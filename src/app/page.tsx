"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const STORYBOOK_URL = "/storybook/";
const storyUrl = (id: string) => `${STORYBOOK_URL}?path=/docs/${id}`;

// Locked logo geometry (v1.0): always render from the provided SVGs — never
// rebuild the feather/wordmark relationship in code.
const QUILL_MARK_PATH =
  "M34.2316 6.45123L38.0722 6.93131C38.0722 6.93131 39.526 4.25133 40.9527 2.98399C42.3339 1.75709 45.06 0.636927 45.06 0.636927C45.06 0.636927 38.3389 -1.28292 29.8041 1.54375C23.4092 3.66173 20.8427 10.1319 20.8427 10.1319C20.8427 10.1319 21.3885 8.14176 21.9095 6.93178C22.4329 5.7161 23.5098 3.94415 23.5098 3.94415C23.5098 3.94415 21.056 4.21693 17.162 7.46474C13.7142 10.3404 10.921 17.1197 10.921 17.1197C10.921 17.1197 11.3578 15.0909 11.7211 13.8129C12.0868 12.5265 12.788 10.5586 12.788 10.5586C12.788 10.5586 10.0675 13.3862 9.00067 16.9063C8.13749 19.7544 7.7738 24.4276 7.7738 24.4276C7.59673 23.4584 7.32518 22.9457 7.13369 21.9743C6.8983 20.7801 6.97902 20.0772 6.76029 18.88C6.76029 18.88 5.12076 22.5861 5.26671 25.0677C5.42674 27.7886 7.93382 31.2025 7.93382 31.2025C7.93382 31.2025 12.2611 22.0211 16.1485 17.1197C21.056 10.9321 25.4834 8.74495 25.4834 8.74495C25.4834 8.74495 17.5354 14.4527 11.7211 25.9212C6.42144 36.3746 5 49.9252 5 49.9252L8.25388 44.8043C8.25388 44.8043 7.56043 44.0576 7.56043 41.9238C7.56043 38.0105 10.6009 32.3756 10.6009 32.3756C10.6009 32.3756 14.9298 30.0864 17.162 27.9482C19.1028 26.089 21.3761 22.5073 21.3761 22.5073L16.842 24.4276C16.842 24.4276 19.6691 23.0941 24.95 16.9064C27.9007 13.449 33.6448 9.59843 33.6448 9.59843C33.6448 9.59843 31.6373 9.70348 30.3909 9.97191C28.7194 10.3319 26.3369 11.4655 26.3369 11.4655C26.3369 11.4655 28.5877 10.0687 30.3909 9.38515C32.6964 8.51122 36.8987 7.83813 36.8987 7.83813L34.2316 6.45123Z";

function QuillMark({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 50 50"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden={size ? true : undefined}
      aria-label={size ? undefined : "The Quill mark"}
    >
      <path fill="var(--ink)" d={QUILL_MARK_PATH} />
    </svg>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center whitespace-nowrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/home/quill-logo-light.svg" alt="Quill" width={74} height={38} className="dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/home/quill-logo-dark.svg" alt="Quill" width={74} height={38} className="hidden dark:inline-block" />
    </span>
  );
}

