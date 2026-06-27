import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in · Japan Trip" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (await getSession()) redirect("/");
  const { from } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
      <div className="rounded-lg border border-ink/10 bg-white/90 p-6 shadow-soft backdrop-blur">
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <Image
            src="/assets/images/mascot-suitcase-daruma.svg"
            alt=""
            aria-hidden
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14"
          />
          <h1 className="text-xl font-bold text-ink">Japan Trip</h1>
          <p className="text-sm text-ink/60">
            A private notebook for Joaquin &amp; Rosalie. Please log in.
          </p>
        </div>
        <LoginForm from={from ?? "/"} />
      </div>
    </div>
  );
}
