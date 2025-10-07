#!/usr/bin/env node

/**
 * Database Collections Setup Script for MatchFever Mobile
 *
 * This script creates the database structure (collections and attributes) for the tournament management app.
 *
 * Collections:
 * - organizations: Tracks organizations and their Appwrite team for staff management
 */

import "dotenv/config";
const sdk = require("node-appwrite");

// Configuration
interface AppwriteConfig {
    endpoint: string;
    projectId: string;
    apiKey: string;
    databaseId: string;
}

const config: AppwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!, // Server API key for admin operations
    databaseId: process.env.APPWRITE_DATABASE_ID || "matchfever-db", // Default database ID
};

// Collection IDs
const COLLECTIONS = {
    ORGANIZATIONS: "organizations",
} as const;

// Validate configuration
function validateConfig(): void {
    const missing: string[] = [];

    if (!config.endpoint) missing.push("EXPO_PUBLIC_APPWRITE_ENDPOINT");
    if (!config.projectId) missing.push("EXPO_PUBLIC_APPWRITE_PROJECT_ID");
    if (!config.apiKey) missing.push("APPWRITE_API_KEY");

    if (missing.length > 0) {
        console.error("❌ Missing required environment variables:");
        missing.forEach((env) => console.error(`   - ${env}`));
        console.error(
            "\nPlease set these variables in your environment or .env file"
        );
        process.exit(1);
    }
}

// Initialize Appwrite client
function initializeAppwrite(): { client: any; databases: any } {
    const client = new sdk.Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId)
        .setKey(config.apiKey);

    return {
        client,
        databases: new sdk.Databases(client),
    };
}

// Create or get database
async function ensureDatabase(databases: any): Promise<void> {
    try {
        console.log(`🔍 Checking for database: ${config.databaseId}`);
        await databases.get(config.databaseId);
        console.log(`✅ Database already exists: ${config.databaseId}`);
    } catch (error: any) {
        if (error.code === 404) {
            console.log(`📦 Creating database: ${config.databaseId}`);
            await databases.create(config.databaseId, "MatchFever Database");
            console.log(`✅ Database created: ${config.databaseId}`);
        } else {
            throw error;
        }
    }
}