function Eyebrow({ children, dash = false }: { children: React.ReactNode; dash?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-sans text-xs font-medium tracking-[0.15em] uppercase text-terracotta whitespace-nowrap max-sm:text-[0.65rem] max-sm:tracking-[0.08em]">
      {dash && <span className="h-px w-5 bg-terracotta max-sm:hidden" />}
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: React.ReactNode;
  caption: string;
}) {
  return (
    <div className="mb-14 flex items-baseline justify-between gap-8">
      <div className="flex flex-col gap-4">
        <span className="font-sans text-xs font-medium tracking-[0.15em] uppercase text-ink-muted">{eyebrow}</span>
        <h2 className="m-0 font-display text-3xl font-normal leading-[1.2] tracking-[-0.03em] text-[var(--text-strong)] [font-variation-settings:var(--fraunces-display)]">
          {title}
        </h2>
      </div>
      <p className="m-0 hidden text-right font-display text-base italic text-[var(--text-muted-color)] [font-variation-settings:var(--fraunces-caption)] md:block">
        {caption}
      </p>
    </div>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <em className="italic text-terracotta [font-variation-settings:var(--fraunces-accent)]">{children}</em>;
}

function PlateLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-2xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted-color)] ${className ?? ""}`}>
      {children}
    </span>
  );
}

function Swatch({ color, pill = false, bordered = false }: { color: string; pill?: boolean; bordered?: boolean }) {
  return (
    <span
      className={`h-[30px] w-[30px] ${pill ? "rounded-full" : "rounded-sm"} ${bordered ? "border border-[var(--line-soft)]" : ""}`}
      style={{ background: color }}
    />
  );
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [specimenOn, setSpecimenOn] = useState(true);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("quill-home-theme");
    } catch {}
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
      // Theme must be read post-hydration: the prerendered markup is always
      // "light", so reading localStorage during render would mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
  }, []);

  function applyTheme(next: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
  }

  function toggleTheme(checked: boolean) {
    const next = checked ? "dark" : "light";
    try {
      localStorage.setItem("quill-home-theme", next);
    } catch {}
    applyTheme(next);
  }

  const navLink =
    "text-sm font-medium text-[var(--text-body)] no-underline transition-colors duration-200 hover:text-terracotta";

  return (
    <div className="min-h-screen w-full bg-[var(--surface-page)] font-sans text-[var(--text-body)] [scroll-behavior:smooth]">
      <div className="paper-grain" />
      <div className="paper-specks" />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 border-b border-[var(--border-divider)] bg-[var(--surface-page)]">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-8 px-12 max-sm:gap-4 max-sm:px-4">
          <a href="#top" className="flex items-center gap-3 no-underline">
            <Logo />
            {/* On mobile only the feather + Quill wordmark stays. */}
            <span className="inline-block h-[18px] w-px bg-[var(--line)] max-sm:hidden" />
            <span className="text-2xs font-medium tracking-[0.2em] uppercase text-[var(--text-muted-color)] max-sm:hidden">
              Design system
            </span>
          </a>
          <div className="flex items-center gap-7 max-sm:gap-3">
            <a href="#foundations" className={`${navLink} max-sm:text-xs`}>Foundations</a>
            <a href="#components" className={`${navLink} max-sm:text-xs`}>Components</a>
            <a href="#principles" className={`${navLink} max-sm:text-xs`}>Principles</a>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Dusk mode" title="Dusk mode" />
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header id="top" className="relative overflow-hidden bg-[var(--surface-page)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07]"
          style={{ backgroundImage: "url('/home/declaration.webp')" }}
        />
        <div className="relative mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-16 px-12 pt-24 pb-[104px] max-lg:grid-cols-1">
          <div className="flex flex-col items-start gap-7">
            <Eyebrow dash>The Quill design system · Issue № 001</Eyebrow>
            <h1 className="m-0 font-display text-5xl font-normal leading-[1.05] tracking-[-0.03em] text-[var(--text-strong)] [font-variation-settings:var(--fraunces-display)] [text-wrap:balance]">
              A design system, made for <Accent>People</Accent>.
            </h1>
            <p className="m-0 max-w-[540px] text-lg leading-[1.7] text-[var(--text-body)]">
              Pressed digital paper, sepia ink, and four botanical pigments. Quill is designed for making interfaces
              feel approachable, delightful, and premium — crafted for everyday use.
            </p>
            <div className="mt-2 flex items-center gap-4">
              <Button size="lg" render={<a href={STORYBOOK_URL} />}>
                Open the Storybook <span aria-hidden>→</span>
              </Button>
              <Button size="lg" variant="outline" render={<a href="#foundations" />}>
                Read the foundations
              </Button>
            </div>
            <p className="m-0 mt-1 font-display text-sm italic text-[var(--text-muted-color)] [font-variation-settings:var(--fraunces-caption)]">
              Curated for AI-powered products.
            </p>
          </div>
          <figure className="m-0 flex flex-col items-center gap-5 max-lg:hidden">
            <QuillMark className="h-auto w-full max-w-[360px] drop-shadow-[0_20px_28px_rgba(42,38,34,0.16)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/quill-stroke.svg" alt="" aria-hidden width={300} height={107} className="-mt-[108px] ml-0.5 dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/quill-stroke-cream.svg" alt="" aria-hidden width={300} height={107} className="-mt-[108px] ml-0.5 hidden dark:block" />
          </figure>
        </div>
      </header>

      {/* ── Foundations ─────────────────────────────────────────────────── */}
      <section id="foundations" className="border-y border-[var(--border-divider)] bg-paper-warm">
        <div className="mx-auto max-w-[1400px] px-12 py-24">
          <SectionHeader
            eyebrow="Foundations"
            title={<>Paper, ink, and four <Accent>pigments</Accent>.</>}
            caption="Everything sits on digital paper."
          />
          <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            <Card className="bg-paper">
              <CardContent className="flex h-full flex-col gap-[18px]">
                <PlateLabel>Color</PlateLabel>
                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-2">
                    <Swatch color="#F5EDDD" bordered />
                    <Swatch color="#EFE4CE" bordered />
                    <Swatch color="#E8DCC0" bordered />
                  </div>
                  <div className="flex gap-2">
                    <Swatch color="#2A2622" />
                    <Swatch color="#5C524A" />
                    <Swatch color="#675F58" />
                  </div>
                  <div className="flex gap-2">
                    <Swatch color="#C4684B" pill />
                    <Swatch color="#7A8C5C" pill />
                    <Swatch color="#5B6B8A" pill />
                    <Swatch color="#B89968" pill />
                  </div>
                </div>
                <p className="m-0 mt-auto text-sm leading-normal text-[var(--text-body)]">
                  Three papers tones, three inks, four pigments. No pure white, no pure black.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-paper">
              <CardContent className="flex h-full flex-col gap-[18px]">
                <PlateLabel>Type</PlateLabel>
                <div className="flex items-baseline gap-3.5">
                  <span className="font-display text-[64px] leading-none text-[var(--text-strong)] [font-variation-settings:var(--fraunces-display)]">Aa</span>
                  <span className="font-sans text-[30px] font-medium leading-none text-[var(--text-muted-color)]">Aa</span>
                </div>
                <p className="m-0 mt-auto text-sm leading-normal text-[var(--text-body)]">
                  Fraunces carries the voice; Raleway does the work. One italic word per headline, always in terracotta.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-paper">
              <CardContent className="flex h-full flex-col gap-[18px]">
                <PlateLabel>Texture &amp; elevation</PlateLabel>
                <div className="flex items-end gap-4 px-0.5 pt-2 pb-3">
                  <span className="h-[52px] w-[52px] rounded-sm border border-[var(--line-faint)] bg-paper-warm shadow-sm" />
                  <span className="h-[52px] w-[52px] rounded-lg border border-[var(--line-faint)] bg-paper-warm shadow" />
                  <span className="h-[52px] w-[52px] rounded-xl border border-[var(--line-faint)] bg-paper-warm shadow-lg" />
                </div>
                <p className="m-0 mt-auto text-sm leading-normal text-[var(--text-body)]">
                  Fractal paper grain, gentle radii, and three steps of warm ink shadow — never a hard drop.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-paper">
              <CardContent className="flex h-full flex-col gap-[18px]">
                <PlateLabel>The mark</PlateLabel>
                <div className="flex items-center gap-[18px]">
                  <QuillMark size={64} />
                  <div className="flex items-end gap-2.5">
                    {/* Favicon tiles sit on light paper in both themes. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/quill-mark.svg" alt="32px favicon" width={32} height={32} className="block rounded-xs border border-[var(--line-soft)] bg-[#F5EDDD] p-[3px]" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/home/quill-mark-16.svg" alt="16px favicon" width={16} height={16} className="block rounded-xs border border-[var(--line-soft)] bg-[#F5EDDD] p-px" />
                  </div>
                </div>
                <p className="m-0 mt-auto text-sm leading-normal text-[var(--text-body)]">
                  The quill, set in sepia ink. Ships as SVG, a full favicon set, and lock-ups in three sizes.
                </p>
                <a href={storyUrl("foundations-brand--docs")} className="text-sm font-medium text-[var(--link)] no-underline transition-colors duration-200 hover:text-terracotta">
                  View the lock-ups →
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Components ──────────────────────────────────────────────────── */}
      <section id="components" className="bg-[var(--surface-page)]">
        <div className="mx-auto max-w-[1400px] px-12 py-24">
          <SectionHeader
            eyebrow="The collection"
            title={<>Every component, a <Accent>specimen</Accent>.</>}
            caption="Designed with intent and taste."
          />
          <div className="grid grid-cols-[400px_minmax(0,1fr)] items-start gap-6 max-lg:grid-cols-1">
            <div className="flex flex-col gap-3">
              <PlateLabel>Plate № 01 · Card</PlateLabel>
              <Card>
                <CardHeader>
                  <CardTitle className="[font-variation-settings:var(--fraunces-text)]">Meeting Mapper</CardTitle>
                  <CardAction>
                    <Badge variant="outline">№ 004</Badge>
                  </CardAction>
                  <CardDescription>
                    Turns a rambling hour into a tidy map of decisions, owners, and loose threads.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="gap-3">
                  <Avatar>
                    <AvatarFallback>MM</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">Drawn by the studio</span>
                  <a href={storyUrl("components-card--docs")} className="ml-auto text-sm font-medium text-primary no-underline hover:underline hover:underline-offset-4">
                    View →
                  </a>
                </CardFooter>
              </Card>
              <PlateLabel className="mt-3">Plate № 05 · Avatar</PlateLabel>
              <Card>
                <CardContent className="flex items-center gap-4 p-1 px-5">
                  <Avatar size="lg">
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>RP</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>Q</AvatarFallback>
                  </Avatar>
                  <span className="ml-auto text-xs text-muted-foreground">lg · default · sm</span>
                </CardContent>
              </Card>
              <PlateLabel className="mt-3">Plate № 06 · Switch</PlateLabel>
              <Card>
                <CardContent className="flex items-center gap-6 p-1 px-5">
                  <Label className="cursor-pointer gap-2">
                    <Switch checked={specimenOn} onCheckedChange={setSpecimenOn} />
                    Notifications
                  </Label>
                  <span className="ml-auto text-xs text-muted-foreground">checked bg-primary · thumb bg-background</span>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <PlateLabel>Plate № 02 · Button — all variants</PlateLabel>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-2 p-1 px-5">
                    <Button>default</Button>
                    <Button variant="outline">outline</Button>
                    <Button variant="secondary">secondary</Button>
                    <Button variant="ghost">ghost</Button>
                    <Button variant="destructive">destructive</Button>
                    <Button variant="link">link</Button>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col gap-3">
                <PlateLabel>Plate № 03 · Badge — all variants</PlateLabel>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-2 p-1 px-5">
                    <Badge>New</Badge>
                    <Badge variant="secondary">Beta</Badge>
                    <Badge variant="destructive">Error</Badge>
                    <Badge variant="outline">Draft</Badge>
                    <Badge variant="ghost">Archive</Badge>
                    <Badge variant="link">View details</Badge>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col gap-3">
                <PlateLabel>Plate № 04 · Field</PlateLabel>
                <Card>
                  <CardContent className="p-1 px-5">
                    <div className="flex max-w-[420px] flex-col gap-2">
                      <Label htmlFor="specimen-email">Your email</Label>
                      <Input id="specimen-email" type="email" placeholder="your@email.com" />
                      <span className="text-xs text-muted-foreground">No spam. Just drawings.</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <a href={STORYBOOK_URL} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary no-underline transition-all duration-200 hover:underline hover:underline-offset-4">
              Browse every story <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Principles ──────────────────────────────────────────────────── */}
      <section id="principles" className="border-y border-[var(--border-divider)] bg-paper-warm">
        <div className="mx-auto flex max-w-[800px] flex-col items-center gap-7 px-12 pt-24 pb-[72px] text-center">
          <span className="font-display text-3xl leading-none text-terracotta">¶</span>
          <p className="m-0 font-display text-2xl font-normal leading-[1.45] tracking-[-0.02em] text-[var(--text-strong)] [font-variation-settings:var(--fraunces-display)] [text-wrap:pretty]">
            &ldquo;People are at the core of our design system and how we thought of what good looks like.
            Distinguishable yet familiar with a flair of style that makes it easy to come back to every day.&rdquo;
          </p>
        </div>
        <div className="mx-auto max-w-[1400px] px-12 pb-24">
          <div className="grid grid-cols-3 gap-12 border-t border-[var(--line-soft)] pt-12 max-md:grid-cols-1">
            {[
              ["№ 01", "Paper first", "No pure white, no pure black. Every surface is pressed cream; every shadow is warm ink, never a hard drop."],
              ["№ 02", "One italic word", "Emphasis is earned. A single accented italic per headline — never two, never shouted."],
              ["№ 03", "A gentle settle", "Hovers lift, presses set down. Nothing bounces, nothing loops, nothing hurries you along."],
            ].map(([num, title, body]) => (
              <div key={num} className="flex flex-col gap-2.5">
                <span className="font-display text-base italic text-terracotta [font-variation-settings:var(--fraunces-caption)]">{num}</span>
                <h3 className="m-0 font-display text-xl font-normal text-[var(--text-strong)] [font-variation-settings:var(--fraunces-text)]">{title}</h3>
                <p className="m-0 text-sm leading-[1.7] text-[var(--text-body)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Getting started ─────────────────────────────────────────────── */}
      <section id="start" className="bg-[var(--surface-page)]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-16 px-12 py-24 max-lg:grid-cols-1">
          <div className="flex flex-col items-start gap-6">
            <span className="font-sans text-xs font-medium tracking-[0.15em] uppercase text-ink-muted">Getting started</span>
            <h2 className="m-0 font-display text-3xl font-normal leading-[1.2] tracking-[-0.03em] text-[var(--text-strong)] [font-variation-settings:var(--fraunces-display)]">
              Begin with a single <Accent>command</Accent>.
            </h2>
            <p className="m-0 max-w-[460px] text-[1rem] leading-[1.7] text-[var(--text-body)]">
              Add the Quill theme with the shadcn CLI, import from the registry, and compose. The Storybook holds a
              story for every component, every state, both themes.
            </p>
            <Button variant="outline" render={<a href={storyUrl("foundations-introduction--docs")} />}>
              Read the full guide <span aria-hidden>→</span>
            </Button>
          </div>
          {/* The code card stays dark in both themes. */}
          <div className="overflow-x-auto rounded-lg bg-[#2A2622] p-7 px-8 font-mono text-sm leading-loose text-[#F5EDDD] shadow">
            <div className="text-[rgba(245,237,221,0.55)]"># add the quill theme</div>
            <div>
              npx shadcn add <span className="text-[#D6BA86]">https://www.quilldesignsystem.com/r/quill.json</span>
            </div>
            <div className="h-[1em]" />
            <div className="text-[rgba(245,237,221,0.55)]">{"// page.tsx"}</div>
            <div>
              <span className="text-[#DB8568]">import</span> {"{ Button }"} <span className="text-[#DB8568]">from</span>{" "}
              <span className="text-[#D6BA86]">&quot;@/components/ui/button&quot;</span>
            </div>
            <div>
              <span className="text-[#DB8568]">import</span> {"{ Card, CardHeader }"}{" "}
              <span className="text-[#DB8568]">from</span> <span className="text-[#D6BA86]">&quot;@/components/ui/card&quot;</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[var(--surface-page)]">
        <div className="h-px bg-[linear-gradient(90deg,transparent,var(--line-strong),transparent)]" />
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-12 pt-12 pb-14 max-md:flex-col">
          <div className="flex items-center gap-3.5">
            <Logo />
            <span className="text-sm text-[var(--text-body)]">— A design system, made for people.</span>
          </div>
          <div className="flex items-center gap-7">
            <a href={STORYBOOK_URL} className={navLink}>Storybook</a>
            <a href="https://github.com/craftwell-ai/quill-ds" className={navLink}>GitHub</a>
            <a href="#foundations" className={navLink}>Foundations</a>
          </div>
          <span className="font-display text-sm italic text-[var(--text-muted-color)] [font-variation-settings:var(--fraunces-caption)]">
            Official design system of Craftwell
          </span>
        </div>
      </footer>
    </div>
  );
}
