"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function vapidKeyToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);

  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function ReminderSettings() {
  const reminder = useQuery(api.reminders.getMine);
  const saveSubscription = useMutation(api.reminders.saveSubscription);
  const setReminder = useMutation(api.reminders.setReminder);

  const [time, setTime] = useState("19:00");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (reminder) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTime(
        `${String(reminder.hour).padStart(2, "0")}:${String(
          reminder.minute,
        ).padStart(2, "0")}`,
      );
    }
  }, [reminder]);

  async function enableReminders() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setMessage("Push notifications are not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      setMessage("Please allow notifications to enable reminders.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyToUint8Array(publicKey),
      }));

    const keys = subscription.toJSON().keys;

    if (!keys?.p256dh || !keys.auth) {
      setMessage("Could not create a notification subscription.");
      return;
    }

    const [hour, minute] = time.split(":").map(Number);

    await saveSubscription({
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    await setReminder({
      enabled: true,
      hour,
      minute,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    setMessage(`Daily reminder enabled for ${time}.`);
  }

  async function disableReminders() {
    const [hour, minute] = time.split(":").map(Number);

    await setReminder({
      enabled: false,
      hour,
      minute,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    setMessage("Daily reminders disabled.");
  }

  const isEnabled = reminder?.enabled ?? false;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-semibold text-zinc-950 dark:text-white">
        Practice reminders
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Get a daily nudge to continue your interview practice.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />

        <button
          type="button"
          onClick={isEnabled ? disableReminders : enableReminders}
          className="rounded-lg bg-[#75F94C] px-4 py-2 text-sm font-bold text-[#111411]"
        >
          {isEnabled ? "Disable reminders" : "Enable reminders"}
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-zinc-500">{message}</p>}
    </section>
  );
}