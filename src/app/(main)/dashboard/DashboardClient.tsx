
"use client";

import { usePreloadedQuery, Preloaded, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ReminderSettings } from "@/components/web/ReminderSettings";
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
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Lightbulb, ChevronRight, TrendingUp } from "lucide-react";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

type Props = {
  preloadedSessions: Preloaded<typeof api.sessions.listRecent>;
  preloadedStats: Preloaded<typeof api.sessions.getStats>;
};

export function DashboardClient({ preloadedSessions, preloadedStats }: Props) {
  const sessions = usePreloadedQuery(preloadedSessions);
  const stats = usePreloadedQuery(preloadedStats);
  const streak = stats.streak ?? 0;

  const currentUserName = useQuery(api.users.getCurrentUserName);

  return (
    <div className={`min-h-screen bg-background px-6 py-10 md:px-10 ${quicksand.className}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeader username={currentUserName ?? undefined} />
        <StatsRow stats={stats} />

        {/* Charts row — TODO: replace mock props with real Convex data
            (scoreTrend from sessions grouped chronologically,
             topicBreakdown from messages grouped by question category) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <ScoreTrendCard />
          </div>
          <AiInsightCard />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TopicDonutCard />
          <ScoreAreaCard />
        </div>

        <ReminderSettings />
        <RecentSessions sessions={sessions} />
      </div>
    </div>
  );
}

function DashboardHeader({ username }: { username?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col pt-20 items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className={`${quicksand.className} text-3xl font-semibold text-foreground`}>
          {username ? `Welcome, ${username}` : t("Dashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("Dashboard.describe")}</p>
      </div>
      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
        <a href="/interview/setup">{t("Dashboard.startButton")}</a>
      </Button>
    </div>
  );
}

// ============================================================
// STAT ROW — fixed alignment: label pinned top, number pinned bottom
// regardless of how many lines the label wraps to.
// ============================================================

function StatsRow({
  stats,
}: {
  stats: { total: number; average: number; best: number; streak: number };
}) {
  const { t } = useLanguage();

  const items = [
    { label: t("Dashboard.totalInterviews"), value: stats.total },
    { label: t("Dashboard.averageScore"), value: `${stats.average}%` },
    { label: t("Dashboard.bestScore"), value: `${stats.best}%` },
    {
      label: t("Dashboard.series"),
      value: `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border bg-card flex flex-col justify-between min-h-[150px]">
          <CardHeader className="pb-2">
            <CardTitle
              className={`${quicksand.className} text-sm font-normal text-muted-foreground leading-snug`}
            >
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

// ============================================================
// SCORE TREND — rounded-pill bar chart
// ============================================================

// TODO: replace with real data, e.g. useQuery(api.sessions.getScoreTrend)
const mockScoreTrend = [
  { label: "S1", value: 52 },
  { label: "S2", value: 58 },
  { label: "S3", value: 61 },
  { label: "S4", value: 55 },
  { label: "S5", value: 68 },
  { label: "S6", value: 74 },
  { label: "S7", value: 79 },
];

function ScoreTrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 shadow-lg">
      {label}: {payload[0].value}%
    </div>
  );
}

function ScoreTrendCard() {
  const data = mockScoreTrend;
  const highlightIndex = data.length - 1; // most recent session highlighted

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          Score Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="28%">
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip content={<ScoreTrendTooltip />} cursor={false} />
            <Bar dataKey="value" radius={[24, 24, 24, 24]} isAnimationActive>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={i === highlightIndex ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================
// AI INSIGHT — surfaces the weakest topic from scoring data
// ============================================================

// TODO: replace with real weakest-topic detection from Groq scoring history
const mockWeakestTopic = { name: "Recursion", dropPct: 15 };

function AiInsightCard() {
  return (
    <Card className="border-border bg-card flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI insight
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your scores on <span className="font-medium text-foreground">{mockWeakestTopic.name}</span>{" "}
          questions dropped {mockWeakestTopic.dropPct}% this week. Want a focused practice set?
        </p>
        <Button
          variant="outline"
          className="mt-4 flex items-center justify-center gap-1 border-primary text-primary hover:bg-primary/10"
        >
          Practice {mockWeakestTopic.name.toLowerCase()}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================
// TOPIC DONUT — rounded end caps
// ============================================================

// TODO: replace with real topic distribution from messages grouped by category
const mockTopicBreakdown = [
  { name: "Arrays & Strings", value: 35, color: "hsl(var(--primary))" },
  { name: "System Design", value: 22, color: "hsl(var(--primary) / 0.7)" },
  { name: "Behavioral", value: 18, color: "hsl(var(--primary) / 0.5)" },
  { name: "Recursion", value: 15, color: "hsl(var(--primary) / 0.3)" },
  { name: "Other", value: 10, color: "hsl(var(--muted-foreground) / 0.3)" },
];

function TopicDonutCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">Topic breakdown</CardTitle>
        <p className="text-xs text-muted-foreground">Questions practiced by category</p>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={mockTopicBreakdown}
              dataKey="value"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={4}
              cornerRadius={12}
              stroke="none"
            >
              {mockTopicBreakdown.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 text-xs">
          {mockTopicBreakdown.map((t) => (
            <div key={t.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-foreground">{t.name}</span>
              <span className="text-muted-foreground">{t.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SCORE AREA CHART — weekly average trend
// ============================================================

// TODO: replace with real per-day average score from sessions this week
const mockAreaData = [
  { day: "Mon", score: 55 },
  { day: "Tue", score: 62 },
  { day: "Wed", score: 58 },
  { day: "Thu", score: 70 },
  { day: "Fri", score: 66 },
  { day: "Sat", score: 76 },
  { day: "Sun", score: 79 },
];

function ScoreAreaCard() {
  return (
    <Card className="border-border bg-card md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <p className="text-sm text-muted-foreground">Average score this week</p>
          <p className="text-2xl font-semibold text-foreground">79%</p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={mockAreaData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="url(#scoreFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================
// RECENT SESSIONS
// ============================================================

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