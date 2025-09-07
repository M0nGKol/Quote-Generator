import {
  getUserFavorites,
  syncUser,
  isAuthenticated,
} from "@/app/actions/actions";
import VintageQuotePage from "./quote-page";

export default async function Page() {
  try {
    const isAuth = await isAuthenticated();
    const userId = isAuth ? await syncUser() : null;
    const userFavorites = isAuth ? await getUserFavorites() : [];

    return (
      <VintageQuotePage
        userId={userId}
        initialFavorites={userFavorites}
        isAuthenticated={isAuth}
      />
    );
  } catch (error) {
    console.error("Error in page:", error);
    // Fallback to anonymous mode
    return (
      <VintageQuotePage
        userId={null}
        initialFavorites={[]}
        isAuthenticated={false}
      />
    );
  }
}
