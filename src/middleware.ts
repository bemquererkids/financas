import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: [
        // Proteger todas as rotas, EXCETO:
        // - api/auth (login/logout)
        // - api/webhooks (integrações externas como UAZAPI)
        // - arquivos estáticos (_next, imagens)
        "/((?!api/auth|api/webhooks|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)",
    ],
};
