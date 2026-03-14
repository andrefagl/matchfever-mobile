import axios, { type AxiosInstance } from "axios";
import { authClient } from "@/lib/auth-client";
import { resolveBaseUrl } from "@/lib/dev-base-url";

const SESSION_CACHE_MS = 30_000; // 30s – avoid refetching session on every API request
let sessionPromise: Promise<{ token?: string } | null> | null = null;
let sessionCached: { token?: string; expiresAt: number } | null = null;

/** Call after sign-out so the next API request doesn't use a stale token. */
export function clearSessionCache() {
    sessionCached = null;
    sessionPromise = null;
}

async function getSessionToken(): Promise<string | undefined> {
    const now = Date.now();
    if (sessionCached && sessionCached.expiresAt > now && sessionCached.token) {
        return sessionCached.token;
    }
    if (!sessionPromise) {
        sessionPromise = authClient
            .getSession()
            .then(({ data }) => {
                const token =
                    data && "session" in data
                        ? (data.session as { token?: string })?.token
                        : (data as { token?: string } | null)?.token;
                sessionCached = {
                    token,
                    expiresAt: now + SESSION_CACHE_MS,
                };
                sessionPromise = null;
                return { token } as { token?: string } | null;
            })
            .catch(() => {
                sessionPromise = null;
                return null;
            });
    }
    const result = await sessionPromise;
    return result?.token;
}

// Tournaments/matches live at server root (e.g. /tournaments). Auth lives at /api/auth.
// If only EXPO_PUBLIC_AUTH_BASE_URL is set (e.g. http://localhost:3000/api/auth), we derive
// the server root so API requests go to /tournaments, not /api/auth/tournaments.
// In dev on device, localhost is replaced with the Metro host so the phone can reach your Mac.
function getApiBaseURL(): string {
    const explicit = process.env.EXPO_PUBLIC_API_URL;
    if (explicit) return resolveBaseUrl(explicit);
    const authBase = process.env.EXPO_PUBLIC_AUTH_BASE_URL;
    if (!authBase) {
        throw new Error(
            "Missing EXPO_PUBLIC_API_URL or EXPO_PUBLIC_AUTH_BASE_URL for API client"
        );
    }
    const resolved = resolveBaseUrl(authBase);
    try {
        const url = new URL(resolved);
        // Strip path (e.g. /api/auth) so base is origin only (e.g. http://localhost:3000)
        url.pathname = "";
        url.search = "";
        url.hash = "";
        return url.toString().replace(/\/$/, "");
    } catch {
        return resolved;
    }
}

const baseURL = getApiBaseURL();

export const apiClient: AxiosInstance = axios.create({
    baseURL,
    timeout: 15_000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const token = await getSessionToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionCached = null;
            sessionPromise = null;
        }
        return Promise.reject(error);
    }
);
