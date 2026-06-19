// Auto-generated stub — run `npm run db:gen-types` against your real Supabase
// project to replace this file with the precise types for every table.
// We hand-write a Database shape here so the app type-checks before
// the first generation.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CWRole = "contestant" | "creator" | "organizer" | "admin";
export type CWAgeCategory = "under_13" | "teen" | "young_adult" | "adult";
export type CWLocale = "en" | "zh";
export type CWCampaignType = "competition" | "activity" | "workshop";
export type CWCampaignStatus =
  | "draft"
  | "pending"
  | "published"
  | "closed"
  | "archived";
export type CWEventMode = "online" | "physical" | "hybrid";
export type CWSubmissionStatus =
  | "staged"
  | "claimed"
  | "paid"
  | "approved"
  | "rejected"
  | "shortlisted"
  | "winner"
  | "withdrawn";
export type CWModerationStatus = "pending" | "approved" | "rejected";
export type CWFieldType =
  | "text"
  | "textarea"
  | "number"
  | "phone"
  | "email"
  | "date"
  | "select"
  | "checkbox"
  | "file";
export type CWWalletEntryType = "credit" | "debit";
export type CWSponsorPlacement =
  | "landing_hero"
  | "campaign_detail_top"
  | "campaign_detail_bottom"
  | "programme_inline";
export type CWExportStatus =
  | "pending"
  | "processing"
  | "ready"
  | "expired"
  | "failed";
export type CWExportFormat = "json" | "csv_zip" | "pdf_report";
export type CWDeletionStatus =
  | "scheduled"
  | "cancelled"
  | "processing"
  | "completed"
  | "failed";
export type CWGuardianLinkStatus = "pending_invite" | "active";
export type CWPdpaConsentEvent =
  | "accept_signup"
  | "accept_update"
  | "consent_change"
  | "withdraw"
  | "reaccept";

