import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Usuário", type: "text", placeholder: "admin" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials, req) {
                // Environment variable check for User 1 (Admin) and User 2 (Wife)
                const user1 = {
                    username: process.env.APP_USER,
                    password: process.env.APP_PASSWORD,
                    name: "Administrador (Você)"
                };
                const user2 = {
                    username: process.env.APP_WIFE_USER,
                    password: process.env.APP_WIFE_PASSWORD,
                    name: "Esposa"
                };

                if (credentials?.username === user1.username && credentials?.password === user1.password) {
                    return { id: "1", name: user1.name, email: "admin@local" };
                }

                if (user2.username && credentials?.username === user2.username && credentials?.password === user2.password) {
                    return { id: "2", name: user2.name, email: "wife@local" };
                }

                return null;
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "changeme_in_production_please",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
