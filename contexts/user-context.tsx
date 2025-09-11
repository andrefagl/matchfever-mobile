import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { ID } from "react-native-appwrite";
import { type Models } from "react-native-appwrite";

type UserContextType = {
    user: Models.User<Models.Preferences> | null;
    pendingUser: PendingUser | null;
    authChecked: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signinOrSignup: (email: string) => Promise<void>;
    createOTPSession: (secret: string) => Promise<{ needsNameSetup: boolean }>;
    updateUserName: (name: string) => Promise<void>;
};

interface PendingUser {
    id: string;
    email: string;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
        null
    );
    const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    async function signinOrSignup(email: string) {
        try {
            const userId = ID.unique();
            const sessionToken = await account.createEmailToken({
                userId,
                email,
            });

            // Store the pending user with both ID and email
            setPendingUser({
                id: sessionToken.userId,
                email: email,
            });
            console.log("sopas sessionToken: ", sessionToken);
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    async function createOTPSession(secret: string) {
        try {
            if (!pendingUser) {
                throw new Error(
                    "Your session has expired. Please sign in again."
                );
            }
            await account.createSession({
                userId: pendingUser.id,
                secret,
            });
            const user = await account.get();

            setUser(user);
            // Clear pending user after successful session creation
            setPendingUser(null);

            // Check if user needs to set their name
            const needsNameSetup = !user.name || user.name.trim() === "";
            return { needsNameSetup };
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    async function updateUserName(name: string) {
        try {
            if (!user) {
                throw new Error("No user session found. Please sign in again.");
            }

            // Update user name using Appwrite's updateName method
            await account.updateName({ name });

            // Refresh user data to get the updated information
            const updatedUser = await account.get();
            setUser(updatedUser);
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    async function signIn(email: string, password: string) {
        try {
            await account.createEmailPasswordSession({
                email,
                password,
            });
            const user = await account.get();
            setUser(user);
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    async function signOut() {
        await account.deleteSession({ sessionId: "current" });
        setUser(null);
        setPendingUser(null);
    }

    const getUserInitialValue = async () => {
        try {
            const user = await account.get();
            setUser(user);
        } catch (error) {
            setUser(null);
        } finally {
            setAuthChecked(true);
        }
    };

    useEffect(() => {
        getUserInitialValue();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                pendingUser,
                authChecked,
                signIn,
                signOut,
                signinOrSignup,
                createOTPSession,
                updateUserName,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
