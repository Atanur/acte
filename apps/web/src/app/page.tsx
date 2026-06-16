"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface MessageResponse {
  message: string;
  note: string;
  env: string;
}

interface InfoResponse {
  app: string;
  version: string;
  description: string;
  techStack: Record<string, string>;
}

export default function Home() {
  const [message, setMessage] = useState<MessageResponse | null>(null);
  const [info, setInfo] = useState<InfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/message`).then((r) => r.json()),
      fetch(`${API_URL}/api/info`).then((r) => r.json()),
    ])
      .then(([msg, inf]) => {
        setMessage(msg);
        setInfo(inf);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-zinc-950 text-zinc-100 px-6">
      <main className="flex flex-col items-center gap-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Acte</h1>
          <p className="text-zinc-400 mt-1">Monorepo Demo</p>
        </div>

        {/* API Bağlantı Durumu */}
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Backend Bağlantısı
          </h2>

          {loading && (
            <p className="text-zinc-400 text-sm animate-pulse">API&apos;ye bağlanıyor...</p>
          )}

          {error && (
            <div className="text-red-400 text-sm">
              <p className="font-medium">Bağlantı hatası</p>
              <p className="text-zinc-500 mt-1">{error}</p>
              <p className="text-zinc-600 mt-2 text-xs">
                Backend&apos;in çalıştığından emin olun: {API_URL}
              </p>
            </div>
          )}

          {message && !error && (
            <div className="space-y-3">
              <p className="text-lg font-medium text-emerald-400">{message.message}</p>
              <p className="text-sm text-zinc-400">{message.note}</p>
              <div className="flex gap-2 text-xs">
                <span className="rounded-md bg-zinc-800 px-2 py-1 text-zinc-400">
                  ortam: {message.env}
                </span>
                <span className="rounded-md bg-zinc-800 px-2 py-1 text-zinc-400">{API_URL}</span>
              </div>
            </div>
          )}
        </div>

        {/* Teknoloji Bilgisi */}
        {info && !error && (
          <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Teknoloji Stack
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(info.techStack).map(([key, val]) => (
                <div key={key} className="rounded-lg bg-zinc-800/50 p-3 text-sm">
                  <span className="text-zinc-500 capitalize">{key}</span>
                  <p className="text-zinc-200 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
