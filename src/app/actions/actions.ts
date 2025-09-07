"use server";

import db from "@/db";
import { quotes, favorites, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from '@clerk/nextjs/server';

// Check if user is authenticated
export async function isAuthenticated() {
  try {
    const { userId } = await auth();
    return !!userId;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

// Sync user with database
export async function syncUser() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId || !clerkUser) return null;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || null,
      });
    } else {
      // Update existing user info
      await db
        .update(users)
        .set({
          email: clerkUser.emailAddresses[0]?.emailAddress || null,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || null,
        })
        .where(eq(users.clerkId, userId));
    }

    return userId;
  } catch (error) {
    console.error("Error syncing user:", error);
    return null;
  }
}

// Fetch a random quote from the database (works for anonymous users)
export async function getRandomQuote() {
  try {
    const { userId } = await auth();
    
    const randomQuote = await db
      .select()
      .from(quotes)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomQuote.length === 0) {
      return null;
    }

    const quote = randomQuote[0];

    // Only check favorites if user is authenticated
    if (userId) {
      const isFav = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.quoteId, quote.id)))
        .limit(1);

      return {
        ...quote,
        isFavorite: isFav.length > 0,
      };
    }

    // For anonymous users, return quote without favorite status
    return {
      ...quote,
      isFavorite: false,
    };
  } catch (error) {
    console.error("Error fetching random quote:", error);
    throw error;
  }
}

// Get only the user's favorite quotes (requires authentication)
export async function getUserFavorites() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const userFavorites = await db.select({
      id: quotes.id,
      text: quotes.text,
      author: quotes.author,
    })
      .from(favorites)
      .innerJoin(quotes, eq(favorites.quoteId, quotes.id))
      .where(eq(favorites.userId, userId));

    return userFavorites;
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return [];
  }
}

// Toggle favorite (requires authentication)
export async function toggleFavorite(quoteId: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error('User not authenticated');

    const existing = await db.select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.quoteId, quoteId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    } else {
      await db.insert(favorites).values({ userId, quoteId });
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}