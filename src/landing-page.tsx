import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, ChevronRight, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { FacetMark } from "@/components/marketing/facet-mark";
import { ToolCard } from "@/components/marketing/tool-card";
import { disabledSlugs } from "@/lib/admin/store";
import { pageMeta } from "@/lib/seo";
import { jsonLd, softwareAppSchema, faqSchema, breadcrumbSchema, howToSchema } from "@/lib/schema";
import { SITE, AUTHOR } from "@/lib/site";
import { getToolBySlug, TOOLS } from "@/lib/data/tools";
import { OneTimeSecretComposer } from "@/components/one-time-secret/composer";

const SLUG = "one-time-secret";
const tool = getToolBySlug(SLUG)!;
const TOOL_URL = `${SITE.url}${tool.href}`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Send a One-Time Secret — Share a Password Securely (Free Privnote Alternative)",
  description:
    "Paste a password, API key, or private note, set a timer, and get a one-time link. The secret is end-to-end encrypted in your browser, our server never sees it, and it self-destructs the moment it's read or the timer runs out. A free, no-signup Privnote alternative.",
  path: tool.href,
  keywords: tool.keywords,
  publishedAt: tool.publishedAt,
  updatedAt: tool.updatedAt,
});

const FAQ = [
  {
    question: "Is it really one-time — can it be read more than once?",
    answer:
      "No. The moment the recipient hits Reveal, the secret is decrypted in their browser and the server immediately deletes the encrypted blob. Anyone opening the same link afterwards sees \"this secret has been destroyed\". The recipient should save or copy the value right away, because closing the tab is the end of it.",
  },
  {
    question: "Can induwara.lk read the secret I'm sending?",
    answer:
      "No. A random AES-256 key is generated in your browser and placed in the part of the link after the # (the URL \"fragment\"), which browsers never send to any server. We only ever see ciphertext we have no key for. It's the same model behind Signal and ProtonMail's encrypted attachments — the server is mathematically excluded.",
  },
  {
    question: "What if someone intercepts the link in transit?",
    answer:
      "Then they can read the secret — the link IS the key. Send it over a channel that's at least somewhat private (SMS, WhatsApp, Signal, work chat, in-person), and pick a short auto-destruct timer so an intercepted link goes stale quickly. Never paste a one-time-secret link in a public chat or a ticket that strangers can see.",
  },
  {
    question: "How long until it self-destructs if no one reads it?",
    answer:
      "Whatever timer you picked: 1 hour, 8 hours, 24 hours, or 1 week. The server enforces it — even if no one ever opens the link, the encrypted blob is permanently deleted when the timer expires. Combined with the read-once behaviour, this means a secret can never linger indefinitely.",
  },
  {
    question: "How is this different from Privnote, One-Time Secret, or PasswordPusher?",
    answer:
      "Same core idea — share a secret via a link that self-destructs after one read. The differences: induwara.lk is free with no signup, no ads, and runs the encryption entirely in your browser via the Web Crypto API. Many of those services run on legacy stacks or use server-side encryption (so the server theoretically has the key). With our approach the key never leaves the URL fragment, so we can't read it even if we wanted to.",
  },
  {
    question: "Can I send a file, not just text?",
    answer:
      "Yes — use our companion tool, \"Send a Self-Destructing File\", which uses the same encryption model for any file up to 3 MB. For text, passwords, API keys, or notes, this page is the right one. Both destroy themselves after a single read.",
  },
  {
    question: "Is there a maximum length for the secret?",
    answer:
      "10,000 characters — easily enough for a password, an SSH key, a small config snippet, or a multi-line note. If you need to share more, generate one link per chunk or use the file-share tool.",
  },
  {
    question: "Do I need an account, app, or installation?",
    answer:
      "No. Open the page, paste, click, send the link. The page is the whole product, your browser does all the cryptography, and we never store anything we can read. There's no account to create, no plugin to install, no API key to manage.",
  },
];

