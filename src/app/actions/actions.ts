"use server";

import db from "@/db";
import { quotes, favorites } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Fetch all quotes (can be filtered by favorites if needed)
export async function getAllQuotes(userId?: string) {
  const allQuotes = await db.select().from(quotes);

  if (userId) {
    const favs = await db.select({ quoteId: favorites.quoteId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    const favIds = favs.map(f => f.quoteId);

    return allQuotes.map(q => ({
      ...q,
      isFavorite: favIds.includes(q.id),
    }));
  }

  return allQuotes;
}

// Fetch a random quote from the database
export async function getRandomQuote(userId?: string) {
  try {
    const randomQuote = await db
      .select()
      .from(quotes)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (randomQuote.length === 0) {
      return null;
    }

    const quote = randomQuote[0];
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

    return quote;
  } catch (error) {
    throw error;
  }
}

// Get only the user's favorite quotes
export async function getUserFavorites(userId: string) {
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
export async function toggleFavorite(userId: string, quoteId: number) {
  try {
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