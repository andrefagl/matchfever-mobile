import { getTmpDirectory } from "./helpers.js";
import { CacheError, CacheResult } from "./types.js";
import { BuildCacheLogger } from "./logger.js";

import { randomUUID } from "crypto";
import { createWriteStream } from "fs";
import * as fs from "fs-extra";
import { dirname, join } from "path";
import { pipeline } from "stream/promises";

const logger = new BuildCacheLogger({
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    enableDebugLogging: false,
});

export async function downloadFileAsync(
    url: string,
    outputPath: string
): Promise<CacheResult> {
    try {
        const headers: Record<string, string> = {
            "User-Agent": "Expo-Build-Cache-Provider/1.0",
            Accept: "application/octet-stream",
        };

        const token = process.env.GITHUB_TOKEN;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            logger.error(`Download failed: ${errorMessage}`);

            if (response.status === 401) {
                return {
                    success: false,
                    error: CacheError.AUTHENTICATION_ERROR,
                    message: errorMessage,
                };
            } else if (response.status === 404) {
                return {
                    success: false,
                    error: CacheError.NO_CACHE_FOUND,
                    message: errorMessage,
                };
            } else {
                return {
                    success: false,
                    error: CacheError.DOWNLOAD_ERROR,
                    message: errorMessage,
                };
            }
        }

        if (!response.body) {
            return {
                success: false,
                error: CacheError.DOWNLOAD_ERROR,
                message: "No response body from server",
            };
        }

        await fs.ensureDir(dirname(outputPath));
        const fileStream = createWriteStream(outputPath);

        const { Readable } = await import("stream");
        const nodeStream = Readable.fromWeb(response.body as any);

        await pipeline(nodeStream, fileStream);

        return {
            success: true,
            data: outputPath,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error(`Download error: ${errorMessage}`);

        if (await fs.pathExists(outputPath)) {
            await fs.remove(outputPath);
        }

        return {
            success: false,
            error: CacheError.DOWNLOAD_ERROR,
            message: errorMessage,
        };
    }
}

export async function downloadAndMaybeExtractAppAsync(
    url: string,
    platform: "ios" | "android",
    cachedAppPath?: string
): Promise<string> {
    const outputDir = join(await getTmpDirectory(), randomUUID());
    await fs.ensureDir(outputDir);

    if (url.endsWith("apk")) {
        const apkFilePath = join(outputDir, `${randomUUID()}.apk`);

        const result = await downloadFileAsync(url, apkFilePath);

        if (!result.success) {
            throw new Error(result.message || "Download failed");
        }

        return await maybeCacheAppAsync(apkFilePath, cachedAppPath);
    } else {
        const tmpArchivePathDir = join(await getTmpDirectory(), randomUUID());
        await fs.ensureDir(tmpArchivePathDir);

        const tmpArchivePath = join(
            tmpArchivePathDir,
            `${randomUUID()}.tar.gz`
        );

        const result = await downloadFileAsync(url, tmpArchivePath);

        if (!result.success) {
            throw new Error(result.message || "Download failed");
        }

        await extractTarArchive(tmpArchivePath, outputDir);

        const appPath = await getAppPathAsync(
            outputDir,
            platform === "ios" ? "app" : "apk"
        );

        return await maybeCacheAppAsync(appPath, cachedAppPath);
    }
}

async function extractTarArchive(
    archivePath: string,
    outputDir: string
): Promise<void> {
    try {
        const { spawn } = await import("child_process");

        const result = spawn("tar", ["-xf", archivePath, "-C", outputDir]);

        return new Promise((resolve, reject) => {
            result.on("close", (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`tar exited with code ${code}`));
                }
            });

            result.on("error", (error) => {
                reject(error);
            });
        });
    } catch (error) {
        logger.warn("Native tar extraction failed, using fallback method");
    }

    logger.info("Extracting archive using fallback method");

    throw new Error("Archive extraction not implemented in fallback mode");
}

async function maybeCacheAppAsync(
    appPath: string,
    cachedAppPath?: string
): Promise<string> {
    if (cachedAppPath) {
        await fs.ensureDir(dirname(cachedAppPath));
        await fs.move(appPath, cachedAppPath);
        return cachedAppPath;
    }
    return appPath;
}

async function getAppPathAsync(
    outputDir: string,
    applicationExtension: string
): Promise<string> {
    const { readdir, stat } = await import("fs/promises");

    const files = await readdir(outputDir, { recursive: true });
    const appFiles = files.filter(
        (file) =>
            typeof file === "string" &&
            file.endsWith(`.${applicationExtension}`)
    );

    if (appFiles.length === 0) {
        throw new Error(
            `No installable apps found with extension .${applicationExtension}`
        );
    }

    return join(outputDir, appFiles[0] as string);
}
