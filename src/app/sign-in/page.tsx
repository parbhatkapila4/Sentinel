"use client";

import { SignInGate } from "@/components/sign-in-gate";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#030303]">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <SignInGate />
    </Suspense>
  );
}
