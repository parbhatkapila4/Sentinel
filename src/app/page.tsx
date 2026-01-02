import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButtonWrapper } from "@/components/sign-in-button";
import { UserButtonWrapper } from "@/components/user-button";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Revenue Sentinel
            </h1>
            <SignInButtonWrapper />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Revenue Sentinel
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {user.emailAddresses[0]?.emailAddress}
          </p>
          <Link
            href="/dashboard"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Go to Dashboard
          </Link>
          <div className="mt-4">
            <UserButtonWrapper />
          </div>
        </div>
      </main>
    </div>
  );
}
