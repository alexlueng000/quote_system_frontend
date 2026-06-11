export type UserRole = "consultant" | "admin" | "approver";
export type UserStatus = "active" | "inactive";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type UserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

export type ActiveTab =
  | "customers"
  | "create"
  | "list"
  | "stats"
  | "country-config"
  | "rules"
  | "users"
  | "approvals";

export type CountryRuleSection =
  | "overview"
  | "countries"
  | "treaty"
  | "path"
  | "deadline"
  | "entity"
  | "language"
  | "fx"
  | "special";

export type LoginResponse = {
  token: string;
  user: User;
};

export type Country = {
  code: string;
  name_cn: string;
  name_en: string;
  default_currency: string;
  country_type?: string;
  enabled: boolean;
  display_order?: number;
  international_region?: string;
  business_region?: string[];
  region_remark?: string;
  jurisdiction_id?: string | null;
  internal_code?: string;
  display_code?: string;
  jurisdiction_type?: string;
  standard_code?: string;
  is_enabled?: boolean | null;
  iso_alpha2?: string | null;
  iso_alpha3?: string | null;
  iso_numeric?: string | null;
  un_m49_code?: string | null;
  wipo_st3_code?: string | null;
  source_name?: string;
  source_url?: string;
  source_version?: string;
  source_note?: string;
  last_verified_at?: string | null;
  source_verified?: boolean;
  source_verified_at?: string | null;
  source_verified_by?: string | null;
  manual_override?: boolean;
  remarks?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  delete_reason?: string | null;
  default_office_jurisdiction_id?: string | null;
  default_office_code?: string;
  default_office_name_cn?: string;
  default_office_name_en?: string;
  default_office_type?: string;
  default_office_source_note?: string;
};

export type CountryCreate = {
  reference_id: string;
  code: string;
  name_cn: string;
  name_en: string;
  enabled: boolean;
  display_order?: number;
  international_region?: string;
  business_region: string[];
  region_remark: string;
  internal_code: string;
  display_code: string;
  jurisdiction_type?: string;
  standard_code?: string;
  is_enabled: boolean;
  source_name?: string;
  source_url?: string;
  source_version?: string;
  source_note?: string;
  source_verified: boolean;
  source_verified_at?: string | null;
  source_verified_by?: string | null;
  last_verified_at: string | null;
  review_status?: "pending_review" | "verified" | "needs_update" | "deprecated" | string;
  manual_override: boolean;
  remarks: string;
  default_office_jurisdiction_id?: string | null;
  default_office_code?: string;
  default_office_name_cn?: string;
  default_office_name_en?: string;
  default_office_type?: string;
  default_office_source_note?: string;
};

export type CountryBulkFromReferenceResult = {
  reference_id: string;
  standard_code: string;
  display_code: string;
  name_cn: string;
  name_en: string;
  status: "created" | "restored" | "added" | "skipped" | "failed" | string;
  existence_status?: "active_exists" | "soft_deleted_exists" | "legacy_exists_only" | "not_exists" | string;
  reason: string;
  country?: Country | null;
};

export type CountryBulkFromReferenceResponse = {
  created_count?: number;
  restored_count?: number;
  added_count: number;
  skipped_count: number;
  failed_count: number;
  created_items?: CountryBulkFromReferenceResult[];
  restored_items?: CountryBulkFromReferenceResult[];
  skipped_items?: CountryBulkFromReferenceResult[];
  failed_items?: CountryBulkFromReferenceResult[];
  added: CountryBulkFromReferenceResult[];
  restored?: CountryBulkFromReferenceResult[];
  skipped: CountryBulkFromReferenceResult[];
  failed: CountryBulkFromReferenceResult[];
};

export type CountryBulkFromReferenceStagingItem = {
  reference_id: string;
  name_cn: string;
  name_en: string;
  display_code: string;
  jurisdiction_type?: string;
  international_region: string;
  business_region: string[];
  default_office_name_cn: string;
  default_office_name_en: string;
  default_office_code: string;
  default_office_type: string;
  remarks: string;
  overwrite_existing_fields?: boolean;
  review_status?: "pending_review" | "verified" | "needs_update" | "deprecated" | string;
};

