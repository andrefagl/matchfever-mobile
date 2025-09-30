#!/usr/bin/env node

/**
 * Database Reset Script for MatchFever Mobile
 *
 * This script clears all test users from the Appwrite database.
 * It uses the server-side Appwrite SDK to perform administrative operations.
 */

import "dotenv/config";
import { Client, Users, Query } from "node-appwrite";

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
}

// Configuration
const config: AppwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!, // Server API key for admin operations
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
function initializeAppwrite(): { client: Client; users: Users } {
    const client = new Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId)
        .setKey(config.apiKey);

    return {
        client,
        users: new Users(client),
    };
}

// Get all users with pagination
async function getAllUsers(users: Users): Promise<AppwriteUser[]> {
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
    users: Users,
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

// Main reset function
async function resetDatabase(): Promise<void> {
    console.log("🚀 Starting database reset...\n");

    try {
        validateConfig();
        console.log("✅ Configuration validated");

        const { users } = initializeAppwrite();
        console.log("✅ Appwrite client initialized");

        // Get all users
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

        console.log("\n📊 Reset Summary:");
        console.log(`   ✅ Successfully deleted: ${deletedCount} users`);
        console.log(`   ❌ Failed to delete: ${failedCount} users`);
        console.log(`   📋 Total processed: ${allUsers.length} users`);

        if (failedCount === 0) {
            console.log("\n🎉 Database reset completed successfully!");
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
