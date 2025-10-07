#!/usr/bin/env node

/**
 * Database Reset Script for MatchFever Mobile
 *
 * This script clears all test data from the Appwrite database:
 * - Users
 * - Organizations collection documents
 *
 * For complete schema reset (collections + data), use reset-database-full.ts
 *
 * It uses the server-side Appwrite SDK to perform administrative operations.
 */

import "dotenv/config";
const sdk = require("node-appwrite");
const { Query } = sdk;

// Define our own user type for the scripts (with optional properties)
interface AppwriteUser {
    $id: string;
    $createdAt?: string;
    $updatedAt?: string;
    name?: string;
    password?: string;
    hash?: string;
    hashOptions?: any;
    registration?: string;
    status?: boolean;
    labels?: string[];
    passwordUpdate?: string;
    email?: string;
    phone?: string;
    emailVerification?: boolean;
    phoneVerification?: boolean;
    mfa?: boolean;
    prefs?: Record<string, any>;
    targets?: any[];
    accessedAt?: string;
}

// Configuration interface
interface AppwriteConfig {
    endpoint: string;
    projectId: string;
    apiKey: string;
    databaseId: string;
}

// Configuration
const config: AppwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!, // Server API key for admin operations
    databaseId: process.env.APPWRITE_DATABASE_ID || "matchfever-db",
};

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
function initializeAppwrite(): { client: any; users: any; databases: any } {
    const client = new sdk.Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId)
        .setKey(config.apiKey);

    return {
        client,
        users: new sdk.Users(client),
        databases: new sdk.Databases(client),
    };
}

// Get all users with pagination
async function getAllUsers(users: any): Promise<AppwriteUser[]> {
    const allUsers: AppwriteUser[] = [];
    let offset = 0;
    const limit = 100; // Appwrite's max limit per request

    while (true) {
        try {
            const response = await users.list([
                Query.limit(limit),
                Query.offset(offset),
            ]);

            if (response.users.length === 0) break;

            allUsers.push(...(response.users as AppwriteUser[]));
            offset += limit;

            console.log(
                `📥 Fetched ${response.users.length} users (total: ${allUsers.length})`
            );
        } catch (error) {
            console.error(
                "❌ Error fetching users:",
                error instanceof Error ? error.message : String(error)
            );
            throw error;
        }
    }

    return allUsers;
}

// Delete a user
async function deleteUser(
    users: any,
    userId: string,
    userEmail: string
): Promise<boolean> {
    try {
        await users.delete(userId);
        console.log(`✅ Deleted user: ${userEmail} (${userId})`);
        return true;
    } catch (error) {
        console.error(
            `❌ Failed to delete user ${userEmail}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
        return false;
    }
}

// Get all documents from a collection with pagination
async function getAllDocuments(
    databases: any,
    collectionId: string
): Promise<any[]> {
    const allDocuments: any[] = [];
    let offset = 0;
    const limit = 100; // Appwrite's max limit per request

    while (true) {
        try {
            const response = await databases.listDocuments(
                config.databaseId,
                collectionId,
                [Query.limit(limit), Query.offset(offset)]
            );

            if (response.documents.length === 0) break;

            allDocuments.push(...response.documents);
            offset += limit;

            console.log(
                `   📥 Fetched ${response.documents.length} documents from ${collectionId} (total: ${allDocuments.length})`
            );
        } catch (error: any) {
            // Collection might not exist yet
            if (error.code === 404) {
                console.log(
                    `   ⚠️  Collection '${collectionId}' not found, skipping`
                );
                break;
            }
            console.error(
                `   ❌ Error fetching documents from ${collectionId}:`,
                error instanceof Error ? error.message : String(error)
            );
            throw error;
        }
    }

    return allDocuments;
}

// Delete a document
async function deleteDocument(
    databases: any,
    collectionId: string,
    documentId: string,
    documentName: string
): Promise<boolean> {
    try {
        await databases.deleteDocument(
            config.databaseId,
            collectionId,
            documentId
        );
        console.log(`   ✅ Deleted document: ${documentName} (${documentId})`);
        return true;
    } catch (error) {
        console.error(
            `   ❌ Failed to delete document ${documentName}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
        return false;
    }
}

// Reset collections
async function resetCollections(databases: any): Promise<void> {
    const collections = [
        { id: "organizations", nameField: "name" },
        // Add more collections here as you create them
        // { id: "tournaments", nameField: "name" },
        // { id: "teams", nameField: "name" },
    ];

    console.log("\n🗂️  Resetting collections...");

    for (const collection of collections) {
        console.log(`\n📋 Processing collection: ${collection.id}`);

        const documents = await getAllDocuments(databases, collection.id);

        if (documents.length === 0) {
            console.log(`   ℹ️  No documents found in ${collection.id}`);
            continue;
        }

        console.log(`   🔍 Found ${documents.length} documents to delete`);

        let deletedCount = 0;
        let failedCount = 0;

        for (const doc of documents) {
            const docName = doc[collection.nameField] || "Unknown";
            const success = await deleteDocument(
                databases,
                collection.id,
                doc.$id,
                docName
            );
            if (success) {
                deletedCount++;
            } else {
                failedCount++;
            }
        }

        console.log(`   📊 ${collection.id} Summary:`);
        console.log(`      ✅ Deleted: ${deletedCount}`);
        console.log(`      ❌ Failed: ${failedCount}`);
    }
}

// Main reset function
async function resetDatabase(): Promise<void> {
    console.log("🚀 Starting database reset...\n");

    try {
        validateConfig();
        console.log("✅ Configuration validated");

        const { users, databases } = initializeAppwrite();
        console.log("✅ Appwrite client initialized");

        // Reset collections first (before deleting users)
        await resetCollections(databases);

        // Get all users
        console.log("\n👥 Resetting users...");
        console.log("\n📋 Fetching all users...");
        const allUsers = await getAllUsers(users);

        if (allUsers.length === 0) {
            console.log("ℹ️  No users found in the database");
            return;
        }

        console.log(`\n🔍 Found ${allUsers.length} users to delete:`);
        allUsers.forEach((user) => {
            console.log(
                `   - ${user.email || user.name || "Unknown"} (${user.$id})`
            );
        });

        // Confirm deletion
        console.log(
            "\n⚠️  This will DELETE ALL USERS from your Appwrite project!"
        );
        console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");

        // Wait for 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Delete all users
        console.log("\n🗑️  Deleting users...");
        let deletedCount = 0;
        let failedCount = 0;

        for (const user of allUsers) {
            const success = await deleteUser(
                users,
                user.$id,
                user.email || user.name || "Unknown"
            );
            if (success) {
                deletedCount++;
            } else {
                failedCount++;
            }
        }

        console.log("\n📊 Users Reset Summary:");
        console.log(`   ✅ Successfully deleted: ${deletedCount} users`);
        console.log(`   ❌ Failed to delete: ${failedCount} users`);
        console.log(`   📋 Total processed: ${allUsers.length} users`);

        if (failedCount === 0) {
            console.log("\n🎉 Database reset completed successfully!");
            console.log(
                "   All users and collection documents have been deleted"
            );
        } else {
            console.log("\n⚠️  Database reset completed with some errors");
        }
    } catch (error) {
        console.error("\n💥 Fatal error during database reset:");
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Handle script execution
if (require.main === module) {
    resetDatabase()
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

export { resetDatabase };
