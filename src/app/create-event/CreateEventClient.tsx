"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import CreateEventForm from "@/components/forms/CreateEventForm";
import { authClient } from "@/lib/auth-client";

export default function CreateEventClient() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (isPending) return null;
  if (!user) return null;

  return <CreateEventForm />;
}
