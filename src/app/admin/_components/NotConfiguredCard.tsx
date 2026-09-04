import { Card } from "./AdminShell";

export function NotConfiguredCard() {
  return (
    <Card className="w-full max-w-md text-center">
      <div
        aria-hidden="true"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1E6] text-2xl"
      >
        🔧
      </div>
      <h1 className="mt-5 text-xl font-semibold text-slate-800">Admin dashboard not configured</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Set the <code className="rounded-md bg-[#F1EEFC] px-1.5 py-0.5 font-mono text-[13px] text-[#5B4BC4]">ADMIN_PASSWORD</code>{" "}
        environment variable on the server, then reload this page to sign in.
      </p>
      <p className="mt-4 text-xs text-slate-400">
        The public quiz keeps working without it. See <span className="font-mono">docs/STATS.md</span> for setup steps.
      </p>
    </Card>
  );
}
