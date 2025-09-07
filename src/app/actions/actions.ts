"use server";

import db from "@/db";
import { quotes, favorites, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from '@clerk/nextjs/server';

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

// Fetch all quotes (can be filtered by favorites if needed)
export async function getAllQuotes() {
  const { userId } = await auth();
  if (!userId) return [];

  const allQuotes = await db.select().from(quotes);

  // Get user's favorite quote IDs
  const favs = await db.select({ quoteId: favorites.quoteId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  const favIds = favs.map(f => f.quoteId);

  return allQuotes.map(q => ({
    ...q,
    isFavorite: favIds.includes(q.id),
  }));
}

// Fetch a random quote from the database
export async function getRandomQuote() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const randomQuote = await db
      .select()
      .from(quotes)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomQuote.length === 0) {
      return null;
    }

    const quote = randomQuote[0];

    const isFav = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.quoteId, quote.id)))
      .limit(1);

    return {
      ...quote,
      isFavorite: isFav.length > 0,
    };
  } catch (error) {
    throw error;
  }
}

// Get only the user's favorite quotes
export async function getUserFavorites() {
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
}

// Toggle favorite
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
    throw error;
  }
}
export async function updateDarkMode(userId: string, darkMode: boolean) {
  try {
    revalidatePath("/");
  } catch (error) {
    throw error;
  }
}