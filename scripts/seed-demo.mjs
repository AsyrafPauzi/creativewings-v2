#!/usr/bin/env node
/**
 * Seed demo accounts + sample campaigns.
 * Run with:  node --env-file=.env.local scripts/seed-demo.mjs
 *
 * Safe to re-run: it upserts by email/owner_id/slug.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "creativewings123";

const ACCOUNTS = [
  {
    email: "admin@creativewings.test",
    full_name: "Platform Admin",
    role: "admin",
    is_admin: true,
  },
  {
    email: "yibon@creativewings.test",
    full_name: "Yibon Creative",
    role: "business",
    organizer: {
      slug: "yibon-creative",
      business_name: "Yibon Creative",
      industry: "Creative Arts & Education",
      about:
        "Yibon Creative is the organising body behind Creative Wings — a national platform for art competitions, school activities and creator portfolios.",
      website: "https://creativewings.asia",
      city: "Kuala Lumpur",
      country: "Malaysia",
      is_listed: true,
      is_verified: true,
    },
  },
  {
    email: "creator@creativewings.test",
    full_name: "Mei Lin",
    role: "creator",
    creator: {
      slug: "mei-lin",
      display_name: "Mei Lin",
      tagline: "Illustrator · Kuala Lumpur",
      bio: "Children's book illustrator and brand designer working with NGOs across Southeast Asia.",
      city: "Kuala Lumpur",
      country: "Malaysia",
      is_listed: true,
    },
  },
  {
    email: "contestant@creativewings.test",
    full_name: "Ahmad bin Karim",
    role: "contestant",
  },
];

async function getOrCreateUser({ email, full_name }) {
  // Try fetch first — listUsers is paginated but our test set is tiny.
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    // Make sure password is current so the user can sign in.
    await supabase.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name },
    });
    return { id: existing.id, created: false };
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (error) throw error;
  return { id: data.user.id, created: true };
}

async function upsertProfile(userId, account) {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: account.full_name,
      display_name: account.full_name,
      role: account.role,
      is_admin: !!account.is_admin,
      onboarded_at: new Date().toISOString(),
      country: "Malaysia",
    })
    .eq("id", userId);
  if (error) throw error;
}

async function upsertOrganizer(userId, org) {
  const { data, error } = await supabase
    .from("organizers")
    .upsert(
      [{ owner_id: userId, ...org }],
      { onConflict: "owner_id" },
    )
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertCreator(userId, creator) {
  const { error } = await supabase
    .from("creators")
    .upsert(
      [{ owner_id: userId, ...creator }],
      { onConflict: "owner_id" },
    );
  if (error) throw error;
}

async function upsertCampaign(organizerId, payload) {
  const { data: existing } = await supabase
    .from("campaigns")
    .select("id")
    .eq("slug", payload.slug)
    .maybeSingle();

  if (existing) {
    await supabase.from("campaigns").update(payload).eq("id", existing.id);
    return existing.id;
  }
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ organizer_id: organizerId, ...payload })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function seedCampaignChildren(campaignId, children) {
  // delete + re-insert child rows so re-running stays idempotent
  for (const t of ["age_brackets", "prizes", "faq_items"]) {
    await supabase.from(t).delete().eq("campaign_id", campaignId);
  }
  if (children.age_brackets?.length) {
    await supabase.from("age_brackets").insert(
      children.age_brackets.map((b, i) => ({ ...b, campaign_id: campaignId, sort_order: i })),
    );
  }
  if (children.prizes?.length) {
    await supabase.from("prizes").insert(
      children.prizes.map((p, i) => ({ ...p, campaign_id: campaignId, sort_order: i })),
    );
  }
  if (children.faq_items?.length) {
    await supabase.from("faq_items").insert(
      children.faq_items.map((f, i) => ({ ...f, campaign_id: campaignId, sort_order: i })),
    );
  }
}

async function main() {
  console.log("→ Seeding demo accounts on", URL);

  const map = {};
  for (const acct of ACCOUNTS) {
    const { id, created } = await getOrCreateUser(acct);
    await upsertProfile(id, acct);
    console.log(`  ${created ? "✚" : "✓"}  ${acct.email}  (${acct.role}${acct.is_admin ? "+admin" : ""})`);
    map[acct.email] = id;
  }

  // Organizer + creator extension rows
  const yibon = ACCOUNTS.find((a) => a.email === "yibon@creativewings.test");
  const meilin = ACCOUNTS.find((a) => a.email === "creator@creativewings.test");
  const yibonOrgId = await upsertOrganizer(map[yibon.email], yibon.organizer);
  await upsertCreator(map[meilin.email], meilin.creator);
  console.log("→ Yibon organiser id:", yibonOrgId);

  // Two demo campaigns, owned by Yibon
  const competitionId = await upsertCampaign(yibonOrgId, {
    slug: "one-smile-one-world-2026",
    title: "One Smile, One World — 笑一笑，世界更美妙 (2026)",
    type: "competition",
    status: "published",
    category: "Art",
    short_description:
      "Malaysia's first national movement inviting students to draw a smile of someone they are grateful for.",
    description:
      "<p>Open to all Malaysian students. Draw a smile of someone you are grateful for and tell us the story behind it. Top entries win cash prizes and have their artwork showcased nationally.</p>",
    entry_fee: 15,
    currency: "MYR",
    submission_start: "2026-06-01T00:00:00+08:00",
    submission_deadline: "2026-10-31T23:59:00+08:00",
    review_start: "2026-09-01T00:00:00+08:00",
    final_event_date: "2026-11-01T19:00:00+08:00",
    event_mode: "physical",
    location_details: "Nationwide submissions · Final showcase in Kuala Lumpur",
    enable_certificate: true,
    enable_age_brackets: true,
    enable_voting: false,
    allow_multiple_submissions: false,
    total_prize_value: "RM 5,000.00 cash + e-certificates for every participant",
    judging_criteria:
      "<ol><li>Creativity & Originality</li><li>Relevance to Theme</li><li>Technical Execution</li><li>Emotional Impact</li></ol>",
    sdg_goals: [3, 4, 16],
    published_at: new Date().toISOString(),
  });
  await seedCampaignChildren(competitionId, {
    age_brackets: [
      { key: "primary", label: "Primary (7–12)", min_age: 7, max_age: 12 },
      { key: "secondary", label: "Secondary (13–17)", min_age: 13, max_age: 17 },
      { key: "university", label: "University (18–24)", min_age: 18, max_age: 24 },
      { key: "open", label: "Open (18+)", min_age: 18, max_age: 99 },
    ],
    prizes: [
      { title: "Grand Prize", description: "RM 2,000 cash + winner showcase + e-certificate" },
      { title: "1st Runner-Up", description: "RM 1,000 cash + e-certificate" },
      { title: "2nd Runner-Up", description: "RM 500 cash + e-certificate" },
      { title: "Every Participant", description: "Personalised e-certificate" },
    ],
    faq_items: [
      {
        question: "Who can join?",
        answer: "Open to all Malaysian students and adults aged 7 and above.",
      },
      {
        question: "How much is the entry fee?",
        answer: "RM 15 per submission across all categories.",
      },
      {
        question: "When are winners announced?",
        answer: "Winners are announced at the final event in November 2026.",
      },
    ],
  });

  const activityId = await upsertCampaign(yibonOrgId, {
    slug: "happy-feet-tapir-beat",
    title: "Happy Feet, Tapir Beat!",
    type: "activity",
    status: "published",
    category: "Running",
    short_description:
      "A community wellness run celebrating the Malayan tapir — every participant receives a digital certificate.",
    description:
      "<p>Lace up your running shoes and join us for a family-friendly virtual run. Track your kilometres, submit your evidence, and receive a personalised e-certificate.</p>",
    entry_fee: 60,
    currency: "MYR",
    submission_start: "2026-07-01T00:00:00+08:00",
    submission_deadline: "2026-09-30T23:59:00+08:00",
    event_mode: "online",
    enable_certificate: true,
    enable_age_brackets: false,
    sdg_goals: [3, 15, 17],
    published_at: new Date().toISOString(),
  });
  await seedCampaignChildren(activityId, {
    prizes: [
      { title: "Every Participant", description: "Personalised Happy Feet e-certificate" },
    ],
    faq_items: [
      {
        question: "Is this a physical event?",
        answer: "It's a virtual run — submit your tracker screenshot from any running app.",
      },
    ],
  });

  console.log("\n✅ Done. Demo accounts (password: " + DEMO_PASSWORD + "):");
  for (const a of ACCOUNTS) {
    console.log(`    ${a.email.padEnd(35)} → ${a.role}${a.is_admin ? " + admin" : ""}`);
  }
  console.log("\nDemo campaigns published:");
  console.log("    /campaigns/one-smile-one-world-2026  (competition · Art)");
  console.log("    /campaigns/happy-feet-tapir-beat     (activity · Running)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
