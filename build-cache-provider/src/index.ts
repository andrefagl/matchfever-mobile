import {
    BuildCacheProviderPlugin,
    ResolveBuildCacheProps,
    RunOptions,
    UploadBuildCacheProps,
} from "@expo/config";
import { existsSync } from "fs";
import { join } from "path";
import { rmSync } from "fs";

(async () => {
    try {
        const dotenv = await import("dotenv");
        const originalLog = console.log;
        console.log = () => {};
        dotenv.config();
        console.log = originalLog;
    } catch (error) {}
})();

import { ConfigValidator } from "./config.js";
import { downloadAndMaybeExtractAppAsync } from "./download.js";
import {
    createReleaseAndUploadAsset,
    getReleaseAssetsByTag,
} from "./github.js";
import { getBuildRunCacheDirectoryPath } from "./helpers.js";
import { BuildCacheLogger } from "./logger.js";
import {
    generateTagName,
    isDevClientBuild,
    retryWithBackoff,
} from "./utils.js";

export async function resolveGitHubRemoteBuildCache(
    {
        projectRoot,
        platform,
        fingerprintHash,
        runOptions,
    }: ResolveBuildCacheProps,
    { owner, repo }: { owner: string; repo: string }
): Promise<string | null> {
    const config = ConfigValidator.getBuildCacheConfig();
    const logger = new BuildCacheLogger(config);

    const configValidation = ConfigValidator.validateGitHubConfig();
    if (!configValidation.success) {
        logger.error(`Configuration error: ${configValidation.message}`);
        return null;
    }

    const cachedAppPath = await getCachedAppPath({
        fingerprintHash,
        platform,
        projectRoot,
        runOptions,
    });

    if (existsSync(cachedAppPath)) {
        if (platform === "ios" && !isValidIosAppBundle(cachedAppPath)) {
            logger.warn(
                "Cached iOS .app bundle is invalid or incomplete (missing Info.plist) - will re-download or rebuild"
            );
            removeCachedAppSync(cachedAppPath);
        } else {
            logger.cacheHit(
                "✅ Using cached build - no need to rebuild from scratch"
            );
            return cachedAppPath;
        }
    }

    logger.info(
        "Searching builds with matching fingerprint on Github Releases"
    );

    try {
        const assets = await retryWithBackoff(
            () =>
                getReleaseAssetsByTag({
                    owner,
                    repo,
                    tag: generateTagName(
                        fingerprintHash,
                        isDevClientBuild(projectRoot)
                    ),
                }),
            config.maxRetries,
            config.retryDelay,
            (attempt, error) =>
                logger.warn(
                    `GitHub API attempt ${attempt} failed: ${error.message}`
                )
        );

        if (assets.length > 0) {
            const asset = assets[0];
            const buildDownloadURL = `https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}`;

            const sizeMB = (asset.size / (1024 * 1024)).toFixed(1);
            logger.cacheHit(` Found cached build: ${asset.name} (${sizeMB}MB)`);
            logger.info("Downloading and extracting...");

            const result = await downloadAndMaybeExtractAppAsync(
                buildDownloadURL,
                platform,
                cachedAppPath
            );

            logger.success("✅ Cached build ready");
            return result;
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        if (
            errorMessage.includes("Not Found") ||
            errorMessage.includes("404")
        ) {
            logger.cacheMiss(
                "📦 No cached build found - will build from scratch and cache the result"
            );
        } else {
            logger.error(`Error searching for cached builds: ${errorMessage}`);
        }
    }

    return null;
}

export async function uploadGitHubRemoteBuildCache(
    {
        projectRoot,
        fingerprintHash,
        runOptions,
        buildPath,
    }: UploadBuildCacheProps,
    { owner, repo }: { owner: string; repo: string }
): Promise<string | null> {
    const configValidation = ConfigValidator.validateGitHubConfig();
    if (!configValidation.success) {
        throw new Error(`Configuration error: ${configValidation.message}`);
    }

    const config = ConfigValidator.getBuildCacheConfig();
    const logger = new BuildCacheLogger(config);

    logger.upload("Uploading build to Github Releases");

    try {
        const result = await retryWithBackoff(
            () =>
                createReleaseAndUploadAsset({
                    owner,
                    repo,
                    tagName: generateTagName(
                        fingerprintHash,
                        isDevClientBuild(projectRoot)
                    ),
                    binaryPath: buildPath,
                }),
            config.maxRetries,
            config.retryDelay,
            (attempt, error) =>
                logger.warn(
                    `Upload attempt ${attempt} failed: ${error.message}`
                )
        );

        return result;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        logger.error(`Release failed: ${errorMessage}`);
        throw new Error(`GitHub release failed: ${errorMessage}`);
    }
}

function isValidIosAppBundle(appPath: string): boolean {
    const infoPlistPath = join(appPath, "Info.plist");
    return existsSync(infoPlistPath);
}

function removeCachedAppSync(appPath: string): void {
    try {
        rmSync(appPath, { recursive: true, force: true });
    } catch {
        // ignore
    }
}

async function getCachedAppPath({
    fingerprintHash,
    platform,
    projectRoot,
    runOptions,
}: {
    fingerprintHash: string;
    platform: "ios" | "android";
    projectRoot: string;
    runOptions: RunOptions;
}): Promise<string> {
    return join(
        await getBuildRunCacheDirectoryPath(),
        `${generateTagName(fingerprintHash, isDevClientBuild(projectRoot))}.${platform === "ios" ? "app" : "apk"}`
    );
}

const providerPlugin: BuildCacheProviderPlugin = {
    resolveBuildCache: resolveGitHubRemoteBuildCache,
    uploadBuildCache: uploadGitHubRemoteBuildCache,
};

export default providerPlugin;
