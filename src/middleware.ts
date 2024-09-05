import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

const publicRoutes = [
  '/',
  '/api/clerk-webhook',
  '/api/drive-activity/notification',
  '/api/payment/success',
];

const ignoredRoutes = [
  '/api/auth/callback/discord',
  '/api/auth/callback/notion',
  '/api/auth/callback/slack',
  '/api/flow',
  '/api/cron/wait',
];

function isPublicRoute(pathname: string) {
  return publicRoutes.includes(pathname);
}

function isIgnoredRoute(pathname: string) {
  return ignoredRoutes.includes(pathname);
}

export default function middleware(req: NextRequest, event: any) {
  const { pathname } = req.nextUrl;

  // If the route is public, proceed without Clerk
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If the route is ignored, proceed without Clerk
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // Apply Clerk middleware for all other routes
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
// https://www.googleapis.com/auth/userinfo.email
// https://www.googleapis.com/auth/userinfo.profile
// https://www.googleapis.com/auth/drive.activity.readonly
// https://www.googleapis.com/auth/drive.metadata
// https://www.googleapis.com/auth/drive.readonly