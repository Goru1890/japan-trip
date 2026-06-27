"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#f8eedc",
          color: "#3f4a5a",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "0.875rem", opacity: 0.7, maxWidth: "24rem" }}>
          The app hit an unexpected error. Your trip data is safe.
        </p>
        <button
          onClick={reset}
          style={{
            border: "none",
            borderRadius: 8,
            background: "#3f4a5a",
            color: "#f8eedc",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
