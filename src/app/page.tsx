import { getUserFavorites, syncUser } from "@/app/actions/actions";
import VintageQuotePage from "./quote-page";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default async function Page() {
  // Sync user with database
  const userId = await syncUser();
  const userFavorites = await getUserFavorites();

  return (
    <>
      <SignedIn>
        <VintageQuotePage userId={userId} initialFavorites={userFavorites} />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md w-full p-8 text-center">
            <h1 className="text-3xl font-light mb-8">Welcome to Quotes</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to discover and save your favorite quotes
            </p>
            <SignInButton mode="modal">
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-light py-2 px-6 rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