export type JurisdictionReference = {
  reference_id: string;
  jurisdiction_id?: string | null;
  standard_code: string;
  display_code: string;
  name_cn: string;
  name_en: string;
  aliases: string[];
  jurisdiction_type: string;
  reference_category: string;
  business_scope: string[];
  visibility_scope: string;
  candidate_status: string;
  quote_selectable_default: boolean;
  not_selectable_reason: string;
  reserved_reason: string;
  geo_region: string;
  default_business_economic_regions: string[];
  source_id?: string | null;
  source_name: string;
  source_url: string;
  source_version: string;
  source_note: string;
  source_verified: boolean;
  source_verified_at?: string | null;
  source_verified_by?: string | null;
  last_reviewed_at?: string | null;
  next_review_due_at?: string | null;
  review_status: string;
  is_active: boolean;
  default_currency_legacy: string;
  default_office_code?: string;
  default_office_name_cn?: string;
  default_office_name_en?: string;
  default_office_type?: string;
  default_office_source_note?: string;
};

export type JurisdictionReferenceListResponse = {
  items: JurisdictionReference[];
  total: number;
};

export type JurisdictionDataSource = {
  source_id: string;
  source_name: string;
  source_type: "official" | "internal" | "third_party" | "manual_verified" | string;
  source_owner: string;
  source_url: string;
  source_version: string;
  applicable_fields: string[];
  verification_frequency: string;
  source_note: string;
  source_verified: boolean;
  source_verified_at?: string | null;
  source_verified_by?: string | null;
  last_reviewed_at?: string | null;
  next_review_due_at?: string | null;
  review_status: "pending_review" | "verified" | "needs_update" | "deprecated" | string;
  is_active: boolean;
};

export type JurisdictionDataSourceForm = {
  source_id: string;
  source_name: string;
  source_type: "official" | "internal" | "third_party" | "manual_verified";
  source_owner: string;
  source_url: string;
  source_version: string;
  applicable_fields: string[];
  verification_frequency: string;
  source_note: string;
  last_reviewed_at?: string | null;
  next_review_due_at?: string | null;
  review_status: "pending_review" | "verified" | "needs_update" | "deprecated";
  is_active: boolean;
};

export type JurisdictionRegionTag = {
  id: string;
  jurisdiction_id: string;
  jurisdiction_code: string;
  jurisdiction_name_cn: string;
  jurisdiction_name_en: string;
  tag_scheme: string;
  tag_code: string;
  tag_name_cn: string;
  tag_name_en: string;
  source_id?: string | null;
  source_type: string;
  source_name: string;
  source_url: string;
  source_note: string;
  source_verified: boolean;
  source_verified_at?: string | null;
  source_verified_by?: string | null;
  last_reviewed_at?: string | null;
  next_review_due_at?: string | null;
  review_status: string;
  is_active: boolean;
  reason_note: string;
};

export type CountryPathRule = {
  id: string;
  country_code: string;
  application_type: string;
  filing_route: string;
  route_detail: string;
  affects_official_fee: boolean;
  affects_local_service_fee: boolean;
  affects_inhouse_service_fee: boolean;
  affects_questions: boolean;
  affects_documents: boolean;
  affects_deadlines: boolean;
  affects_translation: boolean;
  affects_display: boolean;
  enabled: boolean;
  effective_date: string | null;
  remark: string;
};

export type CountryTreatyRule = {
  id: string;
  country_code: string;
  treaty_name: string;
  membership_type: string;
  enabled: boolean;
  effective_date: string | null;
  expiry_date: string | null;
  remark: string;
};

export type DeadlineRule = {
  id: string;
  country_code: string;
  application_type: string;
  filing_route: string;
  route_detail: string;
  pct_chapter_one_deadline: string;
  has_substantive_exam: boolean;
  substantive_exam_mode: string;
  accepts_substantive_exam: boolean;
  has_early_publication: boolean;
  application_cycle: string;
  protection_term: string;
  enabled: boolean;
  effective_date: string | null;
  remark: string;
};

export type EntityTypeRule = {
  id: string;
  country_code: string;
  application_type: string;
  filing_route: string;
  enabled: boolean;
  entity_types: string[];
  affects_official_fee: boolean;
  affects_questions: boolean;
  requires_customer_confirmation: boolean;
  requires_supporting_documents: boolean;
  remark: string;
};

