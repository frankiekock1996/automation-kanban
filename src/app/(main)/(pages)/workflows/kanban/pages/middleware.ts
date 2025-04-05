// pages/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validate } from 'uuid';

export function middleware(req: NextRequest) {
    const uuid = req.nextUrl.pathname.split('/').pop();
    if (!uuid || !validate(uuid)) {
        return NextResponse.redirect(new URL('/404', req.url));
    }
}
