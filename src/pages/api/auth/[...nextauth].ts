import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import argon2 from "argon2";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email or password");
                }
                
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                
                // No user found
                if (!user || !user.password_hash) {
                    throw new Error("Invalid details");
                }
                
                // incorrect password
                const valid = await argon2.verify(user.password_hash, credentials.password);
                if (!valid) {
                    throw new Error("Invalid details");
                }
                
                return {
                    id: user.user_id.toString(),
                    name: user.username,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],

    secret: process.env.AUTH_SECRET,

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            } 
            return token;
        },
        async session({ session, token }: {session: Session; token: JWT}) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },

    events: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const password_hash = await argon2.hash(crypto.randomUUID());
                await prisma.user.upsert({
                    where: { email: user.email! },
                    create: {
                        username: user.name ?? user.email!.split("@")[0],
                        email: user.email!,
                        password_hash,
                        role: "customer",
                    },
                    update: {
                        // you could update their name here
                        username: user.name ?? user.email!.split("@")[0],
                    },
                });
            }
        },
    }
};

export default NextAuth(authOptions);

