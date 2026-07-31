import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "send practice reminders",
  { minutes: 1 },
  internal.reminders.processDueReminders,
);

export default crons;