#!/usr/bin/env node

/**
 * Combined Reset and Seed Script for MatchFever Mobile
 *
 * This script combines the reset and seed operations:
 * 1. Clears all existing users from the database
 * 2. Seeds the database with development users
 */

import { resetDatabase } from "./reset-database";
import { seedDatabase } from "./seed-database";

async function resetAndSeed(): Promise<void> {
    console.log("🔄 Starting complete database reset and seed process...\n");

    try {
        // Step 1: Reset database
        console.log("📝 Step 1: Resetting database...");
        await resetDatabase();

        console.log("\n⏳ Waiting 2 seconds before seeding...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Step 2: Seed database
        console.log("\n📝 Step 2: Seeding database...");
        await seedDatabase();

        console.log(
            "\n🎉 Complete database reset and seed process finished successfully!"
        );
        console.log("\n📋 Your development database is now ready with:");
        console.log("   - Public users (for viewing tournaments)");
        console.log("   - Tournament organizers (for creating tournaments)");
        console.log("   - Staff users (for updating scores and events)");
        console.log("   - Test users for various testing scenarios");
    } catch (error) {
        console.error("\n💥 Error during reset and seed process:");
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Handle script execution
if (require.main === module) {
    resetAndSeed()
        .then(() => {
            console.log("\n✨ Process completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error(
                "\n💥 Process failed:",
                error instanceof Error ? error.message : String(error)
            );
            process.exit(1);
        });
}

export { resetAndSeed };
