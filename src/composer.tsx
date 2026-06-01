"use client";

import * as React from "react";
import { Loader2, ShieldCheck, Copy, Check, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateKey, encryptText } from "@/lib/secret-chat/crypto";

const EXPIRIES = [
  { v: "1h", label: "1 hour" },
  { v: "8h", label: "8 hours" },
  { v: "24h", label: "24 hours" },
  { v: "7d", label: "1 week" },
] as const;

export function OneTimeSecretComposer() {
  const [secret, setSecret] = React.useState("");
  const [expiry, setExpiry] = React.useState("24h");
  const [busy, setBusy] = React.useState(false);
  const [link, setLink] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState("");

  async function create() {
    if (!secret.trim()) return;
    setBusy(true); setError("");
    try {
      const { key, fragment } = await generateKey();
      const created = await (await fetch("/api/secret-chat/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiry, mode: "direct" }),
      })).json();
      if (!created.ok) throw new Error(created.error || "Could not create the secret.");

      const joined = await (await fetch(`/api/secret-chat/${created.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      })).json();
      if (!joined.ok) throw new Error(joined.error || "Could not initialise the session.");

      const { iv, ct } = await encryptText(key, secret);
      const sent = await (await fetch(`/api/secret-chat/${created.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", sender: joined.participant, kind: "text", iv, ciphertext: ct }),
      })).json();
      if (!sent.ok) throw new Error(sent.error || "Encryption uploaded but send failed.");

      setLink(`${window.location.origin}/tools/one-time-secret/${created.id}#${fragment}`);
      setSecret("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error — please try again.");
    } finally { setBusy(false); }
  }

  function copy() {
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (link) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 md:p-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <Check className="size-4" /><span className="text-sm font-medium">Secret created — share this link</span>
        </div>
        <p className="mt-3 break-all rounded-lg bg-background px-3 py-2 font-mono text-xs">{link}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={copy} size="sm" variant="outline" className="gap-1.5">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button onClick={() => { setLink(""); setCopied(false); setError(""); }} size="sm" variant="ghost" className="gap-1.5">
            <RotateCcw className="size-3.5" />Send another
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          The link includes the encryption key (after the <code className="font-mono">#</code>). Send it only to the
          person you want to read this. They can open it once, then it&apos;s destroyed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="size-4" />
        <span className="font-medium">End-to-end encrypted · destroyed after read</span>
      </div>
      <textarea
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="Paste a password, API key, Wi-Fi code, or any private note…"
        rows={5}
        maxLength={10000}
        className="mt-4 w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Auto-destruct after</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXPIRIES.map((e) => (
            <button
              key={e.v}
              onClick={() => setExpiry(e.v)}
              className={
                "rounded-full border px-3 py-1 text-sm " +
                (expiry === e.v ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:bg-muted/60")
              }
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={create} disabled={busy || !secret.trim()} className="mt-5 gap-2">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        Create one-time link
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
