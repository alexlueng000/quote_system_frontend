"use client";

import { FormEvent, type ReactNode, useMemo, useState } from "react";

import { roleOptions, statusOptions } from "../constants";
import { businessTagOptions, enabledOptions, geoRegionOptions, jurisdictionTypeOptions, officeTypeOptions, optionLabel, optionLabels } from "../options";
import type {
  ApprovalRequest,
  Country,
  CountryBulkFromReferenceResponse,
  CountryBulkFromReferenceStagingItem,
  CountryConfig,
  CountryCreate,
  CountryPathRule,
  CountryRuleSection,
  CountryTreatyRule,
  DeadlineRule,
  EntityTypeRule,
  FxTaxRule,
  JurisdictionDataSource,
  JurisdictionDataSourceForm,
  JurisdictionReference,
  LanguageRule,
  SpecialRule,
  User,
  UserForm,
  UserRole,
  UserStatus,
} from "../types";
import { formatDateTime } from "../utils";

export function UsersPanel({
  currentUserId,
  users,
  userForm,
  message,
  newPasswordByUserId,
  setUserForm,
  setUsers,
  setNewPasswordByUserId,
  createUser,
  saveUser,
  resetPassword,
}: {
  currentUserId: string;
  users: User[];
  userForm: UserForm;
  message: string;
  newPasswordByUserId: Record<string, string>;
  setUserForm: (form: UserForm) => void;
  setUsers: (users: User[]) => void;
  setNewPasswordByUserId: (passwords: Record<string, string>) => void;
  createUser: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  saveUser: (user: User) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>;
}) {
  function updateUser(id: string, patch: Partial<User>): void {
    setUsers(users.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  function updatePassword(userId: string, password: string): void {
    setNewPasswordByUserId({ ...newPasswordByUserId, [userId]: password });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <h3 className="text-xl font-semibold">用户管理</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            管理员维护顾问、审批人和管理员账号，禁用后账号将不能登录。
          </p>
          {message ? <p className="mt-2 text-sm font-medium text-[oklch(38%_0.08_155)]">{message}</p> : null}
        </div>

        <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[1fr_1.4fr_1fr_150px_130px_auto]" onSubmit={createUser}>
          <input
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            placeholder="姓名"
            value={userForm.name}
            onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
          />
          <input
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            placeholder="邮箱"
            type="email"
            value={userForm.email}
            onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
          />
          <input
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            placeholder="初始密码"
            type="password"
            value={userForm.password}
            onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
          />
          <select
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            value={userForm.role}
            onChange={(event) => setUserForm({ ...userForm, role: event.target.value as UserRole })}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            value={userForm.status}
            onChange={(event) => setUserForm({ ...userForm, status: event.target.value as UserStatus })}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)]"
            type="submit"
          >
            新增账号
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-[1120px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">姓名</th>
                <th className="px-3 py-3">邮箱</th>
                <th className="px-3 py-3">角色</th>
                <th className="px-3 py-3">状态</th>
                <th className="px-3 py-3">新密码</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-36 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={user.name}
                      onChange={(event) => updateUser(user.id, { name: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-64 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      type="email"
                      value={user.email}
                      onChange={(event) => updateUser(user.id, { email: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={user.role}
                      onChange={(event) => updateUser(user.id, { role: event.target.value as UserRole })}
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="h-9 w-24 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={user.status}
                      onChange={(event) => updateUser(user.id, { status: event.target.value as UserStatus })}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-44 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      placeholder="至少 6 位"
                      type="password"
                      value={newPasswordByUserId[user.id] ?? ""}
                      onChange={(event) => updatePassword(user.id, event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
                        type="button"
                        onClick={() => void saveUser(user)}
                      >
                        保存
                      </button>
                      <button
                        className="h-9 rounded-md border border-[oklch(72%_0.045_178)] px-3 text-sm font-medium text-[oklch(32%_0.075_178)] transition hover:bg-[oklch(92%_0.026_178)]"
                        type="button"
                        onClick={() => void resetPassword(user.id)}
                      >
                        重置密码
                      </button>
                      {user.id === currentUserId ? (
                        <span className="inline-flex h-9 items-center rounded-md bg-[oklch(92%_0.024_178)] px-3 text-xs font-medium text-[oklch(38%_0.055_178)]">
                          当前账号
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function csvToList(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToCsv(value: string[]): string {
  return value.join("，");
}

function firstCountryCode(config: CountryConfig): string {
  return config.countries[0]?.code ?? "US";
}

function defaultPathRule(config: CountryConfig): CountryPathRule {
  return {
    id: "",
    country_code: firstCountryCode(config),
    application_type: "发明",
    filing_route: "PCT进入",
    route_detail: "",
    affects_official_fee: true,
    affects_local_service_fee: true,
    affects_inhouse_service_fee: false,
    affects_questions: true,
    affects_documents: true,
    affects_deadlines: true,
    affects_translation: true,
    affects_display: true,
    enabled: true,
    effective_date: null,
    remark: "",
  };
}

function defaultTreatyRule(config: CountryConfig): CountryTreatyRule {
  return {
    id: "",
    country_code: firstCountryCode(config),
    treaty_name: "PCT",
    membership_type: "成员国",
    enabled: true,
    effective_date: null,
    expiry_date: null,
    remark: "",
  };
}

function defaultDeadlineRule(config: CountryConfig): DeadlineRule {
  return {
    id: "",
    country_code: firstCountryCode(config),
    application_type: "发明",
    filing_route: "PCT进入",
    route_detail: "",
    pct_chapter_one_deadline: "30 个月",
    has_substantive_exam: true,
    substantive_exam_mode: "需单独提出",
    accepts_substantive_exam: true,
    has_early_publication: false,
    application_cycle: "",
    protection_term: "",
    enabled: true,
    effective_date: null,
    remark: "",
  };
}

function defaultEntityRule(config: CountryConfig): EntityTypeRule {
  return {
    id: "",
    country_code: firstCountryCode(config),
    application_type: "发明",
    filing_route: "PCT进入",
    enabled: true,
    entity_types: [],
    affects_official_fee: false,
    affects_questions: false,
    requires_customer_confirmation: false,
    requires_supporting_documents: false,
    remark: "",
  };
}

function defaultLanguageRule(config: CountryConfig): LanguageRule {
  return {
    id: "",
    country_code: firstCountryCode(config),
    application_type: "发明",
    accepted_languages: ["英文"],
    source_language: "中文",
    target_language: "英文",
    intermediate_language: "",
    needs_second_translation: false,
    recommended_scheme_id: "recommended-standard",
    default_translation_fee: true,
    allow_scheme_switch: true,
    enabled: true,
    remark: "",
  };
}

function defaultFxRule(config: CountryConfig): FxTaxRule {
  const country = config.countries[0];
  const currency = country?.default_currency ?? "USD";
  return {
    id: "",
    country_code: country?.code ?? "US",
    official_currency: currency,
    official_quote_currency: currency,
    local_service_currency: currency,
    local_service_currency_options: [currency, "CNY"],
    quote_currency: currency,
    fx_rate: "1",
    tax_rate: "0",
    tax_included: false,
    lock_on_formal_quote: true,
    version: "FX-2026",
    enabled: true,
    remark: "",
  };
}

function defaultCountryCreate(config: CountryConfig): CountryCreate {
  return {
    reference_id: "",
    code: "",
    name_cn: "",
    name_en: "",
    enabled: true,
    international_region: "",
    business_region: [],
    region_remark: "",
    internal_code: "",
    display_code: "",
    jurisdiction_type: "single_country",
    is_enabled: true,
    source_name: "",
    source_url: "",
    source_version: "",
    source_note: "",
    source_verified: false,
    source_verified_at: null,
    source_verified_by: null,
    last_verified_at: null,
    review_status: "pending_review",
    manual_override: false,
    remarks: "",
  };
}

function defaultDataSourceForm(): JurisdictionDataSourceForm {
  return {
    source_id: "",
    source_name: "",
    source_type: "manual_verified",
    source_owner: "",
    source_url: "",
    source_version: "",
    applicable_fields: [],
    verification_frequency: "",
    source_note: "",
    last_reviewed_at: null,
    next_review_due_at: null,
    review_status: "pending_review",
    is_active: true,
  };
}

function dataSourceToForm(source: JurisdictionDataSource): JurisdictionDataSourceForm {
  return {
    source_id: source.source_id,
    source_name: source.source_name,
    source_type: source.source_type === "official" || source.source_type === "internal" || source.source_type === "third_party" || source.source_type === "manual_verified"
      ? source.source_type
      : "manual_verified",
    source_owner: source.source_owner,
    source_url: source.source_url,
    source_version: source.source_version,
    applicable_fields: source.applicable_fields,
    verification_frequency: source.verification_frequency,
    source_note: source.source_note,
    last_reviewed_at: source.last_reviewed_at ?? null,
    next_review_due_at: source.next_review_due_at ?? null,
    review_status: source.review_status === "verified" || source.review_status === "needs_update" || source.review_status === "deprecated"
      ? source.review_status
      : "pending_review",
    is_active: source.is_active,
  };
}

function defaultSpecialRule(config: CountryConfig): SpecialRule {
  return {
    id: "",
    country_code: firstCountryCode(config),
    application_type: "发明",
    filing_route: "PCT进入",
    rule_type: "后补文件",
    enabled: true,
    triggers_extra_fee: false,
    triggers_risk_warning: true,
    requires_customer_confirmation: true,
    risk_summary: "",
    linked_rule_code: "",
    remark: "",
  };
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-14 rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(99%_0.006_178)] px-3 py-2">
      <p className="text-xs text-[oklch(46%_0.045_178)]">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value || "待选择"}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(99%_0.006_178)] px-2 py-1.5">
      <p className="text-[11px] text-[oklch(46%_0.045_178)]">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

function LabeledField({
  label,
  required,
  requirement,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  requirement?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 flex items-center gap-1 font-medium text-[oklch(34%_0.055_178)]">
        <span>{label}{required ? <span className="text-[oklch(42%_0.08_25)]"> *</span> : null}</span>
        {requirement ? <span className="text-xs font-normal text-[oklch(46%_0.045_178)]">{requirement}</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-[oklch(42%_0.08_25)]">{error}</span> : null}
    </label>
  );
}

function normalizeBusinessTags(value?: string[] | string | null): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return normalizeBusinessTagList(value);
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? normalizeBusinessTagList(parsed.map(String)) : normalizeBusinessTagList([value]);
  } catch {
    return normalizeBusinessTagList(value.split(/[,，]/).map((item) => item.trim()).filter(Boolean));
  }
}

function normalizeBusinessTagList(tags: string[]): string[] {
  const normalized: string[] = [];
  tags.forEach((tag) => {
    const nextTag = tag === "SOUTH_AMERICA" ? "LATIN_AMERICA" : tag;
    if (nextTag && !normalized.includes(nextTag)) {
      normalized.push(nextTag);
    }
  });
  return normalized.length > 1 ? normalized.filter((tag) => tag !== "OTHER") : normalized;
}

function isTechnicalRemark(value?: string | null): boolean {
  return /Backfilled from legacy countries|从(?:本地 )?reference 批量添加|created_from_reference/i.test(value ?? "");
}

function businessRemark(value?: string | null): string {
  return isTechnicalRemark(value) ? "" : value ?? "";
}

function normalizeCode(value?: string | null): string {
  return (value ?? "").trim().toUpperCase();
}

const countryRequiredTypes = new Set(["single_country", "special_region"]);
const reviewStatusOptions = ["pending_review", "verified", "needs_update", "deprecated"] as const;

type ValidationIssue = {
  field: string;
  message: string;
};

function isCountryLikeType(type?: string | null): boolean {
  return countryRequiredTypes.has(type ?? "");
}

function objectDisplayName(reference: JurisdictionReference, staging?: CountryBulkFromReferenceStagingItem): string {
  return staging?.name_en?.trim() || staging?.name_cn?.trim() || reference.name_en || reference.name_cn || reference.standard_code;
}

type FieldSourceRow = {
  fieldName: string;
  currentValue: string;
  source_id: string;
  source_name: string;
  source_url: string;
  source_version: string;
  review_status: string;
  verified_by: string;
  verified_at: string;
  next_review_due_at: string;
};

const fallbackFieldSources: Record<string, Omit<FieldSourceRow, "fieldName" | "currentValue" | "verified_by" | "verified_at" | "next_review_due_at"> & { next_review_due_at?: string }> = {
  WIPO_ST3: {
    source_id: "WIPO_ST3",
    source_name: "WIPO Standard ST.3",
    source_url: "https://www.wipo.int/standards/en/part_03_standards.html",
    source_version: "Current WIPO ST.3",
    review_status: "pending_review",
  },
  UN_M49: {
    source_id: "UN_M49",
    source_name: "UNSD Standard Country or Area Codes for Statistical Use",
    source_url: "https://unstats.un.org/unsd/methodology/m49/",
    source_version: "Current online table",
    review_status: "pending_review",
  },
  WIPO_IP_OFFICES_DIRECTORY: {
    source_id: "WIPO_IP_OFFICES_DIRECTORY",
    source_name: "WIPO Country Profiles - Directory of IP Offices",
    source_url: "https://www.wipo.int/en/web/country-profiles/directory-ip-offices",
    source_version: "Current WIPO online directory",
    review_status: "pending_review",
  },
  BUSINESS_REGION_SOURCE: {
    source_id: "BUSINESS_REGION_SOURCE",
    source_name: "Internal business tag source",
    source_url: "internal://business-region-tags",
    source_version: "internal tag policy 2026-06",
    review_status: "pending_review",
  },
  WIPO_LEX_REFERENCE: {
    source_id: "WIPO_LEX_REFERENCE",
    source_name: "WIPO Lex Members reference objects",
    source_url: "https://www.wipo.int/wipolex/zh/members",
    source_version: "P0 reference object baseline",
    review_status: "pending_review",
  },
};

const referenceGeoRegionByCode: Record<string, string> = {
  CN: "Asia",
  HK: "Asia",
  MO: "Asia",
  US: "North America",
  CA: "North America",
  JP: "Asia",
  KR: "Asia",
  DE: "Europe",
  NL: "Europe",
  CH: "Europe",
  CO: "Latin America and the Caribbean",
  AU: "Oceania",
  NZ: "Oceania",
  EP: "Europe",
  EM: "Europe",
};

const referenceBusinessTagsByCode: Record<string, string[]> = {
  CA: ["NORTH_AMERICA", "APEC"],
  CO: ["LATIN_AMERICA"],
  NL: ["EUROPE", "EU"],
};

const referenceOfficeByCode: Record<string, Pick<CountryCreate, "default_office_code" | "default_office_name_cn" | "default_office_name_en" | "default_office_type" | "default_office_source_note">> = {
  NL: { default_office_code: "", default_office_name_cn: "荷兰专利局", default_office_name_en: "Netherlands Patent Office", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  CA: { default_office_code: "CIPO", default_office_name_cn: "加拿大知识产权局", default_office_name_en: "Canadian Intellectual Property Office", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  CN: { default_office_code: "CNIPA", default_office_name_cn: "国家知识产权局", default_office_name_en: "China National Intellectual Property Administration", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  US: { default_office_code: "USPTO", default_office_name_cn: "美国专利商标局", default_office_name_en: "United States Patent and Trademark Office", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  JP: { default_office_code: "JPO", default_office_name_cn: "日本特许厅", default_office_name_en: "Japan Patent Office", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  KR: { default_office_code: "MOIP", default_office_name_cn: "韩国知识产权部", default_office_name_en: "Ministry of Intellectual Property", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY；historical_alias=KIPO / Korean Intellectual Property Office" },
  DE: { default_office_code: "DPMA", default_office_name_cn: "德国专利商标局", default_office_name_en: "German Patent and Trade Mark Office", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  CO: { default_office_code: "SIC", default_office_name_cn: "哥伦比亚工业和商业监督局", default_office_name_en: "Superintendence of Industry and Commerce", default_office_type: "national_ip_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  EP: { default_office_code: "EPO", default_office_name_cn: "欧洲专利局", default_office_name_en: "European Patent Office", default_office_type: "regional_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  EM: { default_office_code: "EUIPO", default_office_name_cn: "欧盟知识产权局", default_office_name_en: "European Union Intellectual Property Office", default_office_type: "regional_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
  WO: { default_office_code: "WIPO/IB", default_office_name_cn: "世界知识产权组织国际局", default_office_name_en: "International Bureau of WIPO", default_office_type: "international_office", default_office_source_note: "WIPO_IP_OFFICES_DIRECTORY" },
};

function sourceById(dataSources: JurisdictionDataSource[], sourceId: string): FieldSourceRow {
  const source = dataSources.find((item) => item.source_id === sourceId);
  const fallback = fallbackFieldSources[sourceId];
  return {
    fieldName: "",
    currentValue: "",
    source_id: source?.source_id ?? fallback.source_id,
    source_name: source?.source_name ?? fallback.source_name,
    source_url: source?.source_url ?? fallback.source_url,
    source_version: source?.source_version ?? fallback.source_version,
    review_status: source?.review_status ?? fallback.review_status,
    verified_by: source?.source_verified_by ?? "",
    verified_at: source?.source_verified_at ?? "",
    next_review_due_at: source?.next_review_due_at ?? "",
  };
}

function referenceGeoRegion(reference: JurisdictionReference): string {
  if (reference.geo_region && reference.geo_region !== "Other") {
    return reference.geo_region;
  }
  if (!isCountryLikeType(reference.jurisdiction_type)) {
    return "";
  }
  return referenceGeoRegionByCode[reference.standard_code.toUpperCase()] ?? "";
}

function referenceBusinessTags(reference: JurisdictionReference): string[] {
  return normalizeBusinessTags(referenceBusinessTagsByCode[reference.standard_code.toUpperCase()] ?? reference.default_business_economic_regions);
}

function referenceOffice(reference: JurisdictionReference): Pick<CountryCreate, "default_office_code" | "default_office_name_cn" | "default_office_name_en" | "default_office_type" | "default_office_source_note"> {
  if (reference.default_office_name_en || reference.default_office_name_cn) {
    return {
      default_office_code: reference.default_office_code ?? "",
      default_office_name_cn: reference.default_office_name_cn ?? "",
      default_office_name_en: reference.default_office_name_en ?? "",
      default_office_type: reference.default_office_type ?? "",
      default_office_source_note: reference.default_office_source_note || "WIPO_IP_OFFICES_DIRECTORY",
    };
  }
  return referenceOfficeByCode[reference.standard_code.toUpperCase()] ?? {
    default_office_code: "",
    default_office_name_cn: "待维护",
    default_office_name_en: "",
    default_office_type: "",
    default_office_source_note: "待按 WIPO_IP_OFFICES_DIRECTORY 或官方主管局来源维护",
  };
}

function buildFieldSourceRows(
  reference: JurisdictionReference | null,
  form: CountryCreate,
  dataSources: JurisdictionDataSource[],
  verified: boolean,
): FieldSourceRow[] {
  if (!reference) {
    return [];
  }
  const verifiedAt = verified ? form.source_verified_at ?? form.last_verified_at ?? "" : "";
  const verifiedBy = verified ? form.source_verified_by ?? "" : "";
  const row = (sourceId: string, fieldName: string, currentValue: string): FieldSourceRow => ({
    ...sourceById(dataSources, sourceId),
    fieldName,
    currentValue,
    review_status: verified ? "verified" : form.review_status ?? sourceById(dataSources, sourceId).review_status,
    verified_by: verifiedBy || sourceById(dataSources, sourceId).verified_by,
    verified_at: verifiedAt || sourceById(dataSources, sourceId).verified_at,
  });
  return [
    row("WIPO_ST3", "standard_code / display_code", `${reference.standard_code} / ${form.display_code || reference.display_code}`),
    row("UN_M49", "international_region", optionLabel(geoRegionOptions, form.international_region ?? referenceGeoRegion(reference)) || "未配置"),
    row("BUSINESS_REGION_SOURCE", "business_region", optionLabels(businessTagOptions, normalizeBusinessTags(form.business_region)) || "未配置"),
    row("WIPO_IP_OFFICES_DIRECTORY", "default_office", [form.default_office_code, form.default_office_name_cn || form.default_office_name_en].filter(Boolean).join(" / ") || "待维护"),
  ];
}

function fieldSourcesAreVerifiable(rows: FieldSourceRow[]): boolean {
  return rows.length > 0 && rows.every((row) =>
    row.currentValue.trim() &&
    row.currentValue !== "未配置" &&
    row.review_status !== "deprecated" &&
    row.source_url.trim(),
  );
}

function fieldSourceSummary(): string {
  return "WIPO ST.3 / UN M49 / WIPO IP Offices Directory / BUSINESS_REGION_SOURCE";
}

const regionOnlyTerms = new Set(["europe", "europa", "欧洲", "歐洲"]);

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getJurisdictionSearchNotice(keyword: string): string {
  const normalized = normalizeSearchText(keyword);
  if (regionOnlyTerms.has(normalized)) {
    return "Europe / 欧洲只是国际地理或商务区域，不是具体申请对象；可从 EPO、EUIPO 等区域局/区域对象候选中选择。";
  }
  return "";
}

function searchJurisdictionReferences(keyword: string, references: JurisdictionReference[]): JurisdictionReference[] {
  const normalized = normalizeSearchText(keyword);
  if (!normalized) {
    return [];
  }
  return references.filter((item) =>
    isVisibleReferenceCandidate(item) &&
    [
      item.name_cn,
      item.name_en,
      item.standard_code,
      item.display_code,
      ...item.aliases,
    ].some((value) => normalizeSearchText(value).includes(normalized)),
  );
}

function isVisibleReferenceCandidate(reference: JurisdictionReference): boolean {
  const businessScope = new Set(reference.business_scope.map((item) => item.toLowerCase()));
  const trademarkOnly = businessScope.size > 0 && Array.from(businessScope).every((item) => item === "trademark");
  const codeSet = new Set([reference.standard_code.toUpperCase(), reference.display_code.toUpperCase()]);
  const hiddenDefaultCodes = new Set(["EU", "IB", "PCT", "HAGUE", "MADRID", "NICE"]);
  return reference.is_active
    && reference.visibility_scope !== "reserved_hidden"
    && reference.reserved_reason !== "trademark_reserved"
    && reference.reference_category !== "treaty_route"
    && !Array.from(codeSet).some((code) => hiddenDefaultCodes.has(code))
    && !(reference.reference_category === "international_organization" && !codeSet.has("WO") && !codeSet.has("WIPO"))
    && !trademarkOnly;
}

function referenceExistsInCountries(reference: JurisdictionReference, countries: Country[]): boolean {
  return referenceExistenceInCountries(reference, countries).status === "active_exists";
}

type ReferenceExistenceStatus = "active_exists" | "soft_deleted_exists" | "legacy_exists_only" | "not_exists";

function referenceExistenceInCountries(reference: JurisdictionReference, countries: Country[]): { status: ReferenceExistenceStatus; country?: Country } {
  const referenceCodes = new Set([
    normalizeCode(reference.standard_code),
    normalizeCode(reference.display_code),
  ].filter(Boolean));
  const matched = countries.find((country) => {
    const countryCodes = [
      country.code,
      country.internal_code,
      country.standard_code,
      country.display_code,
      country.wipo_st3_code,
    ].map(normalizeCode);
    return countryCodes.some((code) => referenceCodes.has(code));
  });
  if (!matched) {
    return { status: "not_exists" };
  }
  const deleted = Boolean(matched.is_deleted) || !matched.enabled || matched.is_enabled === false;
  if (deleted) {
    return { status: "soft_deleted_exists", country: matched };
  }
  if (!matched.jurisdiction_id || !matched.internal_code) {
    return { status: "legacy_exists_only", country: matched };
  }
  return { status: "active_exists", country: matched };
}

function referenceStatusLabel(status: ReferenceExistenceStatus): string {
  if (status === "active_exists") {
    return "已存在";
  }
  if (status === "soft_deleted_exists") {
    return "已删除，可恢复";
  }
  if (status === "legacy_exists_only") {
    return "旧数据存在，可恢复/补建主档";
  }
  return "可新增";
}

function referenceCandidateStatusLabel(reference: JurisdictionReference): string {
  if (!isVisibleReferenceCandidate(reference)) {
    return "预留隐藏";
  }
  if (reference.candidate_status === "reserved") {
    return reference.quote_selectable_default ? "预留" : "候选未纳入报价";
  }
  if (!reference.quote_selectable_default) {
    return "候选未纳入报价";
  }
  return "可作为报价候选";
}

function referenceStatusTone(status: ReferenceExistenceStatus): string {
  if (status === "active_exists") {
    return "bg-[oklch(90%_0.018_178)] text-[oklch(38%_0.035_178)]";
  }
  if (status === "soft_deleted_exists") {
    return "bg-[oklch(94%_0.035_85)] text-[oklch(40%_0.065_85)]";
  }
  if (status === "legacy_exists_only") {
    return "bg-[oklch(93%_0.028_250)] text-[oklch(38%_0.075_250)]";
  }
  return "bg-[oklch(91%_0.035_155)] text-[oklch(34%_0.075_155)]";
}

function hasCompleteSource(reference?: JurisdictionReference | null): boolean {
  return Boolean(reference?.source_name?.trim() && reference?.source_url?.trim() && reference?.source_version?.trim());
}

function countryCreateFromReference(reference: JurisdictionReference, verifiedAt: string): CountryCreate {
  const enabled = reference.candidate_status === "active" && reference.quote_selectable_default;
  const office = referenceOffice(reference);
  const sourceVerified = Boolean(verifiedAt);
  return {
    reference_id: reference.reference_id,
    code: reference.standard_code,
    name_cn: reference.name_cn,
    name_en: reference.name_en,
    enabled,
    international_region: referenceGeoRegion(reference),
    business_region: referenceBusinessTags(reference),
    region_remark: "",
    internal_code: reference.standard_code,
    display_code: reference.display_code,
    standard_code: reference.standard_code,
    jurisdiction_type: reference.jurisdiction_type,
    is_enabled: enabled,
    source_name: "字段级来源：WIPO_ST3 / UN_M49 / WIPO_IP_OFFICES_DIRECTORY / BUSINESS_REGION_SOURCE",
    source_url: "https://www.wipo.int/standards/en/part_03_standards.html; https://unstats.un.org/unsd/methodology/m49/; https://www.wipo.int/en/web/country-profiles/directory-ip-offices",
    source_version: "WIPO ST.3/UN M49/WIPO IP Offices current; business tags 2026-06",
    source_note: "",
    source_verified: sourceVerified,
    source_verified_at: verifiedAt || null,
    source_verified_by: "",
    last_verified_at: verifiedAt || null,
    review_status: sourceVerified ? "verified" : "pending_review",
    manual_override: false,
    remarks: "",
    ...office,
  };
}

function stagingFromReference(reference: JurisdictionReference): CountryBulkFromReferenceStagingItem {
  const form = countryCreateFromReference(reference, "");
  return {
    reference_id: reference.reference_id,
    name_cn: form.name_cn,
    name_en: form.name_en,
    display_code: form.display_code,
    jurisdiction_type: form.jurisdiction_type,
    international_region: form.international_region ?? "",
    business_region: normalizeBusinessTags(form.business_region),
    default_office_name_cn: form.default_office_name_cn ?? "",
    default_office_name_en: form.default_office_name_en ?? "",
    default_office_code: form.default_office_code ?? "",
    default_office_type: form.default_office_type ?? "",
    remarks: "",
    overwrite_existing_fields: false,
    review_status: form.review_status ?? "pending_review",
  };
}

function countryCreateFromStaging(reference: JurisdictionReference, staging: CountryBulkFromReferenceStagingItem): CountryCreate {
  return {
    ...countryCreateFromReference(reference, ""),
    name_cn: staging.name_cn,
    name_en: staging.name_en,
    display_code: staging.display_code,
    jurisdiction_type: staging.jurisdiction_type ?? reference.jurisdiction_type,
    international_region: staging.international_region,
    business_region: normalizeBusinessTags(staging.business_region),
    default_office_name_cn: staging.default_office_name_cn,
    default_office_name_en: staging.default_office_name_en,
    default_office_code: staging.default_office_code,
    default_office_type: staging.default_office_type,
    review_status: staging.review_status ?? "pending_review",
    remarks: staging.remarks,
  };
}

function stagingValidationIssues(staging: CountryBulkFromReferenceStagingItem, reference: JurisdictionReference): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const jurisdictionType = staging.jurisdiction_type ?? reference.jurisdiction_type;
  if (!staging.name_cn.trim() || !staging.name_en.trim()) {
    if (!staging.name_cn.trim()) {
      issues.push({ field: "中文名", message: "中文名不能为空" });
    }
    if (!staging.name_en.trim()) {
      issues.push({ field: "英文名", message: "英文名不能为空" });
    }
  }
  if (!staging.display_code.trim()) {
    issues.push({ field: "业务展示代码", message: "业务展示代码不能为空" });
  }
  if (isCountryLikeType(jurisdictionType) && !staging.international_region) {
    issues.push({ field: "地理区域", message: "地理区域未配置" });
  }
  if (isCountryLikeType(jurisdictionType) && !normalizeBusinessTags(staging.business_region).length) {
    issues.push({ field: "商务/市场标签", message: "商务/市场标签不能为空" });
  }
  if (isCountryLikeType(jurisdictionType) && !staging.default_office_name_en.trim() && !staging.default_office_name_cn.trim()) {
    issues.push({ field: "主管局名称", message: "主管局名称不能为空" });
  }
  if (isCountryLikeType(jurisdictionType) && !staging.default_office_type.trim()) {
    issues.push({ field: "主管局类型", message: "主管局类型不能为空" });
  }
  return issues;
}

function stagingValidationMessage(staging: CountryBulkFromReferenceStagingItem, reference: JurisdictionReference): string {
  return stagingValidationIssues(staging, reference).map((issue) => issue.message).join("；");
}

function stagingIssueForField(issues: ValidationIssue[], field: string): string {
  return issues.find((issue) => issue.field === field)?.message ?? "";
}

function BusinessRegionChips({ value }: { value: string[] }) {
  const tags = normalizeBusinessTags(value);
  return (
    <div className="flex min-w-40 flex-wrap gap-1.5">
      {tags.length ? tags.map((tag) => (
        <span key={tag} className="rounded-md bg-[oklch(92%_0.024_178)] px-2 py-1 text-xs font-medium text-[oklch(34%_0.06_178)]">
          {optionLabel(businessTagOptions, tag)}
        </span>
      )) : <span className="text-xs text-[oklch(48%_0.035_178)]">未配置</span>}
    </div>
  );
}

function BusinessRegionMultiSelect({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(tag: string): void {
    const current = normalizeBusinessTags(value);
    const next = current.includes(tag) ? current.filter((item) => item !== tag) : [...current.filter((item) => item !== "OTHER"), tag];
    onChange(normalizeBusinessTags(next));
  }

  function remove(tag: string): void {
    const next = normalizeBusinessTags(value).filter((item) => item !== tag);
    onChange(next);
  }

  const tags = normalizeBusinessTags(value);

  return (
    <div className="grid gap-1 text-sm">
      {label ? <span className="font-medium text-[oklch(34%_0.055_178)]">{label}</span> : null}
      <details className="group relative">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 py-2">
          <span className="flex flex-wrap gap-1.5">
            {tags.length ? tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-[oklch(92%_0.024_178)] px-2 py-1 text-xs font-medium text-[oklch(34%_0.06_178)]">
                {optionLabel(businessTagOptions, tag)}
                <button
                  className="text-[oklch(40%_0.06_178)] hover:text-[oklch(28%_0.08_178)]"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    remove(tag);
                  }}
                >
                  ×
                </button>
              </span>
            )) : <span className="text-sm text-[oklch(48%_0.035_178)]">未配置</span>}
          </span>
          <span className="shrink-0 text-xs text-[oklch(46%_0.045_178)]">展开</span>
        </summary>
        <div className="absolute z-20 mt-2 w-[min(520px,calc(100vw-48px))] rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] p-3 shadow-lg">
          <div className="mb-3 flex justify-end">
            <button
              className="h-8 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs font-medium text-[oklch(36%_0.06_178)]"
              type="button"
              onClick={() => onChange([])}
            >
              清空
            </button>
          </div>
          {([
            ["BUSINESS_REGION", "商务区域"],
            ["ECONOMIC_ORG", "经济组织 / 区域合作机制"],
          ] as const).map(([group, groupLabel]) => (
            <div key={group} className="mb-3 last:mb-0">
              <p className="mb-2 text-xs font-semibold text-[oklch(42%_0.05_178)]">{groupLabel}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {businessTagOptions.filter((option) => option.group === group).map((option) => (
                  <label key={option.value} className="flex h-8 items-center gap-2 rounded-md border border-[oklch(84%_0.024_178)] px-2 text-xs">
                    <input
                      checked={tags.includes(option.value)}
                      type="checkbox"
                      onChange={() => toggle(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function CountryDataSourceSection({
  dataSourceForm,
  dataSources,
  onClear,
  onEdit,
  onFormChange,
  onSubmit,
}: {
  dataSourceForm: JurisdictionDataSourceForm;
  dataSources: JurisdictionDataSource[];
  onClear: () => void;
  onEdit: (source: JurisdictionDataSource) => void;
  onFormChange: (form: JurisdictionDataSourceForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <div>
      <form className="grid gap-3 border-y border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[150px_1fr_130px_150px_1fr_160px_160px_auto]" onSubmit={onSubmit}>
        <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="source_id" value={dataSourceForm.source_id} onChange={(event) => onFormChange({ ...dataSourceForm, source_id: event.target.value })} />
        <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="来源名称" value={dataSourceForm.source_name} onChange={(event) => onFormChange({ ...dataSourceForm, source_name: event.target.value })} />
        <select className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" value={dataSourceForm.source_type} onChange={(event) => onFormChange({ ...dataSourceForm, source_type: event.target.value as JurisdictionDataSourceForm["source_type"] })}>
          <option value="official">official</option>
          <option value="internal">internal</option>
          <option value="third_party">third_party</option>
          <option value="manual_verified">manual_verified</option>
        </select>
        <select className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" value={dataSourceForm.review_status} onChange={(event) => onFormChange({ ...dataSourceForm, review_status: event.target.value as JurisdictionDataSourceForm["review_status"] })}>
          <option value="pending_review">pending_review</option>
          <option value="verified">verified</option>
          <option value="needs_update">needs_update</option>
          <option value="deprecated">deprecated</option>
        </select>
        <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="来源 URL" value={dataSourceForm.source_url} onChange={(event) => onFormChange({ ...dataSourceForm, source_url: event.target.value })} />
        <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="来源版本" value={dataSourceForm.source_version} onChange={(event) => onFormChange({ ...dataSourceForm, source_version: event.target.value })} />
        <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="下次复核 YYYY-MM-DD" value={dataSourceForm.next_review_due_at ?? ""} onChange={(event) => onFormChange({ ...dataSourceForm, next_review_due_at: event.target.value || null })} />
        <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="适用字段，逗号分隔" value={listToCsv(dataSourceForm.applicable_fields)} onChange={(event) => onFormChange({ ...dataSourceForm, applicable_fields: csvToList(event.target.value) })} />
        <button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">保存来源</button>
        <div className="md:col-span-2 xl:col-span-4">
          <input className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="来源备注" value={dataSourceForm.source_note} onChange={(event) => onFormChange({ ...dataSourceForm, source_note: event.target.value })} />
        </div>
        <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="最近复核 YYYY-MM-DD" value={dataSourceForm.last_reviewed_at ?? ""} onChange={(event) => onFormChange({ ...dataSourceForm, last_reviewed_at: event.target.value || null })} />
        <button className="h-10 rounded-md border border-[oklch(72%_0.035_178)] px-4 text-sm font-semibold text-[oklch(34%_0.075_178)]" type="button" onClick={onClear}>清空</button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] text-left text-sm">
          <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
            <tr>
              <th className="px-3 py-3">来源 ID</th>
              <th className="px-3 py-3">来源名称</th>
              <th className="px-3 py-3">来源 URL</th>
              <th className="px-3 py-3">版本</th>
              <th className="px-3 py-3">类型</th>
              <th className="px-3 py-3">复核状态</th>
              <th className="px-3 py-3">最近复核</th>
              <th className="px-3 py-3">下次复核</th>
              <th className="px-3 py-3">适用字段</th>
              <th className="px-3 py-3">备注</th>
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((source) => (
              <tr key={source.source_id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                <td className="px-3 py-3 font-mono">{source.source_id}</td>
                <td className="px-3 py-3">{source.source_name}</td>
                <td className="max-w-[220px] truncate px-3 py-3">{source.source_url || "-"}</td>
                <td className="px-3 py-3">{source.source_version || "-"}</td>
                <td className="px-3 py-3">{source.source_type}</td>
                <td className="px-3 py-3">{source.review_status}</td>
                <td className="px-3 py-3">{source.last_reviewed_at ? formatDateTime(source.last_reviewed_at) : "-"}</td>
                <td className="px-3 py-3">{source.next_review_due_at ? formatDateTime(source.next_review_due_at) : "-"}</td>
                <td className="px-3 py-3">{source.applicable_fields.join("，") || "-"}</td>
                <td className="px-3 py-3">{source.source_note || "-"}</td>
                <td className="px-3 py-3">
                  <button className="h-8 rounded-md border border-[oklch(72%_0.035_178)] px-3 text-xs font-semibold text-[oklch(34%_0.075_178)]" type="button" onClick={() => onEdit(source)}>
                    编辑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type CountrySortKey =
  | "internal_code"
  | "display_code"
  | "name_cn"
  | "name_en"
  | "jurisdiction_type"
  | "international_region"
  | "business_region"
  | "enabled";

export function CountryConfigPanel({
  config,
  message,
  activeSection,
  referenceCandidates,
  dataSources,
  setConfig,
  createCountry,
  bulkCreateCountries,
  saveDataSource,
  saveCountry,
  deleteCountry,
  restoreCountry,
  savePathRule,
  saveEntityTypeRule,
  saveLanguageRule,
  saveFxTaxRule,
  saveSpecialRule,
  createPathRule,
  createEntityTypeRule,
  createLanguageRule,
  createFxTaxRule,
  createSpecialRule,
  deletePathRule,
  deleteEntityTypeRule,
  deleteLanguageRule,
  deleteFxTaxRule,
  deleteSpecialRule,
}: {
  config: CountryConfig;
  message: string;
  activeSection: CountryRuleSection;
  referenceCandidates: JurisdictionReference[];
  dataSources: JurisdictionDataSource[];
  setConfig: (config: CountryConfig) => void;
  createCountry: (country: CountryCreate) => Promise<boolean>;
  bulkCreateCountries: (referenceIds: string[], stagingItems?: CountryBulkFromReferenceStagingItem[], sourceVerified?: boolean) => Promise<CountryBulkFromReferenceResponse>;
  saveDataSource: (source: JurisdictionDataSourceForm) => Promise<void>;
  saveCountry: (country: Country) => Promise<void>;
  deleteCountry: (country: Country, deleteReason: string) => Promise<boolean>;
  restoreCountry: (country: Country) => Promise<boolean>;
  savePathRule: (rule: CountryPathRule) => Promise<void>;
  saveEntityTypeRule: (rule: EntityTypeRule) => Promise<void>;
  saveLanguageRule: (rule: LanguageRule) => Promise<void>;
  saveFxTaxRule: (rule: FxTaxRule) => Promise<void>;
  saveSpecialRule: (rule: SpecialRule) => Promise<void>;
  createPathRule: (rule: CountryPathRule) => Promise<void>;
  createEntityTypeRule: (rule: EntityTypeRule) => Promise<void>;
  createLanguageRule: (rule: LanguageRule) => Promise<void>;
  createFxTaxRule: (rule: FxTaxRule) => Promise<void>;
  createSpecialRule: (rule: SpecialRule) => Promise<void>;
  deletePathRule: (ruleId: string) => Promise<void>;
  deleteEntityTypeRule: (ruleId: string) => Promise<void>;
  deleteLanguageRule: (ruleId: string) => Promise<void>;
  deleteFxTaxRule: (ruleId: string) => Promise<void>;
  deleteSpecialRule: (ruleId: string) => Promise<void>;
}) {
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedReference, setSelectedReference] = useState<JurisdictionReference | null>(null);
  const [countryForm, setCountryForm] = useState<CountryCreate>(() => defaultCountryCreate(config));
  const [countrySourceVerified, setCountrySourceVerified] = useState(false);
  const [countrySubmitErrors, setCountrySubmitErrors] = useState<string[]>([]);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkSelectedReferenceIds, setBulkSelectedReferenceIds] = useState<string[]>([]);
  const [bulkStagingById, setBulkStagingById] = useState<Record<string, CountryBulkFromReferenceStagingItem>>({});
  const [bulkSourceVerified, setBulkSourceVerified] = useState(false);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [bulkNotice, setBulkNotice] = useState("");
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState<CountryBulkFromReferenceResponse | null>(null);
  const [showDeletedCountries, setShowDeletedCountries] = useState(false);
  const [showCountrySourceManagement, setShowCountrySourceManagement] = useState(false);
  const [treatyForm, setTreatyForm] = useState<CountryTreatyRule>(() => defaultTreatyRule(config));
  const [pathForm, setPathForm] = useState<CountryPathRule>(() => defaultPathRule(config));
  const [deadlineForm, setDeadlineForm] = useState<DeadlineRule>(() => defaultDeadlineRule(config));
  const [entityForm, setEntityForm] = useState<EntityTypeRule>(() => defaultEntityRule(config));
  const [languageForm, setLanguageForm] = useState<LanguageRule>(() => defaultLanguageRule(config));
  const [fxForm, setFxForm] = useState<FxTaxRule>(() => defaultFxRule(config));
  const [specialForm, setSpecialForm] = useState<SpecialRule>(() => defaultSpecialRule(config));
  const [dataSourceForm, setDataSourceForm] = useState<JurisdictionDataSourceForm>(() => defaultDataSourceForm());
  const [editingCountryCode, setEditingCountryCode] = useState<string | null>(null);
  const [countrySort, setCountrySort] = useState<{ key: CountrySortKey; direction: "asc" | "desc" }>({
    key: "internal_code",
    direction: "asc",
  });
  const treatyRules = config.treaty_rules ?? [];
  const deadlineRules = config.deadline_rules ?? [];
  const countryCandidates = searchJurisdictionReferences(countrySearch, referenceCandidates);
  const countrySearchNotice = getJurisdictionSearchNotice(countrySearch);
  const visibleCountries = showDeletedCountries
    ? config.countries
    : config.countries.filter((country) => !country.is_deleted && country.enabled && country.is_enabled !== false);
  const selectedReferenceExists = selectedReference
    ? referenceExistsInCountries(selectedReference, config.countries)
    : false;
  const selectedReferenceStatus = selectedReference
    ? referenceExistenceInCountries(selectedReference, config.countries).status
    : "not_exists";
  const selectedReferenceFieldSources = buildFieldSourceRows(selectedReference, countryForm, dataSources, countrySourceVerified);
  const selectedReferenceSourcesVerifiable = fieldSourcesAreVerifiable(selectedReferenceFieldSources);
  const selectedCountryStaging: CountryBulkFromReferenceStagingItem | null = selectedReference ? {
    reference_id: selectedReference.reference_id,
    name_cn: countryForm.name_cn,
    name_en: countryForm.name_en,
    display_code: countryForm.display_code,
    jurisdiction_type: countryForm.jurisdiction_type ?? selectedReference.jurisdiction_type,
    international_region: countryForm.international_region ?? "",
    business_region: normalizeBusinessTags(countryForm.business_region),
    default_office_name_cn: countryForm.default_office_name_cn ?? "",
    default_office_name_en: countryForm.default_office_name_en ?? "",
    default_office_code: countryForm.default_office_code ?? "",
    default_office_type: countryForm.default_office_type ?? "",
    remarks: businessRemark(countryForm.remarks),
    overwrite_existing_fields: false,
    review_status: countryForm.review_status ?? "pending_review",
  } : null;
  const selectedCountryValidationIssues = selectedReference && selectedCountryStaging
    ? stagingValidationIssues(selectedCountryStaging, selectedReference)
    : [];
  const bulkCandidates = bulkSearch.trim()
    ? searchJurisdictionReferences(bulkSearch, referenceCandidates)
    : referenceCandidates.filter(isVisibleReferenceCandidate);
  const selectableBulkCandidateIds = bulkCandidates
    .filter((candidate) => referenceExistenceInCountries(candidate, config.countries).status !== "active_exists")
    .map((candidate) => candidate.reference_id);
  const selectedBulkReferences = referenceCandidates.filter((reference) =>
    bulkSelectedReferenceIds.includes(reference.reference_id) &&
    isVisibleReferenceCandidate(reference) &&
    referenceExistenceInCountries(reference, config.countries).status !== "active_exists",
  );
  const selectedBulkAllReferences = referenceCandidates.filter((reference) => bulkSelectedReferenceIds.includes(reference.reference_id));
  const bulkStats = {
    totalVisible: referenceCandidates.filter(isVisibleReferenceCandidate).length,
    filtered: bulkCandidates.length,
    existing: bulkCandidates.filter((reference) => referenceExistenceInCountries(reference, config.countries).status === "active_exists").length,
    notSelectable: bulkCandidates.filter((reference) => !reference.quote_selectable_default).length,
    selected: selectedBulkAllReferences.length,
  };
  const bulkActionSummary = {
    created: selectedBulkAllReferences.filter((reference) => isVisibleReferenceCandidate(reference) && referenceExistenceInCountries(reference, config.countries).status === "not_exists").length,
    restored: selectedBulkAllReferences.filter((reference) => isVisibleReferenceCandidate(reference) && ["soft_deleted_exists", "legacy_exists_only"].includes(referenceExistenceInCountries(reference, config.countries).status)).length,
    skipped: selectedBulkAllReferences.filter((reference) => referenceExistenceInCountries(reference, config.countries).status === "active_exists").length,
    blocked: selectedBulkAllReferences.filter((reference) => !isVisibleReferenceCandidate(reference)).length,
  };
  const selectedBulkStagingItems = selectedBulkReferences.map((reference) => bulkStagingById[reference.reference_id] ?? stagingFromReference(reference));
  const selectedBulkValidationEntries = selectedBulkReferences.map((reference) => {
    const staging = bulkStagingById[reference.reference_id] ?? stagingFromReference(reference);
    return { reference, staging, issues: stagingValidationIssues(staging, reference) };
  });
  const bulkInvalidMessages = selectedBulkValidationEntries
    .flatMap(({ reference, staging, issues }) => issues.map((issue) => `${objectDisplayName(reference, staging)}：${issue.message}`));
  const bulkSelectedSourcesComplete = selectedBulkReferences.every((reference) => {
    const staging = bulkStagingById[reference.reference_id] ?? stagingFromReference(reference);
    return !stagingValidationMessage(staging, reference) &&
      fieldSourcesAreVerifiable(buildFieldSourceRows(reference, countryCreateFromStaging(reference, staging), dataSources, false));
  });
  const sortedCountries = useMemo(() => {
    return [...visibleCountries].sort((left, right) => {
      const multiplier = countrySort.direction === "asc" ? 1 : -1;
      const leftValue = countrySort.key === "business_region"
        ? optionLabels(businessTagOptions, normalizeBusinessTags(left.business_region))
        : countrySort.key === "jurisdiction_type"
          ? optionLabel(jurisdictionTypeOptions, left.jurisdiction_type ?? "")
          : countrySort.key === "international_region"
            ? optionLabel(geoRegionOptions, left.international_region ?? "")
            : countrySort.key === "enabled"
              ? String(left.enabled)
              : String(left[countrySort.key] ?? left.code ?? "");
      const rightValue = countrySort.key === "business_region"
        ? optionLabels(businessTagOptions, normalizeBusinessTags(right.business_region))
        : countrySort.key === "jurisdiction_type"
          ? optionLabel(jurisdictionTypeOptions, right.jurisdiction_type ?? "")
          : countrySort.key === "international_region"
            ? optionLabel(geoRegionOptions, right.international_region ?? "")
            : countrySort.key === "enabled"
              ? String(right.enabled)
              : String(right[countrySort.key] ?? right.code ?? "");
      return leftValue.localeCompare(rightValue, "zh-CN") * multiplier || left.code.localeCompare(right.code) * multiplier;
    });
  }, [visibleCountries, countrySort]);

  function updateCountry(code: string, patch: Partial<Country>): void {
    setConfig({
      ...config,
      countries: config.countries.map((country) =>
        country.code === code ? { ...country, ...patch } : country,
      ),
    });
  }

  function updateCountryForm(patch: Partial<CountryCreate>): void {
    setCountryForm((current) => ({
      ...current,
      source_verified: patch.source_verified ?? (patch.review_status === "verified" ? current.source_verified : false),
      review_status: patch.review_status ?? (patch.source_verified ? "verified" : "pending_review"),
      ...patch,
    }));
    if (!("source_verified" in patch) && patch.review_status !== "verified") {
      setCountrySourceVerified(false);
    }
    setCountrySubmitErrors([]);
  }

  function updateBulkStaging(referenceId: string, patch: Partial<CountryBulkFromReferenceStagingItem>): void {
    const reference = referenceCandidates.find((item) => item.reference_id === referenceId);
    if (!reference) {
      return;
    }
    setBulkStagingById((current) => ({
      ...current,
      [referenceId]: {
        ...(current[referenceId] ?? stagingFromReference(reference)),
        ...patch,
      },
    }));
    setBulkSourceVerified(false);
    setBulkNotice("");
  }

  function selectCountryReference(reference: JurisdictionReference): void {
    if (!isVisibleReferenceCandidate(reference) || referenceExistsInCountries(reference, config.countries)) {
      return;
    }
    const enabledFromReference = reference.candidate_status === "active" && reference.quote_selectable_default;
    const office = referenceOffice(reference);
    setSelectedReference(reference);
    setCountryForm((current) => ({
      ...current,
      reference_id: reference.reference_id,
      code: reference.standard_code,
      name_cn: reference.name_cn,
      name_en: reference.name_en,
      internal_code: reference.standard_code,
      display_code: reference.display_code,
      jurisdiction_type: reference.jurisdiction_type,
      international_region: referenceGeoRegion(reference),
      business_region: referenceBusinessTags(reference),
      enabled: enabledFromReference,
      is_enabled: enabledFromReference,
      source_name: "字段级来源：WIPO_ST3 / UN_M49 / WIPO_IP_OFFICES_DIRECTORY / BUSINESS_REGION_SOURCE",
      source_url: "https://www.wipo.int/standards/en/part_03_standards.html; https://unstats.un.org/unsd/methodology/m49/; https://www.wipo.int/en/web/country-profiles/directory-ip-offices",
      source_version: "WIPO ST.3/UN M49/WIPO IP Offices current; business tags 2026-06",
      source_note: "",
      last_verified_at: null,
      source_verified_at: null,
      source_verified_by: null,
      source_verified: false,
      review_status: "pending_review",
      ...office,
    }));
    setCountrySourceVerified(false);
  }

  function updateTreatyRule(id: string, patch: Partial<CountryTreatyRule>): void {
    setConfig({
      ...config,
      treaty_rules: treatyRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  function updatePathRule(id: string, patch: Partial<CountryPathRule>): void {
    setConfig({
      ...config,
      path_rules: config.path_rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  function updateDeadlineRule(id: string, patch: Partial<DeadlineRule>): void {
    setConfig({
      ...config,
      deadline_rules: deadlineRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  function updateEntityRule(id: string, patch: Partial<EntityTypeRule>): void {
    setConfig({
      ...config,
      entity_type_rules: config.entity_type_rules.map((rule) =>
        rule.id === id ? { ...rule, ...patch } : rule,
      ),
    });
  }

  function updateLanguageRule(id: string, patch: Partial<LanguageRule>): void {
    setConfig({
      ...config,
      language_rules: config.language_rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  function updateFxRule(id: string, patch: Partial<FxTaxRule>): void {
    setConfig({
      ...config,
      fx_tax_rules: config.fx_tax_rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  function updateSpecialRule(id: string, patch: Partial<SpecialRule>): void {
    setConfig({
      ...config,
      special_rules: config.special_rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  function createLocalId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}`;
  }

  async function submitCountry(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedReference || selectedReferenceExists) {
      return;
    }
    const stagingForValidation: CountryBulkFromReferenceStagingItem = {
      reference_id: selectedReference.reference_id,
      name_cn: countryForm.name_cn,
      name_en: countryForm.name_en,
      display_code: countryForm.display_code,
      international_region: countryForm.international_region ?? "",
      business_region: normalizeBusinessTags(countryForm.business_region),
      default_office_name_cn: countryForm.default_office_name_cn ?? "",
      default_office_name_en: countryForm.default_office_name_en ?? "",
      default_office_code: countryForm.default_office_code ?? "",
      default_office_type: countryForm.default_office_type ?? "",
      remarks: businessRemark(countryForm.remarks),
      overwrite_existing_fields: false,
      review_status: countryForm.review_status ?? "pending_review",
    };
    const validationIssues = stagingValidationIssues(stagingForValidation, selectedReference);
    if (validationIssues.length) {
      setCountrySubmitErrors(validationIssues.map((issue) => `${objectDisplayName(selectedReference, stagingForValidation)}：${issue.message}`));
      return;
    }
    if (selectedReferenceStatus === "soft_deleted_exists" || selectedReferenceStatus === "legacy_exists_only") {
      const result = await bulkCreateCountries([selectedReference.reference_id], [stagingForValidation], countrySourceVerified);
      if ((result.restored_count ?? 0) === 0 && result.failed_count > 0) {
        return;
      }
      setCountryForm(defaultCountryCreate(config));
      setCountrySearch("");
      setSelectedReference(null);
      setCountrySourceVerified(false);
      return;
    }
    const created = await createCountry({
      ...countryForm,
      reference_id: selectedReference.reference_id,
      code: selectedReference.standard_code,
      internal_code: selectedReference.standard_code,
      display_code: countryForm.display_code || selectedReference.display_code,
      name_cn: countryForm.name_cn || selectedReference.name_cn,
      name_en: countryForm.name_en || selectedReference.name_en,
      is_enabled: countryForm.enabled,
      source_name: countryForm.source_name,
      source_url: countryForm.source_url,
      source_version: countryForm.source_version,
      source_note: countryForm.source_note,
      source_verified: countryForm.source_verified,
      source_verified_at: countryForm.source_verified ? (countryForm.source_verified_at || countryForm.last_verified_at || new Date().toISOString()) : null,
      source_verified_by: countryForm.source_verified_by,
      last_verified_at: countryForm.source_verified ? (countryForm.last_verified_at || countryForm.source_verified_at || new Date().toISOString()) : null,
      review_status: countryForm.source_verified ? "verified" : (countryForm.review_status ?? "pending_review"),
      manual_override:
        countryForm.manual_override ||
        (countryForm.display_code || selectedReference.display_code) !== selectedReference.display_code ||
        (countryForm.name_cn || selectedReference.name_cn) !== selectedReference.name_cn ||
        (countryForm.name_en || selectedReference.name_en) !== selectedReference.name_en,
    });
    if (!created) {
      return;
    }
    setCountryForm(defaultCountryCreate(config));
    setCountrySearch("");
    setSelectedReference(null);
    setCountrySourceVerified(false);
    setCountrySubmitErrors([]);
  }

  async function confirmDeleteCountry(): Promise<void> {
    if (!countryToDelete) {
      return;
    }
    const deleted = await deleteCountry(countryToDelete, deleteReason);
    if (deleted) {
      setCountryToDelete(null);
      setDeleteReason("");
    }
  }

  function toggleBulkReference(referenceId: string): void {
    setBulkSourceVerified(false);
    setBulkNotice("");
    setBulkResult(null);
    const reference = referenceCandidates.find((item) => item.reference_id === referenceId);
    setBulkSelectedReferenceIds((current) => {
      if (current.includes(referenceId)) {
        setBulkStagingById((staging) => {
          const next = { ...staging };
          delete next[referenceId];
          return next;
        });
        return current.filter((item) => item !== referenceId);
      }
      if (reference) {
        setBulkStagingById((staging) => ({ ...staging, [referenceId]: staging[referenceId] ?? stagingFromReference(reference) }));
      }
      return [...current, referenceId];
    });
  }

  function selectAllFilteredBulkReferences(): void {
    setBulkSourceVerified(false);
    setBulkNotice("");
    setBulkResult(null);
    setBulkStagingById((current) => {
      const next = { ...current };
      for (const candidate of bulkCandidates) {
        if (selectableBulkCandidateIds.includes(candidate.reference_id)) {
          next[candidate.reference_id] = next[candidate.reference_id] ?? stagingFromReference(candidate);
        }
      }
      return next;
    });
    setBulkSelectedReferenceIds((current) => Array.from(new Set([...current, ...selectableBulkCandidateIds])));
  }

  function previewBulkAdd(): void {
    if (!selectedBulkReferences.length) {
      setBulkNotice("请先选择待新增或待恢复对象");
      return;
    }
    const invalid = selectedBulkValidationEntries.flatMap(({ reference, staging, issues }) => issues.map((issue) => `${objectDisplayName(reference, staging)}：${issue.message}`));
    if (invalid.length) {
      setBulkNotice(`本批次仍有字段不合格：${Array.from(new Set(invalid)).join("；")}`);
      return;
    }
    setBulkPreviewOpen(true);
    setBulkSourceVerified(false);
    setBulkNotice("");
  }

  async function submitBulkAdd(): Promise<void> {
    if (!selectedBulkReferences.length || selectedBulkValidationEntries.some((entry) => entry.issues.length) || bulkActionSummary.blocked > 0) {
      return;
    }
    setBulkSubmitting(true);
    setBulkNotice("");
    setBulkResult(null);
    try {
      const result = await bulkCreateCountries(
        selectedBulkReferences.map((reference) => reference.reference_id),
        selectedBulkStagingItems,
        bulkSourceVerified,
      );
      setBulkResult(result);
      const createdCount = result.created_count ?? result.added_count;
      const restoredCount = result.restored_count ?? 0;
      const failedItems = result.failed_items ?? result.failed ?? [];
      const failureDetail = failedItems.length
        ? `失败原因：${failedItems.map((item) => `${item.standard_code || item.reference_id}：${item.reason}`).join("；")}`
        : "";
      const summary = `本次新增 ${createdCount} 条，恢复 ${restoredCount} 条，跳过 ${result.skipped_count} 条，失败 ${result.failed_count} 条。${failureDetail}`;
      if (createdCount === 0 && restoredCount === 0 && result.skipped_count > 0 && result.failed_count === 0) {
        setBulkNotice("所选对象均已存在，无需新增。");
        setBulkConfirmOpen(false);
        return;
      }
      if (createdCount === 0 && restoredCount > 0 && result.skipped_count === 0 && result.failed_count === 0) {
        setBulkNotice("所选对象已被删除，已恢复到主档。");
        setBulkConfirmOpen(false);
        return;
      }
      setBulkNotice(summary);
      setBulkConfirmOpen(false);
      if (result.failed_count === 0 && (createdCount > 0 || restoredCount > 0)) {
      setBulkAddOpen(false);
      setBulkPreviewOpen(false);
      setBulkSearch("");
      setBulkSelectedReferenceIds([]);
      setBulkStagingById({});
      setBulkSourceVerified(false);
      setBulkNotice("");
        setBulkResult(null);
      }
    } catch (error) {
      setBulkNotice(error instanceof Error ? error.message : "批量新增/恢复失败。");
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function submitDataSource(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!dataSourceForm.source_id.trim() || !dataSourceForm.source_name.trim()) {
      return;
    }
    await saveDataSource({
      ...dataSourceForm,
      source_id: dataSourceForm.source_id.trim().toUpperCase().replace(/\s+/g, "_"),
      applicable_fields: dataSourceForm.applicable_fields.filter(Boolean),
    });
    setDataSourceForm(defaultDataSourceForm());
  }

  async function submitTreatyRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setConfig({
      ...config,
      treaty_rules: [...treatyRules, { ...treatyForm, id: createLocalId("treaty") }],
    });
    setTreatyForm(defaultTreatyRule(config));
  }

  async function submitPathRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createPathRule(pathForm);
    setPathForm(defaultPathRule(config));
  }

  async function submitDeadlineRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setConfig({
      ...config,
      deadline_rules: [...deadlineRules, { ...deadlineForm, id: createLocalId("deadline") }],
    });
    setDeadlineForm(defaultDeadlineRule(config));
  }

  async function submitEntityRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createEntityTypeRule(entityForm);
    setEntityForm(defaultEntityRule(config));
  }

  async function submitLanguageRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createLanguageRule(languageForm);
    setLanguageForm(defaultLanguageRule(config));
  }

  async function submitFxRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createFxTaxRule(fxForm);
    setFxForm(defaultFxRule(config));
  }

  async function submitSpecialRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createSpecialRule(specialForm);
    setSpecialForm(defaultSpecialRule(config));
  }

  function sortHeader(label: string, key: CountrySortKey) {
    const active = countrySort.key === key;
    return (
      <button
        className="inline-flex items-center gap-1 font-semibold"
        type="button"
        onClick={() =>
          setCountrySort((current) => ({
            key,
            direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
          }))
        }
      >
        {label}
        <span className="text-xs">{active ? (countrySort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">底层数据维护｜国家配置子模块</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
              按技术文档拆分国家主档、条约组织、路径矩阵、期限程序、实体类型、语言翻译、汇率税率和非常规事项。
            </p>
            {message ? <p className="mt-2 text-sm font-medium text-[oklch(38%_0.08_155)]">{message}</p> : null}
          </div>
        </div>
      </div>

      {activeSection === "overview" ? (
        <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
            <h3 className="text-xl font-semibold">底层数据维护</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
              国家配置是报价工作台和报价计算引擎调用的规则底座，管理员在这里维护规则，顾问只在工作台选择和生成报价。
            </p>
          </div>
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["国家主档", "稳定基础信息、启用状态、商务/经济区域。"],
              ["条约组织", "PCT、巴黎公约、EPC、海牙等成员关系。"],
              ["路径矩阵", "国家、申请类型、进入路径、路径细分逐级联动。"],
              ["期限程序", "PCT 期限、实审方式、申请周期和保护期限。"],
              ["实体类型", "大实体、小实体、微实体与官费和问题联动。"],
              ["语言翻译", "申请语言、源语、中间语、目标语和推荐路径。"],
              ["汇率税率", "官费币种、服务费币种、税率、汇率和正式报价锁定。"],
              ["非常规事项", "后补翻译、后补文件、DAS、延迟进入、风险提示。"],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border border-[oklch(84%_0.024_178)] bg-[oklch(97%_0.012_178)] p-4">
                <p className="text-sm font-semibold text-[oklch(28%_0.065_178)]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[oklch(43%_0.042_178)]">{description}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[oklch(88%_0.018_178)] px-5 py-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-[oklch(94%_0.018_178)] px-4 py-3">
                <p className="text-xs text-[oklch(46%_0.045_178)]">配置区</p>
                <p className="mt-1 text-2xl font-semibold">8</p>
              </div>
              <div className="rounded-md bg-[oklch(94%_0.018_178)] px-4 py-3">
                <p className="text-xs text-[oklch(46%_0.045_178)]">国家主档</p>
                <p className="mt-1 text-2xl font-semibold">{config.countries.length}</p>
              </div>
              <div className="rounded-md bg-[oklch(94%_0.018_178)] px-4 py-3">
                <p className="text-xs text-[oklch(46%_0.045_178)]">规则记录</p>
                <p className="mt-1 text-2xl font-semibold">
                  {treatyRules.length + config.path_rules.length + deadlineRules.length + config.entity_type_rules.length + config.language_rules.length + config.fx_tax_rules.length + config.special_rules.length}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {false ? (
        <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
            <h3 className="text-xl font-semibold">来源管理 / 数据源管理</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
              维护地理区域、商务区域、市场标签和一带一路等标签来源；这些标签不代表法律路径，也不代表正式可报价。
            </p>
          </div>
          <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[150px_1fr_130px_150px_1fr_160px_160px_auto]" onSubmit={submitDataSource}>
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              placeholder="source_id"
              value={dataSourceForm.source_id}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, source_id: event.target.value })}
            />
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              placeholder="来源名称"
              value={dataSourceForm.source_name}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, source_name: event.target.value })}
            />
            <select
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              value={dataSourceForm.source_type}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, source_type: event.target.value as JurisdictionDataSourceForm["source_type"] })}
            >
              <option value="official">official</option>
              <option value="internal">internal</option>
              <option value="third_party">third_party</option>
              <option value="manual_verified">manual_verified</option>
            </select>
            <select
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              value={dataSourceForm.review_status}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, review_status: event.target.value as JurisdictionDataSourceForm["review_status"] })}
            >
              <option value="pending_review">pending_review</option>
              <option value="verified">verified</option>
              <option value="needs_update">needs_update</option>
              <option value="deprecated">deprecated</option>
            </select>
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              placeholder="来源 URL"
              value={dataSourceForm.source_url}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, source_url: event.target.value })}
            />
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              placeholder="来源版本"
              value={dataSourceForm.source_version}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, source_version: event.target.value })}
            />
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              placeholder="下次复核 YYYY-MM-DD"
              value={dataSourceForm.next_review_due_at ?? ""}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, next_review_due_at: event.target.value || null })}
            />
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              placeholder="适用字段，逗号分隔"
              value={listToCsv(dataSourceForm.applicable_fields)}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, applicable_fields: csvToList(event.target.value) })}
            />
            <button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">
              保存来源
            </button>
            <div className="md:col-span-2 xl:col-span-4">
              <input
                className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                placeholder="来源备注"
                value={dataSourceForm.source_note}
                onChange={(event) => setDataSourceForm({ ...dataSourceForm, source_note: event.target.value })}
              />
            </div>
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3"
              placeholder="最近复核 YYYY-MM-DD"
              value={dataSourceForm.last_reviewed_at ?? ""}
              onChange={(event) => setDataSourceForm({ ...dataSourceForm, last_reviewed_at: event.target.value || null })}
            />
            <button
              className="h-10 rounded-md border border-[oklch(72%_0.035_178)] px-4 text-sm font-semibold text-[oklch(34%_0.075_178)]"
              type="button"
              onClick={() => setDataSourceForm(defaultDataSourceForm())}
            >
              清空
            </button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-[1080px] text-left text-sm">
              <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
                <tr>
                  <th className="px-3 py-3">来源 ID</th>
                  <th className="px-3 py-3">来源名称</th>
                  <th className="px-3 py-3">来源 URL</th>
                  <th className="px-3 py-3">版本</th>
                  <th className="px-3 py-3">类型</th>
                  <th className="px-3 py-3">复核状态</th>
                  <th className="px-3 py-3">最近复核</th>
                  <th className="px-3 py-3">下次复核</th>
                  <th className="px-3 py-3">适用字段</th>
                  <th className="px-3 py-3">备注</th>
                  <th className="px-3 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {dataSources.map((source) => (
                  <tr key={source.source_id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                    <td className="px-3 py-3 font-mono">{source.source_id}</td>
                    <td className="px-3 py-3">{source.source_name}</td>
                    <td className="max-w-[220px] truncate px-3 py-3">{source.source_url || "-"}</td>
                    <td className="px-3 py-3">{source.source_version || "-"}</td>
                    <td className="px-3 py-3">{source.source_type}</td>
                    <td className="px-3 py-3">{source.review_status}</td>
                    <td className="px-3 py-3">{source.last_reviewed_at ? formatDateTime(source.last_reviewed_at) : "-"}</td>
                    <td className="px-3 py-3">{source.next_review_due_at ? formatDateTime(source.next_review_due_at) : "-"}</td>
                    <td className="px-3 py-3">{source.applicable_fields.join("，") || "-"}</td>
                    <td className="px-3 py-3">{source.source_note || "-"}</td>
                    <td className="px-3 py-3">
                      <button
                        className="h-8 rounded-md border border-[oklch(72%_0.035_178)] px-3 text-xs font-semibold text-[oklch(34%_0.075_178)]"
                        type="button"
                        onClick={() => setDataSourceForm(dataSourceToForm(source))}
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "countries" ? (
      <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold">国家/地区/受理局主档配置</h3>
              <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
                维护基础名称、标准代码、业务展示代码、启用状态、国际地理区域和商务/经济区域。
              </p>
            </div>
            <button
              className="h-10 rounded-md border border-[oklch(72%_0.035_178)] px-4 text-sm font-semibold text-[oklch(34%_0.075_178)]"
              type="button"
              onClick={() => setBulkAddOpen(true)}
            >
              从 reference 批量添加
            </button>
            <button
              className="h-10 rounded-md border border-[oklch(72%_0.035_178)] px-4 text-sm font-semibold text-[oklch(34%_0.075_178)]"
              type="button"
              onClick={() => setShowCountrySourceManagement((current) => !current)}
            >
              来源管理 / 数据源管理
            </button>
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[oklch(36%_0.05_178)]">
            <input
              checked={showDeletedCountries}
              type="checkbox"
              onChange={(event) => setShowDeletedCountries(event.target.checked)}
            />
            显示已删除
          </label>
          {message ? <p className="mt-2 text-sm font-medium text-[oklch(38%_0.08_155)]">{message}</p> : null}
        </div>
        {showCountrySourceManagement ? (
          <div className="border-b border-[oklch(86%_0.02_178)] bg-[oklch(97%_0.012_178)]">
            <div className="px-5 py-3 text-sm text-[oklch(42%_0.045_178)]">
              来源管理是国家/地区/受理局主档内部维护入口，用于修改 URL、版本、备注、review 状态和复核日期；确认来源核验不等于修改来源。
            </div>
            <CountryDataSourceSection
              dataSourceForm={dataSourceForm}
              dataSources={dataSources}
              onClear={() => setDataSourceForm(defaultDataSourceForm())}
              onEdit={(source) => setDataSourceForm(dataSourceToForm(source))}
              onFormChange={setDataSourceForm}
              onSubmit={submitDataSource}
            />
          </div>
        ) : null}
        <form className="border-b border-[oklch(86%_0.02_178)] px-5 py-4" onSubmit={submitCountry}>
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,360px)_1fr]">
            <div>
              <input
                className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                placeholder="中文名 / 关键词搜索"
                value={countrySearch}
                onChange={(event) => {
                  setCountrySearch(event.target.value);
                  setSelectedReference(null);
                  setCountrySourceVerified(false);
                  setCountryForm(defaultCountryCreate(config));
                }}
              />
              <div className="mt-2 max-h-64 overflow-y-auto rounded-md border border-[oklch(84%_0.024_178)]">
                {countryCandidates.length ? countryCandidates.map((candidate) => {
                  const candidateStatus = referenceExistenceInCountries(candidate, config.countries).status;
                  const candidateExists = candidateStatus === "active_exists";
                  return (
                    <button
                      key={candidate.reference_id}
                      className={`grid w-full gap-1 border-b border-[oklch(88%_0.018_178)] px-3 py-2 text-left text-sm last:border-0 disabled:cursor-not-allowed ${selectedReference?.reference_id === candidate.reference_id ? "bg-[oklch(92%_0.024_178)]" : candidateExists ? "bg-[oklch(94%_0.008_178)] text-[oklch(50%_0.025_178)]" : "bg-[oklch(99%_0.006_178)]"}`}
                      disabled={candidateExists}
                      type="button"
                      onClick={() => selectCountryReference(candidate)}
                    >
                      <span className="flex items-center justify-between gap-2 font-semibold">
                        <span>{candidate.name_cn} / {candidate.name_en}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${referenceStatusTone(candidateStatus)}`}>{referenceStatusLabel(candidateStatus)}</span>
                      </span>
                      <span className="text-xs text-[oklch(46%_0.045_178)]">
                        {optionLabel(jurisdictionTypeOptions, candidate.jurisdiction_type)} · {candidate.standard_code} · {candidate.display_code}
                        {!candidate.quote_selectable_default ? ` · ${referenceCandidateStatusLabel(candidate)}` : ""}
                      </span>
                    </button>
                  );
                }) : (
                  <div className="px-3 py-4 text-sm text-[oklch(46%_0.045_178)]">输入关键词后显示候选项</div>
                )}
              </div>
              {countrySearchNotice ? (
                <div className="mt-2 rounded-md border border-[oklch(84%_0.036_85)] bg-[oklch(97%_0.02_85)] px-3 py-2 text-xs leading-5 text-[oklch(40%_0.065_85)]">
                  {countrySearchNotice}
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(96%_0.012_178)] p-3 md:grid-cols-2 xl:grid-cols-4">
                <ReadOnlyField label="标准代码" value={selectedReference?.standard_code ?? ""} />
                <ReadOnlyField label="类型" value={optionLabel(jurisdictionTypeOptions, selectedReference?.jurisdiction_type)} />
                <ReadOnlyField label="国际地理区域" value={selectedReference ? optionLabel(geoRegionOptions, referenceGeoRegion(selectedReference)) : ""} />
                <ReadOnlyField label="默认商务/经济区域" value={selectedReference ? optionLabels(businessTagOptions, referenceBusinessTags(selectedReference)) || "未配置" : ""} />
                <ReadOnlyField label="主管局" value={countryForm.default_office_name_en || countryForm.default_office_name_cn || "待维护"} />
              </div>
              {selectedReference ? (
                <details className="rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(99%_0.006_178)] px-3 py-2 text-xs text-[oklch(46%_0.045_178)]">
                  <summary className="cursor-pointer font-medium text-[oklch(34%_0.06_178)]">导入轨迹</summary>
                  <div className="mt-2 grid gap-1">
                    <span>导入轨迹：{selectedReference.source_id === "WIPO_LEX_REFERENCE" ? "WIPO Lex" : selectedReference.source_id || "-"}</span>
                    <span>该信息仅说明对象进入 reference 候选池的来源，不参与字段来源核验。</span>
                  </div>
                </details>
              ) : null}

              <div className="rounded-md border border-[oklch(80%_0.026_178)] bg-[oklch(99%_0.006_178)] p-3">
                <p className="mb-3 text-sm font-semibold text-[oklch(28%_0.065_178)]">人工配置 / 展示信息调整</p>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <LabeledField label="业务展示代码" required requirement="必填" error={stagingIssueForField(selectedCountryValidationIssues, "业务展示代码")}>
                    <input
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      value={countryForm.display_code}
                      onChange={(event) => updateCountryForm({ display_code: event.target.value.toUpperCase(), manual_override: true })}
                    />
                  </LabeledField>
                  <LabeledField label="中文名" required requirement="必填" error={stagingIssueForField(selectedCountryValidationIssues, "中文名")}>
                    <input
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      value={countryForm.name_cn}
                      onChange={(event) => updateCountryForm({ name_cn: event.target.value, manual_override: true })}
                    />
                  </LabeledField>
                  <LabeledField label="英文名" required requirement="必填" error={stagingIssueForField(selectedCountryValidationIssues, "英文名")}>
                    <input
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      value={countryForm.name_en}
                      onChange={(event) => updateCountryForm({ name_en: event.target.value, manual_override: true })}
                    />
                  </LabeledField>
                  <LabeledField label="类型" required requirement="必填" error={stagingIssueForField(selectedCountryValidationIssues, "类型")}>
                    <select
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      value={countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type ?? "single_country"}
                      onChange={(event) => updateCountryForm({ jurisdiction_type: event.target.value, manual_override: true })}
                    >
                      {jurisdictionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </LabeledField>
                  <LabeledField label="启用状态" required requirement="必填">
                    <select
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      value={String(countryForm.enabled)}
                      onChange={(event) => updateCountryForm({ enabled: event.target.value === "true", is_enabled: event.target.value === "true" })}
                    >
                      {enabledOptions.map((option) => (
                        <option key={String(option.value)} value={String(option.value)}>{option.label}</option>
                      ))}
                    </select>
                  </LabeledField>
                  <LabeledField label="地理区域" required={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type)} requirement={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type) ? "必填；未配置不可保存" : "可选；未配置可保存"} error={stagingIssueForField(selectedCountryValidationIssues, "地理区域")}>
                    <select
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      value={countryForm.international_region ?? ""}
                      onChange={(event) => updateCountryForm({ international_region: event.target.value })}
                    >
                      <option value="">未配置</option>
                      {geoRegionOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </LabeledField>
                  <div className="md:col-span-2">
                    <BusinessRegionMultiSelect
                      label={`商务/市场标签${isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type) ? " * 必填" : " 可选；未配置可保存"}`}
                      value={normalizeBusinessTags(countryForm.business_region)}
                      onChange={(business_region) => updateCountryForm({ business_region })}
                    />
                    {stagingIssueForField(selectedCountryValidationIssues, "商务/市场标签") ? <p className="mt-1 text-xs font-semibold text-[oklch(42%_0.08_25)]">{stagingIssueForField(selectedCountryValidationIssues, "商务/市场标签")}</p> : null}
                  </div>
                  <LabeledField label="备注" requirement="可选">
                    <input
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      value={businessRemark(countryForm.remarks)}
                      onChange={(event) => updateCountryForm({ remarks: event.target.value, region_remark: event.target.value })}
                    />
                  </LabeledField>
                  <LabeledField label="主管局代码" requirement="可后补">
                    <input
                      className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                      placeholder="如 CNIPA / USPTO / SIC"
                      value={countryForm.default_office_code ?? ""}
                      onChange={(event) => updateCountryForm({ default_office_code: event.target.value.toUpperCase(), manual_override: true })}
                    />
                  </LabeledField>
                  <LabeledField label="主管局中文名" required={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type)} requirement={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type) ? "中英文名至少一个必填" : "可选；可后补"}>
                    <input className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3" value={countryForm.default_office_name_cn ?? ""} onChange={(event) => updateCountryForm({ default_office_name_cn: event.target.value, manual_override: true })} />
                  </LabeledField>
                  <LabeledField label="主管局英文名" required={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type)} requirement={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type) ? "中英文名至少一个必填" : "可选；可后补"} error={stagingIssueForField(selectedCountryValidationIssues, "主管局名称")}>
                    <input className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3" value={countryForm.default_office_name_en ?? ""} onChange={(event) => updateCountryForm({ default_office_name_en: event.target.value, manual_override: true })} />
                  </LabeledField>
                  <LabeledField label="主管局类型" required={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type)} requirement={isCountryLikeType(countryForm.jurisdiction_type ?? selectedReference?.jurisdiction_type) ? "必填" : "可选；可后补"} error={stagingIssueForField(selectedCountryValidationIssues, "主管局类型")}>
                    <select className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3" value={countryForm.default_office_type ?? ""} onChange={(event) => updateCountryForm({ default_office_type: event.target.value, manual_override: true })}>
                      <option value="">未配置</option>
                      {officeTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </LabeledField>
                  <LabeledField label="review_status" requirement="数据质量状态">
                    <select className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3" value={countryForm.review_status ?? "pending_review"} onChange={(event) => updateCountryForm({ review_status: event.target.value })}>
                      {reviewStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </LabeledField>
                  <LabeledField label="主管局来源备注" requirement="可选">
                    <input className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3" value={countryForm.default_office_source_note ?? ""} onChange={(event) => updateCountryForm({ default_office_source_note: event.target.value, manual_override: true })} />
                  </LabeledField>
                </div>
              </div>

              <div className="grid gap-3 rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(96%_0.012_178)] p-3 md:grid-cols-[1fr_auto]">
                <div className="text-sm leading-6 text-[oklch(36%_0.05_178)]">
                  <p className="font-semibold text-[oklch(28%_0.065_178)]">字段级来源核验</p>
                  <div className="mt-2 overflow-x-auto rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(99%_0.006_178)]">
                    <table className="min-w-[980px] text-left text-xs">
                      <thead className="bg-[oklch(92%_0.024_178)]">
                        <tr>
                          <th className="px-2 py-2">字段名</th>
                          <th className="px-2 py-2">当前值</th>
                          <th className="px-2 py-2">source_id</th>
                          <th className="px-2 py-2">source_name</th>
                          <th className="px-2 py-2">source_url</th>
                          <th className="px-2 py-2">source_version</th>
                          <th className="px-2 py-2">review_status</th>
                          <th className="px-2 py-2">verified_by</th>
                          <th className="px-2 py-2">verified_at</th>
                          <th className="px-2 py-2">next_review_due_at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReferenceFieldSources.length ? selectedReferenceFieldSources.map((row) => (
                          <tr key={`${row.fieldName}-${row.source_id}`} className="border-t border-[oklch(88%_0.018_178)]">
                            <td className="px-2 py-2 font-medium">{row.fieldName}</td>
                            <td className="px-2 py-2">{row.currentValue || "待维护"}</td>
                            <td className="px-2 py-2 font-mono">{row.source_id}</td>
                            <td className="px-2 py-2">{row.source_name}</td>
                            <td className="max-w-[220px] truncate px-2 py-2" title={row.source_url}>{row.source_url || "-"}</td>
                            <td className="px-2 py-2">{row.source_version || "-"}</td>
                            <td className="px-2 py-2">{countrySourceVerified && row.fieldName !== "reference candidate pool" ? "verified" : row.review_status}</td>
                            <td className="px-2 py-2">{row.verified_by || "-"}</td>
                            <td className="px-2 py-2">{row.verified_at ? formatDateTime(row.verified_at) : "-"}</td>
                            <td className="px-2 py-2">{row.next_review_due_at ? formatDateTime(row.next_review_due_at) : "-"}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td className="px-2 py-3 text-[oklch(46%_0.045_178)]" colSpan={10}>选择候选后显示字段级来源。</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-[oklch(46%_0.045_178)]">确认当前字段来源核验仅表示已检查字段值和来源；来源有误可在上方来源管理维护 source_id、source_url、source_note、review_status，或直接把本对象 review_status 改回 pending_review / needs_update。</p>
                  {selectedReference && !selectedReferenceSourcesVerifiable ? <p className="font-semibold text-[oklch(42%_0.08_25)]">字段值为空、字段值为未配置、来源 URL 缺失或 review_status=deprecated 时，不能确认核验；未核验仍可新增并保存为 pending_review / needs_update。</p> : null}
                  {selectedReference ? <p>候选状态：{referenceCandidateStatusLabel(selectedReference)}</p> : null}
                  {selectedReferenceExists ? <p className="font-semibold text-[oklch(44%_0.07_25)]">该对象已存在于主档，不允许重复新增。</p> : null}
                  {selectedReferenceStatus === "soft_deleted_exists" ? <p className="font-semibold text-[oklch(40%_0.065_85)]">该对象已删除，可恢复到主档。</p> : null}
                  {selectedReferenceStatus === "legacy_exists_only" ? <p className="font-semibold text-[oklch(38%_0.075_250)]">旧数据存在，可恢复/补建主档。</p> : null}
                </div>
                <button
                  className={`h-10 rounded-md px-4 text-sm font-semibold ${countrySourceVerified ? "bg-[oklch(90%_0.035_155)] text-[oklch(34%_0.075_155)]" : "bg-[oklch(35%_0.09_178)] text-[oklch(97%_0.008_178)] disabled:cursor-not-allowed disabled:bg-[oklch(72%_0.015_178)]"}`}
                  disabled={!selectedReference || selectedReferenceExists || !selectedReferenceSourcesVerifiable}
                  type="button"
                  onClick={() => {
                    const verifiedAt = new Date().toISOString();
                    setCountryForm((current) => ({ ...current, last_verified_at: verifiedAt, source_verified_at: verifiedAt, source_verified_by: null, source_verified: true, review_status: "verified" }));
                    setCountrySourceVerified(true);
                  }}
                >
                  {countrySourceVerified ? "已确认字段来源核验" : "确认当前字段来源核验"}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[oklch(46%_0.045_178)]">
              未确认来源核验也可新增；阻断新增的只有对象类型对应的必填字段缺失或非法。标准信息由本地 reference 自动带出。
            </p>
            {countrySubmitErrors.length ? (
              <div className="rounded-md border border-[oklch(82%_0.05_25)] bg-[oklch(97%_0.018_25)] px-3 py-2 text-xs font-semibold leading-5 text-[oklch(42%_0.08_25)]">
                {countrySubmitErrors.map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}
            <button
              className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] disabled:cursor-not-allowed disabled:bg-[oklch(72%_0.015_178)]"
              disabled={!selectedReference || selectedReferenceExists || selectedCountryValidationIssues.length > 0}
              type="submit"
            >
              {selectedReferenceStatus === "soft_deleted_exists" || selectedReferenceStatus === "legacy_exists_only" ? "恢复到主档" : "新增国家"}
            </button>
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-[2060px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">序号</th>
                <th className="px-3 py-3">{sortHeader("标准代码", "internal_code")}</th>
                <th className="px-3 py-3">{sortHeader("业务展示代码", "display_code")}</th>
                <th className="px-3 py-3">{sortHeader("中文名", "name_cn")}</th>
                <th className="px-3 py-3">{sortHeader("英文名", "name_en")}</th>
                <th className="px-3 py-3">{sortHeader("类型", "jurisdiction_type")}</th>
                <th className="px-3 py-3">{sortHeader("国际地理区域", "international_region")}</th>
                <th className="px-3 py-3">{sortHeader("商务/经济区域", "business_region")}</th>
                <th className="px-3 py-3">主管局</th>
                <th className="px-3 py-3">字段来源摘要</th>
                <th className="px-3 py-3">{sortHeader("启用状态", "enabled")}</th>
                <th className="px-3 py-3">删除状态</th>
                <th className="px-3 py-3">人工备注</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedCountries.map((country, index) => {
                const isEditing = editingCountryCode === country.code;
                const remark = businessRemark(country.remarks ?? country.region_remark);
                const isDeleted = Boolean(country.is_deleted) || !country.enabled || country.is_enabled === false;
                return (
                  <tr key={country.code} className={`border-b border-[oklch(88%_0.018_178)] last:border-0 ${isDeleted ? "bg-[oklch(97%_0.018_85)]" : ""}`}>
                    <td className="px-3 py-3 font-mono text-xs">{index + 1}</td>
                    <td className="px-3 py-3 font-mono text-xs">{country.internal_code ?? country.code}</td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <input className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 font-mono text-xs" value={country.display_code ?? country.code} onChange={(event) => updateCountry(country.code, { display_code: event.target.value.toUpperCase(), manual_override: true })} />
                      ) : (
                        <span className="font-mono text-xs">{country.display_code ?? country.code}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <input className="h-9 w-32 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={country.name_cn} onChange={(event) => updateCountry(country.code, { name_cn: event.target.value, manual_override: true })} />
                      ) : (
                        country.name_cn
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <input className="h-9 w-56 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={country.name_en} onChange={(event) => updateCountry(country.code, { name_en: event.target.value, manual_override: true })} />
                      ) : (
                        country.name_en
                      )}
                    </td>
                    <td className="px-3 py-3">{optionLabel(jurisdictionTypeOptions, country.jurisdiction_type ?? "")}</td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <select className="h-9 w-48 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={country.international_region ?? ""} onChange={(event) => updateCountry(country.code, { international_region: event.target.value, manual_override: true })}>
                          <option value="">未配置</option>
                          {geoRegionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      ) : (
                        optionLabel(geoRegionOptions, country.international_region ?? "") || "未配置"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <div className="w-80">
                          <BusinessRegionMultiSelect
                            value={normalizeBusinessTags(country.business_region)}
                            onChange={(business_region) => updateCountry(country.code, { business_region })}
                          />
                        </div>
                      ) : (
                        <BusinessRegionChips value={normalizeBusinessTags(country.business_region)} />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <div className="grid w-96 gap-2">
                          <input className="h-9 rounded-md border border-[oklch(78%_0.028_178)] px-2" placeholder="主管局代码" value={country.default_office_code ?? ""} onChange={(event) => updateCountry(country.code, { default_office_code: event.target.value.toUpperCase(), manual_override: true })} />
                          <input className="h-9 rounded-md border border-[oklch(78%_0.028_178)] px-2" placeholder="主管局中文名" value={country.default_office_name_cn ?? ""} onChange={(event) => updateCountry(country.code, { default_office_name_cn: event.target.value, manual_override: true })} />
                          <input className="h-9 rounded-md border border-[oklch(78%_0.028_178)] px-2" placeholder="主管局英文名" value={country.default_office_name_en ?? ""} onChange={(event) => updateCountry(country.code, { default_office_name_en: event.target.value, manual_override: true })} />
                          <select className="h-9 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={country.default_office_type ?? ""} onChange={(event) => updateCountry(country.code, { default_office_type: event.target.value, manual_override: true })}>
                            <option value="">未配置</option>
                            {officeTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                          <input className="h-9 rounded-md border border-[oklch(78%_0.028_178)] px-2" placeholder="主管局来源备注" value={country.default_office_source_note ?? ""} onChange={(event) => updateCountry(country.code, { default_office_source_note: event.target.value, manual_override: true })} />
                        </div>
                      ) : (
                        <div className="grid gap-1">
                          <span className="font-mono text-xs">{country.default_office_code || "无缩写"}</span>
                          <span className="max-w-72 truncate" title={country.default_office_name_cn || country.default_office_name_en || ""}>{country.default_office_name_cn || country.default_office_name_en || "-"}</span>
                          {country.default_office_jurisdiction_id ? <span className="text-xs text-[oklch(46%_0.045_178)]">已关联主档对象</span> : null}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="grid max-w-72 gap-1 text-xs">
                        <span className="truncate" title={fieldSourceSummary()}>{fieldSourceSummary()}</span>
                        <span>standard_code/display_code、international_region、business_region、default_office</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <select
                          className="h-9 w-24 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                          value={String(country.enabled)}
                          onChange={(event) => updateCountry(country.code, { enabled: event.target.value === "true", is_enabled: event.target.value === "true" })}
                        >
                          {enabledOptions.map((option) => (
                            <option key={String(option.value)} value={String(option.value)}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        country.enabled ? "启用" : "停用"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isDeleted ? (
                        <div className="grid gap-1">
                          <span className="inline-flex w-fit rounded-md bg-[oklch(94%_0.035_85)] px-2 py-1 text-xs font-semibold text-[oklch(40%_0.065_85)]">已删除</span>
                          {country.delete_reason ? <span className="max-w-48 text-xs text-[oklch(46%_0.045_178)]">{country.delete_reason}</span> : null}
                        </div>
                      ) : (
                        <span className="text-xs text-[oklch(46%_0.045_178)]">未删除</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <input className="h-9 w-56 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={remark} onChange={(event) => updateCountry(country.code, { remarks: event.target.value, region_remark: event.target.value })} />
                      ) : (
                        remark
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
                            type="button"
                            onClick={() => {
                              void saveCountry({ ...country, remarks: remark, region_remark: remark });
                              setEditingCountryCode(null);
                            }}
                          >
                            保存
                          </button>
                          <button
                            className="h-9 rounded-md border border-[oklch(76%_0.026_178)] px-3 text-sm font-medium text-[oklch(40%_0.05_178)]"
                            type="button"
                            onClick={() => setEditingCountryCode(null)}
                          >
                            关闭
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {isDeleted ? (
                            <button
                              className="h-9 rounded-md border border-[oklch(72%_0.035_155)] px-3 text-sm font-medium text-[oklch(34%_0.075_155)]"
                              type="button"
                              onClick={() => void restoreCountry(country)}
                            >
                              恢复
                            </button>
                          ) : (
                            <>
                              <button
                                className="h-9 rounded-md border border-[oklch(72%_0.035_178)] px-3 text-sm font-medium text-[oklch(34%_0.075_178)]"
                                type="button"
                                onClick={() => setEditingCountryCode(country.code)}
                              >
                                编辑
                              </button>
                              <button
                                className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]"
                                type="button"
                                onClick={() => {
                                  setCountryToDelete(country);
                                  setDeleteReason("");
                                }}
                              >
                                删除
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeSection === "treaty" ? (
        <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
            <h3 className="text-xl font-semibold">条约、组织与成员关系配置</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
              独立维护 PCT、巴黎公约、海牙、EPC、ARIPO、OAPI 等关系，避免写死在国家主档。
            </p>
          </div>
          <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[110px_140px_130px_150px_150px_1fr_auto]" onSubmit={submitTreatyRule}>
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="国家" value={treatyForm.country_code} onChange={(event) => setTreatyForm({ ...treatyForm, country_code: event.target.value.toUpperCase() })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="条约/组织" value={treatyForm.treaty_name} onChange={(event) => setTreatyForm({ ...treatyForm, treaty_name: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="关系类型" value={treatyForm.membership_type} onChange={(event) => setTreatyForm({ ...treatyForm, membership_type: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" type="date" value={treatyForm.effective_date ?? ""} onChange={(event) => setTreatyForm({ ...treatyForm, effective_date: event.target.value || null })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" type="date" value={treatyForm.expiry_date ?? ""} onChange={(event) => setTreatyForm({ ...treatyForm, expiry_date: event.target.value || null })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="备注" value={treatyForm.remark} onChange={(event) => setTreatyForm({ ...treatyForm, remark: event.target.value })} />
            <button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">新增关系</button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] text-left text-sm">
              <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
                <tr><th className="px-3 py-3">国家</th><th className="px-3 py-3">条约/组织</th><th className="px-3 py-3">成员关系</th><th className="px-3 py-3">生效</th><th className="px-3 py-3">失效</th><th className="px-3 py-3">启用</th><th className="px-3 py-3">备注</th><th className="px-3 py-3">操作</th></tr>
              </thead>
              <tbody>
                {treatyRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                    <td className="px-3 py-3">{rule.country_code}</td>
                    <td className="px-3 py-3"><input className="h-9 w-32 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.treaty_name} onChange={(event) => updateTreatyRule(rule.id, { treaty_name: event.target.value })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-32 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.membership_type} onChange={(event) => updateTreatyRule(rule.id, { membership_type: event.target.value })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-36 rounded-md border border-[oklch(78%_0.028_178)] px-2" type="date" value={rule.effective_date ?? ""} onChange={(event) => updateTreatyRule(rule.id, { effective_date: event.target.value || null })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-36 rounded-md border border-[oklch(78%_0.028_178)] px-2" type="date" value={rule.expiry_date ?? ""} onChange={(event) => updateTreatyRule(rule.id, { expiry_date: event.target.value || null })} /></td>
                    <td className="px-3 py-3"><input checked={rule.enabled} type="checkbox" onChange={(event) => updateTreatyRule(rule.id, { enabled: event.target.checked })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-72 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.remark} onChange={(event) => updateTreatyRule(rule.id, { remark: event.target.value })} /></td>
                    <td className="px-3 py-3">
                      <button className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]" type="button" onClick={() => setConfig({ ...config, treaty_rules: treatyRules.filter((item) => item.id !== rule.id) })}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "path" ? (
      <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <h3 className="text-xl font-semibold">申请类型与进入路径矩阵</h3>
        </div>
        <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[110px_120px_140px_1fr_auto]" onSubmit={submitPathRule}>
          <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="国家" value={pathForm.country_code} onChange={(event) => setPathForm({ ...pathForm, country_code: event.target.value.toUpperCase() })} />
          <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请类型" value={pathForm.application_type} onChange={(event) => setPathForm({ ...pathForm, application_type: event.target.value })} />
          <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请途径" value={pathForm.filing_route} onChange={(event) => setPathForm({ ...pathForm, filing_route: event.target.value })} />
          <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="路径细分" value={pathForm.route_detail} onChange={(event) => setPathForm({ ...pathForm, route_detail: event.target.value })} />
          <button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">新增路径</button>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-[1320px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">国家</th>
                <th className="px-3 py-3">类型</th>
                <th className="px-3 py-3">途径</th>
                <th className="px-3 py-3">细分</th>
                <th className="px-3 py-3">官费</th>
                <th className="px-3 py-3">外所费</th>
                <th className="px-3 py-3">本所费</th>
                <th className="px-3 py-3">问题</th>
                <th className="px-3 py-3">文件</th>
                <th className="px-3 py-3">期限</th>
                <th className="px-3 py-3">翻译</th>
                <th className="px-3 py-3">启用</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {config.path_rules.map((rule) => (
                <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-3">{rule.country_code}</td>
                  <td className="px-3 py-3">{rule.application_type}</td>
                  <td className="px-3 py-3">{rule.filing_route}</td>
                  <td className="px-3 py-3">
                    <input className="h-9 w-36 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.route_detail} onChange={(event) => updatePathRule(rule.id, { route_detail: event.target.value })} />
                  </td>
                  {(["affects_official_fee", "affects_local_service_fee", "affects_inhouse_service_fee", "affects_questions", "affects_documents", "affects_deadlines", "affects_translation"] as const).map((key) => (
                    <td key={key} className="px-3 py-3">
                      <input checked={rule[key]} type="checkbox" onChange={(event) => updatePathRule(rule.id, { [key]: event.target.checked })} />
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <input checked={rule.enabled} type="checkbox" onChange={(event) => updatePathRule(rule.id, { enabled: event.target.checked })} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]" type="button" onClick={() => void savePathRule(rule)}>保存</button>
                      <button className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]" type="button" onClick={() => void deletePathRule(rule.id)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {activeSection === "deadline" ? (
        <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
            <h3 className="text-xl font-semibold">期限与程序节点配置</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
              维护 PCT 进入期限、实审方式、提前公开、申请周期和保护期限；复杂法律例外进入非常规事项或知识库。
            </p>
          </div>
          <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[90px_110px_130px_130px_120px_130px_1fr_auto]" onSubmit={submitDeadlineRule}>
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="国家" value={deadlineForm.country_code} onChange={(event) => setDeadlineForm({ ...deadlineForm, country_code: event.target.value.toUpperCase() })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请类型" value={deadlineForm.application_type} onChange={(event) => setDeadlineForm({ ...deadlineForm, application_type: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="进入途径" value={deadlineForm.filing_route} onChange={(event) => setDeadlineForm({ ...deadlineForm, filing_route: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="路径细分" value={deadlineForm.route_detail} onChange={(event) => setDeadlineForm({ ...deadlineForm, route_detail: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="PCT 期限" value={deadlineForm.pct_chapter_one_deadline} onChange={(event) => setDeadlineForm({ ...deadlineForm, pct_chapter_one_deadline: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="实审方式" value={deadlineForm.substantive_exam_mode} onChange={(event) => setDeadlineForm({ ...deadlineForm, substantive_exam_mode: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="保护期限" value={deadlineForm.protection_term} onChange={(event) => setDeadlineForm({ ...deadlineForm, protection_term: event.target.value })} />
            <button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">新增期限</button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-[1240px] text-left text-sm">
              <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
                <tr><th className="px-3 py-3">国家</th><th className="px-3 py-3">申请类型</th><th className="px-3 py-3">进入途径</th><th className="px-3 py-3">细分</th><th className="px-3 py-3">PCT 期限</th><th className="px-3 py-3">实审</th><th className="px-3 py-3">实审方式</th><th className="px-3 py-3">提前公开</th><th className="px-3 py-3">申请周期</th><th className="px-3 py-3">保护期限</th><th className="px-3 py-3">启用</th><th className="px-3 py-3">操作</th></tr>
              </thead>
              <tbody>
                {deadlineRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                    <td className="px-3 py-3">{rule.country_code}</td>
                    <td className="px-3 py-3">{rule.application_type}</td>
                    <td className="px-3 py-3">{rule.filing_route}</td>
                    <td className="px-3 py-3"><input className="h-9 w-32 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.route_detail} onChange={(event) => updateDeadlineRule(rule.id, { route_detail: event.target.value })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-24 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.pct_chapter_one_deadline} onChange={(event) => updateDeadlineRule(rule.id, { pct_chapter_one_deadline: event.target.value })} /></td>
                    <td className="px-3 py-3"><input checked={rule.has_substantive_exam} type="checkbox" onChange={(event) => updateDeadlineRule(rule.id, { has_substantive_exam: event.target.checked })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-36 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.substantive_exam_mode} onChange={(event) => updateDeadlineRule(rule.id, { substantive_exam_mode: event.target.value })} /></td>
                    <td className="px-3 py-3"><input checked={rule.has_early_publication} type="checkbox" onChange={(event) => updateDeadlineRule(rule.id, { has_early_publication: event.target.checked })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.application_cycle} onChange={(event) => updateDeadlineRule(rule.id, { application_cycle: event.target.value })} /></td>
                    <td className="px-3 py-3"><input className="h-9 w-40 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.protection_term} onChange={(event) => updateDeadlineRule(rule.id, { protection_term: event.target.value })} /></td>
                    <td className="px-3 py-3"><input checked={rule.enabled} type="checkbox" onChange={(event) => updateDeadlineRule(rule.id, { enabled: event.target.checked })} /></td>
                    <td className="px-3 py-3"><button className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]" type="button" onClick={() => setConfig({ ...config, deadline_rules: deadlineRules.filter((item) => item.id !== rule.id) })}>删除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "entity" ? (
        <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
            <h3 className="text-xl font-semibold">实体类型配置</h3>
          </div>
          <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[110px_120px_140px_1fr_auto]" onSubmit={submitEntityRule}>
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="国家" value={entityForm.country_code} onChange={(event) => setEntityForm({ ...entityForm, country_code: event.target.value.toUpperCase() })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请类型" value={entityForm.application_type} onChange={(event) => setEntityForm({ ...entityForm, application_type: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请途径" value={entityForm.filing_route} onChange={(event) => setEntityForm({ ...entityForm, filing_route: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="实体选项，逗号分隔" value={listToCsv(entityForm.entity_types)} onChange={(event) => setEntityForm({ ...entityForm, entity_types: csvToList(event.target.value) })} />
            <button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">新增实体</button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-[840px] text-left text-sm">
              <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
                <tr><th className="px-3 py-3">国家</th><th className="px-3 py-3">类型</th><th className="px-3 py-3">实体选项</th><th className="px-3 py-3">影响官费</th><th className="px-3 py-3">客户确认</th><th className="px-3 py-3">启用</th><th className="px-3 py-3">操作</th></tr>
              </thead>
              <tbody>
                {config.entity_type_rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                    <td className="px-3 py-3">{rule.country_code}</td><td className="px-3 py-3">{rule.application_type}</td>
                    <td className="px-3 py-3"><input className="h-9 w-56 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={listToCsv(rule.entity_types)} onChange={(event) => updateEntityRule(rule.id, { entity_types: csvToList(event.target.value) })} /></td>
                    <td className="px-3 py-3"><input checked={rule.affects_official_fee} type="checkbox" onChange={(event) => updateEntityRule(rule.id, { affects_official_fee: event.target.checked })} /></td>
                    <td className="px-3 py-3"><input checked={rule.requires_customer_confirmation} type="checkbox" onChange={(event) => updateEntityRule(rule.id, { requires_customer_confirmation: event.target.checked })} /></td>
                    <td className="px-3 py-3"><input checked={rule.enabled} type="checkbox" onChange={(event) => updateEntityRule(rule.id, { enabled: event.target.checked })} /></td>
                    <td className="px-3 py-3"><div className="flex gap-2"><button className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]" type="button" onClick={() => void saveEntityTypeRule(rule)}>保存</button><button className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]" type="button" onClick={() => void deleteEntityTypeRule(rule.id)}>删除</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "language" ? (
        <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4"><h3 className="text-xl font-semibold">语言与翻译路径</h3></div>
          <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[110px_120px_1fr_100px_100px_auto]" onSubmit={submitLanguageRule}>
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="国家" value={languageForm.country_code} onChange={(event) => setLanguageForm({ ...languageForm, country_code: event.target.value.toUpperCase() })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请类型" value={languageForm.application_type} onChange={(event) => setLanguageForm({ ...languageForm, application_type: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="可接受语言" value={listToCsv(languageForm.accepted_languages)} onChange={(event) => setLanguageForm({ ...languageForm, accepted_languages: csvToList(event.target.value) })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="源语" value={languageForm.source_language} onChange={(event) => setLanguageForm({ ...languageForm, source_language: event.target.value })} />
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="目标语" value={languageForm.target_language} onChange={(event) => setLanguageForm({ ...languageForm, target_language: event.target.value })} />
            <button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">新增语言</button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] text-left text-sm">
              <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]"><tr><th className="px-3 py-3">国家</th><th className="px-3 py-3">可接受语言</th><th className="px-3 py-3">源语</th><th className="px-3 py-3">目标语</th><th className="px-3 py-3">默认翻译费</th><th className="px-3 py-3">启用</th><th className="px-3 py-3">操作</th></tr></thead>
              <tbody>{config.language_rules.map((rule) => (<tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0"><td className="px-3 py-3">{rule.country_code}</td><td className="px-3 py-3"><input className="h-9 w-56 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={listToCsv(rule.accepted_languages)} onChange={(event) => updateLanguageRule(rule.id, { accepted_languages: csvToList(event.target.value) })} /></td><td className="px-3 py-3"><input className="h-9 w-20 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.source_language} onChange={(event) => updateLanguageRule(rule.id, { source_language: event.target.value })} /></td><td className="px-3 py-3"><input className="h-9 w-20 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.target_language} onChange={(event) => updateLanguageRule(rule.id, { target_language: event.target.value })} /></td><td className="px-3 py-3"><input checked={rule.default_translation_fee} type="checkbox" onChange={(event) => updateLanguageRule(rule.id, { default_translation_fee: event.target.checked })} /></td><td className="px-3 py-3"><input checked={rule.enabled} type="checkbox" onChange={(event) => updateLanguageRule(rule.id, { enabled: event.target.checked })} /></td><td className="px-3 py-3"><div className="flex gap-2"><button className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]" type="button" onClick={() => void saveLanguageRule(rule)}>保存</button><button className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]" type="button" onClick={() => void deleteLanguageRule(rule.id)}>删除</button></div></td></tr>))}</tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "fx" ? (
        <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4"><h3 className="text-xl font-semibold">汇率与税率配置</h3></div>
          <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[110px_110px_110px_110px_110px_auto]" onSubmit={submitFxRule}>
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="国家" value={fxForm.country_code} onChange={(event) => setFxForm({ ...fxForm, country_code: event.target.value.toUpperCase() })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="官方币种" value={fxForm.official_currency} onChange={(event) => setFxForm({ ...fxForm, official_currency: event.target.value.toUpperCase(), official_quote_currency: event.target.value.toUpperCase() })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="报价币种" value={fxForm.quote_currency} onChange={(event) => setFxForm({ ...fxForm, quote_currency: event.target.value.toUpperCase() })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="汇率" value={fxForm.fx_rate} onChange={(event) => setFxForm({ ...fxForm, fx_rate: event.target.value })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="版本" value={fxForm.version} onChange={(event) => setFxForm({ ...fxForm, version: event.target.value })} /><button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">新增汇率</button>
          </form>
          <div className="overflow-x-auto"><table className="min-w-[820px] text-left text-sm"><thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]"><tr><th className="px-3 py-3">国家</th><th className="px-3 py-3">报价币种</th><th className="px-3 py-3">汇率</th><th className="px-3 py-3">税率</th><th className="px-3 py-3">锁定</th><th className="px-3 py-3">版本</th><th className="px-3 py-3">操作</th></tr></thead><tbody>{config.fx_tax_rules.map((rule) => (<tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0"><td className="px-3 py-3">{rule.country_code}</td><td className="px-3 py-3"><input className="h-9 w-20 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.quote_currency} onChange={(event) => updateFxRule(rule.id, { quote_currency: event.target.value })} /></td><td className="px-3 py-3"><input className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right" type="number" value={rule.fx_rate} onChange={(event) => updateFxRule(rule.id, { fx_rate: event.target.value })} /></td><td className="px-3 py-3"><input className="h-9 w-24 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right" type="number" value={rule.tax_rate} onChange={(event) => updateFxRule(rule.id, { tax_rate: event.target.value })} /></td><td className="px-3 py-3"><input checked={rule.lock_on_formal_quote} type="checkbox" onChange={(event) => updateFxRule(rule.id, { lock_on_formal_quote: event.target.checked })} /></td><td className="px-3 py-3"><input className="h-9 w-32 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.version} onChange={(event) => updateFxRule(rule.id, { version: event.target.value })} /></td><td className="px-3 py-3"><div className="flex gap-2"><button className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]" type="button" onClick={() => void saveFxTaxRule(rule)}>保存</button><button className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]" type="button" onClick={() => void deleteFxTaxRule(rule.id)}>删除</button></div></td></tr>))}</tbody></table></div>
        </section>
      ) : null}

      {activeSection === "special" ? (
        <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
          <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4"><h3 className="text-xl font-semibold">非常规事项规则</h3></div>
          <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[110px_120px_140px_160px_1fr_auto]" onSubmit={submitSpecialRule}>
            <input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="国家" value={specialForm.country_code} onChange={(event) => setSpecialForm({ ...specialForm, country_code: event.target.value.toUpperCase() })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请类型" value={specialForm.application_type} onChange={(event) => setSpecialForm({ ...specialForm, application_type: event.target.value })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="申请途径" value={specialForm.filing_route} onChange={(event) => setSpecialForm({ ...specialForm, filing_route: event.target.value })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="事项" value={specialForm.rule_type} onChange={(event) => setSpecialForm({ ...specialForm, rule_type: event.target.value })} /><input className="h-10 rounded-md border border-[oklch(78%_0.028_178)] px-3" placeholder="风险摘要" value={specialForm.risk_summary} onChange={(event) => setSpecialForm({ ...specialForm, risk_summary: event.target.value })} /><button className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)]" type="submit">新增事项</button>
          </form>
          <div className="overflow-x-auto"><table className="min-w-[900px] text-left text-sm"><thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]"><tr><th className="px-3 py-3">国家</th><th className="px-3 py-3">事项</th><th className="px-3 py-3">额外费用</th><th className="px-3 py-3">风险提示</th><th className="px-3 py-3">客户确认</th><th className="px-3 py-3">摘要</th><th className="px-3 py-3">操作</th></tr></thead><tbody>{config.special_rules.map((rule) => (<tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0"><td className="px-3 py-3">{rule.country_code}</td><td className="px-3 py-3">{rule.rule_type}</td><td className="px-3 py-3"><input checked={rule.triggers_extra_fee} type="checkbox" onChange={(event) => updateSpecialRule(rule.id, { triggers_extra_fee: event.target.checked })} /></td><td className="px-3 py-3"><input checked={rule.triggers_risk_warning} type="checkbox" onChange={(event) => updateSpecialRule(rule.id, { triggers_risk_warning: event.target.checked })} /></td><td className="px-3 py-3"><input checked={rule.requires_customer_confirmation} type="checkbox" onChange={(event) => updateSpecialRule(rule.id, { requires_customer_confirmation: event.target.checked })} /></td><td className="px-3 py-3"><input className="h-9 w-72 rounded-md border border-[oklch(78%_0.028_178)] px-2" value={rule.risk_summary} onChange={(event) => updateSpecialRule(rule.id, { risk_summary: event.target.value })} /></td><td className="px-3 py-3"><div className="flex gap-2"><button className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]" type="button" onClick={() => void saveSpecialRule(rule)}>保存</button><button className="h-9 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-sm font-medium text-[oklch(42%_0.08_25)]" type="button" onClick={() => void deleteSpecialRule(rule.id)}>删除</button></div></td></tr>))}</tbody></table></div>
        </section>
      ) : null}

      {countryToDelete ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] shadow-xl">
            <div className="border-b border-[oklch(86%_0.02_178)] px-5 py-4">
              <h3 className="text-lg font-semibold">确认删除主档对象</h3>
              <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">删除前系统会检查业务引用；已有引用时请改为停用。</p>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-2">
              <ReadOnlyField label="标准代码" value={countryToDelete.internal_code ?? countryToDelete.code} />
              <ReadOnlyField label="业务展示代码" value={countryToDelete.display_code ?? countryToDelete.code} />
              <ReadOnlyField label="中文名" value={countryToDelete.name_cn} />
              <ReadOnlyField label="英文名" value={countryToDelete.name_en} />
              <ReadOnlyField label="类型" value={optionLabel(jurisdictionTypeOptions, countryToDelete.jurisdiction_type ?? "")} />
              <LabeledField label="删除原因">
                <input
                  className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] px-3"
                  value={deleteReason}
                  onChange={(event) => setDeleteReason(event.target.value)}
                />
              </LabeledField>
              <div className="md:col-span-2 rounded-md border border-[oklch(84%_0.036_85)] bg-[oklch(97%_0.02_85)] px-3 py-2 text-sm leading-6 text-[oklch(40%_0.065_85)]">
                删除风险提示：删除通过后仅做软删除并停用，默认不再出现在主档列表；历史报价、草稿和价格配置仍保留原有 country_code / jurisdiction_id 引用。若系统检测到任何业务引用，将拒绝删除并提示改为停用。
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[oklch(86%_0.02_178)] px-5 py-4">
              <button
                className="h-10 rounded-md border border-[oklch(76%_0.026_178)] px-4 text-sm font-medium text-[oklch(40%_0.05_178)]"
                type="button"
                onClick={() => {
                  setCountryToDelete(null);
                  setDeleteReason("");
                }}
              >
                取消
              </button>
              <button
                className="h-10 rounded-md border border-[oklch(72%_0.05_25)] px-4 text-sm font-semibold text-[oklch(42%_0.08_25)]"
                type="button"
                onClick={() => void confirmDeleteCountry()}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {bulkAddOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] shadow-xl">
            <div className="border-b border-[oklch(86%_0.02_178)] px-5 py-4">
              <h3 className="text-lg font-semibold">从 reference 批量添加</h3>
              <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">仅使用当前本地 reference 候选库，不做官方自动同步、不覆盖已有主档。</p>
            </div>
            <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-5 lg:grid-cols-[1.3fr_1fr]">
              <div className="min-h-0">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="h-10 flex-1 rounded-md border border-[oklch(78%_0.028_178)] px-3"
                    placeholder="中文名 / 英文名 / 标准代码 / 展示代码"
                    value={bulkSearch}
                    onChange={(event) => {
                      setBulkSearch(event.target.value);
                      setBulkNotice("");
                    }}
                  />
                  <button
                    className="h-10 rounded-md border border-[oklch(72%_0.035_178)] px-3 text-sm font-medium text-[oklch(34%_0.075_178)]"
                    type="button"
                    onClick={selectAllFilteredBulkReferences}
                  >
                    全选当前筛选
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  <StatPill label="当前候选总数" value={String(bulkStats.totalVisible)} />
                  <StatPill label="当前筛选结果数" value={String(bulkStats.filtered)} />
                  <StatPill label="已录入主档数" value={String(bulkStats.existing)} />
                  <StatPill label="候选未纳入报价数" value={String(bulkStats.notSelectable)} />
                  <StatPill label="本次已勾选数" value={String(bulkStats.selected)} />
                </div>
                <div className="mt-3 max-h-[46vh] overflow-y-auto rounded-md border border-[oklch(84%_0.024_178)]">
                  {bulkCandidates.map((candidate) => {
                    const candidateStatus = referenceExistenceInCountries(candidate, config.countries).status;
                    const candidateExists = candidateStatus === "active_exists";
                    const checked = bulkSelectedReferenceIds.includes(candidate.reference_id);
                    return (
                      <label key={candidate.reference_id} className={`grid gap-1 border-b border-[oklch(88%_0.018_178)] px-3 py-2 text-sm last:border-0 ${candidateExists ? "bg-[oklch(94%_0.008_178)] text-[oklch(50%_0.025_178)]" : "bg-[oklch(99%_0.006_178)]"}`}>
                        <span className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2">
                            <input
                              checked={checked}
                              disabled={candidateExists}
                              type="checkbox"
                              onChange={() => toggleBulkReference(candidate.reference_id)}
                            />
                            <span className="font-semibold">{candidate.name_cn} / {candidate.name_en}</span>
                          </span>
                          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs ${referenceStatusTone(candidateStatus)}`}>{referenceStatusLabel(candidateStatus)}</span>
                        </span>
                        <span className="pl-6 text-xs text-[oklch(46%_0.045_178)]">
                          {optionLabel(jurisdictionTypeOptions, candidate.jurisdiction_type)} · {candidate.standard_code} · {candidate.display_code} · {optionLabel(geoRegionOptions, referenceGeoRegion(candidate))} · {optionLabels(businessTagOptions, referenceBusinessTags(candidate)) || "未配置"}
                          {!candidate.quote_selectable_default ? ` · ${referenceCandidateStatusLabel(candidate)}` : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="min-h-0 rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(96%_0.012_178)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">批量新增暂存清单</p>
                  <span className="text-xs text-[oklch(46%_0.045_178)]">{selectedBulkReferences.length} 项</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <StatPill label="新增" value={String(bulkActionSummary.created)} />
                  <StatPill label="恢复" value={String(bulkActionSummary.restored)} />
                  <StatPill label="跳过已存在" value={String(bulkActionSummary.skipped)} />
                  <StatPill label="隐藏/不可选" value={String(bulkActionSummary.blocked)} />
                </div>
                {bulkNotice ? (
                  <div className="mt-3 rounded-md border border-[oklch(84%_0.036_85)] bg-[oklch(97%_0.02_85)] px-3 py-2 text-sm text-[oklch(40%_0.065_85)]">
                    {bulkNotice}
                  </div>
                ) : null}
                {bulkResult ? (
                  <div className="mt-3 rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(99%_0.006_178)] px-3 py-2 text-xs leading-5">
                    <p className="font-semibold">结果明细：新增 {bulkResult.created_count ?? bulkResult.added_count}，恢复 {bulkResult.restored_count ?? 0}，跳过 {bulkResult.skipped_count}，失败 {bulkResult.failed_count}</p>
                    {[...(bulkResult.created_items ?? bulkResult.added), ...(bulkResult.restored_items ?? bulkResult.restored ?? []), ...(bulkResult.skipped_items ?? bulkResult.skipped), ...(bulkResult.failed_items ?? bulkResult.failed)].map((item) => (
                      <p key={`${item.status}-${item.reference_id}`} className="mt-1">
                        {item.standard_code || item.reference_id} / {item.display_code || "-"}：{item.reason}
                      </p>
                    ))}
                  </div>
                ) : null}
                {bulkInvalidMessages.length ? (
                  <div className="mt-3 rounded-md border border-[oklch(82%_0.05_25)] bg-[oklch(97%_0.018_25)] px-3 py-2 text-xs font-semibold leading-5 text-[oklch(42%_0.08_25)]">
                    {Array.from(new Set(bulkInvalidMessages)).map((message) => (
                      <button key={message} className="block text-left underline-offset-2 hover:underline" type="button" onClick={() => setBulkNotice(message)}>
                        {message}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 max-h-[42vh] overflow-y-auto rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(99%_0.006_178)]">
                  {selectedBulkReferences.length ? selectedBulkReferences.map((reference) => (
                    <div key={reference.reference_id} className="border-b border-[oklch(88%_0.018_178)] px-3 py-3 text-sm last:border-0">
                        {(() => {
                          const staging = bulkStagingById[reference.reference_id] ?? stagingFromReference(reference);
                          const previewForm = countryCreateFromStaging(reference, staging);
                          const fieldRows = buildFieldSourceRows(reference, previewForm, dataSources, false);
                          const issues = stagingValidationIssues(staging, reference);
                          const validationMessage = stagingValidationMessage(staging, reference);
                          const stagedType = staging.jurisdiction_type ?? reference.jurisdiction_type;
                          return (
                            <details open className={`grid gap-3 rounded-md ${issues.length ? "border border-[oklch(82%_0.05_25)] bg-[oklch(99%_0.01_25)] p-2" : ""}`}>
                              <summary className="cursor-pointer list-none font-semibold">
                                <span>{reference.standard_code} / {staging.display_code || reference.display_code} · {staging.name_cn || reference.name_cn}</span>
                                {validationMessage ? <span className="ml-2 text-xs text-[oklch(42%_0.08_25)]">{validationMessage}</span> : null}
                                <span className="ml-2 text-xs font-medium text-[oklch(46%_0.045_178)]">展开/收起</span>
                              </summary>
                              <div className="flex justify-end">
                                <button
                                  className="h-8 rounded-md border border-[oklch(72%_0.05_25)] px-3 text-xs font-semibold text-[oklch(42%_0.08_25)]"
                                  type="button"
                                  onClick={() => toggleBulkReference(reference.reference_id)}
                                >
                                  从清单移除
                                </button>
                              </div>
                              <div className="grid gap-2 md:grid-cols-2">
                                <LabeledField label="中文名" required requirement="必填" error={stagingIssueForField(issues, "中文名")}>
                                  <input className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.name_cn} onChange={(event) => updateBulkStaging(reference.reference_id, { name_cn: event.target.value })} />
                                </LabeledField>
                                <LabeledField label="英文名" required requirement="必填" error={stagingIssueForField(issues, "英文名")}>
                                  <input className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.name_en} onChange={(event) => updateBulkStaging(reference.reference_id, { name_en: event.target.value })} />
                                </LabeledField>
                                <LabeledField label="业务展示代码" required requirement="必填" error={stagingIssueForField(issues, "业务展示代码")}>
                                  <input className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2 font-mono" value={staging.display_code} onChange={(event) => updateBulkStaging(reference.reference_id, { display_code: event.target.value.toUpperCase() })} />
                                </LabeledField>
                                <LabeledField label="类型" required requirement="必填" error={stagingIssueForField(issues, "类型")}>
                                  <select className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.jurisdiction_type ?? reference.jurisdiction_type} onChange={(event) => updateBulkStaging(reference.reference_id, { jurisdiction_type: event.target.value })}>
                                    {jurisdictionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                  </select>
                                </LabeledField>
                                <LabeledField label="地理区域" required={isCountryLikeType(stagedType)} requirement={isCountryLikeType(stagedType) ? "必填；未配置不可保存" : "可选；未配置可保存"} error={stagingIssueForField(issues, "地理区域")}>
                                  <select className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.international_region} onChange={(event) => updateBulkStaging(reference.reference_id, { international_region: event.target.value })}>
                                    <option value="">未配置</option>
                                    {geoRegionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                  </select>
                                </LabeledField>
                                <div className="md:col-span-2">
                                  <BusinessRegionMultiSelect
                                    label={`商务/市场标签${isCountryLikeType(stagedType) ? " * 必填" : " 可选；未配置可保存"}`}
                                    value={normalizeBusinessTags(staging.business_region)}
                                    onChange={(business_region) => updateBulkStaging(reference.reference_id, { business_region })}
                                  />
                                  {stagingIssueForField(issues, "商务/市场标签") ? <p className="mt-1 text-xs font-semibold text-[oklch(42%_0.08_25)]">{stagingIssueForField(issues, "商务/市场标签")}</p> : null}
                                </div>
                                <LabeledField label="主管局英文名" required={isCountryLikeType(stagedType)} requirement={isCountryLikeType(stagedType) ? "中英文名至少一个必填" : "可选；可后补"} error={stagingIssueForField(issues, "主管局名称")}>
                                  <input className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.default_office_name_en} onChange={(event) => updateBulkStaging(reference.reference_id, { default_office_name_en: event.target.value })} />
                                </LabeledField>
                                <LabeledField label="主管局中文名" required={isCountryLikeType(stagedType)} requirement={isCountryLikeType(stagedType) ? "中英文名至少一个必填" : "可选；可后补"}>
                                  <input className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.default_office_name_cn} onChange={(event) => updateBulkStaging(reference.reference_id, { default_office_name_cn: event.target.value })} />
                                </LabeledField>
                                <LabeledField label="主管局代码" requirement="可后补">
                                  <input className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2 font-mono" value={staging.default_office_code} onChange={(event) => updateBulkStaging(reference.reference_id, { default_office_code: event.target.value.toUpperCase() })} />
                                </LabeledField>
                                <LabeledField label="主管局类型" required={isCountryLikeType(stagedType)} requirement={isCountryLikeType(stagedType) ? "必填" : "可选；可后补"} error={stagingIssueForField(issues, "主管局类型")}>
                                  <select className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.default_office_type} onChange={(event) => updateBulkStaging(reference.reference_id, { default_office_type: event.target.value })}>
                                    <option value="">未配置</option>
                                    {officeTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                  </select>
                                </LabeledField>
                                <LabeledField label="review_status" requirement="数据质量状态">
                                  <select className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={staging.review_status ?? "pending_review"} onChange={(event) => updateBulkStaging(reference.reference_id, { review_status: event.target.value })}>
                                    {reviewStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                                  </select>
                                </LabeledField>
                                <LabeledField label="人工备注" requirement="可选">
                                  <input className="h-9 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2" value={businessRemark(staging.remarks)} onChange={(event) => updateBulkStaging(reference.reference_id, { remarks: event.target.value })} />
                                </LabeledField>
                                {referenceExistenceInCountries(reference, config.countries).status !== "not_exists" ? (
                                  <label className="flex items-center gap-2 text-sm">
                                    <input checked={Boolean(staging.overwrite_existing_fields)} type="checkbox" onChange={(event) => updateBulkStaging(reference.reference_id, { overwrite_existing_fields: event.target.checked })} />
                                    覆盖已维护字段
                                  </label>
                                ) : null}
                              </div>
                              <div className="grid gap-1 text-xs text-[oklch(46%_0.045_178)]">
                                <span>标准代码：{reference.standard_code}；字段来源：{fieldRows.map((row) => `${row.fieldName}:${row.source_id}`).join("；")}</span>
                                <span>当前状态：{referenceStatusLabel(referenceExistenceInCountries(reference, config.countries).status)}</span>
                              </div>
                            </details>
                          );
                        })()}
                    </div>
                  )) : (
                    <div className="px-3 py-6 text-sm text-[oklch(46%_0.045_178)]">
                      请选择要新增或恢复的 reference 对象
                    </div>
                  )}
                </div>
                <label className="mt-3 flex items-start gap-2 text-sm leading-6">
                  <input
                    checked={bulkSourceVerified}
                    className="mt-1"
                    disabled={!bulkSelectedSourcesComplete}
                    type="checkbox"
                    onChange={(event) => setBulkSourceVerified(event.target.checked)}
                  />
                  <span className={!bulkSelectedSourcesComplete ? "text-[oklch(52%_0.025_178)]" : ""}>确认本批次字段来源核验；未确认也可保存，保存后 review_status 维持 pending_review / needs_update。</span>
                </label>
                {!bulkSelectedSourcesComplete ? (
                  <p className="mt-2 text-xs font-semibold text-[oklch(42%_0.08_25)]">所选对象有未配置字段、来源 URL 缺失或 review_status=deprecated，暂不能确认来源核验；但只要没有必填字段错误，仍可按 pending_review / needs_update 保存。</p>
                ) : null}
                <div className="mt-3 rounded-md border border-[oklch(84%_0.036_85)] bg-[oklch(97%_0.02_85)] px-3 py-2 text-xs leading-5 text-[oklch(40%_0.065_85)]">
                  提交后以后端收到的 staging payload 为准：新增不存在对象、恢复已删除对象，跳过已存在对象，不会修改价格配置或报价工作台数据源。
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[oklch(86%_0.02_178)] px-5 py-4">
              <button
                className="h-10 rounded-md border border-[oklch(76%_0.026_178)] px-4 text-sm font-medium text-[oklch(40%_0.05_178)]"
                type="button"
                onClick={() => {
                  setBulkAddOpen(false);
                  setBulkPreviewOpen(false);
                  setBulkSelectedReferenceIds([]);
                  setBulkStagingById({});
                  setBulkSourceVerified(false);
                  setBulkNotice("");
                  setBulkConfirmOpen(false);
                  setBulkResult(null);
                }}
              >
                取消
              </button>
              <button
                className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] disabled:cursor-not-allowed disabled:bg-[oklch(72%_0.015_178)]"
                type="button"
                onClick={previewBulkAdd}
              >
                编辑本批次清单
              </button>
              <button
                className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] disabled:cursor-not-allowed disabled:bg-[oklch(72%_0.015_178)]"
                disabled={!selectedBulkReferences.length || selectedBulkValidationEntries.some((entry) => entry.issues.length) || bulkActionSummary.blocked > 0}
                type="button"
                onClick={() => setBulkConfirmOpen(true)}
              >
                批量新增/恢复
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {bulkConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] shadow-xl">
            <div className="border-b border-[oklch(86%_0.02_178)] px-5 py-4">
              <h3 className="text-lg font-semibold">确认批量新增/恢复</h3>
              <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">提交前请再次确认本批次处理范围。</p>
            </div>
            <div className="space-y-3 p-5">
              <div className="grid gap-3 md:grid-cols-2">
              <ReadOnlyField label="本次将处理对象数量" value={`${selectedBulkReferences.length}`} />
              <ReadOnlyField label="新增 / 恢复 / 跳过" value={`${bulkActionSummary.created} / ${bulkActionSummary.restored} / ${bulkActionSummary.skipped}`} />
              <ReadOnlyField label="是否已完成来源核验" value={bulkSourceVerified ? "是" : "否"} />
              </div>
              {bulkNotice ? (
                <div className="rounded-md border border-[oklch(84%_0.036_85)] bg-[oklch(97%_0.02_85)] px-3 py-2 text-sm leading-6 text-[oklch(40%_0.065_85)]">
                  {bulkNotice}
                </div>
              ) : null}
              {bulkResult ? (
                <div className="rounded-md border border-[oklch(84%_0.024_178)] bg-[oklch(96%_0.012_178)] px-3 py-2 text-xs leading-5">
                  <p className="font-semibold">返回结果：新增 {bulkResult.created_count ?? bulkResult.added_count}，恢复 {bulkResult.restored_count ?? 0}，跳过 {bulkResult.skipped_count}，失败 {bulkResult.failed_count}</p>
                  {[...(bulkResult.created_items ?? bulkResult.added), ...(bulkResult.restored_items ?? bulkResult.restored ?? []), ...(bulkResult.skipped_items ?? bulkResult.skipped), ...(bulkResult.failed_items ?? bulkResult.failed)].map((item) => (
                    <p key={`${item.status}-${item.reference_id}`} className="mt-1">
                      {item.standard_code || item.reference_id} / {item.display_code || "-"}：{item.reason}
                    </p>
                  ))}
                </div>
              ) : null}
              <div className="max-h-64 overflow-y-auto rounded-md border border-[oklch(86%_0.02_178)]">
                {selectedBulkReferences.map((reference) => (
                  <div key={reference.reference_id} className="border-b border-[oklch(88%_0.018_178)] px-3 py-2 text-sm last:border-0">
                    {(() => {
                      const staging = bulkStagingById[reference.reference_id] ?? stagingFromReference(reference);
                      return (
                        <>
                          <p className="font-semibold">{reference.standard_code} / {staging.display_code}</p>
                          <p className="text-xs text-[oklch(46%_0.045_178)]">{staging.name_cn} / {staging.name_en} · {optionLabel(jurisdictionTypeOptions, reference.jurisdiction_type)} · {staging.default_office_name_en || staging.default_office_name_cn}</p>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-[oklch(84%_0.036_85)] bg-[oklch(97%_0.02_85)] px-3 py-2 text-sm leading-6 text-[oklch(40%_0.065_85)]">
                确认按当前 staging payload 执行，不代表来源永久正确。本操作会新增不存在对象、恢复已删除对象，并跳过已存在对象；不会修改价格配置，也不会切换报价工作台数据源。
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[oklch(86%_0.02_178)] px-5 py-4">
              <button
                className="h-10 rounded-md border border-[oklch(76%_0.026_178)] px-4 text-sm font-medium text-[oklch(40%_0.05_178)]"
                disabled={bulkSubmitting}
                type="button"
                onClick={() => setBulkConfirmOpen(false)}
              >
                返回检查
              </button>
              <button
                className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] disabled:cursor-not-allowed disabled:bg-[oklch(72%_0.015_178)]"
                disabled={bulkSubmitting}
                type="button"
                onClick={() => void submitBulkAdd()}
              >
                {bulkSubmitting ? "处理中..." : "确认新增/恢复"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ApprovalPanel({
  requests,
  message,
  canReview,
  refresh,
  review,
}: {
  requests: ApprovalRequest[];
  message: string;
  canReview: boolean;
  refresh: () => Promise<void>;
  review: (requestId: string, status: "已通过" | "已拒绝") => Promise<void>;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
      <div className="flex flex-col gap-3 border-b border-[oklch(84%_0.025_178)] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">审批解锁</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            超过未转化或逾期跟进规则时，顾问需要审批通过后继续生成正式报价。
          </p>
        </div>
        <button
          className="h-10 rounded-md border border-[oklch(72%_0.035_178)] px-4 text-sm font-medium text-[oklch(34%_0.075_178)] transition hover:bg-[oklch(93%_0.018_178)]"
          type="button"
          onClick={() => void refresh()}
        >
          刷新
        </button>
      </div>
      {message ? <p className="border-b border-[oklch(88%_0.018_178)] px-5 py-3 text-sm text-[oklch(38%_0.065_178)]">{message}</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
            <tr>
              <th className="px-4 py-3">顾问</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">未转化数</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">申请理由</th>
              <th className="px-4 py-3">有效期</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[oklch(48%_0.045_178)]" colSpan={7}>
                  暂无审批解锁记录。
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-4 py-3">{request.consultant_email}</td>
                  <td className="px-4 py-3">{request.request_type}</td>
                  <td className="px-4 py-3 font-mono">{request.open_unconverted_count}</td>
                  <td className="px-4 py-3">{request.status}</td>
                  <td className="px-4 py-3">{request.reason}</td>
                  <td className="px-4 py-3">{request.valid_until ? formatDateTime(request.valid_until) : "-"}</td>
                  <td className="px-4 py-3">
                    {canReview && request.status === "待审批" ? (
                      <div className="flex gap-2">
                        <button
                          className="h-8 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-xs font-semibold text-[oklch(97%_0.008_178)]"
                          type="button"
                          onClick={() => void review(request.id, "已通过")}
                        >
                          通过
                        </button>
                        <button
                          className="h-8 rounded-md border border-[oklch(78%_0.04_28)] px-3 text-xs font-medium text-[oklch(40%_0.08_28)]"
                          type="button"
                          onClick={() => void review(request.id, "已拒绝")}
                        >
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <span className="text-[oklch(48%_0.045_178)]">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
