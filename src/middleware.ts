import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: [
        // Proteger todas as rotas, exceto arquivos estáticos do Next.js, imagens e a própria rota de API de auth
        "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)",
    ],
};
