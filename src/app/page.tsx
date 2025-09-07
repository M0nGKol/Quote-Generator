import { getUserFavorites } from "@/app/actions/actions";
import VintageQuotePage from "./quote-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;
  const userId = params.user || "demo-user";
  const userFavorites = await getUserFavorites(userId);

  return <VintageQuotePage userId={userId} initialFavorites={userFavorites} />;
}
