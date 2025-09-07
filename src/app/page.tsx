import { getUserFavorites } from "@/app/actions/actions";
import VintageQuotePage from "./quote-page";

export default async function Page() {
  const userId = "demo-user"; // replace with real session user
  const userFavorites = await getUserFavorites(userId);

  return (
    <VintageQuotePage
      userId={userId}
      initialFavorites={userFavorites}
      initialDarkMode={false}
    />
  );
}
