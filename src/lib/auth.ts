import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    // Adapter ativado para persistência no banco
    adapter: PrismaAdapter(prisma) as Adapter,
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email e senha são obrigatórios");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error("Credenciais inválidas");
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Credenciais inválidas");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            }
        }),
    ],
    callbacks: {
        session: async ({ session, token }) => {
            if (session?.user && token?.sub) {
                // @ts-ignore
                session.user.id = token.sub;
            }
            return session;
        },
        jwt: async ({ token, user }) => {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/auth/signin',
    }
};
