import { notFound } from "next/navigation";

import { VotingGallery } from "@/components/campaigns/voting-gallery";
import {
  AboutSection,
  AlsoRecommended,
  BottomCampaignCta,
  CampaignHero,
  CampaignSidebar,
  ContactSection,
  CriteriaSection,
  DetailToolbar,
  FaqSection,
  ResourcesSection,
  RulesSection,
  SectionTabs,
  SponsorBanner,
  SubmitSection,
  type RelatedCampaign,
} from "@/components/campaigns/detail-sections";
import { PageMotion } from "@/components/site/animations/page-motion";
import { parseJudgingCriteria } from "@/lib/campaigns/parse-judging-criteria";
import { loadSponsorSlot } from "@/lib/sponsor-slots";
import { createClient } from "@/lib/supabase/server";
import type {
  CWCampaignType,
  SubCategoryRow,
} from "@/lib/supabase/database.types";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("title, short_description")
    .eq("slug", slug)
    .maybeSingle();
  return {
    title: data?.title ?? "Campaign",
    description: data?.short_description ?? undefined,
  };
}

const DEFAULT_RULES: Record<CWCampaignType, string[]> = {
  competition: [
    "Each contestant submits one (1) original entry within the submission window.",
    "All entries must be the contestant's own work — no plagiarism, AI-only generation or impersonation.",
    "Group entries are accepted only where explicitly noted by the organizer.",
    "Top finalists are announced after judging closes; auto-approved entries enter the public-vote phase.",
    "Winners agree to be featured on Creative Wings and the organizer's channels.",
  ],
  workshop: [
    "Workshops require registration before the start date — seats are limited.",
    "Materials and pre-work, if any, are listed by the organizer.",
    "Recordings are shared with registered attendees only, where applicable.",
    "Attendance certificates are issued automatically once the session is completed.",
  ],
  activity: [
    "Activities are open to anyone who meets the eligibility criteria.",
    "Submissions are auto-approved; please review the organizer's content guidelines first.",
    "Featured entries may be highlighted by Creative Wings in the public feed.",
    "Some activities run on a rolling basis with no fixed end date.",
  ],
};

const DEFAULT_CRITERIA: Record<
  CWCampaignType,
  { name: string; weight: string; description: string }[]
> = {
  competition: [
    { name: "Originality", weight: "30%", description: "Idea, narrative and creative direction." },
    { name: "Craft & technique", weight: "25%", description: "Execution quality and command of the medium." },
    { name: "Storytelling", weight: "20%", description: "How well the brief is interpreted and conveyed." },
    { name: "Production quality", weight: "10%", description: "Audio/video clarity, framing and polish." },
    { name: "Audience choice", weight: "15%", description: "Public votes from the Creative Wings community." },
  ],
  workshop: [
    { name: "Pre-work completion", weight: "30%", description: "Required exercises submitted before the session." },
    { name: "Live participation", weight: "30%", description: "Engagement with prompts and group activities." },
    { name: "Final artefact", weight: "30%", description: "Quality of the workshop output piece." },
    { name: "Reflection", weight: "10%", description: "Short written reflection at the end of the session." },
  ],
  activity: [
    { name: "Brief alignment", weight: "40%", description: "How closely the entry follows the activity brief." },
    { name: "Authenticity", weight: "30%", description: "Original work and honest documentation." },
    { name: "Impact", weight: "30%", description: "Real-world or community impact, where relevant." },
  ],
};

const SUBMIT_NOTES =
  "Plagiarism, AI-generated content where prohibited, and impersonation will result in disqualification. Public votes count once judging closes; vote-buying is auto-detected and removed.";

