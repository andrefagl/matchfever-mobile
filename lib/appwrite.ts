import { Client, Account, Avatars } from "react-native-appwrite";
import { getCurrentConfig } from "./config";

const config = getCurrentConfig();

export const client: Client = new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setPlatform(config.appwrite.platform);

if (__DEV__ && config.appwrite.devKey) {
    client.setDevKey(config.appwrite.devKey);
}

export const account: Account = new Account(client);
export const avatars: Avatars = new Avatars(client);
