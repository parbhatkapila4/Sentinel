"use client";

import { UserButton } from "@clerk/nextjs";

export function UserButtonWrapper() {
  return <UserButton afterSignOutUrl="/" />;
}
