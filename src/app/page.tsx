import { getUserFavorites } from "@/app/actions/actions";
import VintageQuotePage from "./quote-page";

type PageProps = {
  searchParams: { user?: string };
};

export default async function Page({ searchParams }: PageProps) {
  // Get userId from URL params, default to "demo-user"
  const userId = searchParams.user || "demo-user";
  const userFavorites = await getUserFavorites(userId);

  return <VintageQuotePage userId={userId} initialFavorites={userFavorites} />;
}
