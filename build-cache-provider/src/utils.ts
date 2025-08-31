export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    baseDelay: number,
    onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            if (attempt === maxRetries) {
                throw lastError;
            }

            if (onRetry) {
                onRetry(attempt, lastError);
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

export function generateTagName(
    fingerprintHash: string,
    isDevClient: boolean
): string {
    return `fingerprint.${fingerprintHash}${isDevClient ? ".dev-client" : ""}`;
}

export function isDevClientBuild(projectRoot: string): boolean {
    // Simplified check - could be enhanced to read package.json
    return true; // Default to dev client for now
}
