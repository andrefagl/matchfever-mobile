export enum CacheError {
    NO_CACHE_FOUND = "NO_CACHE_FOUND",
    NETWORK_ERROR = "NETWORK_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    DOWNLOAD_ERROR = "DOWNLOAD_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    GITHUB_API_ERROR = "GITHUB_API_ERROR",
}

export interface CacheResult {
    success: boolean;
    data?: string;
    error?: CacheError;
    message?: string;
    details?: any;
}

export interface GitHubConfig {
    token: string;
    owner: string;
    repo: string;
}

export interface BuildCacheConfig {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    enableDebugLogging: boolean;
}

export interface Logger {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    cacheHit(message: string, ...args: any[]): void;
    cacheMiss(message: string, ...args: any[]): void;
    upload(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
}
