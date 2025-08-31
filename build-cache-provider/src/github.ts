import { randomUUID } from "crypto";
import * as fs from "fs-extra";
import { readFile, stat } from "fs/promises";
import { basename, dirname, join } from "path";
import { getTmpDirectory } from "./helpers.js";
import { BuildCacheLogger } from "./logger.js";

interface GithubProviderOptions {
    owner: string;
    repo: string;
    tagName: string;
    binaryPath: string;
}

const logger = new BuildCacheLogger({
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    enableDebugLogging: false,
});

interface GitHubAsset {
    id: number;
    name: string;
    size: number;
    browser_download_url: string;
}

interface GitHubRelease {
    id: number;
    url: string;
    assets: GitHubAsset[];
}

class GitHubAPI {
    private token: string;
    private owner: string;
    private repo: string;
    private baseUrl: string;

    constructor(owner: string, repo: string) {
        this.token = process.env.GITHUB_TOKEN!;
        this.owner = owner;
        this.repo = repo;
        this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.token}`,
                "User-Agent": "Expo-Build-Cache-Provider/1.0",
                Accept: "application/vnd.github.v3+json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `GitHub API error: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return response.json();
    }

    async getRepository(): Promise<{ default_branch: string }> {
        return this.request<{ default_branch: string }>("");
    }

    async getBranch(branch: string): Promise<{ commit: { sha: string } }> {
        return this.request<{ commit: { sha: string } }>(`/branches/${branch}`);
    }

    async getReleaseByTag(tag: string): Promise<GitHubRelease> {
        return this.request<GitHubRelease>(`/releases/tags/${tag}`);
    }

    async createRelease(data: {
        tag_name: string;
        name: string;
        draft: boolean;
        prerelease: boolean;
    }): Promise<GitHubRelease> {
        return this.request<GitHubRelease>("/releases", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateRelease(
        releaseId: number,
        data: {
            tag_name: string;
            name: string;
            draft: boolean;
            prerelease: boolean;
        }
    ): Promise<GitHubRelease> {
        return this.request<GitHubRelease>(`/releases/${releaseId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async getRelease(releaseId: number): Promise<GitHubRelease> {
        return this.request<GitHubRelease>(`/releases/${releaseId}`);
    }

    async deleteReleaseAsset(assetId: number): Promise<void> {
        await this.request(`/releases/assets/${assetId}`, {
            method: "DELETE",
        });
    }

    async uploadReleaseAsset(
        releaseId: number,
        name: string,
        data: Buffer
    ): Promise<GitHubAsset> {
        const url = `https://uploads.github.com/repos/${this.owner}/${this.repo}/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.token}`,
                "User-Agent": "Expo-Build-Cache-Provider/1.0",
                "Content-Type": "application/octet-stream",
                "Content-Length": data.length.toString(),
            },
            body: data,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Upload failed: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return response.json();
    }

    async createTag(params: {
        tag: string;
        message: string;
        object: string;
        type: string;
        tagger: {
            name: string;
            email: string;
            date: string;
        };
    }): Promise<{ sha: string }> {
        return this.request<{ sha: string }>("/git/tags", {
            method: "POST",
            body: JSON.stringify(params),
        });
    }

    async createRef(ref: string, sha: string): Promise<void> {
        await this.request("/git/refs", {
            method: "POST",
            body: JSON.stringify({ ref, sha }),
        });
    }

    async getRef(ref: string): Promise<{ object: { sha: string } }> {
        return this.request<{ object: { sha: string } }>(`/git/refs/${ref}`);
    }
}

export async function createReleaseAndUploadAsset({
    owner,
    repo,
    tagName,
    binaryPath,
}: GithubProviderOptions): Promise<string> {
    const api = new GitHubAPI(owner, repo);

    try {
        const commitSha = await getBranchShaWithFallback(api, owner, repo);
        const tagSha = await ensureAnnotatedTag(api, {
            tag: tagName,
            message: tagName,
            object: commitSha,
            type: "commit",
            tagger: {
                name: "Release Bot",
                email: "bot@expo.dev",
                date: new Date().toISOString(),
            },
        });

        let release: GitHubRelease;
        try {
            const existingRelease = await api.getReleaseByTag(tagName);

            release = await api.updateRelease(existingRelease.id, {
                tag_name: tagName,
                name: tagName,
                draft: false,
                prerelease: true,
            });
        } catch (error) {
            if (error instanceof Error && error.message.includes("404")) {
                release = await api.createRelease({
                    tag_name: tagName,
                    name: tagName,
                    draft: false,
                    prerelease: true,
                });
            } else {
                throw error;
            }
        }

        await uploadReleaseAsset(api, {
            owner,
            repo,
            releaseId: release.id,
            binaryPath,
        });

        return release.url;
    } catch (error) {
        throw new Error(
            `GitHub release failed: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

async function getBranchShaWithFallback(
    api: GitHubAPI,
    owner: string,
    repo: string
): Promise<string> {
    try {
        const repoData = await api.getRepository();

        const branchData = await api.getBranch(repoData.default_branch);
        return branchData.commit.sha;
    } catch (error) {
        const branchesToTry = ["main", "master", "develop"];

        for (const branchName of branchesToTry) {
            try {
                const branchData = await api.getBranch(branchName);
                return branchData.commit.sha;
            } catch (error) {
                if (branchName === "develop") {
                    throw new Error("No valid branch found");
                }
                continue;
            }
        }
        throw new Error("Branch fallback exhausted");
    }
}

async function ensureAnnotatedTag(
    api: GitHubAPI,
    params: {
        tag: string;
        message: string;
        object: string;
        type: string;
        tagger: {
            name: string;
            email: string;
            date: string;
        };
    }
): Promise<string> {
    const { tag } = params;
    const refName = `refs/tags/${tag}`;

    try {
        const existingRef = await api.getRef(`tags/${tag}`);
        return existingRef.object.sha;
    } catch (err) {
        if (err instanceof Error && !err.message.includes("404")) {
            throw err;
        }
    }

    const tagData = await api.createTag(params);

    await api.createRef(refName, tagData.sha);

    return tagData.sha;
}

async function uploadReleaseAsset(
    api: GitHubAPI,
    params: {
        owner: string;
        repo: string;
        releaseId: number;
        binaryPath: string;
    }
): Promise<void> {
    let filePath = params.binaryPath;
    let name = basename(filePath);

    if ((await stat(filePath)).isDirectory()) {
        await fs.mkdirp(await getTmpDirectory());
        const tarPath = join(await getTmpDirectory(), `${randomUUID()}.tar.gz`);
        const parentPath = dirname(filePath);

        try {
            const { spawn } = await import("child_process");
            const tarProcess = spawn("tar", [
                "-czf",
                tarPath,
                "-C",
                parentPath,
                name,
            ]);

            await new Promise<void>((resolve, reject) => {
                tarProcess.on("close", (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`tar exited with code ${code}`));
                    }
                });

                tarProcess.on("error", (error) => {
                    reject(error);
                });
            });

            filePath = tarPath;
            name = name + ".tar.gz";
        } catch (error) {
            throw new Error("Failed to create tar archive");
        }
    }

    try {
        const release = await api.getRelease(params.releaseId);
        const existingAsset = release.assets.find(
            (asset) => asset.name === name
        );

        if (existingAsset) {
            await api.deleteReleaseAsset(existingAsset.id);
        }
    } catch (error) {
        logger.warn("Could not delete existing asset:", error);
    }

    const fileData = await readFile(filePath);

    await api.uploadReleaseAsset(params.releaseId, name, fileData);

    if (filePath !== params.binaryPath) {
        try {
            await fs.remove(filePath);
        } catch (error) {}
    }

    logger.success("Build successfully uploaded to GitHub Releases");
}

export async function getReleaseAssetsByTag({
    owner,
    repo,
    tag,
}: {
    owner: string;
    repo: string;
    tag: string;
}): Promise<GitHubAsset[]> {
    const api = new GitHubAPI(owner, repo);
    const release = await api.getReleaseByTag(tag);
    return release.assets;
}
