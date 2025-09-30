#!/usr/bin/env node

/**
 * Database Seed Script for MatchFever Mobile
 *
 * This script creates development users for testing the tournament management app.
 * It creates different types of users:
 * - General public users (for viewing scores, standings, statistics)
 * - Tournament organizers (for creating and managing tournaments)
 * - Staff users (for updating tournament events, goals, results, etc.)
 */

import "dotenv/config";
import { Client, Users, ID } from "node-appwrite";

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

// Types
type UserRole = "public" | "organizer" | "staff" | "admin" | "test";

interface UserPermissions {
    canView: boolean;
    canCreateTournaments: boolean;
    canUpdateScores: boolean;
    canManageUsers: boolean;
}

interface DevelopmentUser {
    type: UserRole;
    name: string;
    email: string;
    labels: string[];
}

interface AppwriteConfig {
    endpoint: string;
    projectId: string;
    apiKey: string;
}

interface CreateUserResult {
    success: boolean;
    user?: AppwriteUser;
    userData: DevelopmentUser;
    error?: string;
}

// Configuration
const config: AppwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!, // Server API key for admin operations
};

// Development users to create
const developmentUsers: DevelopmentUser[] = [
    // General Public Users (viewers)
    {
        type: "public",
        name: "John Viewer",
        email: "andre.fagl+johnviewer@gmail.com",
        labels: ["public", "viewer"],
    },
    {
        type: "public",
        name: "Sarah Fan",
        email: "andre.fagl+sarahfan@gmail.com",
        labels: ["public", "viewer"],
    },
    {
        type: "public",
        name: "Mike Sports",
        email: "andre.fagl+mikesports@gmail.com",
        labels: ["public", "viewer"],
    },

    // Tournament Organizers
    {
        type: "organizer",
        name: "Emma Organizer",
        email: "andre.fagl+emmaorganizer@gmail.com",
        labels: ["organizer", "tournamentcreator"],
    },
    {
        type: "organizer",
        name: "David Manager",
        email: "andre.fagl+davidmanager@gmail.com",
        labels: ["organizer", "tournamentcreator"],
    },

    // Staff Users (for updating events, scores, etc.)
    {
        type: "staff",
        name: "Lisa Staff",
        email: "andre.fagl+lisastaff@gmail.com",
        labels: ["staff", "scoreupdater"],
    },
    {
        type: "staff",
        name: "Tom Referee",
        email: "andre.fagl+tomreferee@gmail.com",
        labels: ["staff", "referee", "scoreupdater"],
    },
    {
        type: "staff",
        name: "Anna Admin",
        email: "andre.fagl+annaadmin@gmail.com",
        labels: ["staff", "admin", "tournamentcreator", "scoreupdater"],
    },

    // Test Users with specific roles
    {
        type: "test",
        name: "Test User 1",
        email: "andre.fagl+testuser1@gmail.com",
        labels: ["test", "public"],
    },
    {
        type: "test",
        name: "Test User 2",
        email: "andre.fagl+testuser2@gmail.com",
        labels: ["test", "organizer"],
    },
];

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