export default async function CampaignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "*, organizers:organizer_id(id, slug, name, logo_url, industry, is_verified, about, email, phone, website)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!campaign || !["published", "closed"].includes(campaign.status)) {
    notFound();
  }

  const organizer = Array.isArray(campaign.organizers)
    ? campaign.organizers[0]
    : campaign.organizers;

  const [
    { data: ageBrackets },
    { data: prizes },
    { data: faqItems },
    { data: subCategoryRows },
    { data: relatedRows },
    sponsorTop,
    sponsorBottom,
    { data: votingRows },
  ] = await Promise.all([
    supabase
      .from("age_brackets")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
    supabase
      .from("prizes")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
    supabase
      .from("faq_items")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
    campaign.sub_category
      ? supabase
          .from("sub_categories")
          .select("slug, label_en, label_zh, icon, applicable_types, sort_order, created_at")
          .eq("slug", campaign.sub_category)
          .maybeSingle()
          .then((r) => ({ data: r.data ? [r.data] : [] }))
      : Promise.resolve({ data: [] as SubCategoryRow[] }),
    supabase
      .from("campaigns")
      .select(
        "id, slug, title, submission_deadline, banner_url, type, organizer:organizer_id(name)",
      )
      .eq("type", campaign.type)
      .neq("id", campaign.id)
      .in("status", ["published", "closed"])
      .order("submission_deadline", { ascending: true })
      .limit(4),
    loadSponsorSlot({
      placement: "campaign_detail_top",
      campaignType: campaign.type,
      campaignId: campaign.id,
      subCategorySlug: campaign.sub_category ?? null,
    }),
    loadSponsorSlot({
      placement: "campaign_detail_bottom",
      campaignType: campaign.type,
      campaignId: campaign.id,
      subCategorySlug: campaign.sub_category ?? null,
    }),
    campaign.enable_voting
      ? supabase
          .from("submissions")
          .select("id, student_name, artwork_url, vote_count, age_brackets:age_bracket_id(label)")
          .eq("campaign_id", campaign.id)
          .eq("moderation_status", "approved")
          .in("status", ["paid", "approved", "shortlisted", "winner"])
          .order("vote_count", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const subCategory: SubCategoryRow | null =
    Array.isArray(subCategoryRows) && subCategoryRows[0]
      ? (subCategoryRows[0] as SubCategoryRow)
      : null;
  const related: RelatedCampaign[] = (relatedRows ?? []) as RelatedCampaign[];
  const votingEntries = (votingRows ?? []).map((row) => {
    const bracket = Array.isArray(row.age_brackets) ? row.age_brackets[0] : row.age_brackets;
    return {
      id: row.id,
      student_name: row.student_name,
      artwork_url: row.artwork_url,
      vote_count: row.vote_count ?? 0,
      bracketLabel: bracket?.label ?? null,
    };
  });
  const joinHref = `/campaigns/${campaign.slug}/submit`;
  const campaignType = campaign.type as CWCampaignType;
  const rules = DEFAULT_RULES[campaignType];
  const { structured: criteria, prose: proseCriteria } = parseJudgingCriteria(
    campaign.judging_criteria,
    DEFAULT_CRITERIA[campaignType],
  );

  return (
    <PageMotion hero>
    <div className="bg-white">
      <DetailToolbar campaign={{ title: campaign.title, type: campaign.type }} />
      <CampaignHero
        campaign={campaign}
        organizer={organizer}
        ageBrackets={ageBrackets ?? []}
        subCategory={subCategory}
        joinHref={joinHref}
      />

      <div className="bg-[#F8F9FB]">
        <div className="cw-container grid items-start gap-7 py-7 lg:grid-cols-[280px_1fr]">
          <CampaignSidebar
            campaign={campaign}
            organizer={organizer}
            related={related}
            subCategory={subCategory}
            joinHref={joinHref}
          />

          <main className="flex flex-col gap-7">
            <SponsorBanner slot={sponsorTop} />
            <SectionTabs />
            <AboutSection campaign={campaign} ageBrackets={ageBrackets ?? []} />
            <CriteriaSection criteria={criteria} proseCriteria={proseCriteria} prizes={prizes ?? []} />
            {campaign.enable_voting ? (
              <section className="flex flex-col gap-4" id="voting">
                <h2 className="text-2xl font-extrabold tracking-tight text-body">Public voting</h2>
                <p className="text-sm text-text-secondary">
                  Vote for your favourite entries. Each visitor can cast up to{" "}
                  {campaign.vote_limit_per_user ?? 1} vote(s) in this campaign.
                </p>
                <VotingGallery campaignSlug={campaign.slug} entries={votingEntries} />
              </section>
            ) : null}
            <SubmitSection notes={SUBMIT_NOTES} />
            <RulesSection rules={rules} />
            <ResourcesSection campaign={campaign} organizer={organizer} />
            <FaqSection items={faqItems ?? []} />
            {organizer && <ContactSection organizer={organizer} />}
            <SponsorBanner slot={sponsorBottom} />
            <AlsoRecommended campaigns={related} />
          </main>
        </div>
      </div>
      <BottomCampaignCta campaign={campaign} joinHref={joinHref} />
    </div>
    </PageMotion>
  );
}
