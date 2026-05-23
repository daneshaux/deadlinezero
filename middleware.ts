// Auth protection for /dashboard is handled by app/(dashboard)/layout.tsx
// using auth() in Node/server context, which supports Prisma + pg.
// Middleware runs in Edge runtime and cannot import Prisma-backed auth.
export function middleware() {}
export const config = { matcher: [] }
