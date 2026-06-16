"use client";

import { useState } from "react";

export function ContactForm({ apiUrl }: { apiUrl: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(e.currentTarget),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-lg border border-[var(--site-border)] bg-[var(--site-card)] p-6 text-center">
        <p className="text-lg font-semibold">Mesajınız alındı!</p>
        <p className="mt-1 text-sm text-[var(--site-muted)]">En kısa sürede size geri döneceğiz.</p>
      </div>
    );
  }

  return (
    <form action={apiUrl} method="post" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Ad Soyad</span>
          <input
            name="name"
            required
            className="rounded-md border border-[var(--site-border)] bg-[var(--site-card)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--site-primary)]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">E-posta</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-[var(--site-border)] bg-[var(--site-card)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--site-primary)]"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Telefon <span className="font-normal text-[var(--site-muted)]">(isteğe bağlı)</span></span>
        <input
          name="phone"
          type="tel"
          className="rounded-md border border-[var(--site-border)] bg-[var(--site-card)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--site-primary)]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Mesaj</span>
        <textarea
          name="message"
          required
          rows={5}
          className="rounded-md border border-[var(--site-border)] bg-[var(--site-card)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--site-primary)]"
        />
      </label>
      {state === "error" && (
        <p className="text-sm text-red-600">Bir hata oluştu, lütfen tekrar deneyin.</p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="self-start rounded-md bg-[var(--site-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--site-primary-fg)] disabled:opacity-60"
      >
        {state === "sending" ? "Gönderiliyor…" : "Gönder"}
      </button>
    </form>
  );
}
