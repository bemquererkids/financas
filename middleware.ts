export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        // Protect all routes except internal APIs (if needed public) and static files
        "/((?!api/whatsapp|login|static|.*\\..*|_next).*)",
    ],
};