export type LanguageRule = {
  id: string;
  country_code: string;
  application_type: string;
  accepted_languages: string[];
  source_language: string;
  target_language: string;
  intermediate_language: string;
  needs_second_translation: boolean;
  recommended_scheme_id: string;
  default_translation_fee: boolean;
  allow_scheme_switch: boolean;
  enabled: boolean;
  remark: string;
};

export type FxTaxRule = {
  id: string;
  country_code: string;
  official_currency: string;
  official_quote_currency: string;
  local_service_currency: string;
  local_service_currency_options: string[];
  quote_currency: string;
  fx_rate: string;
  tax_rate: string;
  tax_included: boolean;
  lock_on_formal_quote: boolean;
  version: string;
  enabled: boolean;
  remark: string;
};

export type SpecialRule = {
  id: string;
  country_code: string;
  application_type: string;
  filing_route: string;
  rule_type: string;
  enabled: boolean;
  triggers_extra_fee: boolean;
  triggers_risk_warning: boolean;
  requires_customer_confirmation: boolean;
  risk_summary: string;
  linked_rule_code: string;
  remark: string;
};

export type CountryConfig = {
  countries: Country[];
  treaty_rules: CountryTreatyRule[];
  path_rules: CountryPathRule[];
  deadline_rules: DeadlineRule[];
  entity_type_rules: EntityTypeRule[];
  language_rules: LanguageRule[];
  fx_tax_rules: FxTaxRule[];
  special_rules: SpecialRule[];
};

export type IpSystemQuerySystem = {
  system_code: string;
  name_zh: string;
  name_en: string;
  short_name: string;
  category: string;
  source_url: string;
  source_name: string;
  last_checked_at: string | null;
  remark: string;
  is_p0: boolean;
  is_reserved: boolean;
};

export type IpSystemMemberStats = {
  official_member_count: number;
  existing_in_master_count: number;
  missing_in_master_count: number;
  applicable_relation_count: number;
  relation_type_counts: Record<string, number>;
  last_checked_at: string | null;
  source_name: string;
  source_url: string;
};

export type IpSystemQueryMember = {
  name_zh: string;
  name_en: string;
  code: string;
  effective_date: string | null;
  date_label: string;
  member_type: string;
  master_status: string;
  master_status_label: string;
  membership_relation_type: string;
  membership_relation_type_label: string;
  pct_route_type: string;
  pct_route_type_label: string;
  regional_system_code: string;
  regional_system_name: string;
  route_remark: string;
  is_historical_relation: boolean;
  internal_remark: string;
  remark_updated_at: string | null;
  remark_updated_by: string;
  remark: string;
};

export type IpSystemMembersResponse = {
  system: IpSystemQuerySystem;
  stats: IpSystemMemberStats;
  overall_remark: string;
  members: IpSystemQueryMember[];
  historical_members: IpSystemQueryMember[];
};

export type IpSystemJurisdictionOption = {
  jurisdiction_id: string | null;
  code: string;
  name_zh: string;
  name_en: string;
  member_type: string;
  master_status: string;
  master_status_label: string;
  matched_system_codes: string[];
  has_reference_object?: boolean;
  object_type?: string;
  object_type_label?: string;
  reference_source_name?: string;
  reference_profile_url?: string;
  reference_system_hint?: string;
  is_pct_contracting_state?: boolean;
  is_paris_contracting_party?: boolean;
  epc_relation_type_label?: string;
  is_eu_design_covered?: boolean;
};

export type IpSystemJurisdictionMembership = {
  system_code: string;
  system_name_zh: string;
  system_name_en: string;
  short_name: string;
  effective_date: string | null;
  membership_relation_type: string;
  membership_relation_type_label: string;
  pct_route_type: string;
  pct_route_type_label: string;
  regional_system_code: string;
  regional_system_name: string;
  route_remark: string;
  is_historical_relation: boolean;
  internal_remark: string;
  remark: string;
};

