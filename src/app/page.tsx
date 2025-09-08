import {
  getUserFavorites,
  syncUser,
  isAuthenticated,
  toggleFavorite,
} from "@/app/actions/actions";
import VintageQuotePage from "../components/quote-page";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: { fav?: string };
}) {
  try {
    const isAuth = await isAuthenticated();
    const userId = isAuth ? await syncUser() : null;

    if (isAuth && searchParams?.fav) {
      const quoteId = Number(searchParams.fav);
      if (!Number.isNaN(quoteId)) {
        await toggleFavorite(quoteId);
        redirect("/");
      }
    }

    const userFavorites = isAuth ? await getUserFavorites() : [];

    return (
      <VintageQuotePage
        userId={userId}
        initialFavorites={userFavorites}
        isAuthenticated={isAuth}
      />
    );
  } catch (error) {
    return (
      <VintageQuotePage
        userId={null}
        initialFavorites={[]}
        isAuthenticated={false}
      />
    );
  }
}
