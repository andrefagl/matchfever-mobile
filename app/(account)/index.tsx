import { useUser } from "@/contexts/user-context";
import { Redirect } from "expo-router";

export default function AccountIndex() {
    const { user } = useUser();
    return <Redirect href={user ? "/(account)/profile" : "/(account)/signin"} />;
}
