"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { toggleFavorite, getRandomQuote } from "@/app/actions/actions";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeToggle";

type Quote = {
  id: number;
  text: string;
  author: string;
};

export default function VintageQuotePage({
  initialFavorites,
  isAuthenticated,
}: {
  userId: string | null;
  initialFavorites: Quote[];
  isAuthenticated: boolean;
}) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Quote[]>(initialFavorites);
  const [viewMode, setViewMode] = useState<"discover" | "favorites">(
    "discover"
  );
  const [, startTransition] = useTransition();

  const fetchRandomQuote = async () => {
    setIsLoading(true);
    try {
      const randomQuote = await getRandomQuote();
      setCurrentQuote(randomQuote);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (quote: Quote) => {
    if (!isAuthenticated) {
      return;
    }
    const quoteId = quote.id;
    setFavorites((prev) => {
      const isCurrentlyFavorite = prev.some((fav) => fav.id === quoteId);
      if (isCurrentlyFavorite) {
        return prev.filter((fav) => fav.id !== quoteId);
      } else {
        return [...prev, quote];
      }
    });

    startTransition(async () => {
      try {
        await toggleFavorite(quoteId);
      } catch (error) {
        setFavorites((prev) => {
          const isCurrentlyFavorite = prev.some((fav) => fav.id === quoteId);
          if (isCurrentlyFavorite) {
            return [...prev, quote];
          } else {
            return prev.filter((fav) => fav.id !== quoteId);
          }
        });
      }
    });
  };

  const isFavorite = (quote: Quote) =>
    favorites.some((fav) => fav.id === quote.id);

  return (
    <div className="bg-background text-foreground">
      <div className="flex flex-col items-center justify-center min-h-screen p-8 max-w-4xl mx-auto">
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <ModeToggle />

          {isAuthenticated ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-sans font-bold mb-2 text-foreground">
            PeakSlork
          </h1>
          <p className="font-light text-muted-foreground">
            Discover timeless wisdom
          </p>
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
          {isAuthenticated && (
            <Button
              onClick={() => setViewMode("favorites")}
              variant={viewMode === "favorites" ? "default" : "ghost"}
              className="font-light px-6 py-2 rounded-full transition-all duration-200"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites
              {favorites.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-chart-2">
                  {favorites.length}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Content */}
        {viewMode === "discover" ? (
          <>
            <div className="max-w-2xl w-full mb-12">
              {currentQuote ? (
                <Card className="relative bg-card border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-8">
                    {isAuthenticated ? (
                      <Button
                        onClick={() => handleToggleFavorite(currentQuote)}
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full hover:bg-accent"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isFavorite(currentQuote)
                              ? "text-primary fill-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                        />
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-4 right-4 rounded-full hover:bg-accent"
                        >
                          <Heart className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        </Button>
                      </SignInButton>
                    )}

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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-light text-base px-8 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "New quote"
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
                    className="relative border-border border-dashed bg-card transition-all duration-200"
                  >
                    <CardContent className="p-6">
                      <Button
                        onClick={() => handleToggleFavorite(quote)}
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 rounded-full hover:bg-accent"
                      >
                        <Heart className="w-4 h-4 text-primary fill-primary" />
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
                    Tap the heart on any quote
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
