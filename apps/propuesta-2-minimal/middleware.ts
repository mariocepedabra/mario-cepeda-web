import type { NextRequest } from 'next/server';

import { protectAdmin } from '@mario/core/auth';

export function middleware(request: NextRequest) {
  return protectAdmin(request);
}

export const config = {
  matcher: ['/admin/:path*'],
};
