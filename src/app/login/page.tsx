import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Panel } from "@/components/ui/Panel";
import { isSafeInternalNextPath } from "@/lib/auth/paths";
import { getVerifiedAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getVerifiedAdminSession();
  const params = await searchParams;
  const nextPath = isSafeInternalNextPath(params.next) ? params.next : "/";

  if (session) {
    redirect(nextPath);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <Panel className="w-full max-w-md px-6 py-8 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          Project X Website Service
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Internal Admin Access
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Sign in to continue to the internal Website Service administration
          tools.
        </p>
        <LoginForm nextPath={nextPath} />
      </Panel>
    </div>
  );
}
