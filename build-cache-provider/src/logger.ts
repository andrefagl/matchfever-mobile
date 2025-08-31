import { Logger, BuildCacheConfig } from "./types.js";

// ANSI color codes (no external dependencies)
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",

    // Foreground colors
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",

    // Background colors
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
};

export class BuildCacheLogger implements Logger {
    private config: BuildCacheConfig;

    constructor(config: BuildCacheConfig) {
        this.config = config;
    }

    debug(message: string, ...args: any[]): void {
        if (this.config.enableDebugLogging) {
            console.log(
                `${colors.gray}[DEBUG]${colors.reset} ${message}`,
                ...args
            );
        }
    }

    info(message: string, ...args: any[]): void {
        console.log(`${colors.green}[INFO]${colors.reset} ${message}`, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn(
            `${colors.yellow}[WARN]${colors.reset} ${message}`,
            ...args
        );
    }

    error(message: string, ...args: any[]): void {
        console.error(
            `${colors.red}[ERROR]${colors.reset} ${message}`,
            ...args
        );
    }

    // Special methods for cache-specific messages
    cacheHit(message: string, ...args: any[]): void {
        console.log(
            `${colors.bright}${colors.green}[CACHE]${colors.reset} ${message}`,
            ...args
        );
    }

    cacheMiss(message: string, ...args: any[]): void {
        console.log(
            `${colors.bright}${colors.blue}[CACHE]${colors.reset} ${message}`,
            ...args
        );
    }

    upload(message: string, ...args: any[]): void {
        console.log(
            `${colors.bright}${colors.magenta}[UPLOAD]${colors.reset} ${message}`,
            ...args
        );
    }

    success(message: string, ...args: any[]): void {
        console.log(
            `${colors.bright}${colors.green}[SUCCESS]${colors.reset} ${message}`,
            ...args
        );
    }
}
