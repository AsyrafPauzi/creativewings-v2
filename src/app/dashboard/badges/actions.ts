"use server";

import { markBadgesNotified } from "@/lib/badges/engine";
import { requireUser } from "@/lib/auth";

export async function markBadgesNotifiedAction(badgeSlugs: string[]) {
  const { user } = await requireUser();
  await markBadgesNotified(user.id, badgeSlugs);
}
