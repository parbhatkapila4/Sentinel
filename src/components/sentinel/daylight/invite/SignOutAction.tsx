"use client";

import { SignOutButton } from "@clerk/nextjs";
import { primaryButtonStyle } from "../blocks";

export function SignOutAction({ returnTo }: { returnTo: string }) {
  return (
    <SignOutButton redirectUrl={returnTo}>
      <button type="button" className="dl-btn-primary" style={primaryButtonStyle}>
        Sign out
      </button>
    </SignOutButton>
  );
}
