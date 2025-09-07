"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toggleFavorite, getRandomQuote } from "@/app/actions/actions";

type Quote = {
  id: number;
  text: string;
  author: string;
  isFavorite?: boolean;
};

export default function VintageQuotePage({
  userId,
  initialFavorites,
}: {
  userId: string;
  initialFavorites: Quote[];
}) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Quote[]>(initialFavorites);
  const [viewMode, setViewMode] = useState<"discover" | "favorites">(
    "discover"
  );
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();

  const fetchRandomQuote = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const randomQuote = await getRandomQuote(userId);
      setCurrentQuote(randomQuote);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (quote: Quote) => {
    const quoteId = quote.id;
    setFavorites((prev) => {
      const isCurrentlyFavorite = prev.some((fav) => fav.id === quoteId);
      if (isCurrentlyFavorite) {
        return prev.filter((fav) => fav.id !== quoteId);
      } else {
        return [...prev, { ...quote, isFavorite: true }];
      }
    });

    startTransition(async () => {
      try {
        await toggleFavorite(userId, quoteId);
      } catch (error) {
        setFavorites((prev) => {
          const isCurrentlyFavorite = prev.some((fav) => fav.id === quoteId);
          if (isCurrentlyFavorite) {
            return [...prev, { ...quote, isFavorite: true }];
          } else {
            return prev.filter((fav) => fav.id !== quoteId);
          }
        });
      }
    });
  };

  const isFavorite = (quote: Quote) =>
    favorites.some((fav) => fav.id === quote.id);

  const switchUser = (newUserId: string) => {
    window.location.href = `/?user=${newUserId}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-col items-center justify-center min-h-screen p-8 max-w-4xl mx-auto">
        {/* User Selector */}
        <div className="absolute top-6 left-6">
          <select
            value={userId}
            onChange={(e) => switchUser(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="demo-user">Demo User</option>
            <option value="alice">Alice</option>
            <option value="bob">Bob</option>
            <option value="charlie">Charlie</option>
            <option value="diana">Diana</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <Button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            variant="ghost"
            size="icon"
            className="rounded-full transition-colors duration-200 hover:bg-accent"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-sans font-light mb-2 tracking-tight text-foreground">
            Quotes
          </h1>
          <p className="font-light text-muted-foreground">Welcome, {userId}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-12">
          <Button
            onClick={() => setViewMode("discover")}
            variant={viewMode === "discover" ? "default" : "ghost"}
            className="font-light px-6 py-2 rounded-full transition-all duration-200"
          >
            Discover
          </Button>
          <Button
            onClick={() => setViewMode("favorites")}
            variant={viewMode === "favorites" ? "default" : "ghost"}
            className="font-light px-6 py-2 rounded-full transition-all duration-200"
          >
            <Heart className="w-4 h-4 mr-2" />
            Favorites
            {favorites.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {favorites.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Content */}
        {viewMode === "discover" ? (
          <>
            <div className="max-w-2xl w-full mb-12">
              {currentQuote ? (
                <Card className="relative bg-card border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-8">
                    <Button
                      onClick={() => handleToggleFavorite(currentQuote)}
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 rounded-full hover:bg-accent"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite(currentQuote)
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground hover:text-amber-500"
                        }`}
                      />
                    </Button>

                    <div className="text-center">
                      <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-6 text-balance text-card-foreground">
                        "{currentQuote.text}"
                      </blockquote>
                      <cite className="text-base font-light not-italic text-muted-foreground">
                        — {currentQuote.author}
                      </cite>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed bg-muted/50 border-border">
                  <CardContent className="p-12 text-center">
                    <div className="font-light text-lg text-muted-foreground">
                      Click below to discover a quote
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Button
              onClick={fetchRandomQuote}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-white font-light text-base px-8 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "New Quote"
              )}
            </Button>
          </>
        ) : (
          <div className="max-w-4xl w-full">
            {favorites.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {favorites.map((quote) => (
                  <Card
                    key={quote.id}
                    className="relative bg-card border-border shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <Button
                        onClick={() => handleToggleFavorite(quote)}
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 rounded-full hover:bg-accent"
                      >
                        <Heart className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </Button>

                      <div className="text-center">
                        <blockquote className="text-base font-light leading-relaxed mb-4 text-balance text-card-foreground">
                          "{quote.text}"
                        </blockquote>
                        <cite className="text-sm font-light not-italic text-muted-foreground">
                          — {quote.author}
                        </cite>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-muted/50 border-border">
                <CardContent className="p-12 text-center">
                  <div className="font-light text-lg mb-2 text-muted-foreground">
                    No favorites yet
                  </div>
                  <p className="font-light text-sm text-muted-foreground/80">
                    Save quotes by clicking the heart icon
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
