import { getUserFavorites } from "@/app/actions/actions";
import VintageQuotePage from "./quote-page";

type PageProps = {
  searchParams: Promise<{ user?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  // Await the searchParams Promise
  const params = await searchParams;
  const userId = params.user || "demo-user";
  const userFavorites = await getUserFavorites(userId);

  return <VintageQuotePage userId={userId} initialFavorites={userFavorites} />;
}
