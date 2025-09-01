// apps/web-client/src/middleware.js

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// This is a more modern and recommended approach for Clerk middleware.
export default clerkMiddleware({
  // By default, all routes are protected.
  // We explicitly list the routes that should be PUBLICLY accessible.
  publicRoutes: [
    '/', // The home page should be public
    '/sign-in(.*)', // The sign-in pages
    '/sign-up(.*)', // The sign-up pages
  ]
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};