import type { Bootstrap, FollowupForm, FollowupMethod, QuotationForm, UserForm, UserRole, UserStatus } from "./types";

export const roleOptions: { label: string; value: UserRole }[] = [
  { label: "顾问", value: "consultant" },
  { label: "管理员", value: "admin" },
  { label: "审批人", value: "approver" },
];
export const statusOptions: { label: string; value: UserStatus }[] = [
  { label: "启用", value: "active" },
  { label: "禁用", value: "inactive" },
];
export const followupMethodOptions: FollowupMethod[] = ["邮件", "电话", "微信", "会议", "其他"];
export const initialUserForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "consultant",
  status: "active",
};
export const initialFollowupForm: FollowupForm = {
  method: "邮件",
  content: "",
  next_followup_date: "",
};

export const fallbackBootstrap: Bootstrap = {
  users: [
    { id: "u-consultant", name: "Suri", email: "suri@example.com", role: "consultant", status: "active" },
    { id: "u-admin", name: "管理员", email: "admin@example.com", role: "admin", status: "active" },
  ],
  countries: [
    { code: "US", name_cn: "美国", name_en: "United States", default_currency: "USD", enabled: true },
    { code: "EP", name_cn: "欧洲", name_en: "Europe", default_currency: "EUR", enabled: true },
    { code: "JP", name_cn: "日本", name_en: "Japan", default_currency: "JPY", enabled: true },
    { code: "KR", name_cn: "韩国", name_en: "Korea", default_currency: "KRW", enabled: true },
  ],
  application_types: ["发明", "实用新型", "外观"],
  filing_routes: ["直接申请", "巴黎公约", "PCT进入"],
  currencies: ["CNY", "USD", "EUR", "JPY", "KRW"],
  statuses: ["草稿", "已生成报价", "已发送客户", "待跟进", "跟进中", "跟进逾期", "需价格调整", "已确认", "部分开卷", "已开卷", "框架协议", "未成交", "已作废"],
  fee_rules: [],
  translation_rules: [],
};

export const initialForm: QuotationForm = {
  client_name: "智造未来科技有限公司",
  client_contact: "Lina",
  consultant_email: "suri@example.com",
  country_code: "US",
  country_codes: ["US"],
  application_type: "发明",
  filing_route: "PCT进入",
  currency: "USD",
  has_case: true,
  case_title: "一种高效热管理结构",
  applicant_count: 1,
  priority_count: 1,
  claim_count: 18,
  description_pages: 36,
  drawing_pages: 6,
  needs_translation: true,
  translation_quantity_one: 1200,
  translation_quantity_two: 3,
  remark: "",
  status: "已生成报价",
};

export const importantNotes = [
  "本报价基于正常新申请程序。",
  "非常规事项如客户另有需求，将另行报价确认。",
  "审查、授权及年费阶段费用为后续预估，实际发生时另行确认。",
];
