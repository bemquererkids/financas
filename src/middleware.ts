import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: [
        // Proteger todas as rotas, EXCETO:
        // - api/auth (login/logout/register)
        // - api/webhooks (integrações externas como UAZAPI)
        // - auth/signin e auth/signup (páginas públicas de autenticação)
        // - arquivos estáticos (_next, imagens)
        "/((?!api/auth|api/webhooks|auth/signin|auth/signup|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)",
    ],
};
