"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type UserRole = "consultant" | "admin" | "approver";
type UserStatus = "active" | "inactive";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

type ActiveTab = "create" | "list" | "stats" | "rules" | "users";

type LoginResponse = {
  token: string;
  user: User;
};

type Country = {
  code: string;
  name_cn: string;
  name_en: string;
  default_currency: string;
  enabled: boolean;
};

type FeeRule = {
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

type TranslationRule = {
  id: string;
  item_name: string;
  unit: string;
  unit_price: string;
  currency: string;
  min_fee: string;
  enabled: boolean;
  is_default: boolean;
};

type QuotationItem = {
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

type Quotation = QuotationForm & {
  id: string;
  quotation_no: string;
  consultant_name: string;
  items: QuotationItem[];
  current_stage_total: string;
  future_stage_total: string;
  total_amount: string;
  is_sent: boolean;
  is_confirmed: boolean;
  is_opened: boolean;
  created_at: string;
  updated_at: string;
};

type FollowupMethod = "邮件" | "电话" | "微信" | "会议" | "其他";

type Followup = {
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

type FollowupForm = {
  method: FollowupMethod;
  content: string;
  next_followup_date: string;
};

type Bootstrap = {
  users: User[];
  countries: Country[];
  application_types: string[];
  filing_routes: string[];
  currencies: string[];
  statuses: string[];
  fee_rules?: FeeRule[];
  translation_rules?: TranslationRule[];
};

type QuotationForm = {
  client_name: string;
  client_contact: string;
  consultant_email: string;
  country_code: string;
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

type GeneratedQuotation = {
  items: QuotationItem[];
  current_stage_total: string;
  future_stage_total: string;
  total_amount: string;
  display_currency: string;
  important_notes: string[];
};

type Statistics = {
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

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const roleOptions: { label: string; value: UserRole }[] = [
  { label: "顾问", value: "consultant" },
  { label: "管理员", value: "admin" },
  { label: "审批人", value: "approver" },
];
const statusOptions: { label: string; value: UserStatus }[] = [
  { label: "启用", value: "active" },
  { label: "禁用", value: "inactive" },
];
const followupMethodOptions: FollowupMethod[] = ["邮件", "电话", "微信", "会议", "其他"];
const initialUserForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "consultant",
  status: "active",
};
const initialFollowupForm: FollowupForm = {
  method: "邮件",
  content: "",
  next_followup_date: "",
};

const fallbackBootstrap: Bootstrap = {
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
  statuses: ["草稿", "已生成报价", "已发送客户", "跟进中", "需价格调整", "已确认", "已开卷", "未成交", "已作废"],
  fee_rules: [],
  translation_rules: [],
};

const initialForm: QuotationForm = {
  client_name: "智造未来科技有限公司",
  client_contact: "Lina",
  consultant_email: "suri@example.com",
  country_code: "US",
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

const importantNotes = [
  "本报价基于正常新申请程序。",
  "非常规事项如客户另有需求，将另行报价确认。",
  "审查、授权及年费阶段费用为后续预估，实际发生时另行确认。",
];

export default function Home() {
  const [bootstrap, setBootstrap] = useState<Bootstrap>(fallbackBootstrap);
  const [form, setForm] = useState<QuotationForm>(initialForm);
  const [generated, setGenerated] = useState<GeneratedQuotation | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState<string>(fallbackBootstrap.users[0].email);
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [connection, setConnection] = useState<"online" | "fallback">("fallback");
  const [activeTab, setActiveTab] = useState<ActiveTab>("create");
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
  const [translationRules, setTranslationRules] = useState<TranslationRule[]>([]);
  const [rulesMessage, setRulesMessage] = useState<string>("");
  const [users, setUsers] = useState<User[]>(fallbackBootstrap.users);
  const [userForm, setUserForm] = useState<UserForm>(initialUserForm);
  const [newPasswordByUserId, setNewPasswordByUserId] = useState<Record<string, string>>({});
  const [usersMessage, setUsersMessage] = useState<string>("");
  const [followupsByQuotationId, setFollowupsByQuotationId] = useState<Record<string, Followup[]>>({});
  const [followupForm, setFollowupForm] = useState<FollowupForm>(initialFollowupForm);
  const [followupMessage, setFollowupMessage] = useState<string>("");
  const [serverStatistics, setServerStatistics] = useState<Statistics | null>(null);
  const [quoteFilters, setQuoteFilters] = useState({
    keyword: "",
    country: "",
    status: "",
    consultant: "",
    dateFrom: "",
    dateTo: "",
  });

  const previewPayload = useMemo<QuotationForm>(() => form, [form]);

  const statistics = useMemo<Statistics>(() => {
    if (serverStatistics) {
      return serverStatistics;
    }
    const quoteCount = quotations.length;
    const opened = quotations.filter((quotation) => quotation.is_opened).length;
    const total = quotations.reduce((sum, quotation) => sum + Number(quotation.total_amount), 0);
    const current = quotations.reduce((sum, quotation) => sum + Number(quotation.current_stage_total), 0);
    const future = quotations.reduce((sum, quotation) => sum + Number(quotation.future_stage_total), 0);
    return {
      quote_count: quoteCount,
      current_stage_total: String(current),
      future_stage_total: String(future),
      total_amount: String(total),
      sent_count: quotations.filter((quotation) => quotation.is_sent).length,
      confirmed_count: quotations.filter((quotation) => quotation.is_confirmed).length,
      opened_count: opened,
      lost_count: quotations.filter((quotation) => quotation.status === "未成交").length,
      open_rate: quoteCount ? String(opened / quoteCount) : "0",
    };
  }, [quotations, serverStatistics]);

  useEffect(() => {
    async function loadBootstrap(): Promise<void> {
      try {
        const response = await fetch(`${apiBase}/api/v1/bootstrap`);
        if (!response.ok) {
          throw new Error("bootstrap failed");
        }
        const data = (await response.json()) as Bootstrap;
        setBootstrap(data);
        setUsers(data.users);
        setFeeRules(data.fee_rules ?? []);
        setTranslationRules(data.translation_rules ?? []);
        setLoginEmail(data.users[0]?.email ?? "");
        setConnection("online");
      } catch {
        setConnection("fallback");
      }
    }
    void loadBootstrap();
  }, []);

  useEffect(() => {
    async function generatePreview(): Promise<void> {
      try {
        const response = await fetch(`${apiBase}/api/v1/quotations/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(previewPayload),
        });
        if (!response.ok) {
          throw new Error("generate failed");
        }
        setGenerated((await response.json()) as GeneratedQuotation);
        setConnection("online");
      } catch {
        setGenerated(buildLocalPreview(previewPayload));
        setConnection("fallback");
      }
    }
    void generatePreview();
  }, [previewPayload]);

  useEffect(() => {
    if (activeTab !== "rules" || selectedUser?.role !== "admin") {
      return;
    }
    async function loadRules(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const [feeResponse, translationResponse] = await Promise.all([
          fetch(`${apiBase}/api/v1/fee-rules`, {
            headers: authHeaders(authToken, selectedUser.email),
          }),
          fetch(`${apiBase}/api/v1/translation-rules`, {
            headers: authHeaders(authToken, selectedUser.email),
          }),
        ]);
        if (!feeResponse.ok || !translationResponse.ok) {
          throw new Error("rules failed");
        }
        setFeeRules((await feeResponse.json()) as FeeRule[]);
        setTranslationRules((await translationResponse.json()) as TranslationRule[]);
        setConnection("online");
      } catch {
        setConnection("fallback");
        setRulesMessage("规则接口暂不可用，请确认后端已启动且当前账号为管理员。");
      }
    }
    void loadRules();
  }, [activeTab, selectedUser, authToken]);

  useEffect(() => {
    if (activeTab !== "users" || selectedUser?.role !== "admin") {
      return;
    }
    async function loadUsers(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/api/v1/users`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        if (!response.ok) {
          throw new Error("users failed");
        }
        const data = (await response.json()) as User[];
        setUsers(data);
        setBootstrap((current) => ({ ...current, users: data }));
        setConnection("online");
      } catch {
        setConnection("fallback");
        setUsersMessage("用户接口暂不可用，请确认后端已启动且当前账号为管理员。");
      }
    }
    void loadUsers();
  }, [activeTab, selectedUser, authToken]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }
    async function loadQuotations(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/api/v1/quotations`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        if (!response.ok) {
          throw new Error("quotations failed");
        }
        const data = (await response.json()) as { items: Quotation[]; total: number };
        setQuotations(data.items);
        setSelectedQuotationId(data.items[0]?.id ?? null);
        setConnection("online");
      } catch {
        setConnection("fallback");
      }
    }
    void loadQuotations();
  }, [selectedUser, authToken]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }
    async function loadStatistics(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/api/v1/statistics`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        if (!response.ok) {
          throw new Error("statistics failed");
        }
        setServerStatistics((await response.json()) as Statistics);
        setConnection("online");
      } catch {
        setServerStatistics(null);
        setConnection("fallback");
      }
    }
    void loadStatistics();
  }, [selectedUser, quotations, authToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }
    const payload = { ...form, consultant_email: selectedUser.email };
    try {
      const response = await fetch(`${apiBase}/api/v1/quotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("create failed");
      }
      const quotation = (await response.json()) as Quotation;
      setQuotations((current) => [quotation, ...current]);
      setServerStatistics(null);
      setSelectedQuotationId(quotation.id);
      setConnection("online");
      setActiveTab("list");
    } catch {
      const quotation = buildLocalQuotation(payload, selectedUser, generated ?? buildLocalPreview(payload));
      setQuotations((current) => [quotation, ...current]);
      setServerStatistics(null);
      setSelectedQuotationId(quotation.id);
      setConnection("fallback");
      setActiveTab("list");
    }
  }

  function updateField<K extends keyof QuotationForm>(key: K, value: QuotationForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function updateStatus(id: string, status: string): Promise<void> {
    const previous = quotations;
    setQuotations((current) =>
      current.map((quotation) =>
        quotation.id === id
          ? {
              ...quotation,
              status,
              is_sent: ["已发送客户", "跟进中", "已确认", "已开卷"].includes(status),
              is_confirmed: ["已确认", "已开卷"].includes(status),
              is_opened: status === "已开卷",
            }
          : quotation,
      ),
    );
    if (!selectedUser) {
      return;
    }
    try {
      const response = await fetch(`${apiBase}/api/v1/quotations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("status failed");
      }
      const updated = (await response.json()) as Quotation;
      setQuotations((current) =>
        current.map((quotation) => (quotation.id === updated.id ? updated : quotation)),
      );
      setServerStatistics(null);
      setConnection("online");
    } catch {
      setQuotations(previous);
      setConnection("fallback");
    }
  }

  async function saveFeeRule(rule: FeeRule): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setRulesMessage("");
    const response = await fetch(`${apiBase}/api/v1/fee-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        amount: Number(rule.amount),
        currency: rule.currency,
        is_default: rule.is_default,
        is_active: rule.is_active,
        remark: rule.remark,
      }),
    });
    if (!response.ok) {
      setRulesMessage("费用规则保存失败。");
      return;
    }
    const updated = (await response.json()) as FeeRule;
    setFeeRules((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setRulesMessage("费用规则已保存，新报价会使用最新规则。");
  }

  async function saveTranslationRule(rule: TranslationRule): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setRulesMessage("");
    const response = await fetch(`${apiBase}/api/v1/translation-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        item_name: rule.item_name,
        unit: rule.unit,
        unit_price: Number(rule.unit_price),
        currency: rule.currency,
        min_fee: Number(rule.min_fee),
        enabled: rule.enabled,
        is_default: rule.is_default,
      }),
    });
    if (!response.ok) {
      setRulesMessage("翻译费规则保存失败。");
      return;
    }
    const updated = (await response.json()) as TranslationRule;
    setTranslationRules((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setRulesMessage("翻译费规则已保存，新报价会使用最新规则。");
  }

  function syncUsers(nextUsers: User[]): void {
    setUsers(nextUsers);
    setBootstrap((current) => ({ ...current, users: nextUsers }));
  }

  async function createManagedUser(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }
    setUsersMessage("");
    const response = await fetch(`${apiBase}/api/v1/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify(userForm),
    });
    if (!response.ok) {
      setUsersMessage(response.status === 409 ? "邮箱已存在，请换一个邮箱。" : "新增用户失败。");
      return;
    }
    const created = (await response.json()) as User;
    syncUsers([...users, created]);
    setUserForm(initialUserForm);
    setUsersMessage("用户已新增。");
    setConnection("online");
  }

  async function saveManagedUser(user: User): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setUsersMessage("");
    const response = await fetch(`${apiBase}/api/v1/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      }),
    });
    if (!response.ok) {
      setUsersMessage(response.status === 409 ? "邮箱已存在，请换一个邮箱。" : "用户保存失败。");
      return;
    }
    const updated = (await response.json()) as User;
    syncUsers(users.map((item) => (item.id === updated.id ? updated : item)));
    if (selectedUser.id === updated.id) {
      setSelectedUser(updated);
    }
    setUsersMessage("用户信息已保存。");
    setConnection("online");
  }

  async function resetManagedPassword(userId: string): Promise<void> {
    if (!selectedUser) {
      return;
    }
    const password = newPasswordByUserId[userId] ?? "";
    if (password.length < 6) {
      setUsersMessage("新密码至少 6 位。");
      return;
    }
    setUsersMessage("");
    const response = await fetch(`${apiBase}/api/v1/users/${userId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setUsersMessage("密码重置失败。");
      return;
    }
    setNewPasswordByUserId((current) => ({ ...current, [userId]: "" }));
    setUsersMessage("密码已重置。");
    setConnection("online");
  }

  async function createFollowup(quotation: Quotation, event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }
    if (!followupForm.content.trim()) {
      setFollowupMessage("请填写跟进内容。");
      return;
    }
    setFollowupMessage("");
    const response = await fetch(`${apiBase}/api/v1/quotations/${quotation.id}/followups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        method: followupForm.method,
        content: followupForm.content.trim(),
        next_followup_date: followupForm.next_followup_date || null,
      }),
    });
    if (!response.ok) {
      setFollowupMessage("跟进记录保存失败。");
      return;
    }
    const created = (await response.json()) as Followup;
    setFollowupsByQuotationId((current) => ({
      ...current,
      [quotation.id]: [created, ...(current[quotation.id] ?? [])],
    }));
    setFollowupForm(initialFollowupForm);
    setFollowupMessage("跟进记录已保存。");
    setConnection("online");
  }

  const visibleQuotations =
    selectedUser?.role === "consultant"
      ? quotations.filter((quotation) => quotation.consultant_email === selectedUser.email)
      : quotations;
  const filteredQuotations = visibleQuotations.filter((quotation) => {
    const keyword = quoteFilters.keyword.trim().toLowerCase();
    const createdDate = quotation.created_at.slice(0, 10);
    const matchesKeyword =
      !keyword ||
      quotation.client_name.toLowerCase().includes(keyword) ||
      quotation.quotation_no.toLowerCase().includes(keyword) ||
      quotation.case_title.toLowerCase().includes(keyword);
    const matchesCountry = !quoteFilters.country || quotation.country_code === quoteFilters.country;
    const matchesStatus = !quoteFilters.status || quotation.status === quoteFilters.status;
    const matchesConsultant =
      !quoteFilters.consultant || quotation.consultant_email === quoteFilters.consultant;
    const matchesDateFrom = !quoteFilters.dateFrom || createdDate >= quoteFilters.dateFrom;
    const matchesDateTo = !quoteFilters.dateTo || createdDate <= quoteFilters.dateTo;
    return (
      matchesKeyword &&
      matchesCountry &&
      matchesStatus &&
      matchesConsultant &&
      matchesDateFrom &&
      matchesDateTo
    );
  });
  const selectedQuotation =
    filteredQuotations.find((quotation) => quotation.id === selectedQuotationId) ??
    filteredQuotations[0] ??
    null;

  useEffect(() => {
    if (!selectedUser || !selectedQuotation || followupsByQuotationId[selectedQuotation.id]) {
      return;
    }
    async function loadFollowups(): Promise<void> {
      if (!selectedUser || !selectedQuotation) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/api/v1/quotations/${selectedQuotation.id}/followups`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        if (!response.ok) {
          throw new Error("followups failed");
        }
        const data = (await response.json()) as Followup[];
        setFollowupsByQuotationId((current) => ({ ...current, [selectedQuotation.id]: data }));
        setFollowupMessage("");
        setConnection("online");
      } catch {
        setFollowupMessage("跟进记录接口暂不可用。");
        setConnection("fallback");
      }
    }
    void loadFollowups();
  }, [selectedUser, selectedQuotation, authToken, followupsByQuotationId]);

  if (!selectedUser) {
    return (
      <LoginScreen
        connection={connection}
        loginEmail={loginEmail}
        loginPassword={loginPassword}
        loginError={loginError}
        setLoginEmail={setLoginEmail}
        setLoginPassword={setLoginPassword}
        onLogin={async () => {
          setLoginError("");
          try {
            const response = await fetch(`${apiBase}/api/v1/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            if (!response.ok) {
              throw new Error("login failed");
            }
            const data = (await response.json()) as LoginResponse;
            setAuthToken(data.token);
            setSelectedUser(data.user);
            updateField("consultant_email", data.user.email);
            setActiveTab(data.user.role === "admin" ? "list" : "create");
          } catch {
            setLoginError("邮箱或密码不正确。");
          }
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[oklch(97%_0.012_178)] text-[oklch(18%_0.025_180)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-[oklch(82%_0.025_178)] bg-[oklch(94%_0.018_178)] px-5 py-6 lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(45%_0.07_178)]">ZYIP Quote</p>
            <h1 className="mt-2 text-2xl font-semibold">新案基础报价</h1>
            <p className="mt-3 text-sm text-[oklch(42%_0.045_178)]">
              {selectedUser.name} · {selectedUser.role === "admin" ? "管理员" : "顾问"}
            </p>
          </div>
          <nav className="space-y-2">
            {selectedUser.role === "consultant" ? (
              <TabButton active={activeTab === "create"} label="新建报价" onClick={() => setActiveTab("create")} />
            ) : null}
            <TabButton active={activeTab === "list"} label={selectedUser.role === "admin" ? "全部报价" : "我的报价"} onClick={() => setActiveTab("list")} />
            <TabButton active={activeTab === "stats"} label="统计看板" onClick={() => setActiveTab("stats")} />
            {selectedUser.role === "admin" ? (
              <TabButton active={activeTab === "rules"} label="价格规则" onClick={() => setActiveTab("rules")} />
            ) : null}
            {selectedUser.role === "admin" ? (
              <TabButton active={activeTab === "users"} label="用户管理" onClick={() => setActiveTab("users")} />
            ) : null}
            <button
              className="h-10 w-full rounded-md px-4 text-left text-sm font-medium text-[oklch(40%_0.05_28)] transition hover:bg-[oklch(91%_0.026_28)]"
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setAuthToken("");
                setLoginPassword("");
                setSelectedQuotationId(null);
              }}
            >
              退出登录
            </button>
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[oklch(84%_0.025_178)] bg-[oklch(98%_0.008_178)] px-4 py-4 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-[oklch(44%_0.045_178)]">内部报价工作台</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-normal">标准规则生成报价，记录后续跟进</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-md px-3 py-2 text-sm font-medium ${connection === "online" ? "bg-[oklch(88%_0.08_155)] text-[oklch(30%_0.09_155)]" : "bg-[oklch(91%_0.045_75)] text-[oklch(42%_0.08_75)]"}`}>
                  {connection === "online" ? "API 已连接" : "本地演示数据"}
                </span>
                <span className="rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 py-2 text-sm">
                  {selectedUser.name}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2 lg:hidden">
              {selectedUser.role === "consultant" ? (
                <TabButton active={activeTab === "create"} label="新建" onClick={() => setActiveTab("create")} />
              ) : null}
              <TabButton active={activeTab === "list"} label="报价" onClick={() => setActiveTab("list")} />
              <TabButton active={activeTab === "stats"} label="统计" onClick={() => setActiveTab("stats")} />
              {selectedUser.role === "admin" ? (
                <TabButton active={activeTab === "rules"} label="规则" onClick={() => setActiveTab("rules")} />
              ) : null}
              {selectedUser.role === "admin" ? (
                <TabButton active={activeTab === "users"} label="用户" onClick={() => setActiveTab("users")} />
              ) : null}
            </div>
          </header>

          <div className="grid flex-1 gap-6 px-4 py-6 sm:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              {activeTab === "create" && selectedUser.role === "consultant" ? (
                <QuotationFormView
                  bootstrap={bootstrap}
                  form={form}
                  generated={generated}
                  onSubmit={handleSubmit}
                  updateField={updateField}
                />
              ) : null}
              {activeTab === "list" ? (
              <QuotationList
                quotations={filteredQuotations}
                allQuotations={visibleQuotations}
                filters={quoteFilters}
                setFilters={setQuoteFilters}
                users={users}
                countries={bootstrap.countries}
                statuses={bootstrap.statuses}
                updateStatus={updateStatus}
                connection={connection}
                selectedQuotationId={selectedQuotation?.id ?? null}
                onSelectQuotation={setSelectedQuotationId}
                isAdmin={selectedUser.role === "admin"}
              />
              ) : null}
              {activeTab === "stats" ? <StatisticsPanel statistics={statistics} /> : null}
              {activeTab === "rules" && selectedUser.role === "admin" ? (
                <RulesPanel
                  feeRules={feeRules}
                  translationRules={translationRules}
                  message={rulesMessage}
                  setFeeRules={setFeeRules}
                  setTranslationRules={setTranslationRules}
                  saveFeeRule={saveFeeRule}
                  saveTranslationRule={saveTranslationRule}
                />
              ) : null}
              {activeTab === "users" && selectedUser.role === "admin" ? (
                <UsersPanel
                  currentUserId={selectedUser.id}
                  users={users}
                  userForm={userForm}
                  message={usersMessage}
                  newPasswordByUserId={newPasswordByUserId}
                  setUserForm={setUserForm}
                  setUsers={syncUsers}
                  setNewPasswordByUserId={setNewPasswordByUserId}
                  createUser={createManagedUser}
                  saveUser={saveManagedUser}
                  resetPassword={resetManagedPassword}
                />
              ) : null}
            </div>
            <aside className="space-y-4">
              {selectedQuotation ? (
                <QuotationDetail
                  quotation={selectedQuotation}
                  connection={connection}
                  followups={followupsByQuotationId[selectedQuotation.id] ?? []}
                  followupForm={followupForm}
                  followupMessage={followupMessage}
                  setFollowupForm={setFollowupForm}
                  createFollowup={createFollowup}
                />
              ) : (
                <SummaryPanel generated={generated} statistics={statistics} />
              )}
              <NotesPanel notes={generated?.important_notes ?? importantNotes} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginScreen({
  connection,
  loginEmail,
  loginPassword,
  loginError,
  setLoginEmail,
  setLoginPassword,
  onLogin,
}: {
  connection: "online" | "fallback";
  loginEmail: string;
  loginPassword: string;
  loginError: string;
  setLoginEmail: (email: string) => void;
  setLoginPassword: (password: string) => void;
  onLogin: () => Promise<void>;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[oklch(96%_0.012_178)] px-4 text-[oklch(18%_0.025_180)]">
      <section className="w-full max-w-md rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(45%_0.07_178)]">
          ZYIP Quote
        </p>
        <h1 className="mt-3 text-2xl font-semibold">登录报价系统</h1>
        <p className="mt-2 text-sm leading-6 text-[oklch(46%_0.045_178)]">
          顾问只能创建和查看自己的报价；管理员可以查看全部报价，并维护后端价格规则。
        </p>
        <label className="mt-6 block text-sm">
          <span className="mb-1 block font-medium">邮箱</span>
          <input
            className="h-11 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 outline-none transition focus:border-[oklch(47%_0.1_178)]"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="mb-1 block font-medium">密码</span>
          <input
            className="h-11 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 outline-none transition focus:border-[oklch(47%_0.1_178)]"
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void onLogin();
              }
            }}
          />
        </label>
        {loginError ? <p className="mt-3 text-sm font-medium text-[oklch(45%_0.12_28)]">{loginError}</p> : null}
        <button
          className="mt-5 h-11 w-full rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)]"
          type="button"
          onClick={() => void onLogin()}
        >
          进入系统
        </button>
        <p className="mt-4 text-xs text-[oklch(48%_0.045_178)]">
          {connection === "online" ? "API 已连接" : "当前使用本地演示账号"}
        </p>
        <div className="mt-3 rounded-md bg-[oklch(94%_0.018_178)] p-3 text-xs leading-5 text-[oklch(42%_0.045_178)]">
          <p>演示账号：</p>
          <p>顾问：suri@example.com / Suri123456</p>
          <p>管理员：admin@example.com / Admin123456</p>
        </div>
      </section>
    </main>
  );
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`h-10 rounded-md px-4 text-left text-sm font-medium transition ${active ? "bg-[oklch(35%_0.09_178)] text-[oklch(97%_0.008_178)]" : "text-[oklch(34%_0.04_178)] hover:bg-[oklch(90%_0.022_178)]"}`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function UsersPanel({
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

function RulesPanel({
  feeRules,
  translationRules,
  message,
  setFeeRules,
  setTranslationRules,
  saveFeeRule,
  saveTranslationRule,
}: {
  feeRules: FeeRule[];
  translationRules: TranslationRule[];
  message: string;
  setFeeRules: (rules: FeeRule[]) => void;
  setTranslationRules: (rules: TranslationRule[]) => void;
  saveFeeRule: (rule: FeeRule) => Promise<void>;
  saveTranslationRule: (rule: TranslationRule) => Promise<void>;
}) {
  function updateFeeRule(id: string, patch: Partial<FeeRule>): void {
    setFeeRules(feeRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  function updateTranslationRule(id: string, patch: Partial<TranslationRule>): void {
    setTranslationRules(
      translationRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <h3 className="text-xl font-semibold">费用规则</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            修改后只影响新创建的报价，历史报价保持原明细。
          </p>
          {message ? <p className="mt-2 text-sm font-medium text-[oklch(38%_0.08_155)]">{message}</p> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">国家</th>
                <th className="px-3 py-3">类型</th>
                <th className="px-3 py-3">途径</th>
                <th className="px-3 py-3">阶段</th>
                <th className="px-3 py-3">项目</th>
                <th className="px-3 py-3">金额</th>
                <th className="px-3 py-3">币种</th>
                <th className="px-3 py-3">启用</th>
                <th className="px-3 py-3">默认</th>
                <th className="px-3 py-3">备注</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {feeRules.map((rule) => (
                <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-3">{rule.country_code}</td>
                  <td className="px-3 py-3">{rule.application_type}</td>
                  <td className="px-3 py-3">{rule.filing_route}</td>
                  <td className="px-3 py-3">{rule.stage}</td>
                  <td className="px-3 py-3">{rule.item_name}</td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right"
                      min={0}
                      type="number"
                      value={rule.amount}
                      onChange={(event) => updateFeeRule(rule.id, { amount: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-20 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.currency}
                      onChange={(event) => updateFeeRule(rule.id, { currency: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.is_active}
                      type="checkbox"
                      onChange={(event) => updateFeeRule(rule.id, { is_active: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.is_default}
                      type="checkbox"
                      onChange={(event) => updateFeeRule(rule.id, { is_default: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-52 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.remark}
                      onChange={(event) => updateFeeRule(rule.id, { remark: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
                      type="button"
                      onClick={() => void saveFeeRule(rule)}
                    >
                      保存
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <h3 className="text-xl font-semibold">翻译费规则</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">项目名称</th>
                <th className="px-3 py-3">单位</th>
                <th className="px-3 py-3">单价</th>
                <th className="px-3 py-3">最低收费</th>
                <th className="px-3 py-3">币种</th>
                <th className="px-3 py-3">启用</th>
                <th className="px-3 py-3">默认</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {translationRules.map((rule) => (
                <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-56 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.item_name}
                      onChange={(event) => updateTranslationRule(rule.id, { item_name: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-16 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.unit}
                      onChange={(event) => updateTranslationRule(rule.id, { unit: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right"
                      min={0}
                      type="number"
                      value={rule.unit_price}
                      onChange={(event) => updateTranslationRule(rule.id, { unit_price: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right"
                      min={0}
                      type="number"
                      value={rule.min_fee}
                      onChange={(event) => updateTranslationRule(rule.id, { min_fee: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-20 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.currency}
                      onChange={(event) => updateTranslationRule(rule.id, { currency: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.enabled}
                      type="checkbox"
                      onChange={(event) => updateTranslationRule(rule.id, { enabled: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.is_default}
                      type="checkbox"
                      onChange={(event) => updateTranslationRule(rule.id, { is_default: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
                      type="button"
                      onClick={() => void saveTranslationRule(rule)}
                    >
                      保存
                    </button>
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

function QuotationFormView({
  bootstrap,
  form,
  generated,
  onSubmit,
  updateField,
}: {
  bootstrap: Bootstrap;
  form: QuotationForm;
  generated: GeneratedQuotation | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  updateField: <K extends keyof QuotationForm>(key: K, value: QuotationForm[K]) => void;
}) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">报价变量</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">顾问填写变量，底层价格规则由后台控制。</p>
          </div>
          <button className="h-10 rounded-md bg-[oklch(37%_0.105_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(32%_0.115_178)]" type="submit">
            生成并保存
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput label="客户名称" value={form.client_name} onChange={(value) => updateField("client_name", value)} />
          <TextInput label="客户联系人" value={form.client_contact} onChange={(value) => updateField("client_contact", value)} />
          <TextInput label="案件名称" value={form.case_title} onChange={(value) => updateField("case_title", value)} />
          <SelectInput label="国家/地区" value={form.country_code} options={bootstrap.countries.map((country) => ({ label: `${country.name_cn} (${country.code})`, value: country.code }))} onChange={(value) => updateField("country_code", value)} />
          <SelectInput label="申请类型" value={form.application_type} options={bootstrap.application_types.map(toOption)} onChange={(value) => updateField("application_type", value)} />
          <SelectInput label="申请途径" value={form.filing_route} options={bootstrap.filing_routes.map(toOption)} onChange={(value) => updateField("filing_route", value)} />
          <SelectInput label="币种" value={form.currency} options={bootstrap.currencies.map(toOption)} onChange={(value) => updateField("currency", value)} />
          <NumberInput label="申请人数量" value={form.applicant_count} onChange={(value) => updateField("applicant_count", value)} />
          <NumberInput label="优先权数量" value={form.priority_count} onChange={(value) => updateField("priority_count", value)} />
          <NumberInput label="权利要求项数" value={form.claim_count} onChange={(value) => updateField("claim_count", value)} />
          <NumberInput label="说明书页数" value={form.description_pages} onChange={(value) => updateField("description_pages", value)} />
          <NumberInput label="附图页数" value={form.drawing_pages} onChange={(value) => updateField("drawing_pages", value)} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr_1fr]">
          <label className="flex h-11 items-center gap-3 rounded-md border border-[oklch(80%_0.026_178)] px-3 text-sm">
            <input
              checked={form.needs_translation}
              type="checkbox"
              onChange={(event) => updateField("needs_translation", event.target.checked)}
            />
            需要翻译
          </label>
          <NumberInput label="翻译数量一" value={form.translation_quantity_one} onChange={(value) => updateField("translation_quantity_one", value)} />
          <NumberInput label="翻译数量二" value={form.translation_quantity_two} onChange={(value) => updateField("translation_quantity_two", value)} />
        </div>
      </section>

      <FeeTable generated={generated} />
    </form>
  );
}

function FeeTable({ generated }: { generated: GeneratedQuotation | null }) {
  const items = generated?.items ?? [];
  return (
    <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
      <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
        <h3 className="text-xl font-semibold">报价明细</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
            <tr>
              <th className="px-4 py-3">阶段</th>
              <th className="px-4 py-3">费用项目</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3 text-right">金额</th>
              <th className="px-4 py-3">币种</th>
              <th className="px-4 py-3">性质</th>
              <th className="px-4 py-3">备注</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.id}-${item.sort_order}`} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                <td className="px-4 py-3 font-medium">{item.stage}</td>
                <td className="px-4 py-3">{item.item_name}</td>
                <td className="px-4 py-3">{item.fee_type}</td>
                <td className="px-4 py-3 text-right font-mono">{formatMoney(item.amount, item.currency)}</td>
                <td className="px-4 py-3">{item.currency}</td>
                <td className="px-4 py-3">{item.cost_nature}</td>
                <td className="px-4 py-3 text-[oklch(46%_0.045_178)]">{item.remark || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QuotationList({
  quotations,
  allQuotations,
  filters,
  setFilters,
  users,
  countries,
  statuses,
  updateStatus,
  connection,
  selectedQuotationId,
  onSelectQuotation,
  isAdmin,
}: {
  quotations: Quotation[];
  allQuotations: Quotation[];
  filters: {
    keyword: string;
    country: string;
    status: string;
    consultant: string;
    dateFrom: string;
    dateTo: string;
  };
  setFilters: (filters: {
    keyword: string;
    country: string;
    status: string;
    consultant: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
  users: User[];
  countries: Country[];
  statuses: string[];
  updateStatus: (id: string, status: string) => Promise<void>;
  connection: "online" | "fallback";
  selectedQuotationId: string | null;
  onSelectQuotation: (id: string) => void;
  isAdmin: boolean;
}) {
  function exportQuotation(id: string): void {
    window.open(`${apiBase}/api/v1/quotations/${id}/export`, "_blank", "noopener,noreferrer");
  }

  function updateFilter(key: keyof typeof filters, value: string): void {
    setFilters({ ...filters, [key]: value });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
      <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
        <h3 className="text-xl font-semibold">报价记录</h3>
        <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
          当前显示 {quotations.length} / {allQuotations.length} 份报价
        </p>
      </div>
      <div className="border-b border-[oklch(86%_0.02_178)] px-5 py-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="block text-sm xl:col-span-2">
            <span className="mb-1 block font-medium">关键词</span>
            <input
              className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
              placeholder="客户、编号、案件"
              value={filters.keyword}
              onChange={(event) => updateFilter("keyword", event.target.value)}
            />
          </label>
          <SelectInput
            label="国家/地区"
            value={filters.country}
            options={[{ label: "全部", value: "" }, ...countries.map((country) => ({ label: `${country.name_cn} (${country.code})`, value: country.code }))]}
            onChange={(value) => updateFilter("country", value)}
          />
          <SelectInput
            label="状态"
            value={filters.status}
            options={[{ label: "全部", value: "" }, ...statuses.map(toOption)]}
            onChange={(value) => updateFilter("status", value)}
          />
          {isAdmin ? (
            <SelectInput
              label="顾问"
              value={filters.consultant}
              options={[
                { label: "全部", value: "" },
                ...users
                  .filter((user) => user.role === "consultant")
                  .map((user) => ({ label: user.name, value: user.email })),
              ]}
              onChange={(value) => updateFilter("consultant", value)}
            />
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block font-medium">起始日期</span>
            <input
              className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">结束日期</span>
            <input
              className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
            />
          </label>
        </div>
        <button
          className="mt-3 h-9 rounded-md border border-[oklch(74%_0.03_178)] px-3 text-sm font-medium text-[oklch(34%_0.06_178)] hover:bg-[oklch(92%_0.024_178)]"
          type="button"
          onClick={() =>
            setFilters({
              keyword: "",
              country: "",
              status: "",
              consultant: "",
              dateFrom: "",
              dateTo: "",
            })
          }
        >
          清空筛选
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
            <tr>
              <th className="px-4 py-3">报价编号</th>
              <th className="px-4 py-3">客户</th>
              <th className="px-4 py-3">顾问</th>
              <th className="px-4 py-3">国家</th>
              <th className="px-4 py-3 text-right">金额</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[oklch(48%_0.045_178)]" colSpan={7}>
                  暂无报价记录，先生成一份报价。
                </td>
              </tr>
            ) : (
              quotations.map((quotation) => (
                <tr
                  key={quotation.id}
                  className={`border-b border-[oklch(88%_0.018_178)] last:border-0 ${selectedQuotationId === quotation.id ? "bg-[oklch(94%_0.022_178)]" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-xs">{quotation.quotation_no}</td>
                  <td className="px-4 py-3 font-medium">{quotation.client_name}</td>
                  <td className="px-4 py-3">{quotation.consultant_name}</td>
                  <td className="px-4 py-3">{quotation.country_code}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatMoney(quotation.total_amount, quotation.currency)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="h-9 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-2"
                      value={quotation.status}
                      onChange={(event) => void updateStatus(quotation.id, event.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)]"
                        type="button"
                        onClick={() => onSelectQuotation(quotation.id)}
                      >
                        查看详情
                      </button>
                    <button
                      className="h-9 rounded-md border border-[oklch(72%_0.045_178)] px-3 text-sm font-medium text-[oklch(32%_0.075_178)] transition hover:bg-[oklch(92%_0.026_178)] disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={connection === "fallback"}
                      type="button"
                      onClick={() => exportQuotation(quotation.id)}
                    >
                      导出 Excel
                    </button>
                    </div>
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

function QuotationDetail({
  quotation,
  connection,
  followups,
  followupForm,
  followupMessage,
  setFollowupForm,
  createFollowup,
}: {
  quotation: Quotation;
  connection: "online" | "fallback";
  followups: Followup[];
  followupForm: FollowupForm;
  followupMessage: string;
  setFollowupForm: (form: FollowupForm) => void;
  createFollowup: (quotation: Quotation, event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  function exportQuotation(): void {
    window.open(`${apiBase}/api/v1/quotations/${quotation.id}/export`, "_blank", "noopener,noreferrer");
  }

  const basicRows = [
    ["报价编号", quotation.quotation_no],
    ["客户名称", quotation.client_name],
    ["客户联系人", quotation.client_contact || "-"],
    ["顾问", quotation.consultant_name],
    ["国家/地区", quotation.country_code],
    ["申请类型", quotation.application_type],
    ["申请途径", quotation.filing_route],
    ["案件名称", quotation.case_title || "-"],
    ["状态", quotation.status],
  ];

  return (
    <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">报价详情</h3>
          <p className="mt-1 break-all font-mono text-xs text-[oklch(46%_0.045_178)]">{quotation.quotation_no}</p>
        </div>
        <button
          className="h-9 shrink-0 rounded-md border border-[oklch(72%_0.045_178)] px-3 text-sm font-medium text-[oklch(32%_0.075_178)] transition hover:bg-[oklch(92%_0.026_178)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={connection === "fallback"}
          type="button"
          onClick={exportQuotation}
        >
          导出
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
        {basicRows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-[oklch(48%_0.045_178)]">{label}</dt>
            <dd className="min-w-0 break-words font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-[oklch(86%_0.02_178)] pt-4">
        <SummaryRow label="当前阶段" value={formatMoney(quotation.current_stage_total, quotation.currency)} />
        <SummaryRow label="后续预估" value={formatMoney(quotation.future_stage_total, quotation.currency)} />
        <SummaryRow label="全流程预估" value={formatMoney(quotation.total_amount, quotation.currency)} strong />
      </div>

      <div className="mt-5">
        <h4 className="mb-3 text-sm font-semibold">费用明细</h4>
        <div className="max-h-[360px] overflow-auto rounded-md border border-[oklch(86%_0.02_178)]">
          <table className="min-w-full text-left text-xs">
            <thead className="sticky top-0 bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-2">阶段</th>
                <th className="px-3 py-2">项目</th>
                <th className="px-3 py-2 text-right">金额</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item) => (
                <tr key={`${item.id}-${item.sort_order}`} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-2">{item.stage}</td>
                  <td className="px-3 py-2">{item.item_name}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatMoney(item.amount, item.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 border-t border-[oklch(86%_0.02_178)] pt-4">
        <h4 className="text-sm font-semibold">跟进记录</h4>
        <form className="mt-3 space-y-3" onSubmit={(event) => void createFollowup(quotation, event)}>
          <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
            <select
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 text-sm"
              value={followupForm.method}
              onChange={(event) =>
                setFollowupForm({ ...followupForm, method: event.target.value as FollowupMethod })
              }
            >
              {followupMethodOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <input
              className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 text-sm"
              type="date"
              value={followupForm.next_followup_date}
              onChange={(event) =>
                setFollowupForm({ ...followupForm, next_followup_date: event.target.value })
              }
            />
          </div>
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 py-2 text-sm outline-none transition focus:border-[oklch(47%_0.1_178)]"
            placeholder="记录客户反馈、下一步动作或需内部确认的问题"
            value={followupForm.content}
            onChange={(event) => setFollowupForm({ ...followupForm, content: event.target.value })}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[oklch(46%_0.045_178)]">{followupMessage}</p>
            <button
              className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={connection === "fallback"}
              type="submit"
            >
              添加跟进
            </button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          {followups.length === 0 ? (
            <p className="rounded-md border border-[oklch(86%_0.02_178)] px-3 py-4 text-center text-sm text-[oklch(48%_0.045_178)]">
              暂无跟进记录
            </p>
          ) : (
            followups.map((followup) => (
              <article
                key={followup.id}
                className="rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(98%_0.008_178)] px-3 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[oklch(46%_0.045_178)]">
                  <span className="font-medium text-[oklch(32%_0.055_178)]">
                    {followup.method} · {followup.user_name}
                  </span>
                  <time>{formatDateTime(followup.followup_date)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{followup.content}</p>
                {followup.next_followup_date ? (
                  <p className="mt-2 text-xs font-medium text-[oklch(36%_0.075_178)]">
                    下次跟进：{followup.next_followup_date}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function StatisticsPanel({ statistics }: { statistics: Statistics }) {
  const metrics = [
    ["报价数量", statistics.quote_count.toString()],
    ["当前阶段金额", formatMoney(statistics.current_stage_total, "USD")],
    ["全流程预估", formatMoney(statistics.total_amount, "USD")],
    ["已发送客户", statistics.sent_count.toString()],
    ["已确认", statistics.confirmed_count.toString()],
    ["已开卷", statistics.opened_count.toString()],
    ["未成交", statistics.lost_count.toString()],
    ["开卷转化率", `${(Number(statistics.open_rate) * 100).toFixed(2)}%`],
  ];
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] p-5">
          <p className="text-sm text-[oklch(46%_0.045_178)]">{label}</p>
          <p className="mt-3 text-2xl font-semibold">{value}</p>
        </div>
      ))}
    </section>
  );
}

function SummaryPanel({ generated, statistics }: { generated: GeneratedQuotation | null; statistics: Statistics }) {
  return (
    <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] p-5">
      <h3 className="text-lg font-semibold">报价汇总</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <SummaryRow label="当前阶段" value={formatMoney(generated?.current_stage_total ?? "0", generated?.display_currency ?? "USD")} />
        <SummaryRow label="后续预估" value={formatMoney(generated?.future_stage_total ?? "0", generated?.display_currency ?? "USD")} />
        <SummaryRow label="全流程预估" value={formatMoney(generated?.total_amount ?? "0", generated?.display_currency ?? "USD")} strong />
        <SummaryRow label="已保存报价" value={`${statistics.quote_count} 份`} />
      </dl>
    </section>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[oklch(46%_0.045_178)]">{label}</dt>
      <dd className={strong ? "text-lg font-semibold" : "font-medium"}>{value}</dd>
    </div>
  );
}

function NotesPanel({ notes }: { notes: string[] }) {
  return (
    <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] p-5">
      <h3 className="text-lg font-semibold">报价说明</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[oklch(42%_0.045_178)]">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        className="h-11 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 outline-none transition focus:border-[oklch(47%_0.1_178)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        className="h-11 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 outline-none transition focus:border-[oklch(47%_0.1_178)]"
        min={0}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function SelectInput({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <select
        className="h-11 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 outline-none transition focus:border-[oklch(47%_0.1_178)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function toOption(value: string): { label: string; value: string } {
  return { label: value, value };
}

function buildLocalPreview(payload: QuotationForm): GeneratedQuotation {
  const countryCurrency = payload.currency;
  const baseByCountry: Record<string, number> = { US: 2670, EP: 2595, JP: 1340, KR: 1180 };
  const current = baseByCountry[payload.country_code] ?? 1800;
  const translationOne = payload.needs_translation ? Math.max(payload.translation_quantity_one * 0.12, 120) : 0;
  const translationTwo = payload.needs_translation ? Math.max(payload.translation_quantity_two * 18, 40) : 0;
  const future = payload.country_code === "EP" ? 2100 : 1480;
  const items: QuotationItem[] = [
    buildItem("official", "申请阶段", "官方申请费", "官方费", current * 0.42, countryCurrency, "当前费用", "", 1),
    buildItem("foreign", "申请阶段", "外所申请服务费", "外所费", current * 0.36, countryCurrency, "当前费用", "", 2),
    buildItem("local", "申请阶段", "本所申请服务费", "本所费", current * 0.22, countryCurrency, "当前费用", "", 3),
    buildItem("translation-one", "申请阶段", "申请文件翻译费", "翻译费", translationOne, countryCurrency, "当前费用", `${payload.translation_quantity_one} 词`, 4),
    buildItem("translation-two", "申请阶段", "附图文字翻译/校对费", "翻译费", translationTwo, countryCurrency, "当前费用", `${payload.translation_quantity_two} 页`, 5),
    buildItem("exam", "审查阶段", "审查阶段预估费用", "官方费", future * 0.55, countryCurrency, "后续预估", "后续发生时确认", 6),
    buildItem("grant", "授权阶段", "授权阶段预估费用", "官方费", future * 0.45, countryCurrency, "后续预估", "授权时确认", 7),
    buildItem("annuity", "年费阶段", "后续年费", "年费", 0, countryCurrency, "后续预估", "后续另行报价", 8),
  ];
  const currentTotal = items.filter((item) => item.cost_nature === "当前费用").reduce((sum, item) => sum + Number(item.amount), 0);
  const futureTotal = items.filter((item) => item.cost_nature === "后续预估").reduce((sum, item) => sum + Number(item.amount), 0);
  return {
    items,
    current_stage_total: currentTotal.toFixed(2),
    future_stage_total: futureTotal.toFixed(2),
    total_amount: (currentTotal + futureTotal).toFixed(2),
    display_currency: countryCurrency,
    important_notes: importantNotes,
  };
}

function buildLocalQuotation(payload: QuotationForm, user: User, preview: GeneratedQuotation): Quotation {
  const now = new Date().toISOString();
  return {
    ...payload,
    id: crypto.randomUUID(),
    quotation_no: `${dateStamp()}-ZYIP-${Math.random().toString(16).slice(2, 7).toUpperCase()}`,
    consultant_name: user.name,
    consultant_email: user.email,
    items: preview.items,
    current_stage_total: preview.current_stage_total,
    future_stage_total: preview.future_stage_total,
    total_amount: preview.total_amount,
    is_sent: ["已发送客户", "跟进中", "已确认", "已开卷"].includes(payload.status),
    is_confirmed: ["已确认", "已开卷"].includes(payload.status),
    is_opened: payload.status === "已开卷",
    created_at: now,
    updated_at: now,
  };
}

function buildItem(
  id: string,
  stage: string,
  itemName: string,
  feeType: string,
  amount: number,
  currency: string,
  costNature: string,
  remark: string,
  sortOrder: number,
): QuotationItem {
  return {
    id,
    stage,
    item_name: itemName,
    fee_type: feeType,
    amount: amount.toFixed(2),
    currency,
    cost_nature: costNature,
    remark,
    sort_order: sortOrder,
  };
}

function dateStamp(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}${month}${day}`;
}

function formatMoney(value: string | number, currency: string): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function authHeaders(token: string, email: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : { "X-User-Email": email };
}
