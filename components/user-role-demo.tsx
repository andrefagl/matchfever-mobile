import React from "react";
import { View } from "react-native";
import { useUser } from "@/contexts/user-context";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
    getUserRole,
    getUserPermissions,
    getRoleDisplayName,
    userCan,
    isTestUser,
    type MatchFeverUser,
} from "../lib/user-permissions";

/**
 * Demo component showing how to use user permissions in your app
 * This is just an example - you can remove this file after understanding the pattern
 */
export function UserRoleDemo() {
    const { user } = useUser();

    if (!user) {
        return (
            <View>
                <Text>Please sign in to see user role information</Text>
            </View>
        );
    }

    const role = getUserRole(user);
    const permissions = getUserPermissions(user);
    const roleDisplayName = role ? getRoleDisplayName(role) : "Unknown";

    return (
        <VStack space='md' className='p-4'>
            <Text className='text-xl font-bold'>User Role Information</Text>

            {/* User Info */}
            <VStack space='sm'>
                <Text className='font-semibold'>User Details:</Text>
                <Text>Name: {user.name || "Not set"}</Text>
                <Text>Email: {user.email}</Text>
                <Text>Role: {roleDisplayName}</Text>
                {isTestUser(user) && (
                    <Text className='text-orange-600'>
                        ⚠️ Test User (created by development scripts)
                    </Text>
                )}
            </VStack>

            {/* Permissions */}
            <VStack space='sm'>
                <Text className='font-semibold'>Permissions:</Text>
                <HStack space='sm'>
                    <Text>👀 Can View:</Text>
                    <Text
                        className={
                            userCan.view(user)
                                ? "text-green-600"
                                : "text-red-600"
                        }
                    >
                        {userCan.view(user) ? "✅ Yes" : "❌ No"}
                    </Text>
                </HStack>
                <HStack space='sm'>
                    <Text>🏆 Can Create Tournaments:</Text>
                    <Text
                        className={
                            userCan.createTournaments(user)
                                ? "text-green-600"
                                : "text-red-600"
                        }
                    >
                        {userCan.createTournaments(user) ? "✅ Yes" : "❌ No"}
                    </Text>
                </HStack>
                <HStack space='sm'>
                    <Text>⚽ Can Update Scores:</Text>
                    <Text
                        className={
                            userCan.updateScores(user)
                                ? "text-green-600"
                                : "text-red-600"
                        }
                    >
                        {userCan.updateScores(user) ? "✅ Yes" : "❌ No"}
                    </Text>
                </HStack>
                <HStack space='sm'>
                    <Text>👥 Can Manage Users:</Text>
                    <Text
                        className={
                            userCan.manageUsers(user)
                                ? "text-green-600"
                                : "text-red-600"
                        }
                    >
                        {userCan.manageUsers(user) ? "✅ Yes" : "❌ No"}
                    </Text>
                </HStack>
            </VStack>

            {/* Raw Permissions Object (for debugging) */}
            <VStack space='sm'>
                <Text className='font-semibold'>
                    Raw Permissions (for debugging):
                </Text>
                <Text className='text-xs font-mono bg-gray-100 p-2 rounded'>
                    {JSON.stringify(permissions, null, 2)}
                </Text>
            </VStack>
        </VStack>
    );
}

// Example usage in other components:

/*
// In a tournament creation component:
export function CreateTournamentButton() {
    const { user } = useUser();
    
    if (!user || !userCan.createTournaments(user)) {
        return null; // Don't show the button if user can't create tournaments
    }
    
    return (
        <Button onPress={() => navigateToCreateTournament()}>
            Create Tournament
        </Button>
    );
}

// In a score update component:
export function ScoreUpdateForm() {
    const { user } = useUser();
    
    if (!user || !userCan.updateScores(user)) {
        return <Text>You don't have permission to update scores</Text>;
    }
    
    return (
        <Form>
            // Score update form here
        </Form>
    );
}

// Role-based navigation:
export function AppNavigation() {
    const { user } = useUser();
    
    return (
        <Navigation>
            <NavItem href="/tournaments">Tournaments</NavItem>
            
            {user && userCan.createTournaments(user) && (
                <NavItem href="/create-tournament">Create Tournament</NavItem>
            )}
            
            {user && userCan.updateScores(user) && (
                <NavItem href="/update-scores">Update Scores</NavItem>
            )}
            
            {user && userCan.manageUsers(user) && (
                <NavItem href="/admin">Admin Panel</NavItem>
            )}
        </Navigation>
    );
}
*/
