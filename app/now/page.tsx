import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getStartDate,
  getDays,
  getVisibleActivities,
  getVisibleReservations,
} from "@/lib/db/queries";
import { type Category } from "@/lib/trip";
import {
  computeNextSteps,
  type DayMeta,
  type NowActivity,
  type NowReservation,
  type Step,
} from "@/lib/now";
import { Icon } from "@/components/Icon";
import { SecretBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Now · Japan Trip" };

function StepActions({ step }: { step: Step }) {
  if (!step.mapsUrl && !step.linkUrl) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {step.mapsUrl && (
        <a
          href={step.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink/90"
        >
          📍 Open in Maps ↗
        </a>
      )}
      {step.linkUrl && (
        <a
          href={step.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
        >
          {step.linkLabel ?? "Open"} ↗
        </a>
      )}
    </div>
  );
}

function NextHero({ step, label }: { step: Step; label: string }) {
  return (
    <div className="rounded-lg border border-red/30 bg-white p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wide text-red">
        {label}
      </div>
      <div className="mt-1 flex items-start gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {step.icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-ink">
            <span className="text-ink/60">{step.action} </span>
            {step.title}
            {step.isSecret && (
              <span className="ml-2 align-middle">
                <SecretBadge />
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-sm text-ink/55">
            Day {step.dayNumber} · {step.city}
            {step.time ? ` · ${step.time}` : ""}
          </p>
          {step.detail && (
            <p className="mt-1.5 text-sm text-ink/70">{step.detail}</p>
          )}
        </div>
      </div>
      <StepActions step={step} />
    </div>
  );
}

function StepRow({ step }: { step: Step }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="w-16 shrink-0 text-xs font-semibold tabular-nums text-ink/45">
        {step.time ?? (step.kind === "hotel" ? "night" : step.kind === "travel" ? "travel" : "")}
      </span>
      <span className="text-lg" aria-hidden>
        {step.icon}
      </span>
      <span className="min-w-0 flex-1 text-sm text-ink">
        <span className="text-ink/55">{step.action} </span>
        <span className="font-medium">{step.title}</span>
        {step.isSecret && (
          <span className="ml-1.5 align-middle">
            <SecretBadge />
          </span>
        )}
      </span>
      {step.mapsUrl && (
        <a
          href={step.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-red hover:underline"
        >
          Map ↗
        </a>
      )}
    </li>
  );
}

export default async function NowPage() {
  const session = await getSession();
  const uid = session?.uid ?? -1;

  const [startDate, dayRows, acts, resvs] = await Promise.all([
    getStartDate(),
    getDays(),
    getVisibleActivities(uid),
    getVisibleReservations(uid),
  ]);

  const dayMetas: DayMeta[] = dayRows.map((d) => ({
    dayNumber: d.dayNumber,
    city: d.city,
    title: d.title,
    summary: d.summary,
    transport: d.transport,
    restDay: d.restDay,
  }));

  const nowActs: NowActivity[] = acts.map((a) => ({
    id: a.id,
    dayNumber: a.dayNumber,
    time: a.time,
    title: a.title,
    description: a.description,
    category: a.category as Category,
    location: a.location,
    cost: a.cost,
    booking: a.booking,
    mustDo: a.mustDo,
    isSecret: a.isSecret,
  }));

  const nowResvs: NowReservation[] = resvs.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    startsAt: r.startsAt ? new Date(r.startsAt) : null,
    dayNumber: r.dayNumber,
    confirmation: r.confirmation,
    url: r.url,
    isSecret: r.isSecret,
  }));

  const result = computeNextSteps(
    startDate,
    dayMetas,
    nowActs,
    nowResvs,
    new Date()
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Icon name="date" size={32} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            What now{session?.name ? `, ${session.name}` : ""}?
          </h1>
          <p className="text-sm text-ink/60">
            Your next move — by the current time in Japan.
          </p>
        </div>
      </div>

      {result.phase === "before" && (
        <div className="rounded-lg border border-sky/40 bg-sky/10 p-4 text-ink shadow-soft">
          <p className="text-lg font-semibold">
            {result.daysUntilStart > 0
              ? `Trip starts in ${result.daysUntilStart} day${result.daysUntilStart === 1 ? "" : "s"} ✈️`
              : "Trip starts today! ✈️"}
          </p>
          <p className="mt-0.5 text-sm text-ink/70">Here&apos;s what kicks it off:</p>
        </div>
      )}

      {result.phase === "after" && (
        <div className="rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
          <p className="text-lg font-semibold text-ink">
            The trip&apos;s a wrap — おつかれさま! 🎉
          </p>
          <Link
            href="/itinerary"
            className="mt-3 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
          >
            Relive the itinerary
          </Link>
        </div>
      )}

      {result.current && result.current.key !== result.next?.key && (
        <p className="text-sm text-ink/60">
          <span className="font-medium text-ink/80">Around now:</span>{" "}
          {result.current.icon} {result.current.title}
        </p>
      )}

      {result.next && (
        <NextHero
          step={result.next}
          label={result.phase === "before" ? "First up" : "Do this next"}
        />
      )}

      {result.laterToday.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/55">
            Later today
          </h2>
          <ul className="divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
            {result.laterToday.map((s) => (
              <StepRow key={s.key} step={s} />
            ))}
          </ul>
        </section>
      )}

      {result.upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/55">
            Coming up
          </h2>
          <ul className="divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
            {result.upcoming.map((s) => (
              <StepRow key={s.key} step={s} />
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-xs text-ink/45">
        Built from your itinerary, hotels, travel legs, and bookings.
      </p>
    </div>
  );
}
