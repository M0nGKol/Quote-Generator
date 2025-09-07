import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const isProtectedRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
    
    // Sync user with database
    const { userId } = await auth();
    if (userId) {
      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, userId))
          .limit(1);

        if (existingUser.length === 0) {
          // User doesn't exist in our database, create them
          // We'll get user details from Clerk in the server action
          await db.insert(users).values({
            clerkId: userId,
            email: null, // Will be updated by server action
            name: null,  // Will be updated by server action
          });
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    }
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};