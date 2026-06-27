"use client";

import { useActionState } from "react";
import { loginAction, type LoginResult } from "./actions";

export function LoginForm({ from }: { from: string }) {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="from" value={from} />

      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/55"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="joaquin or rosalie"
          className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/55"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30"
        />
        <p className="mt-1 text-xs text-ink/55">
          First time? Whatever you type becomes your password.
        </p>
      </div>

      {state.error && (
        <p className="rounded-md border border-red/40 bg-red/10 px-3 py-2 text-sm text-ink">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
