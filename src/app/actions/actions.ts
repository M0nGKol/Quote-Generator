"use server";

import db from "@/db";
import { quotes, favorites, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function isAuthenticated() {
  try {
    const { userId } = await auth();
    return Boolean(userId);
  } catch {
    return false;
  }
}

export async function syncUser() {
  try {
    const { userId } = await auth();
    const profile = await currentUser();

    if (!userId || !profile) return null;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    const name =
      `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
      profile.username ||
      null;
    const email = profile.emailAddresses[0]?.emailAddress || null;

    if (existing.length === 0) {
      await db.insert(users).values({
        clerkId: userId,
        email,
        name,
      });
    } else {
      await db
        .update(users)
        .set({ email, name })
        .where(eq(users.clerkId, userId));
    }

    return userId;
  } catch {
    return null;
  }
}
export async function getRandomQuote() {
  try {
    const { userId } = await auth();

    const rows = await db.select().from(quotes).orderBy(sql`RANDOM()`).limit(1);
    if (rows.length === 0) return null;

    const quote = rows[0];

    if (!userId) {
      return { ...quote, isFavorite: false };
    }

    const fav = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.quoteId, quote.id)))
      .limit(1);

    return { ...quote, isFavorite: fav.length > 0 };
  } catch (error) {
    throw error;
  }
}

export async function getUserFavorites() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const userFavorites = await db
      .select({
        id: quotes.id,
        text: quotes.text,
        author: quotes.author,
      })
      .from(favorites)
      .innerJoin(quotes, eq(favorites.quoteId, quotes.id))
      .where(eq(favorites.userId, userId));

    return userFavorites;
  } catch {
    return [];
  }
}

export async function toggleFavorite(quoteId: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Not authenticated");

    const existing = await db
      .select()
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