// Create Organizations collection
async function createOrganizationsCollection(databases: any): Promise<void> {
    const collectionId = COLLECTIONS.ORGANIZATIONS;

    // Try to create collection
    try {
        console.log("\n📋 Creating Organizations collection...");
        await databases.createCollection(
            config.databaseId,
            collectionId,
            "Organizations",
            ['read("any")', 'create("users")'], // permissions
            true // documentSecurity
        );
        console.log("✅ Organizations collection created");
        await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
        if (error.code === 409) {
            console.log("✅ Organizations collection already exists");
        } else {
            throw error;
        }
    }

    // Create attributes (always try, even if collection exists)
    console.log("   📝 Adding attributes...");

    // Helper function to create attribute with error handling
    const createAttribute = async (
        createFn: () => Promise<any>,
        name: string,
        description: string
    ) => {
        try {
            await createFn();
            console.log(`   ✅ Added '${name}' attribute ${description}`);
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error: any) {
            if (error.code === 409) {
                console.log(
                    `   ⚠️  '${name}' attribute already exists, skipping`
                );
            } else {
                console.error(
                    `   ❌ Failed to create '${name}': ${error.message}`
                );
                throw error;
            }
        }
    };

    // name - TEXT NOT NULL UNIQUE
    await createAttribute(
        () =>
            databases.createStringAttribute(
                config.databaseId,
                collectionId,
                "name",
                255,
                true // required
            ),
        "name",
        "(string, required)"
    );

    // is_verified - BOOLEAN DEFAULT false
    await createAttribute(
        () =>
            databases.createBooleanAttribute(
                config.databaseId,
                collectionId,
                "is_verified",
                false, // required (must be false to allow default)
                false // default
            ),
        "is_verified",
        "(boolean, default: false)"
    );

    // is_community - BOOLEAN DEFAULT true
    await createAttribute(
        () =>
            databases.createBooleanAttribute(
                config.databaseId,
                collectionId,
                "is_community",
                false, // required (must be false to allow default)
                true // default
            ),
        "is_community",
        "(boolean, default: true)"
    );

    // appwrite_team_id - TEXT UNIQUE (optional, nullable)
    await createAttribute(
        () =>
            databases.createStringAttribute(
                config.databaseId,
                collectionId,
                "appwrite_team_id",
                255,
                false // required
            ),
        "appwrite_team_id",
        "(string, optional)"
    );

    // created_by - TEXT NOT NULL (Appwrite user ID)
    await createAttribute(
        () =>
            databases.createStringAttribute(
                config.databaseId,
                collectionId,
                "created_by",
                255,
                true // required
            ),
        "created_by",
        "(string, required)"
    );

    // created_at - TIMESTAMPTZ DEFAULT now()
    await createAttribute(
        () =>
            databases.createDatetimeAttribute(
                config.databaseId,
                collectionId,
                "created_at",
                false, // required (must be false to allow default)
                new Date().toISOString() // default
            ),
        "created_at",
        "(datetime, default: now)"
    );

    // updated_at - TIMESTAMPTZ DEFAULT now()
    await createAttribute(
        () =>
            databases.createDatetimeAttribute(
                config.databaseId,
                collectionId,
                "updated_at",
                false, // required (must be false to allow default)
                new Date().toISOString() // default
            ),
        "updated_at",
        "(datetime, default: now)"
    );

    // Wait for all attributes to be ready
    console.log("\n   ⏳ Waiting for attributes to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create indexes for unique fields and performance
    console.log("\n   📑 Creating indexes...");

    // Helper function to create index with error handling
    const createIndex = async (
        key: string,
        type: any,
        attributes: string[],
        description: string
    ) => {
        try {
            await databases.createIndex(
                config.databaseId,
                collectionId,
                key,
                type,
                attributes
            );
            console.log(`   ✅ Created ${description}`);
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error: any) {
            if (error.code === 409) {
                console.log(`   ⚠️  Index '${key}' already exists, skipping`);
            } else {
                console.error(
                    `   ❌ Failed to create index '${key}': ${error.message}`
                );
                throw error;
            }
        }
    };

    // Index for name (unique)
    await createIndex(
        "idx_name",
        sdk.IndexType.Unique,
        ["name"],
        "unique index on 'name'"
    );

    // Index for appwrite_team_id (unique, for faster lookups)
    await createIndex(
        "idx_appwrite_team_id",
        sdk.IndexType.Unique,
        ["appwrite_team_id"],
        "unique index on 'appwrite_team_id'"
    );

    // Index for created_by (for faster queries)
    await createIndex(
        "idx_created_by",
        sdk.IndexType.Key,
        ["created_by"],
        "index on 'created_by'"
    );

    // Index for is_verified (for filtering)
    await createIndex(
        "idx_is_verified",
        sdk.IndexType.Key,
        ["is_verified"],
        "index on 'is_verified'"
    );

    console.log("\n✅ Organizations collection setup complete!");
}

// Main setup function
async function setupCollections(): Promise<void> {
    console.log("🚀 Starting database collections setup...\n");

    try {
        validateConfig();
        console.log("✅ Configuration validated");

        const { databases } = initializeAppwrite();
        console.log("✅ Appwrite client initialized\n");

        // Ensure database exists
        await ensureDatabase(databases);

        // Create collections
        await createOrganizationsCollection(databases);

        console.log("\n🎉 Database collections setup completed successfully!");
        console.log("\n📋 Summary:");
        console.log(`   Database: ${config.databaseId}`);
        console.log(`   Collections created: 1`);
        console.log(`     - ${COLLECTIONS.ORGANIZATIONS}`);
        console.log("\n💡 Next steps:");
        console.log(
            "   1. Create additional collections (tournaments, teams, players, etc.)"
        );
        console.log("   2. Set up collection permissions as needed");
        console.log("   3. Start creating documents in your collections");
    } catch (error) {
        console.error("\n💥 Fatal error during setup:");
        console.error(error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error("\n📚 Stack trace:");
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Handle script execution
if (require.main === module) {
    setupCollections()
        .then(() => {
            console.log("\n✨ Script execution completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error(
                "\n💥 Script failed:",
                error instanceof Error ? error.message : String(error)
            );
            process.exit(1);
        });
}

export { setupCollections };