// ---- Row types (the source of truth) ---------------------------------------

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: CWRole;
  is_admin: boolean;
  phone: string | null;
  country: string | null;
  city: string | null;
  date_of_birth: string | null;
  age_category: CWAgeCategory | null;
  pdpa_consent_at: string | null;
  pdpa_version_accepted: string | null;
  consent_marketing: boolean;
  consent_analytics: boolean;
  consent_third_party: boolean;
  consent_public_profile: boolean;
  consent_updated_at: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  guardian_consent_at: string | null;
  is_minor: boolean;
  locale: CWLocale;
  email_verified_at: string | null;
  email_verification_sent_at: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailVerificationTokenRow {
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export interface GuardianLinkRow {
  id: string;
  guardian_id: string | null;
  student_id: string;
  guardian_name: string;
  guardian_email: string;
  status: CWGuardianLinkStatus;
  created_at: string;
  updated_at: string;
}

export interface PdpaPolicyVersionRow {
  id: string;
  version: string;
  effective_from: string;
  summary: string | null;
  body_md: string;
  content_hash: string;
  is_current: boolean;
  created_at: string;
}

export interface PdpaConsentRow {
  id: string;
  user_id: string;
  policy_version: string;
  event: CWPdpaConsentEvent;
  consent_marketing: boolean | null;
  consent_analytics: boolean | null;
  consent_third_party: boolean | null;
  consent_public_profile: boolean | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DataExportRequestRow {
  id: string;
  user_id: string;
  status: CWExportStatus;
  format: CWExportFormat;
  file_path: string | null;
  file_size: number | null;
  expires_at: string | null;
  failed_reason: string | null;
  requested_at: string;
  completed_at: string | null;
}

export interface AccountDeletionRequestRow {
  id: string;
  user_id: string;
  status: CWDeletionStatus;
  reason: string | null;
  scheduled_for: string;
  cancelled_at: string | null;
  completed_at: string | null;
  failed_reason: string | null;
  requested_ip: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizerRow {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  business_name: string;
  logo_url: string | null;
  banner_url: string | null;
  industry: string | null;
  about: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  is_listed: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatorRow {
  id: string;
  owner_id: string;
  slug: string;
  display_name: string;
  profile_image_url: string | null;
  cover_image_url: string | null;
  tagline: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  behance_url: string | null;
  dribbble_url: string | null;
  tiktok_url: string | null;
  is_listed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProjectRow {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  tools: string[];
  tags: string[];
  sdg_goals: number[];
  views_count: number;
  likes_count: number;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SponsorSlotRow {
  id: string;
  placement: CWSponsorPlacement;
  sponsor_name: string;
  title: string;
  body: string | null;
  cta_label: string;
  cta_href: string;
  image_url: string | null;
  background_from: string | null;
  background_to: string | null;
  applicable_types: CWCampaignType[];
  applicable_campaign_id: string | null;
  applicable_sub_category: string | null;
  is_published: boolean;
  active_from: string | null;
  active_until: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubCategoryRow {
  slug: string;
  label_en: string;
  label_zh: string | null;
  icon: string;
  description_en: string | null;
  description_zh: string | null;
  applicable_types: CWCampaignType[];
  sort_order: number;
  created_at: string;
}

export interface PortfolioProjectAssetRow {
  id: string;
  project_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface CampaignRow {
  id: string;
  organizer_id: string;
  slug: string;
  title: string;
  serial_code: string | null;
  type: CWCampaignType;
  status: CWCampaignStatus;
  category: string | null;
  sub_category: string | null;
  short_description: string | null;
  description: string | null;
  banner_url: string | null;
  hero_url: string | null;
  certificate_template_url: string | null;
  entry_fee: number;
  currency: string;
  submission_start: string | null;
  submission_deadline: string | null;
  review_start: string | null;
  final_event_date: string | null;
  event_mode: CWEventMode | null;
  location_details: string | null;
  kpi_show_progress: boolean;
  kpi_target: number;
  kpi_label: string | null;
  allow_multiple_submissions: boolean;
  multi_min: number;
  multi_max: number;
  enable_addons: boolean;
  enable_age_brackets: boolean;
  enable_school_sponsors: boolean;
  enable_certificate: boolean;
  enable_voting: boolean;
  enable_checkout_message: boolean;
  checkout_message_label: string | null;
  checkout_message_required: boolean;
  use_account_fullname: boolean;
  enable_design: boolean;
  design_picker_label: string | null;
  design_artwork_w: number | null;
  design_artwork_h: number | null;
  judging_criteria: string | null;
  total_prize_value: string | null;
  sdg_goals: number[];
  submissions_count: number;
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgeBracketRow {
  id: string;
  campaign_id: string;
  key: string;
  label: string;
  min_age: number;
  max_age: number;
  sort_order: number;
}

export interface PrizeRow {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  rank: number | null;
  image_url: string | null;
  sort_order: number;
}

export interface FaqItemRow {
  id: string;
  campaign_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface CustomFieldRow {
  id: string;
  campaign_id: string;
  label: string;
  field_type: CWFieldType;
  options: string | null;
  required: boolean;
  sort_order: number;
}

export interface SchoolRow {
  id: string;
  campaign_id: string;
  school_code: string;
  school_name: string;
  coupon_code: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
}

export interface SponsorCouponRow {
  id: string;
  campaign_id: string;
  school_id: string | null;
  code: string;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UploadTokenRow {
  id: string;
  token: string;
  campaign_id: string;
  school_id: string | null;
  school_code: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface SubmissionRow {
  id: string;
  campaign_id: string;
  contestant_id: string | null;
  age_bracket_id: string | null;
  school_id: string | null;
  submission_code: string | null;
  school_code: string | null;
  month_code: string | null;
  seq_code: string | null;
  student_name: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  age: number | null;
  artwork_url: string | null;
  artwork_source_url: string | null;
  design_variant: string | null;
  checkout_message: string | null;
  field_data: Json;
  status: CWSubmissionStatus;
  moderation_status: CWModerationStatus;
  moderation_note: string | null;
  claim_reserved_by: string | null;
  claim_reserved_until: string | null;
  score: number | null;
  rank: number | null;
  paid_at: string | null;
  sponsor_coupon_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletEntryRow {
  id: string;
  user_id: string;
  entry_type: CWWalletEntryType;
  amount: number;
  currency: string;
  reason: string;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BadgeRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  tier: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserBadgeRow {
  id: string;
  user_id: string;
  badge_id: string;
  campaign_id: string | null;
  awarded_at: string;
}

export interface AuditLogRow {
  id: string;
  action: string;
  object_type: string;
  object_id: string | null;
  actor_id: string | null;
  details: Json | null;
  created_at: string;
}

export interface SdgGoalsRefRow {
  goal_number: number;
  title_en: string;
  title_zh: string | null;
  color: string;
  short_label: string | null;
}

export interface PublicVoteRow {
  id: string;
  submission_id: string;
  voter_hash: string;
  voted_at: string;
}

// ---- Helpers ---------------------------------------------------------------

type WithDefaults<T, K extends keyof T> = Omit<Partial<T>, K> & Pick<T, K>;

interface Table<Row, RequiredKey extends keyof Row> {
  Row: Row;
  Insert: WithDefaults<Row, RequiredKey>;
  Update: Partial<Row>;
  Relationships: [];
}

// ---- Database --------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id" | "email">;
      email_verification_tokens: Table<
        EmailVerificationTokenRow,
        "user_id" | "token_hash" | "expires_at"
      >;
      guardian_links: Table<GuardianLinkRow, "student_id" | "guardian_name" | "guardian_email">;
      organizers: Table<OrganizerRow, "owner_id" | "slug" | "name">;
      creators: Table<CreatorRow, "owner_id" | "slug" | "display_name">;
      portfolio_projects: Table<PortfolioProjectRow, "creator_id" | "slug" | "title">;
      portfolio_project_assets: Table<PortfolioProjectAssetRow, "project_id" | "url">;
      campaigns: Table<CampaignRow, "organizer_id" | "slug" | "title">;
      age_brackets: Table<AgeBracketRow, "campaign_id" | "key" | "label">;
      prizes: Table<PrizeRow, "campaign_id" | "title">;
      faq_items: Table<FaqItemRow, "campaign_id" | "question" | "answer">;
      custom_fields: Table<CustomFieldRow, "campaign_id" | "label">;
      schools: Table<SchoolRow, "campaign_id" | "school_code" | "school_name">;
      sponsor_coupons: Table<SponsorCouponRow, "campaign_id" | "code">;
      upload_tokens: Table<UploadTokenRow, "token" | "campaign_id">;
      submissions: Table<SubmissionRow, "campaign_id">;
      wallet_entries: Table<
        WalletEntryRow,
        "user_id" | "entry_type" | "amount" | "reason"
      >;
      badges: Table<BadgeRow, "slug" | "name">;
      user_badges: Table<UserBadgeRow, "user_id" | "badge_id">;
      audit_log: Table<AuditLogRow, "action" | "object_type">;
      sdg_goals_ref: Table<SdgGoalsRefRow, "goal_number" | "title_en" | "color">;
      public_votes: Table<PublicVoteRow, "submission_id" | "voter_hash">;
      sub_categories: Table<SubCategoryRow, "slug" | "label_en" | "icon">;
      sponsor_slots: Table<
        SponsorSlotRow,
        "placement" | "sponsor_name" | "title"
      >;
      pdpa_policy_versions: Table<
        PdpaPolicyVersionRow,
        "version" | "body_md" | "content_hash"
      >;
      pdpa_consents: Table<PdpaConsentRow, "user_id" | "policy_version" | "event">;
      data_export_requests: Table<DataExportRequestRow, "user_id">;
      account_deletion_requests: Table<AccountDeletionRequestRow, "user_id">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      cw_role: CWRole;
      cw_campaign_type: CWCampaignType;
      cw_campaign_status: CWCampaignStatus;
      cw_event_mode: CWEventMode;
      cw_submission_status: CWSubmissionStatus;
      cw_moderation_status: CWModerationStatus;
      cw_field_type: CWFieldType;
      cw_wallet_entry_type: CWWalletEntryType;
      cw_sponsor_placement: CWSponsorPlacement;
      cw_export_status: CWExportStatus;
      cw_export_format: CWExportFormat;
      cw_deletion_status: CWDeletionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
