import { BuildCacheConfig, CacheError, CacheResult } from "./types.js";

// Default configuration values
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_DEBUG = false;

export class ConfigValidator {
    static validateGitHubConfig(): CacheResult {
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return {
                success: false,
                error: CacheError.VALIDATION_ERROR,
                message: "GITHUB_TOKEN environment variable is required",
            };
        }

        return {
            success: true,
            data: "Configuration validation passed",
        };
    }

    static getBuildCacheConfig(): BuildCacheConfig {
        return {
            maxRetries: parseInt(
                process.env.BUILD_CACHE_PROVIDER_MAX_RETRIES ||
                    String(DEFAULT_MAX_RETRIES)
            ),
            retryDelay: parseInt(
                process.env.BUILD_CACHE_PROVIDER_RETRY_DELAY ||
                    String(DEFAULT_RETRY_DELAY)
            ),
            timeout: parseInt(
                process.env.BUILD_CACHE_PROVIDER_TIMEOUT ||
                    String(DEFAULT_TIMEOUT)
            ),
            enableDebugLogging:
                process.env.BUILD_CACHE_PROVIDER_DEBUG === "true" ||
                DEFAULT_DEBUG,
        };
    }
}
