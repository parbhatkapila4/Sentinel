import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { SignInClient } from "./sign-in-client";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const { userId } = await auth();
  const sp = await searchParams;
  const raw = Array.isArray(sp.redirect) ? sp.redirect[0] : sp.redirect;
  const target = raw && raw.startsWith("/") ? raw : "/dashboard";

  if (userId) redirect(target);

  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
