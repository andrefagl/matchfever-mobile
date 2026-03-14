import { createContext, useContext, useEffect, useState } from "react";
import { messages } from "@/constants";
import { clearSessionCache } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

type User = {
    id: string;
    email: string;
    name?: string | null;
};

type UserContextType = {
    user: User | null;
    pendingUser: PendingUser | null;
    authChecked: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signinOrSignup: (email: string) => Promise<void>;
    createOTPSession: (
        secret: string,
    ) => Promise<{ needsNameSetup: boolean } | undefined>;
    resendOTP: () => Promise<{ success: boolean } | undefined>;
    updateUserName: (name: string) => Promise<void>;
};

interface PendingUser {
    id: string;
    email: string;
}

export const UserContext = createContext<UserContextType | undefined>(
    undefined,
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [pendingUser, setPendingUser] = useState<PendingUser | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    const mapUser = (sessionUser: {
        id: string;
        email: string;
        name?: string | null;
    }): User => ({
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name ?? null,
    });

    const throwAuthError = (error: unknown): never => {
        const message =
            typeof error === "object" &&
            error &&
            "message" in error &&
            typeof (error as { message?: string }).message === "string"
                ? (error as { message: string }).message
                : messages.platform.general.unexpectedError;
        throw new Error(message);
    };

    async function signinOrSignup(email: string) {
        const result = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "sign-in",
        });

        if (result.error) {
            throwAuthError(result.error);
        }

        setPendingUser({
            id: email,
            email,
        });
    }

    async function createOTPSession(secret: string) {
        if (!pendingUser) {
            throw new Error(messages.platform.otp.sessionExpired);
        }

        const signInResult = await authClient.signIn.emailOtp({
            email: pendingUser.email,
            otp: secret,
        });

        if (signInResult.error) {
            throwAuthError(signInResult.error);
        }

        const sessionResult = await authClient.getSession();

        if (sessionResult.error) {
            throwAuthError(sessionResult.error);
        }

        const sessionUser = sessionResult.data?.user;
        if (!sessionUser) {
            throw new Error(messages.platform.general.unexpectedError);
        }

        setUser(mapUser(sessionUser));
        setPendingUser(null);

        const needsNameSetup =
            !sessionUser.name || sessionUser.name.trim() === "";
        return { needsNameSetup };
    }

    async function resendOTP() {
        if (!pendingUser) {
            throw new Error(messages.platform.otp.sessionExpired);
        }

        const result = await authClient.emailOtp.sendVerificationOtp({
            email: pendingUser.email,
            type: "sign-in",
        });

        if (result.error) {
            throwAuthError(result.error);
        }

        return { success: true };
    }

    async function updateUserName(name: string) {
        if (!user) {
            throw new Error(messages.platform.session.notFound);
        }

        const updateResult = await authClient.updateUser({ name });
        if (updateResult.error) {
            throwAuthError(updateResult.error);
        }

        const sessionResult = await authClient.getSession();
        if (sessionResult.error) {
            throwAuthError(sessionResult.error);
        }

        const sessionUser = sessionResult.data?.user;
        if (sessionUser) {
            setUser(mapUser(sessionUser));
        }
    }

    async function signIn(email: string, password: string) {
        const result = await authClient.signIn.email({
            email,
            password,
        });

        if (result.error) {
            throwAuthError(result.error);
        }

        const sessionResult = await authClient.getSession();
        if (sessionResult.error) {
            throwAuthError(sessionResult.error);
        }

        const sessionUser = sessionResult.data?.user;
        if (sessionUser) {
            setUser(mapUser(sessionUser));
        }
    }

    async function signOut() {
        const result = await authClient.signOut();
        if (result.error) {
            throwAuthError(result.error);
        }
        clearSessionCache();
        setUser(null);
        setPendingUser(null);
    }

    const getUserInitialValue = async () => {
        try {
            const sessionResult = await authClient.getSession();
            if (sessionResult.error) {
                setUser(null);
                setAuthChecked(true);
                return;
            }

            const sessionUser = sessionResult.data?.user;
            setUser(sessionUser ? mapUser(sessionUser) : null);
        } catch {
            // e.g. network unreachable (device using localhost), treat as logged out
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
