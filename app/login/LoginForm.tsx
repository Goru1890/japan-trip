"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAction, claimAction, type LoginResult } from "./actions";

const inputCls =
  "w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink sm:text-sm focus:border-red focus:outline-none focus:ring-2 focus:ring-red/30";

export function LoginForm({ from }: { from: string }) {
  const [mode, setMode] = useState<"login" | "claim">("login");
  const [username, setUsername] = useState("");

  const [loginState, loginFormAction, loginPending] = useActionState<
    LoginResult,
    FormData
  >(loginAction, {});
  const [claimState, claimFormAction, claimPending] = useActionState<
    LoginResult,
    FormData
  >(claimAction, {});

  useEffect(() => {
    if (loginState.claim) {
      setMode("claim");
      if (loginState.username) setUsername(loginState.username);
    }
  }, [loginState]);

  if (mode === "claim") {
    return (
      <form action={claimFormAction} className="space-y-4">
        <input type="hidden" name="from" value={from} />
        <input type="hidden" name="username" value={username} />
        <p className="rounded-md border border-sky/40 bg-sky/10 px-3 py-2 text-sm text-ink">
          First time for <strong>{username}</strong> — set a password to claim this
          account. You&apos;ll need the trip&apos;s setup code.
        </p>

        <Field label="New password" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        <Field label="Confirm password" htmlFor="confirm">
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        <Field label="Setup code" htmlFor="code">
          <input id="code" name="code" type="text" className={inputCls} />
        </Field>

        {claimState.error && <ErrorNote>{claimState.error}</ErrorNote>}

        <button
          type="submit"
          disabled={claimPending}
          className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
        >
          {claimPending ? "Setting up…" : "Set password & enter"}
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className="w-full text-center text-xs font-medium text-ink/55 hover:underline"
        >
          ← Back to log in
        </button>
      </form>
    );
  }

  return (
    <form action={loginFormAction} className="space-y-4">
      <input type="hidden" name="from" value={from} />

      <Field label="Username" htmlFor="username">
        <input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className={inputCls}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputCls}
        />
      </Field>

      {loginState.error && <ErrorNote>{loginState.error}</ErrorNote>}

      <button
        type="submit"
        disabled={loginPending}
        className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-50"
      >
        {loginPending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink/55"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-red/40 bg-red/10 px-3 py-2 text-sm text-ink">
      {children}
    </p>
  );
}