export default function OneTimeSecretPage() {
  if (disabledSlugs().has(SLUG)) notFound();

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: SITE.url },
    { name: "Tools", url: `${SITE.url}/tools` },
    { name: tool.shortTitle, url: TOOL_URL },
  ]);
  const softwareApp = softwareAppSchema({
    name: tool.title, description: tool.description, url: TOOL_URL, category: "SecurityApplication", keywords: tool.keywords,
  });
  const faq = faqSchema(FAQ);
  const relatedSlugs = new Set(["password-generator", "secret-chat", "hash-generator"]);
  const relatedTools = TOOLS.filter((t) => relatedSlugs.has(t.slug)).slice(0, 3);
  const howTo = howToSchema({
    name: "How to send a one-time secret",
    description: "Encrypt a password or note in your browser, share the one-time link, and have it destroyed after one read.",
    url: TOOL_URL,
    steps: [
      { name: "Paste your secret", text: "Type or paste the password, API key, or private note you want to share." },
      { name: "Pick a timer", text: "Choose how long it can sit unread (1 hour to 1 week)." },
      { name: "Create the link", text: "Your browser encrypts it; the server only ever sees ciphertext. Copy the resulting link." },
      { name: "Send & destroy on read", text: "Share the link with one person. The moment they open it, the secret is shown to them and permanently destroyed." },
    ],
  });

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howTo) }} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li><Link href="/tools" className="hover:text-foreground">Tools</Link></li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li className="font-medium text-foreground">{tool.shortTitle}</li>
        </ol>
      </nav>

      <header className="mt-6">
        <div className="flex items-center gap-2 text-sm text-primary">
          <FacetMark size={16} />
          <span className="font-medium uppercase tracking-wider">Privnote-style · Read-once</span>
        </div>
        <h1 className="heading-display mt-3 text-balance text-3xl md:text-5xl">
          Send a one-time secret — share a password securely
        </h1>
        <p className="mt-4 max-w-3xl text-pretty text-lg text-muted-foreground md:text-xl">
          Paste a password, API key, or private note, pick a timer, and get a link that self-destructs the moment it&apos;s
          read — or when the timer runs out. The secret is end-to-end encrypted in your browser; our server only
          ever sees ciphertext it can&apos;t decrypt. Free, no signup.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span>By <Link href="/about" className="font-medium text-foreground hover:underline">{AUTHOR.name}</Link></span>
          {tool.updatedAt && (
            <span className="flex items-center gap-1"><CalendarDays className="size-3.5" />Updated {new Date(tool.updatedAt).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}</span>
          )}
        </div>
      </header>

      <div className="mt-8 max-w-xl"><OneTimeSecretComposer /></div>

      <Section heading="How it works">
        <p>
          When you click <em>Create one-time link</em>, your browser generates a random AES-256 key with the native
          Web Crypto API and places it in the part of the URL after the <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">#</code> — the
          URL <em>fragment</em>, which browsers <strong>never transmit to any server</strong>. Your secret is encrypted
          locally with that key before it leaves your device, so what we receive and store is opaque ciphertext we
          have no way to read.
        </p>
        <p>
          The link you share has two parts: the session identifier (which we know) and the decryption key (which
          only you and the recipient know, because it&apos;s in the fragment). When they open it, their browser pulls
          the encrypted blob, uses the key from their URL to decrypt it locally, and shows them the secret. At the
          same moment, we receive a destroy signal from the recipient&apos;s browser and permanently delete the encrypted
          blob server-side. No log keeps it. No backup.
        </p>
        <p>
          That gives you two layers of protection. <strong>Read-once</strong> means even if someone later finds the
          link in a chat history, opening it shows nothing — the blob is gone. The <strong>server-enforced timer</strong> means
          if no one ever reads the secret, it still self-destructs after the window you picked. And because we never
          have the key, there is no point in time at which a readable version of your secret exists on our side.
        </p>
        <p>
          The one rule: <strong>the link is the key</strong>. Anyone who gets the full URL can read the secret once.
          Send it over a channel that&apos;s at least somewhat private (SMS, WhatsApp, Signal, work chat, in-person)
          and prefer the shortest timer that fits your use-case. Don&apos;t paste it in a public chat or a ticket that
          strangers can see.
        </p>
      </Section>

      <Section heading="When this is the right tool">
        <p>Anywhere you&apos;d normally email or message a password and feel a little uneasy about it:</p>
        <ul className="mt-2 space-y-2">
          <li><strong>Share a Wi-Fi password with a guest</strong> — short timer, one-time link, gone after they connect.</li>
          <li><strong>Hand off an API key, SSH key, or database password to a teammate</strong> — without it sitting in Slack history forever.</li>
          <li><strong>Send a one-time login</strong> to a colleague when you can&apos;t use a proper password manager.</li>
          <li><strong>Share a sensitive note</strong> — an address, a phone number, a personal detail — without leaving a trail.</li>
          <li><strong>Replace pasting secrets in tickets / docs / chat</strong> — the secret is in the link instead of the message body, and it dies on read.</li>
        </ul>
      </Section>

      <Section heading="Frequently asked questions">
        <Accordion className="w-full">
          {FAQ.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section heading="Related tools">
        <div className="grid gap-4 md:grid-cols-3">
          {relatedTools.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </Section>

      <Section heading="Sources & references">
        <ul className="space-y-2 text-base">
          <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-foreground hover:underline">MDN — Web Crypto API (AES-GCM-256)<ExternalLink className="size-3.5 text-muted-foreground" /></a></li>
          <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/URL/hash" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-foreground hover:underline">MDN — URL fragment (#hash) never sent to servers<ExternalLink className="size-3.5 text-muted-foreground" /></a></li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">Encryption is AES-GCM-256 via the browser&apos;s native Web Crypto API; the key lives only in the URL fragment.</p>
      </Section>

      <div className="mt-16 rounded-2xl border border-border/60 bg-muted/30 p-6 text-center md:p-8">
        <p className="text-sm text-muted-foreground">Questions or a bug to report?</p>
        <p className="mt-1 font-medium">Email <a href={`mailto:${AUTHOR.email}`} className="text-primary hover:underline">{AUTHOR.email}</a>.</p>
      </div>
    </article>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 md:mt-16">
      <h2 className="heading-section text-2xl md:text-3xl">{heading}</h2>
      <Separator className="my-4" />
      <div className="space-y-4 text-base leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
