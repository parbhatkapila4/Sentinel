"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";

export function UserButtonWrapper() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (!isLoaded) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className="text-sm text-white hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-400">
          {user.emailAddresses?.[0]?.emailAddress ?? ""}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
