// apps/web-client/src/middleware.js

import { clerkMiddleware } from '@clerk/nextjs/server';

// This is the modern and recommended approach for Clerk middleware.
export default clerkMiddleware({
  // By default, all routes are protected.
  // We explicitly list the routes that should be PUBLICLY accessible and do not require a login.
  publicRoutes: [
    '/',             // The home page should be public
    '/sign-in(.*)',  // The sign-in pages (and all their sub-pages)
    '/sign-up(.*)',  // The sign-up pages (and all their sub-pages)
  ]
});

export const config = {
  // This specifies which routes the middleware should run on. This default is usually correct.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};