// Create a single user
async function createUser(
    users: Users,
    userData: DevelopmentUser
): Promise<CreateUserResult> {
    try {
        const userId = ID.unique();

        const user = await users.create(
            userId,
            userData.email,
            undefined, // phone number (optional)
            undefined, // password not needed for OTP authentication
            userData.name
        );

        // Set user labels for role management
        if (userData.labels && userData.labels.length > 0) {
            await users.updateLabels(userId, userData.labels);
        }

        console.log(
            `✅ Created ${userData.type} user: ${userData.name} (${userData.email})`
        );
        return { success: true, user, userData };
    } catch (error) {
        console.error(
            `❌ Failed to create user ${userData.email}: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            userData,
        };
    }
}

// Create user preferences based on role
async function setUserPreferences(
    users: Users,
    userId: string,
    userType: UserRole
): Promise<void> {
    try {
        const permissions = getUserPermissions(userType);

        // Flatten the permissions object to avoid [object Object] issue
        const preferences = {
            userType: userType,
            // Flatten permissions into individual preference keys
            canView: permissions.canView,
            canCreateTournaments: permissions.canCreateTournaments,
            canUpdateScores: permissions.canUpdateScores,
            canManageUsers: permissions.canManageUsers,
            createdAt: new Date().toISOString(),
            isTestUser: true,
        };

        await users.updatePrefs(userId, preferences);
        console.log(`   📝 Set preferences for ${userType} user`);
        console.log(`   🔐 Permissions:`, permissions);
    } catch (error) {
        console.error(
            `   ⚠️  Failed to set preferences: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}

// Get permissions based on user type
function getUserPermissions(userType: UserRole): UserPermissions {
    switch (userType) {
        case "public":
            return {
                canView: true,
                canCreateTournaments: false,
                canUpdateScores: false,
                canManageUsers: false,
            };
        case "organizer":
            return {
                canView: true,
                canCreateTournaments: true,
                canUpdateScores: false,
                canManageUsers: false,
            };
        case "staff":
            return {
                canView: true,
                canCreateTournaments: false,
                canUpdateScores: true,
                canManageUsers: false,
            };
        case "admin":
            return {
                canView: true,
                canCreateTournaments: true,
                canUpdateScores: true,
                canManageUsers: true,
            };
        default:
            return {
                canView: true,
                canCreateTournaments: false,
                canUpdateScores: false,
                canManageUsers: false,
            };
    }
}

// Main seed function
async function seedDatabase(): Promise<void> {
    console.log("🌱 Starting database seeding...\n");

    try {
        validateConfig();
        console.log("✅ Configuration validated");

        const { users } = initializeAppwrite();
        console.log("✅ Appwrite client initialized");

        console.log(
            `\n👥 Creating ${developmentUsers.length} development users...\n`
        );

        let createdCount = 0;
        let failedCount = 0;
        const results: CreateUserResult[] = [];

        // Create users sequentially to avoid rate limiting
        for (const userData of developmentUsers) {
            const result = await createUser(users, userData);
            results.push(result);

            if (result.success && result.user) {
                createdCount++;
                // Set user preferences
                await setUserPreferences(users, result.user.$id, userData.type);

                // Add a small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 500));
            } else {
                failedCount++;
            }
        }

        // Summary
        console.log("\n📊 Seeding Summary:");
        console.log(`   ✅ Successfully created: ${createdCount} users`);
        console.log(`   ❌ Failed to create: ${failedCount} users`);
        console.log(`   📋 Total processed: ${developmentUsers.length} users`);

        // Group by user type
        const usersByType = results
            .filter((r) => r.success)
            .reduce((acc, r) => {
                const type = r.userData.type;
                if (!acc[type]) acc[type] = [];
                acc[type].push(r.userData);
                return acc;
            }, {} as Record<string, DevelopmentUser[]>);

        console.log("\n👥 Created Users by Type:");
        Object.entries(usersByType).forEach(([type, users]) => {
            console.log(`   ${type.toUpperCase()}: ${users.length} users`);
            users.forEach((user) => {
                console.log(`     - ${user.name} (${user.email})`);
            });
        });

        // Login instructions
        console.log("\n🔐 Login Instructions:");
        console.log("   All users use OTP (One-Time Password) authentication");
        console.log(
            "   Use the email addresses shown above to receive OTP codes"
        );
        console.log(
            "   All emails go to: andre.fagl@gmail.com with role-based aliases"
        );

        if (failedCount === 0) {
            console.log("\n🎉 Database seeding completed successfully!");
        } else {
            console.log("\n⚠️  Database seeding completed with some errors");

            // Show failed users
            const failedUsers = results.filter((r) => !r.success);
            if (failedUsers.length > 0) {
                console.log("\n❌ Failed Users:");
                failedUsers.forEach((result) => {
                    console.log(
                        `   - ${result.userData.email}: ${result.error}`
                    );
                });
            }
        }
    } catch (error) {
        console.error("\n💥 Fatal error during database seeding:");
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Handle script execution
if (require.main === module) {
    seedDatabase()
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

export { seedDatabase };
