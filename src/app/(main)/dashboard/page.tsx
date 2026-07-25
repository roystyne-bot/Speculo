// app/dashboard/page.tsx
// Server Component — runs during SSR, before anything reaches the browser.
// preloadQuery fetches the data server-side and hands it to the client
// component below already resolved, so there's no skeleton flash on a
// fresh page load. It stays live after that via usePreloadedQuery.
import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { DashboardClient } from "./DashboardClient";



export default async function DashboardPage() {
  const token = await getToken();

  const [preloadedSessions, preloadedStats] = await Promise.all([
    preloadQuery(api.sessions.listRecent, {}, { token }),
    preloadQuery(api.sessions.getStats, {}, { token }),
  ]);

  return <DashboardClient preloadedSessions={preloadedSessions} preloadedStats={preloadedStats} />;
}