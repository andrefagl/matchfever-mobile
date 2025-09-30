import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { AppwriteException, ID } from "react-native-appwrite";
import { type Models } from "react-native-appwrite";
import { getFriendlyErrorMessage } from "@/platform/appwrite/responseCodesMapping";
import { messages } from "@/constants";
import { type MatchFeverUser } from "../lib/user-permissions";

type UserContextType = {
    user: Models.User<any> | null;
    pendingUser: PendingUser | null;
    authChecked: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signinOrSignup: (email: string) => Promise<void>;
    createOTPSession: (
        secret: string
    ) => Promise<{ needsNameSetup: boolean } | undefined>;
    resendOTP: () => Promise<{ success: boolean } | undefined>;
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
    const [user, setUser] = useState<Models.User<any> | null>(null);
    const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    const throwException = (
        error: Error | AppwriteException,
        context?: string
    ): never => {
        if ("type" in error) {
            const errorMessage = getFriendlyErrorMessage(error.type, context);
            throw new Error(errorMessage);
        } else {
            throw new Error(error.message);
        }
    };

    async function signinOrSignup(email: string) {
        try {
            const userId = ID.unique();
            const sessionToken = await account.createEmailToken({
                userId,
                email,
            });

            setPendingUser({
                id: sessionToken.userId,
                email: email,
            });
        } catch (error) {
            throwException(error as AppwriteException, "email");
        }
    }

    async function createOTPSession(secret: string) {
        try {
            if (!pendingUser) {
                throw new Error(messages.platform.otp.sessionExpired);
            }
            await account.createSession({
                userId: pendingUser.id,
                secret,
            });
            const user = await account.get();

            setUser(user);
            setPendingUser(null);

            const needsNameSetup = !user.name || user.name.trim() === "";
            return { needsNameSetup };
        } catch (error) {
            throwException(error as AppwriteException);
        }
    }

    async function resendOTP() {
        try {
            if (!pendingUser) {
                throw new Error(messages.platform.otp.sessionExpired);
            }

            await account.createEmailToken({
                userId: pendingUser.id,
                email: pendingUser.email,
            });

            return { success: true };
        } catch (error) {
            throwException(error as AppwriteException);
        }
    }

    async function updateUserName(name: string) {
        try {
            if (!user) {
                throw new Error(messages.platform.session.notFound);
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
                resendOTP,
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