export type IpSystemJurisdictionMembershipGroup = {
  jurisdiction_id: string | null;
  code: string;
  name_zh: string;
  name_en: string;
  master_status: string;
  master_status_label: string;
  has_reference_object?: boolean;
  object_type?: string;
  object_type_label?: string;
  reference_source_name?: string;
  reference_profile_url?: string;
  reference_system_hint?: string;
  is_pct_contracting_state?: boolean;
  is_paris_contracting_party?: boolean;
  epc_relation_type_label?: string;
  is_eu_design_covered?: boolean;
  memberships: IpSystemJurisdictionMembership[];
};

export type IpSystemUpdateDiff = {
  change_type:
    | "added_member"
    | "removed_member"
    | "effective_date_changed"
    | "name_changed"
    | "code_changed"
    | "remark_changed"
    | "source_changed"
    | "route_type_changed"
    | "object_type_changed"
    | "profile_url_changed";
  code: string;
  name_zh: string;
  name_en: string;
  old_effective_date: string | null;
  new_effective_date: string | null;
  old_remark: string;
  new_remark: string;
  old_source_url: string;
  new_source_url: string;
  old_value?: string | null;
  new_value?: string | null;
};

export type IpSystemCheckUpdatesResponse = {
  system_code: string;
  source_id: string;
  checked_at: string;
  source_url: string;
  source_name: string;
  source_type: string;
  apply_target: string;
  affects_membership_count: boolean;
  check_status: string;
  expected_count: number | null;
  expected_scope: string;
  parsed_count: number | null;
  parsed_date_count: number | null;
  current_baseline_count: number | null;
  failure_reason: string;
  apply_allowed: boolean;
  diff_summary: Record<string, number>;
  has_changes: boolean;
  summary_preview: string;
  message: string;
  diffs: IpSystemUpdateDiff[];
};

export type IpSystemApplyUpdatesResponse = {
  system_code: string;
  updated_count: number;
  parsed_count: number | null;
  parsed_date_count: number | null;
  written_date_count: number | null;
  skipped_count: number;
  apply_target: string;
  affects_membership_count: boolean;
  summary: string;
  message: string;
};

export type IpSystemDataSource = {
  id: string;
  system_code: string;
  source_name: string;
  source_type: string;
  source_url: string;
  purpose_note: string;
  is_enabled: boolean;
  last_checked_at: string | null;
  last_success_at: string | null;
  last_check_status: string;
  last_check_message: string;
  last_check_summary: string;
  last_update_summary: string;
  admin_update_note: string;
  created_at: string | null;
  updated_at: string | null;
};

export type IpSystemUpdateHistoryItem = {
  id: number;
  source_id: string;
  system_code: string;
  source_name: string;
  source_type: string;
  operation: string;
  update_type: string;
  update_count: number;
  parsed_count: number | null;
  parsed_date_count: number | null;
  written_date_count: number | null;
  system_summary: string;
  admin_note: string;
  actor: string;
  status: string;
  failure_reason: string;
  created_at: string | null;
};

export type IpSystemReferenceObject = {
  sequence_no: number;
  name_zh: string;
  name_en: string;
  code: string;
  object_type: string;
  object_type_label: string;
  master_status: string;
  master_status_label: string;
  is_pct_contracting_state: boolean;
  is_paris_contracting_party: boolean;
  epc_relation_type: string;
  epc_relation_type_label: string;
  is_eu_design_covered: boolean;
  system_hint: string;
  profile_url: string;
  internal_remark: string;
};

export type IpSystemReferenceObjectsResponse = {
  source_name: string;
  source_type: string;
  source_url: string;
  reference_count: number;
  objects: IpSystemReferenceObject[];
};

