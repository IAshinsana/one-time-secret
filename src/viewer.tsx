"use client";

import * as React from "react";
import { ShieldCheck, Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importKeyFromFragment, decryptText } from "@/lib/secret-chat/crypto";

type Status = "loading" | "ready" | "revealed" | "gone" | "error";

export function OneTimeSecretViewer({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [secret, setSecret] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState("");
  const fragRef = React.useRef("");

  React.useEffect(() => {
    const frag = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!frag) { setStatus("error"); setErrMsg("This link is missing the decryption key (the part after #)."); return; }
    fragRef.current = frag;
    (async () => {
      try {
        const meta = await (await fetch(`/api/secret-chat/${sessionId}?since=0`)).json();
        if (!meta.alive) { setStatus("gone"); return; }
        setStatus("ready");
      } catch { setStatus("error"); setErrMsg("Could not reach the server. Please try again."); }
    })();
  }, [sessionId]);

  async function reveal() {
    setStatus("loading");
    try {
      const key = await importKeyFromFragment(fragRef.current);
      const data = await (await fetch(`/api/secret-chat/${sessionId}?since=0`)).json();
      if (!data.alive || !data.messages?.length) { setStatus("gone"); return; }
      const m = data.messages[0];
      const raw = await decryptText(key, m.iv, m.ciphertext);
      let text = raw;
      try { const env = JSON.parse(raw); if (typeof env?.t === "string") text = env.t; } catch {}
      setSecret(text);
      setStatus("revealed");
      // Destroy on server so no one else can ever load this link.
      await fetch(`/api/secret-chat/${sessionId}`, { method: "DELETE" }).catch(() => {});
    } catch {
      setStatus("error");
      setErrMsg("Could not decrypt — the key in the link is wrong, or the secret has already been destroyed.");
    }
  }

  function copy() {
    navigator.clipboard.writeText(secret).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (status === "loading") {
    return <Box><Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" /><p className="mt-3 text-center text-sm text-muted-foreground">Checking the secret…</p></Box>;
  }
  if (status === "gone") {
    return <Box><AlertTriangle className="mx-auto size-6 text-amber-500" /><p className="mt-3 text-center text-sm">This one-time secret has been destroyed. It was either read by someone else or the timer ran out — nothing to recover.</p></Box>;
  }
  if (status === "error") {
    return <Box><AlertTriangle className="mx-auto size-6 text-destructive" /><p className="mt-3 text-center text-sm">{errMsg || "Something went wrong."}</p></Box>;
  }
  if (status === "revealed") {
    return (
      <Box>
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-4" /><span className="font-medium">Decrypted in your browser · now destroyed on our side</span>
        </div>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-background px-3 py-3 font-mono text-sm">{secret}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={copy} size="sm" variant="outline" className="gap-1.5">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied!" : "Copy secret"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          This page is the only place this secret will appear. Save or copy it now — it&apos;s already been destroyed on
          our side and the link can&apos;t be opened again.
        </p>
      </Box>
    );
  }

  return (
    <Box>
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="size-4" /><span className="font-medium">An encrypted secret is waiting for you</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Someone sent you a one-time secret. <strong>The moment you reveal it, it&apos;s destroyed</strong> — be ready
        to copy or save it now.
      </p>
      <Button onClick={reveal} className="mt-4 gap-2"><ShieldCheck className="size-4" />Reveal &amp; destroy</Button>
    </Box>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-xl rounded-2xl border border-border/60 bg-card p-5 md:p-6">{children}</div>;
}
