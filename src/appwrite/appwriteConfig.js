import { Client, Account, Databases, Storage } from "appwrite"

const client = new Client();
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECTID)

// Auth
export const account = new Account(client)

// Database
export const databases = new Databases(client)

export const storage = new Storage(client);
