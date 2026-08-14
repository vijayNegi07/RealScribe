import {betterAuth} from "better-auth"
import { getClient} from "./dbConnect"
import { mongodbAdapter } from "better-auth/adapters/mongodb";


const client = await getClient();

export const auth = betterAuth({
    database:mongodbAdapter(client),
    emailAndPassword:{
        enabled:true
    },
    user: {
        deleteUser: { 
            enabled: true
        } 
    },
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        "http://localhost:3000", // keep local dev working too
    ],
    plugins:[
    ]
})