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

export type ActiveTab = "create" | "list" | "stats" | "rules" | "users" | "approvals";

export type LoginResponse = {
  token: string;
  user: User;
};

export type Country = {
  code: string;
  name_cn: string;
  name_en: string;
  default_currency: string;
  enabled: boolean;
};

export type FeeRule = {
  id: string;
  country_code: string;
  application_type: string;
  filing_route: string;
  stage: string;
  item_name: string;
  fee_type: string;
  amount: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  cost_nature: string;
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

export type QuotationForm = {
  client_name: string;
  client_contact: string;
  consultant_email: string;
  country_code: string;
  country_codes: string[];
  application_type: string;
  filing_route: string;
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
