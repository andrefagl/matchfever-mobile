// Type declarations for node-appwrite in scripts context
declare module "node-appwrite" {
    export class Client {
        setEndpoint(endpoint: string): Client;
        setProject(projectId: string): Client;
        setKey(key: string): Client;
    }

    export class Users {
        constructor(client: Client);
        list(queries?: string[]): Promise<{ total: number; users: any[] }>;
        create(
            userId: string,
            email: string,
            phone?: string,
            password?: string,
            name?: string
        ): Promise<any>;
        delete(userId: string): Promise<any>;
        updateLabels(userId: string, labels: string[]): Promise<any>;
        updatePrefs(
            userId: string,
            prefs: Record<string, any>
        ): Promise<Record<string, any>>;
    }

    export class Query {
        static limit(limit: number): string;
        static offset(offset: number): string;
    }

    export class ID {
        static unique(): string;
    }
}
