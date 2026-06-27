import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getStartDate,
  getVisibleActivities,
  getVisibleReservations,
} from "@/lib/db/queries";
import { days as scaffold, type Category } from "@/lib/trip";
import { computeNow, type NowActivity } from "@/lib/now";
import { mapsUrl } from "@/lib/links";
import { Icon } from "@/components/Icon";
import { CategoryBadge } from "@/components/CategoryBadge";
import { MustDoBadge, SecretBadge } from "@/components/Badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Now · Japan Trip" };

const cityForDay = (n: number) => scaffold.find((d) => d.day === n)?.city ?? "";

function ActivityCard({
  act,
  tone = "next",
}: {
  act: NowActivity;
  tone?: "now" | "next";
}) {
  return (
    <div
      className={[
        "rounded-lg border p-5 shadow-soft",
        tone === "now" ? "border-matcha/50 bg-matcha/10" : "border-ink/10 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink/55">
        {tone === "now" ? "Happening around now" : "Up next"}
        <span>·</span>
        <span>
          Day {act.dayNumber} · {cityForDay(act.dayNumber)}
        </span>
        {act.time && <span>· {act.time}</span>}
      </div>
      <h2 className="mt-1 text-xl font-bold text-ink">{act.title}</h2>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <CategoryBadge category={act.category} />
        {act.mustDo && <MustDoBadge />}
        {act.isSecret && <SecretBadge />}
      </div>
      {act.description && (
        <p className="mt-2 text-sm text-ink/70">{act.description}</p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/60">
        {act.cost && <span>💴 {act.cost}</span>}
        {act.location && (
          <a
            href={mapsUrl(act.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-red hover:underline"
          >
            📍 Open in Maps ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default async function NowPage() {
  const session = await getSession();
  const uid = session?.uid ?? -1;

  const [startDate, acts, resvs] = await Promise.all([
    getStartDate(),
    getVisibleActivities(uid),
    getVisibleReservations(uid),
  ]);

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

  const result = computeNow(startDate, nowActs, new Date(), scaffold.length);

  const nowMs = Date.now();
  const nextResv =
    resvs
      .filter((r) => r.startsAt && new Date(r.startsAt).getTime() >= nowMs)
      .sort(
        (a, b) =>
          new Date(a.startsAt as Date).getTime() -
          new Date(b.startsAt as Date).getTime()
      )[0] ?? null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Icon name="date" size={32} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            What now{session?.name ? `, ${session.name}` : ""}?
          </h1>
          <p className="text-sm text-ink/60">Based on the current time in Japan.</p>
        </div>
      </div>

      {result.phase === "before" && (
        <div className="rounded-lg border border-sky/40 bg-sky/10 p-5 text-ink shadow-soft">
          <p className="text-lg font-semibold">
            {result.daysUntilStart > 0
              ? `Trip starts in ${result.daysUntilStart} day${result.daysUntilStart === 1 ? "" : "s"}.`
              : "Trip starts today! ✈️"}
          </p>
          <p className="mt-1 text-sm text-ink/70">
            First up when you land:
          </p>
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

      {result.current && <ActivityCard act={result.current} tone="now" />}
      {result.next && <ActivityCard act={result.next} tone="next" />}

      {nextResv && (
        <div className="rounded-lg border border-lantern/50 bg-lantern/15 p-5 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink/55">
            Next booking · {nextResv.type}
          </div>
          <h2 className="mt-1 font-bold text-ink">{nextResv.title}</h2>
          <p className="mt-1 text-sm text-ink/70">
            {new Date(nextResv.startsAt as Date).toLocaleString("en-US", {
              timeZone: "Asia/Tokyo",
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            (JST)
            {nextResv.confirmation ? ` · #${nextResv.confirmation}` : ""}
          </p>
          {nextResv.url && (
            <a
              href={nextResv.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-red hover:underline"
            >
              Open booking ↗
            </a>
          )}
        </div>
      )}

      {result.upcoming.length > 1 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/55">
            Then
          </h2>
          <ul className="divide-y divide-ink/10 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
            {result.upcoming.slice(1).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-12 shrink-0 text-xs font-semibold tabular-nums text-ink/45">
                  {a.time ?? ""}
                </span>
                <span className="flex-1 text-sm text-ink">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-ink/50">
                    {" "}
                    · Day {a.dayNumber}
                  </span>
                </span>
                {a.isSecret && <SecretBadge />}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-xs text-ink/45">
        Up next is computed from your itinerary times and today&apos;s date.
      </p>
    </div>
  );
}
