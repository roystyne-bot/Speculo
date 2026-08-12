// app/dashboard/DashboardClient.tsx
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
  AreaChart,
  Area,
} from "recharts";
import { Lightbulb, ChevronRight, TrendingUp } from "lucide-react";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["600", "700"] });

// Brand tokens (from your Tailwind v4 @theme) — used directly since
// they're already full color values, not HSL triplets like shadcn's
// default --primary. Swap these if your token names differ.
const COLOR_SPRING = "var(--color-spring)";
const COLOR_SPRING_PALE = "var(--color-spring-pale)";
const COLOR_SPRING_DEEP = "var(--color-spring-deep)";
const COLOR_ONYX_LIGHT = "var(--color-onyx-light)";
const COLOR_NEUTRAL = "#6B7280"; // fallback gray for "Other" bucket

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
// Colors handled via a custom `shape` render prop instead of <Cell>,
// since Cell is deprecated in recent Recharts versions.
// ============================================================

type RoundedBarProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  dataLength: number;
};

// `shape` receives ONE props object from Recharts — destructuring here
// is correct (unlike .map/.reduce callbacks, which get positional args).
function RoundedBar({ x, y, width, height, index, dataLength }: RoundedBarProps) {
  const isHighlight = index === dataLength - 1;
  const fill = isHighlight ? COLOR_SPRING : COLOR_SPRING_PALE;
  const r = Math.min(width / 2, 16);

  return (
    <path
      d={`
        M${x},${y + r}
        Q${x},${y} ${x + r},${y}
        L${x + width - r},${y}
        Q${x + width},${y} ${x + width},${y + r}
        L${x + width},${y + height}
        L${x},${y + height}
        Z
      `}
      fill={fill}
    />
  );
}

function ScoreTrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg text-xs font-semibold px-3 py-1.5 shadow-lg"
      style={{ backgroundColor: COLOR_SPRING, color: COLOR_ONYX_LIGHT }}
    >
      {label}: {payload[0].value}%
    </div>
  );
}

function ScoreTrendCard() {
  const data = useQuery(api.dashboard.getScoreTrend, { limit: 7 });

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
          <TrendingUp className="h-4 w-4" style={{ color: COLOR_SPRING }} />
          Score Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data === undefined ? (
          <ChartSkeleton height={220} />
        ) : data.length === 0 ? (
          <ChartEmptyState message="Complete a session to see your score trend." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barCategoryGap="28%">
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip content={<ScoreTrendTooltip />} cursor={false} />
              <Bar
                dataKey="value"
                shape={(props: any) => (
                  <RoundedBar {...props} dataLength={data.length} />
                )}
                isAnimationActive
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// AI INSIGHT — surfaces the weakest topic from real scoring data
// ============================================================

function AiInsightCard() {
  const weakest = useQuery(api.dashboard.getWeakestTopic);

  return (
    <Card className="border-border bg-card flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
          <Lightbulb className="h-4 w-4" style={{ color: COLOR_SPRING }} />
          AI insight
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        {weakest === undefined ? (
          <div className="h-16 animate-pulse rounded-md bg-muted" />
        ) : weakest === null ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            No score drops detected yet — keep practicing to unlock insights.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your scores on <span className="font-medium text-foreground">{weakest.name}</span>{" "}
              questions dropped {weakest.dropPct}% this week. Want a focused practice set?
            </p>
            <Button
              variant="outline"
              className="mt-4 flex items-center justify-center gap-1 hover:bg-muted"
              style={{ borderColor: COLOR_SPRING, color: COLOR_SPRING }}
            >
              Practice {weakest.name.toLowerCase()}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// TOPIC DONUT — rounded end caps, colors via per-datum `fill` field
// (Recharts reads each data object's own `fill` key automatically,
// no <Cell> needed)
// ============================================================

const DONUT_PALETTE = [COLOR_SPRING, COLOR_SPRING_DEEP, COLOR_SPRING_PALE, COLOR_ONYX_LIGHT, COLOR_NEUTRAL];

function TopicDonutCard() {
  const raw = useQuery(api.dashboard.getTopicBreakdown);

  // .map callback receives (item, index) as separate positional args —
  // destructure them individually, not as one { } object.
  const data = raw?.map((topic, i) => ({
    ...topic,
    fill: DONUT_PALETTE[i % DONUT_PALETTE.length],
  }));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">Topic breakdown</CardTitle>
        <p className="text-xs text-muted-foreground">Questions practiced by category</p>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {data === undefined ? (
          <ChartSkeleton height={140} width={140} />
        ) : data.length === 0 ? (
          <ChartEmptyState message="No questions practiced yet." />
        ) : (
          <>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={4}
                  cornerRadius={12}
                  stroke="none"
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 text-xs max-h-[140px] overflow-y-auto pr-1">
              {data.map((topic) => (
                <div key={topic.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: topic.fill }}
                  />
                  <span className="text-foreground truncate">{topic.name}</span>
                  <span className="text-muted-foreground shrink-0">{topic.value}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// SCORE AREA CHART — real per-day average, last 7 days
// ============================================================

function ScoreAreaCard() {
  const data = useQuery(api.dashboard.getWeeklyScoreArea);

  // .reduce callback receives (accumulator, currentItem) as separate
  // positional args — destructure them individually, not as { sum, d }.
  const avg =
    data && data.length
      ? Math.round(data.reduce((sum, day) => sum + day.score, 0) / data.length)
      : 0;

  return (
    <Card className="border-border bg-card md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <p className="text-sm text-muted-foreground">Average score this week</p>
          <p className="text-2xl font-semibold text-foreground">
            {data === undefined ? "—" : `${avg}%`}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {data === undefined ? (
          <ChartSkeleton height={100} />
        ) : (
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_SPRING} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLOR_SPRING} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="score"
                stroke={COLOR_SPRING}
                strokeWidth={2.5}
                fill="url(#scoreFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// Shared small helpers
// ============================================================

function ChartSkeleton({ height, width }: { height: number; width?: number }) {
  return (
    <div
      className="animate-pulse rounded-md bg-muted"
      style={{ height, width: width ?? "100%" }}
    />
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[100px] w-full items-center justify-center text-center text-xs text-muted-foreground">
      {message}
    </div>
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