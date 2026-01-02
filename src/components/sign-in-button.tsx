"use client";

import { SignInButton } from "@clerk/nextjs";

export function SignInButtonWrapper() {
  return (
    <SignInButton mode="modal">
      <button className="flex h-12 w-full items-center justify-center rounded-full bg-black px-5 text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 md:w-[158px]">
        Sign in
      </button>
    </SignInButton>
  );
}
