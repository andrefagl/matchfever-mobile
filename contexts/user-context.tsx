import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { ID } from "react-native-appwrite";
import { type Models } from "react-native-appwrite";

export const UserContext = createContext({
    user: null as Models.User<Models.Preferences> | null,
    authChecked: false,
    signIn: async (email: string, password: string) => {},
    signUp: async (email: string, password: string) => {},
    signOut: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
        null
    );
    const [authChecked, setAuthChecked] = useState(false);

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

    async function signUp(email: string, password: string) {
        try {
            await account.create({
                userId: ID.unique(),
                email,
                password,
            });
            await signIn(email, password);
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    async function signOut() {
        await account.deleteSession({ sessionId: "current" });
        setUser(null);
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
            value={{ user, authChecked, signIn, signUp, signOut }}
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
