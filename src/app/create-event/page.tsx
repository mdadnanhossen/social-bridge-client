import type { Metadata } from "next";

import CreateEventClient from "./CreateEventClient";

export const metadata: Metadata = {
  title: "Create a Community Event — SocialBridge",
  description:
    "Organize a local relief effort, environmental cleanup, or community support drive and rally volunteers around your cause.",
};

export default function CreateEventPage() {
  return <CreateEventClient />;
}
