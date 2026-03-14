import Constants from "expo-constants";

/**
 * In development, when running on a physical device, "localhost" in env URLs
 * refers to the device itself, so API/auth requests fail. Replace localhost
 * with the dev server host (e.g. your Mac's LAN IP from Metro).
 */
export function resolveBaseUrl(url: string): string {
    if (typeof __DEV__ === "undefined" || !__DEV__) return url;
    if (!url.includes("localhost")) return url;
    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri || typeof hostUri !== "string") return url;
    const devHost = hostUri.split(":")[0];
    if (!devHost) return url;
    return url.replace(/localhost/g, devHost);
}
