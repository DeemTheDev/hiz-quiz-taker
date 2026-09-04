import type { Metadata } from "next";
import { isAdminConfigured, isAuthenticated } from "@/lib/server/admin-auth";
import { AdminShell } from "./_components/AdminShell";
import { Dashboard } from "./_components/Dashboard";
import { LoginCard } from "./_components/LoginCard";
import { NotConfiguredCard } from "./_components/NotConfiguredCard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: { absolute: "Quiz Stats · Admin" },
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  if (!isAdminConfigured()) {
    return (
      <AdminShell centered>
        <NotConfiguredCard />
      </AdminShell>
    );
  }

  if (!(await isAuthenticated())) {
    const params = await searchParams;
    const error = typeof params.error === "string" ? params.error : undefined;
    return (
      <AdminShell centered>
        <LoginCard error={error} />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}
