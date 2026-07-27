// app/dashboard/DashboardClient.tsx
"use client";

import { usePreloadedQuery, Preloaded } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useLanguage } from "@/components/web/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

type Props = {
  preloadedSessions: Preloaded<typeof api.sessions.listRecent>;
  preloadedStats: Preloaded<typeof api.sessions.getStats>;
};

export function DashboardClient({ preloadedSessions, preloadedStats }: Props) {
  // Resolves instantly with the server-preloaded data on first render
  // never undefined, no loading state needed here. Live-updates after
  // that if the underlying data changes (e.g. a session completes
  // elsewhere), same as a normal useQuery would.
  const sessions = usePreloadedQuery(preloadedSessions);
  const stats = usePreloadedQuery(preloadedStats);

  return (
    <div className={`min-h-screen bg-background px-6 py-10 md:px-10 ${quicksand.className}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeader />
        <StatsRow stats={stats} />
        <RecentSessions sessions={sessions} />
      </div>
    </div>
  );
}

function DashboardHeader() {
    const { t } = useLanguage();
  return (
    <div className="flex flex-col pt-20 items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className={`${quicksand.className} text-3xl font-semibold text-foreground`}>{t("Dashboard.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("Dashboard.describe")}
        </p>
      </div>
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <a href="/interview/setup">
         {t("Dashboard.startButton")}
        </a>
      </Button>
    </div>
  );
}

function StatsRow({
  stats,
}: {
  stats: { total: number; average: number; best: number; streak: number };
}) {
   const { t } = useLanguage();

  const items = [
    { label: `${t("Dashboard.totalInterviews")}`, value: stats.total },
    { label: `${t("Dashboard.averageScore")}`, value: `${stats.average}%` },
    { label: `${t("Dashboard.bestScore")}`, value: `${stats.best}%` },
    { label: `${t("Dashboard.series")}`, value: `${stats.streak} days` },
  ];

  

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className={`${quicksand.className}text-sm font-normal text-muted-foreground`}>
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type SessionRow = {
  _id: string;
  role: string;
  score: number;
  duration: string;
  status: string;
  createdAt: number;
};

function RecentSessions({ sessions }: { sessions: SessionRow[] }) {
    const { t } = useLanguage();
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-foreground">
          {t("Dashboard.recent")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>{t("Dashboard.duration")}</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session._id}>
                  <TableCell className="font-medium text-foreground">{session.role}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{session.duration}</TableCell>
                  <TableCell className="text-foreground">{session.score}%</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        session.status === "completed"
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary/15 text-secondary"
                      }
                    >
                      {session.status === "completed" ? t("Dashboard.completed") : "In progress"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="font-serif text-base text-foreground">No interviews yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Start your first mock interview to see your results here.
      </p>
    </div>
  );
}