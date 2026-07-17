"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Adjust this shape to match your actual Convex schema for the sessions table.
type Session = {
  _id: string;
  role: string;
  score: number;
  duration: string;
  status: "completed" | "in_progress";
  createdAt: number;
};

export default function DashboardPage() {
  // useQuery returns undefined while loading, then the data, then live updates.
  // Convex caches this automatically, so no extra caching layer is needed.
  const sessions = useQuery(api.sessions.listRecent) as Session[] | undefined;
  const stats = useQuery(api.sessions.getStats) as
    | { total: number; average: number; best: number; streak: number }
    | undefined;

  const isLoading = sessions === undefined || stats === undefined;

  return (
    <div className="min-h-screen bg-background px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeader />
        <StatsRow stats={stats} loading={isLoading} />
        <RecentSessions sessions={sessions} loading={isLoading} />
      </div>
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your interview practice and progress.
        </p>
      </div>
      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
        <a href="/interview/setup">Start new interview</a>
      </Button>
    </div>
  );
}

function StatsRow({
  stats,
  loading,
}: {
  stats?: { total: number; average: number; best: number; streak: number };
  loading: boolean;
}) {
  const items = [
    { label: "Total interviews", value: stats?.total },
    { label: "Average score", value: stats ? `${stats.average}%` : undefined },
    { label: "Best score", value: stats ? `${stats.best}%` : undefined },
    {
      label: "Practice streak",
      value: stats ? `${stats.streak} days` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-sm font-normal text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold text-foreground">
                {item.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentSessions({
  sessions,
  loading,
}: {
  sessions?: Session[];
  loading: boolean;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-serif text-lg font-medium text-foreground">
          Recent interviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SessionsSkeleton />
        ) : sessions && sessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session._id}>
                  <TableCell className="font-medium text-foreground">
                    {session.role}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {session.duration}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {session.score}%
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        session.status === "completed"
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary/15 text-secondary"
                      }
                    >
                      {session.status === "completed"
                        ? "Completed"
                        : "In progress"}
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

function SessionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
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
