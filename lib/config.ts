const getEnvironment = (): keyof typeof config => {
    if (__DEV__) {
        return "development";
    }
    return "production";
};

export const config = {
    development: {
        appwrite: {
            endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
            projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
            platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
            devKey: process.env.EXPO_PUBLIC_APPWRITE_DEV_KEY!,
        },
    },
    production: {
        appwrite: {
            endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
            projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
            platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
            // No devKey in production
            devKey: undefined,
        },
    },
};

export const getCurrentConfig = () => {
    const env = getEnvironment();
    return config[env as keyof typeof config] || config.production;
};
