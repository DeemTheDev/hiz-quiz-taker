import { Card } from "./AdminShell";

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Incorrect password. Please try again.",
  "2": "Too many attempts. Please wait 15 minutes and try again.",
};

export function LoginCard({ error }: { error?: string }) {
  const message = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES["1"] : null;

  return (
    <Card className="w-full max-w-sm sm:p-8">
      <div
        aria-hidden="true"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE9FF] text-2xl"
      >
        📊
      </div>
      <h1 className="mt-5 text-center text-2xl font-semibold text-slate-800">Quiz Stats</h1>
      <p className="mt-1 text-center text-sm text-slate-500">Enter the admin password to view the dashboard.</p>

      {message ? (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-[#FDE8EF] px-4 py-3 text-sm font-medium text-[#9F1D4A]"
        >
          {message}
        </p>
      ) : null}

      <form method="post" action="/api/admin/login" className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-12 w-full rounded-xl border border-[#E4DFF7] bg-[#FAF9FF] px-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7C6CF2] focus:ring-4 focus:ring-[#7C6CF2]/20"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="h-12 w-full rounded-xl bg-[#7C6CF2] text-base font-semibold text-white shadow-[0_6px_18px_rgba(124,108,242,0.35)] transition hover:bg-[#6B5AE6] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7C6CF2]/30 active:scale-[0.99]"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-slate-400">
        This dashboard shows anonymous, aggregate quiz results only. No personal data is stored.
      </p>
    </Card>
  );
}
