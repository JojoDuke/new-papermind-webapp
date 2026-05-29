import { NextResponse } from 'next/server';

const DEMO_COOKIE = 'papermind_demo_used';

/** Clears the one-time demo cookie so the user can generate again (e.g. lost local deck data). */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEMO_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
