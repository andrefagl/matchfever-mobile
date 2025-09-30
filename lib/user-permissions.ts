import { Models } from "react-native-appwrite";

/**
 * User Permission Types for MatchFever Mobile
 *
 * These utilities help work with user permissions stored in Appwrite preferences.
 * The permissions are stored as flattened preferences to avoid display issues.
 */

export interface UserPermissions {
    canView: boolean;
    canCreateTournaments: boolean;
    canUpdateScores: boolean;
    canManageUsers: boolean;
}

/**
 * Extended user preferences interface that includes our custom fields
 */
export interface MatchFeverUserPreferences extends Models.Preferences {
    userType?: string;
    canView?: boolean;
    canCreateTournaments?: boolean;
    canUpdateScores?: boolean;
    canManageUsers?: boolean;
    createdAt?: string;
    isTestUser?: boolean;
}

/**
 * Type alias for a user with MatchFever preferences
 */
export type MatchFeverUser = Models.User<MatchFeverUserPreferences>;

/**
 * Type guard to check if a user has MatchFever preferences
 */
export function isMatchFeverUser(
    user: Models.User<any>
): user is MatchFeverUser {
    return user && typeof user.prefs === "object" && user.prefs !== null;
}

/**
 * Safely convert any Appwrite user to a MatchFever user
 * This is safer than using 'as' because it preserves the original object
 */
export function toMatchFeverUser(user: Models.User<any>): MatchFeverUser {
    return user as MatchFeverUser;
}

/**
 * Overloaded functions that can work with any Appwrite user type
 * These provide a seamless experience without requiring type conversion
 */

// Overloaded getUserPermissions
export function getUserPermissions(user: Models.User<any>): UserPermissions;
export function getUserPermissions(user: MatchFeverUser): UserPermissions;
export function getUserPermissions(
    user: Models.User<any> | MatchFeverUser
): UserPermissions {
    const prefs = user.prefs || {};

    return {
        canView: prefs.canView === true,
        canCreateTournaments: prefs.canCreateTournaments === true,
        canUpdateScores: prefs.canUpdateScores === true,
        canManageUsers: prefs.canManageUsers === true,
    };
}

// Overloaded getUserRole
export function getUserRole(user: Models.User<any>): UserRole | null;
export function getUserRole(user: MatchFeverUser): UserRole | null;
export function getUserRole(
    user: Models.User<any> | MatchFeverUser
): UserRole | null {
    const prefs = user.prefs || {};
    return (prefs.userType as UserRole) || null;
}

// Overloaded isTestUser
export function isTestUser(user: Models.User<any>): boolean;
export function isTestUser(user: MatchFeverUser): boolean;
export function isTestUser(user: Models.User<any> | MatchFeverUser): boolean {
    const prefs = user.prefs || {};
    return prefs.isTestUser === true;
}

export type UserRole = "public" | "organizer" | "staff" | "admin";

/**
 * Permission check helpers that work with any Appwrite user type
 */
export const userCan = {
    /**
     * Check if user can view tournaments and scores
     */
    view: (user: Models.User<any> | MatchFeverUser): boolean => {
        return getUserPermissions(user).canView;
    },

    /**
     * Check if user can create and manage tournaments
     */
    createTournaments: (user: Models.User<any> | MatchFeverUser): boolean => {
        return getUserPermissions(user).canCreateTournaments;
    },

    /**
     * Check if user can update scores and events
     */
    updateScores: (user: Models.User<any> | MatchFeverUser): boolean => {
        return getUserPermissions(user).canUpdateScores;
    },

    /**
     * Check if user can manage other users
     */
    manageUsers: (user: Models.User<any> | MatchFeverUser): boolean => {
        return getUserPermissions(user).canManageUsers;
    },
};

/**
 * Role-based permission templates
 */
export const rolePermissions: Record<UserRole, UserPermissions> = {
    public: {
        canView: true,
        canCreateTournaments: false,
        canUpdateScores: false,
        canManageUsers: false,
    },
    organizer: {
        canView: true,
        canCreateTournaments: true,
        canUpdateScores: false,
        canManageUsers: false,
    },
    staff: {
        canView: true,
        canCreateTournaments: false,
        canUpdateScores: true,
        canManageUsers: false,
    },
    admin: {
        canView: true,
        canCreateTournaments: true,
        canUpdateScores: true,
        canManageUsers: true,
    },
};

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
        public: "Viewer",
        organizer: "Tournament Organizer",
        staff: "Staff Member",
        admin: "Administrator",
    };

    return roleNames[role] || "Unknown Role";
}

/**
 * Check if user has any of the specified roles
 */
export function userHasRole(
    user: Models.User<any> | MatchFeverUser,
    roles: UserRole[]
): boolean {
    const userRole = getUserRole(user);
    return userRole ? roles.includes(userRole) : false;
}

/**
 * Check if user has all required permissions
 */
export function userHasPermissions(
    user: Models.User<any> | MatchFeverUser,
    requiredPermissions: Partial<UserPermissions>
): boolean {
    const userPermissions = getUserPermissions(user);

    return Object.entries(requiredPermissions).every(
        ([permission, required]) => {
            if (required === true) {
                return (
                    userPermissions[permission as keyof UserPermissions] ===
                    true
                );
            }
            return true;
        }
    );
}
