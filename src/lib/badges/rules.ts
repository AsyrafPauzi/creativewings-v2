import type { CWBadgeRuleType } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/server";

const COUNTABLE_STATUSES = ["paid", "approved", "shortlisted", "winner"];

export async function rulePasses(
  ruleType: CWBadgeRuleType,
  threshold: number,
  userId: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  switch (ruleType) {
    case "submission_count": {
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("contestant_id", userId)
        .in("status", COUNTABLE_STATUSES);
      return (count ?? 0) >= threshold;
    }
    case "certificate_count": {
      const { count } = await supabase
        .from("issued_certificates")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      return (count ?? 0) >= threshold;
    }
    case "votes_received": {
      const { data: subs } = await supabase
        .from("submissions")
        .select("vote_count")
        .eq("contestant_id", userId);
      const total = (subs ?? []).reduce((sum, s) => sum + (s.vote_count ?? 0), 0);
      return total >= threshold;
    }
    case "shortlisted": {
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("contestant_id", userId)
        .eq("status", "shortlisted");
      return (count ?? 0) >= threshold;
    }
    case "campaign_winner": {
      const { count } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("contestant_id", userId)
        .eq("status", "winner");
      return (count ?? 0) >= threshold;
    }
    case "organizer_published": {
      const { data: org } = await supabase
        .from("organizers")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();
      if (!org) return false;
      const { count } = await supabase
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("organizer_id", org.id)
        .eq("status", "published");
      return (count ?? 0) >= threshold;
    }
    case "account_tenure_days": {
      const { data: profile } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("id", userId)
        .maybeSingle();
      if (!profile?.created_at) return false;
      const days = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24),
      );
      return days >= threshold;
    }
    default:
      return false;
  }
}