export type IpSystemBusinessDomain = {
  id: string;
  system_id: string;
  business_domain: "patent" | "design" | "trademark" | "general_ip" | string;
  is_enabled: boolean;
  quote_hint_default_enabled: boolean;
  path_rule_default_dependency: boolean;
  remark: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type IpSystem = {
  system_id: string;
  system_code: string;
  system_name_cn: string;
  system_name_en: string;
  system_category: string;
  business_domain_scope: string;
  is_active: boolean;
  display_order: number;
  default_update_frequency: string;
  source_priority: string;
  source_url: string;
  official_source_name: string;
  last_verified_at: string | null;
  next_review_due_at: string | null;
  remark: string;
  business_domains: IpSystemBusinessDomain[];
};

export type IpSystemOverview = {
  system_id: string;
  system_code: string;
  system_name_cn: string;
  system_name_en: string;
  system_category: string;
  business_domain: string | null;
  current_jurisdiction_count: number;
  relation_type_counts: Record<string, number>;
  pending_review_count: number;
  last_sync_at: string | null;
  last_verified_at: string | null;
  next_review_due_at: string | null;
  review_status: string;
};

export type IpSystemV1PhaseScope = {
  phase1_system_codes: string[];
  reserved_system_codes: string[];
  phase1_jurisdiction_codes: string[];
};

export type IpSystemBusinessTodoSummary = {
  pending_review_count: number;
  match_exception_count: number;
  candidate_count: number;
  non_phase1_candidate_count: number;
  has_overdue_review: boolean;
};

export type IpSystemBusinessReferenceSummary = {
  source_config_count: number;
  candidate_count: number;
  phase1_candidate_count: number;
  non_phase1_candidate_count: number;
  unmatched_candidate_count: number;
  latest_snapshot_at: string | null;
  latest_sync_at: string | null;
};

export type IpSystemBusinessDashboardItem = {
  system_id: string;
  system_code: string;
  system_name_cn: string;
  system_name_en: string;
  system_category: string;
  business_domain_scope: string;
  business_domains: IpSystemBusinessDomain[];
  management_agency: string;
  is_active: boolean;
  is_phase1_default: boolean;
  is_reserved: boolean;
  current_relation_count: number;
  relation_type_counts: Record<string, number>;
  todo_summary: IpSystemBusinessTodoSummary;
  reference_summary: IpSystemBusinessReferenceSummary;
  data_status: string;
  last_verified_at: string | null;
  next_review_due_at: string | null;
  remark: string;
};

export type IpSystemBusinessDashboardResponse = {
  items: IpSystemBusinessDashboardItem[];
  phase_scope: IpSystemV1PhaseScope;
};

export type IpSystemBusinessRelationSummaryBucket = {
  key: string;
  label: string;
  count: number;
  examples: string[];
  relation_type_codes: string[];
};

export type IpSystemBusinessActionItem = {
  action_key: string;
  title: string;
  description: string;
  priority: number;
};

export type IpSystemBusinessTodoItem = {
  item_type: string;
  title: string;
  count: number;
  description: string;
  action_key: string;
  priority: number;
};

export type IpSystemBusinessDetailResponse = {
  system: IpSystemBusinessDashboardItem;
  relation_summary: {
    current_relation_count: number;
    relation_type_counts: Record<string, number>;
  };
  current_relation_summary: IpSystemBusinessRelationSummaryBucket[];
  todo_items: IpSystemBusinessTodoItem[];
  recommended_next_actions: IpSystemBusinessActionItem[];
  boundary_notes: string[];
  relations: IpSystemRelation[];
  source_configs: IpSystemSourceConfig[];
  reference_summary: IpSystemBusinessReferenceSummary;
  pending_reviews: IpSystemChangeReview[];
  match_exceptions: IpSystemMatchException[];
  candidates: IpSystemRelationCandidate[];
};

export type IpSystemJurisdictionTodoItem = {
  item_type: string;
  system_id: string | null;
  system_code: string;
  relation_type_code: string;
  title: string;
  status: string;
  source_reference: string;
};

export type IpSystemJurisdictionSystemCard = {
  system_id: string;
  system_code: string;
  system_name_cn: string;
  system_category: string;
  status: string;
  relations: IpSystemRelation[];
  pending_reviews: IpSystemChangeReview[];
  candidates: IpSystemRelationCandidate[];
  match_exceptions: IpSystemMatchException[];
  risk_tips: string[];
};

export type IpSystemJurisdictionProfileResponse = {
  profile: {
    jurisdiction_id: string;
    jurisdiction_code: string;
    jurisdiction_name_cn: string;
    jurisdiction_name_en: string;
    jurisdiction_type: string;
    current_relation_count: number;
    pending_item_count: number;
    latest_verified_at: string | null;
    data_status: string;
  };
  system_cards: IpSystemJurisdictionSystemCard[];
  todo_items: IpSystemJurisdictionTodoItem[];
  hidden_not_applicable_count: number;
  phase_scope: IpSystemV1PhaseScope;
};

export type IpSystemRelation = {
  relation_id: string;
  jurisdiction_id: string;
  jurisdiction_code: string;
  jurisdiction_name_cn: string;
  jurisdiction_name_en: string;
  system_id: string;
  system_code: string;
  system_name_cn: string;
  relation_type_id: string;
  relation_type_code: string;
  relation_type_name_cn: string;
  business_domain: string;
  is_active: boolean;
  effective_date: string | null;
  expiry_date: string | null;
  publish_status: string;
  source_reference: string;
  verification_status: string;
  quote_hint_enabled: boolean;
  path_rule_dependency: boolean;
  quote_hint_text: string;
  special_statement: string | null;
  data_quality_flags: string[];
  admin_remark: string;
  is_current_effective: boolean;
};

export type IpSystemSourceConfig = {
  source_config_id: string;
  system_id: string;
  source_name: string;
  source_type: string;
  source_url: string;
  source_scope: string;
  official_source_name: string;
  parser_key?: string;
  parse_mode: string;
  update_frequency: string;
  auto_check_enabled?: boolean;
  last_checked_at: string | null;
  next_check_at: string | null;
  last_success_at: string | null;
  last_failed_at: string | null;
  failure_reason: string;
  is_active: boolean;
  remark: string;
};

export type IpSystemRelationCandidate = {
  candidate_id: string;
  source_config_id: string | null;
  snapshot_id: string | null;
  batch_id: string | null;
  system_id: string;
  system_code: string;
  system_name_cn: string;
  business_domain: string;
  relation_type_id: string | null;
  relation_type_code: string;
  relation_type_name_cn: string;
  official_name: string;
  official_code: string;
  raw_text: string;
  source_url: string;
  source_reference: string;
  evidence_text: string;
  matched_jurisdiction_id: string | null;
  matched_jurisdiction_code: string;
  matched_jurisdiction_name_cn: string;
  match_status: string;
  match_confidence: string | number | null;
  data_quality_flags: string[];
  created_at: string | null;
  updated_at: string | null;
};

export type IpSystemReferenceCandidateResponse = {
  batch: IpSystemSyncBatch;
  snapshot_id: string | null;
  source_config: IpSystemSourceConfig;
  total_candidates: number;
  matched_count: number;
  unmatched_count: number;
  candidates: IpSystemRelationCandidate[];
};

export type IpSystemReferenceReviewResponse = {
  batch_id: string;
  created_count: number;
  skipped_count: number;
  reviews: IpSystemChangeReview[];
};

export type IpSystemJurisdictionReferenceCheck = {
  jurisdiction_id: string;
  published_relations: IpSystemRelation[];
  pending_reviews: IpSystemChangeReview[];
  reference_candidates: IpSystemRelationCandidate[];
  match_exceptions: IpSystemMatchException[];
};

export type IpSystemEnablementCheckResponse = {
  query: string;
  matched_jurisdiction: {
    jurisdiction_id: string | null;
    jurisdiction_code: string;
    jurisdiction_name_cn: string;
    jurisdiction_name_en: string;
    jurisdiction_type: string;
    is_enabled: boolean | null;
    is_deleted: boolean | null;
  } | null;
  master_status: string;
  phase_scope_status: string;
  system_statuses: IpSystemEnablementSystemStatus[];
  published_relations: IpSystemRelation[];
  reference_candidates: IpSystemRelationCandidate[];
  pending_reviews: IpSystemChangeReview[];
  match_exceptions: IpSystemMatchException[];
  alias_mappings: Record<string, unknown>[];
  recommended_next_actions: IpSystemBusinessActionItem[];
  boundary_notes: string[];
};

export type IpSystemEnablementSystemStatus = {
  system_id: string;
  system_code: string;
  system_name: string;
  status:
    | "published"
    | "reference_hit_unpublished"
    | "candidate_exists"
    | "pending_review_exists"
    | "match_exception"
    | "no_hit"
    | "not_applicable"
    | "reserved_hidden"
    | string;
  relation_types: string[];
  visibility: "default" | "reserved_hidden" | "hidden" | string;
  reason: string;
  published_relations: IpSystemRelation[];
  reference_candidates: IpSystemRelationCandidate[];
  pending_reviews: IpSystemChangeReview[];
  match_exceptions: IpSystemMatchException[];
};

export type IpSystemImportResponse = {
  batch: IpSystemSyncBatch;
  snapshot_id: string | null;
  total_rows: number;
  parsed_count: number;
  new_records_count: number;
  changed_records_count: number;
  removed_records_count: number;
  unchanged_records_count: number;
  exception_records_count: number;
  parse_errors: Array<{ row_number: number; reason: string; raw: Record<string, unknown> }>;
};

export type IpSystemSyncBatch = {
  batch_id: string;
  system_id: string;
  source_config_id: string | null;
  source_snapshot_id: string | null;
  batch_type: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  total_records_found: number;
  new_records_count: number;
  changed_records_count: number;
  removed_records_count: number;
  unchanged_records_count: number;
  exception_records_count: number;
  error_message: string;
  raw_snapshot_path: string;
  created_by: string | null;
  change_review_count?: number;
  match_exception_count?: number;
};

export type IpSystemChangeReview = {
  review_id: string;
  batch_id: string;
  system_id: string;
  system_code: string;
  jurisdiction_id: string | null;
  jurisdiction_code: string;
  jurisdiction_name_cn: string;
  relation_type_id: string | null;
  relation_type_code: string;
  business_domain: string;
  change_type: string;
  old_relation_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  source_official_name: string;
  source_official_code: string;
  data_quality_flags: string[];
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  published_by: string | null;
  published_at: string | null;
  review_comment: string;
  created_at: string | null;
};

export type IpSystemRelationType = {
  relation_type_id: string;
  relation_type_code: string;
  relation_type_name_cn: string;
  relation_type_name_en: string;
  applicable_system_category: string;
  is_active: boolean;
  display_order: number;
  remark: string;
};

export type IpSystemMatchException = {
  exception_id: string;
  batch_id: string | null;
  system_id: string;
  system_code: string;
  source_config_id: string | null;
  official_name: string;
  official_code: string;
  raw_record: Record<string, unknown> | null;
  suggested_jurisdiction_id: string | null;
  confidence_score: string | number | null;
  status: string;
  resolved_jurisdiction_id: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_comment: string;
  created_at: string | null;
};

export type CustomerStatus = "active" | "inactive";
export type CustomerType = "企业" | "个人" | "律所" | "代理机构" | "其他";
export type CustomerLevel = "普通" | "重点" | "战略" | "暂停";

export type CustomerContact = {
  id: string;
  customer_id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  wechat: string;
  is_primary: boolean;
  remark: string;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  customer_no: string;
  name: string;
  customer_type: CustomerType;
  consultant_id: string | null;
  consultant_email: string;
  consultant_name: string;
  department: string;
  default_currency: string;
  default_quote_terms: string;
  customer_level: CustomerLevel;
  status: CustomerStatus;
  remark: string;
  created_at: string;
  updated_at: string;
  contacts: CustomerContact[];
};

export type CustomerForm = {
  name: string;
  customer_type: CustomerType;
  consultant_email: string;
  department: string;
  default_currency: string;
  default_quote_terms: string;
  customer_level: CustomerLevel;
  status: CustomerStatus;
  remark: string;
};

export type CustomerContactForm = {
  name: string;
  title: string;
  email: string;
  phone: string;
  wechat: string;
  is_primary: boolean;
  remark: string;
};

export type FeeRule = {
  id: string;
  version_id?: string | null;
  country_code: string;
  application_type: string;
  filing_route: string;
  pct_route_detail?: string;
  entity_type?: string;
  stage: string;
  item_group_key?: string;
  item_name: string;
  fee_type: string;
  fee_category?: string;
  amount: string;
  currency: string;
  quote_currency?: string;
  is_multi_currency?: boolean;
  tax_included?: boolean;
  is_default: boolean;
  is_active: boolean;
  cost_nature: string;
  trigger_condition?: string;
  price_version?: string;
  remark: string;
};

export type TranslationRule = {
  id: string;
  item_name: string;
  unit: string;
  unit_price: string;
  currency: string;
  min_fee: string;
  enabled: boolean;
  is_default: boolean;
};

export type QuotationItem = {
  id: string;
  stage: string;
  item_name: string;
  fee_type: string;
  amount: string;
  currency: string;
  cost_nature: string;
  remark: string;
  sort_order: number;
};

export type QuotationDraftItem = {
  id: string;
  draft_id: string;
  country_code: string;
  application_type: string;
  filing_route: string;
  pct_route_detail: string;
  entity_type: string;
  case_title: string;
  quote_currency: string;
  current_stage_total: string;
  future_stage_total: string;
  total_amount: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type QuotationDraft = {
  id: string;
  draft_no: string;
  consultant_id: string | null;
  consultant_email: string;
  consultant_name: string;
  client_name: string;
  client_contact: string;
  has_case: boolean;
  case_title: string;
  applicant_count: number;
  priority_count: number;
  claim_count: number;
  description_pages: number;
  drawing_pages: number;
  needs_translation: boolean;
  translation_quantity_one: string;
  translation_quantity_two: string;
  status: string;
  remark: string | null;
  created_at: string;
  updated_at: string;
  items: QuotationDraftItem[];
};

export type DraftBasicForm = {
  client_name: string;
  client_contact: string;
  has_case: boolean;
  case_title: string;
  applicant_count: number;
  priority_count: number;
  claim_count: number;
  description_pages: number;
  drawing_pages: number;
  needs_translation: boolean;
  translation_quantity_one: number;
  translation_quantity_two: number;
  remark: string;
};

export type Quotation = QuotationForm & {
  id: string;
  quotation_no: string;
  consultant_name: string;
  items: QuotationItem[];
  current_stage_total: string;
  future_stage_total: string;
  total_amount: string;
  next_followup_date: string | null;
  last_followup_at: string | null;
  is_sent: boolean;
  is_confirmed: boolean;
  is_opened: boolean;
  created_at: string;
  updated_at: string;
};

export type ApprovalRequest = {
  id: string;
  consultant_id: string;
  consultant_email: string;
  request_type: string;
  open_unconverted_count: number;
  status: string;
  reason: string;
  reviewer_id: string | null;
  reviewer_comment: string | null;
  reviewed_at: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
};

export type FollowupMethod = "邮件" | "电话" | "微信" | "会议" | "其他";

export type Followup = {
  id: string;
  quotation_id: string;
  user_id: string;
  user_name: string;
  followup_date: string;
  method: FollowupMethod;
  content: string;
  next_followup_date: string | null;
  created_at: string;
};

export type FollowupForm = {
  method: FollowupMethod;
  content: string;
  next_followup_date: string;
};

export type Bootstrap = {
  users: User[];
  countries: Country[];
  application_types: string[];
  filing_routes: string[];
  currencies: string[];
  statuses: string[];
  fee_rules?: FeeRule[];
  translation_rules?: TranslationRule[];
};

export type WorkbenchOptions = {
  country_code: string;
  application_types: string[];
  filing_routes: string[];
  route_details: string[];
  entity_types: string[];
  quote_currency: string;
  has_path_rules: boolean;
};

export type QuotationForm = {
  client_name: string;
  client_contact: string;
  consultant_email: string;
  country_code: string;
  country_codes: string[];
  application_type: string;
  filing_route: string;
  pct_route_detail: string;
  entity_type: string;
  currency: string;
  has_case: boolean;
  case_title: string;
  applicant_count: number;
  priority_count: number;
  claim_count: number;
  description_pages: number;
  drawing_pages: number;
  needs_translation: boolean;
  translation_quantity_one: number;
  translation_quantity_two: number;
  remark: string;
  status: string;
};

export type GeneratedQuotation = {
  items: QuotationItem[];
  current_stage_total: string;
  future_stage_total: string;
  total_amount: string;
  display_currency: string;
  important_notes: string[];
};

export type Statistics = {
  quote_count: number;
  current_stage_total: string;
  future_stage_total: string;
  total_amount: string;
  sent_count: number;
  confirmed_count: number;
  opened_count: number;
  lost_count: number;
  open_rate: string;
};
