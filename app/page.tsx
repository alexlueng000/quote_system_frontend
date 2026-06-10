"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  ApprovalPanel,
  CountryConfigPanel,
  UsersPanel,
} from "./components/admin";
import { LoginScreen, NotesPanel, StatisticsPanel, SummaryPanel } from "./components/common";
import { CustomersPanel } from "./components/customers";
import { DraftWorkbench, QuotationFormView } from "./components/drafts";
import { IpSystemsPanel } from "./components/ip-systems";
import { QuotationDetail, QuotationList } from "./components/quotations";
import { RulesPanel } from "./components/rules";
import { MobileNav, Sidebar } from "./components/sidebar";
import {
  fallbackBootstrap,
  fallbackCountryConfig,
  fallbackCustomers,
  importantNotes,
  initialCustomerContactForm,
  initialCustomerForm,
  initialFollowupForm,
  initialForm,
  initialUserForm,
} from "./constants";
import type {
  ActiveTab,
  ApprovalRequest,
  Bootstrap,
  Customer,
  CustomerContact,
  CustomerContactForm,
  CustomerForm,
  Country,
  CountryBulkFromReferenceResponse,
  CountryConfig,
  CountryCreate,
  CountryPathRule,
  CountryRuleSection,
  DraftBasicForm,
  EntityTypeRule,
  FeeRule,
  FxTaxRule,
  Followup,
  FollowupForm,
  GeneratedQuotation,
  JurisdictionDataSource,
  JurisdictionDataSourceForm,
  JurisdictionReference,
  JurisdictionReferenceListResponse,
  LanguageRule,
  LoginResponse,
  Quotation,
  QuotationDraft,
  QuotationForm,
  Statistics,
  SpecialRule,
  TranslationRule,
  User,
  UserForm,
  WorkbenchOptions,
} from "./types";
import {
  apiBase,
  authHeaders,
  buildLocalPreview,
  clearStoredAuth,
  readApiErrorCode,
  readApiErrorMessage,
  readStoredAuth,
  saveStoredAuth,
} from "./utils";

export default function Home() {
  const [bootstrap, setBootstrap] = useState<Bootstrap>(fallbackBootstrap);
  const [form, setForm] = useState<QuotationForm>(initialForm);
  const [generated, setGenerated] = useState<GeneratedQuotation | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(fallbackCustomers);
  const [customerForm, setCustomerForm] = useState<CustomerForm>(initialCustomerForm);
  const [customerContactForm, setCustomerContactForm] = useState<CustomerContactForm>(initialCustomerContactForm);
  const [customerMessage, setCustomerMessage] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(fallbackCustomers[0]?.id ?? null);
  const [customerKeyword, setCustomerKeyword] = useState<string>("");
  const [drafts, setDrafts] = useState<QuotationDraft[]>([]);
  const [selectedDraftItemIds, setSelectedDraftItemIds] = useState<string[]>([]);
  const [draftMessage, setDraftMessage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState<string>(fallbackBootstrap.users[0].email);
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [connection, setConnection] = useState<"online" | "fallback">("fallback");
  const [activeTab, setActiveTab] = useState<ActiveTab>("create");
  const [activeCountryConfigSection, setActiveCountryConfigSection] = useState<CountryRuleSection>("overview");
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
  const [translationRules, setTranslationRules] = useState<TranslationRule[]>([]);
  const [rulesMessage, setRulesMessage] = useState<string>("");
  const [countryConfig, setCountryConfig] = useState<CountryConfig>(fallbackCountryConfig);
  const [referenceCandidates, setReferenceCandidates] = useState<JurisdictionReference[]>([]);
  const [jurisdictionDataSources, setJurisdictionDataSources] = useState<JurisdictionDataSource[]>([]);
  const [countryConfigMessage, setCountryConfigMessage] = useState<string>("");
  const [users, setUsers] = useState<User[]>(fallbackBootstrap.users);
  const [userForm, setUserForm] = useState<UserForm>(initialUserForm);
  const [newPasswordByUserId, setNewPasswordByUserId] = useState<Record<string, string>>({});
  const [usersMessage, setUsersMessage] = useState<string>("");
  const [followupsByQuotationId, setFollowupsByQuotationId] = useState<Record<string, Followup[]>>({});
  const [followupForm, setFollowupForm] = useState<FollowupForm>(initialFollowupForm);
  const [followupMessage, setFollowupMessage] = useState<string>("");
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvalMessage, setApprovalMessage] = useState<string>("");
  const [approvalReason, setApprovalReason] = useState<string>("需要继续为客户生成正式报价，请审批解锁。");
  const [canRequestApprovalUnlock, setCanRequestApprovalUnlock] = useState<boolean>(false);
  const [serverStatistics, setServerStatistics] = useState<Statistics | null>(null);
  const [workbenchOptions, setWorkbenchOptions] = useState<WorkbenchOptions>({
    country_code: "",
    application_types: [],
    filing_routes: [],
    route_details: [],
    entity_types: [],
    quote_currency: "",
    has_path_rules: false,
  });
  const [quoteFilters, setQuoteFilters] = useState({
    keyword: "",
    country: "",
    status: "",
    consultant: "",
    dateFrom: "",
    dateTo: "",
  });

  const previewPayload = useMemo<QuotationForm>(
    () => {
      const countryCode = form.country_codes[0] ?? form.country_code;
      const country = bootstrap.countries.find((item) => item.code === countryCode);
      return {
        ...form,
        country_code: countryCode,
        currency: country?.default_currency ?? form.currency,
      };
    },
    [bootstrap.countries, form],
  );

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

  const loadApprovalRequests = useCallback(async (): Promise<void> => {
    if (!selectedUser) {
      return;
    }
    try {
      const response = await fetch(`${apiBase}/quotation-approval-requests`, {
        headers: authHeaders(authToken, selectedUser.email),
      });
      if (!response.ok) {
        throw new Error("approval requests failed");
      }
      const data = (await response.json()) as ApprovalRequest[];
      setApprovalRequests(data);
      setConnection("online");
    } catch {
      setApprovalMessage("审批解锁记录暂不可用。");
      setConnection("fallback");
    }
  }, [authToken, selectedUser]);

  useEffect(() => {
    let cancelled = false;
    if (!cancelled) {
      const storedAuth = readStoredAuth();
      if (storedAuth) {
        setAuthToken(storedAuth.token);
        setSelectedUser(storedAuth.user);
        setLoginEmail(storedAuth.user.email);
        updateField("consultant_email", storedAuth.user.email);
        setActiveTab(storedAuth.user.role === "admin" ? "list" : "create");
      }
      setAuthReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function loadBootstrap(): Promise<void> {
      try {
        const response = await fetch(`${apiBase}/bootstrap`);
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
    async function loadWorkbenchOptions(): Promise<void> {
      const countryCode = form.country_codes[0] ?? form.country_code;
      if (!countryCode) {
        return;
      }
      const params = new URLSearchParams({
        country_code: countryCode,
        application_type: form.application_type,
        filing_route: form.filing_route,
      });
      try {
        const response = await fetch(`${apiBase}/quotation-workbench/options?${params.toString()}`);
        if (!response.ok) {
          throw new Error("workbench options failed");
        }
        const options = (await response.json()) as WorkbenchOptions;
        setWorkbenchOptions(options);
        setForm((current) => {
          const nextApplicationType = options.application_types.includes(current.application_type)
            ? current.application_type
            : options.application_types[0] ?? current.application_type;
          const nextFilingRoute = options.filing_routes.includes(current.filing_route)
            ? current.filing_route
            : options.filing_routes[0] ?? current.filing_route;
          const nextRouteDetail = options.route_details.length
            ? options.route_details.includes(current.pct_route_detail)
              ? current.pct_route_detail
              : options.route_details[0]
            : "";
          const nextEntityType = options.entity_types.length
            ? options.entity_types.includes(current.entity_type)
              ? current.entity_type
              : options.entity_types[0]
            : "";
          return {
            ...current,
            application_type: nextApplicationType,
            filing_route: nextFilingRoute,
            pct_route_detail: nextRouteDetail,
            entity_type: nextEntityType,
            currency: options.quote_currency || current.currency,
          };
        });
        setConnection("online");
      } catch {
        setWorkbenchOptions({
          country_code: countryCode,
          application_types: [],
          filing_routes: [],
          route_details: [],
          entity_types: [],
          quote_currency: "",
          has_path_rules: false,
        });
      }
    }
    void loadWorkbenchOptions();
  }, [form.application_type, form.country_code, form.country_codes, form.filing_route]);

  useEffect(() => {
    async function generatePreview(): Promise<void> {
      try {
        const response = await fetch(`${apiBase}/quotations/generate`, {
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
          fetch(`${apiBase}/fee-rules`, {
            headers: authHeaders(authToken, selectedUser.email),
          }),
          fetch(`${apiBase}/translation-rules`, {
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
    if (activeTab !== "country-config" || selectedUser?.role !== "admin") {
      return;
    }
    async function loadCountryConfig(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/country-config?include_deleted=true`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        const referenceResponse = await fetch(`${apiBase}/jurisdiction-references`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        const dataSourceResponse = await fetch(`${apiBase}/jurisdiction-data-sources`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        if (!response.ok || !referenceResponse.ok || !dataSourceResponse.ok) {
          throw new Error("country config failed");
        }
        setCountryConfig((await response.json()) as CountryConfig);
        const references = (await referenceResponse.json()) as JurisdictionReferenceListResponse;
        setReferenceCandidates(references.items);
        setJurisdictionDataSources((await dataSourceResponse.json()) as JurisdictionDataSource[]);
        setConnection("online");
      } catch {
        setConnection("fallback");
        setCountryConfig(fallbackCountryConfig);
        setReferenceCandidates([]);
        setJurisdictionDataSources([]);
        setCountryConfigMessage("底层数据维护接口暂不可用，当前使用本地演示数据；reference 候选需连接 API 后加载。");
      }
    }
    void loadCountryConfig();
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
        const response = await fetch(`${apiBase}/users`, {
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
    async function loadCustomers(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/customers`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        if (!response.ok) {
          throw new Error("customers failed");
        }
        const data = (await response.json()) as { items: Customer[]; total: number };
        setCustomers(data.items);
        setSelectedCustomerId((current) => current ?? data.items[0]?.id ?? null);
        setConnection("online");
      } catch {
        setCustomers(fallbackCustomers);
        setSelectedCustomerId((current) => current ?? fallbackCustomers[0]?.id ?? null);
        setConnection("fallback");
      }
    }
    void loadCustomers();
  }, [selectedUser, authToken]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }
    async function loadQuotations(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/quotations`, {
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
    async function loadDrafts(): Promise<void> {
      if (!selectedUser) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/quotation-drafts`, {
          headers: authHeaders(authToken, selectedUser.email),
        });
        if (!response.ok) {
          throw new Error("drafts failed");
        }
        const data = (await response.json()) as { items: QuotationDraft[]; total: number };
        setDrafts(data.items);
        setSelectedDraftItemIds((current) =>
          current.filter((id) => data.items.some((draft) => draft.items.some((item) => item.id === id))),
        );
        setConnection("online");
      } catch {
        setConnection("fallback");
      }
    }
    void loadDrafts();
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
        const response = await fetch(`${apiBase}/statistics`, {
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
    const payload = {
      client_name: form.client_name,
      client_contact: form.client_contact,
      consultant_email: selectedUser.role === "admin" ? form.consultant_email : undefined,
      country_codes: form.country_codes.length ? form.country_codes : [form.country_code],
      application_type: form.application_type,
      filing_route: form.filing_route,
      pct_route_detail: form.pct_route_detail,
      entity_type: form.entity_type,
      has_case: form.has_case,
      case_title: form.case_title,
      applicant_count: form.applicant_count,
      priority_count: form.priority_count,
      claim_count: form.claim_count,
      description_pages: form.description_pages,
      drawing_pages: form.drawing_pages,
      needs_translation: form.needs_translation,
      translation_quantity_one: form.translation_quantity_one,
      translation_quantity_two: form.translation_quantity_two,
      remark: form.remark,
    };
    setDraftMessage("");
    try {
      const response = await fetch(`${apiBase}/quotation-drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("draft failed");
      }
      const draft = (await response.json()) as QuotationDraft;
      setDrafts((current) => [draft, ...current]);
      setConnection("online");
      setDraftMessage(`草稿已保存：${draft.draft_no}`);
    } catch {
      setConnection("fallback");
      setDraftMessage("草稿保存失败，请确认后端已启动。");
    }
  }

  function updateField<K extends keyof QuotationForm>(key: K, value: QuotationForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCountry(code: string): void {
    setForm((current) => {
      const nextCodes = current.country_codes.includes(code)
        ? current.country_codes.filter((item) => item !== code)
        : [...current.country_codes, code];
      const nextPrimaryCode = nextCodes[0] ?? current.country_code;
      const nextCountry = bootstrap.countries.find((country) => country.code === nextPrimaryCode);
      return {
        ...current,
        country_codes: nextCodes,
        country_code: nextPrimaryCode,
        currency: nextCountry?.default_currency ?? current.currency,
      };
    });
  }

  function toggleDraftItem(id: string): void {
    setSelectedDraftItemIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function applyUpdatedDraft(updated: QuotationDraft): void {
    setDrafts((current) => {
      const nextDrafts = current.map((draft) => (draft.id === updated.id ? updated : draft));
      return nextDrafts.filter((draft) => draft.items.length > 0);
    });
  }

  function selectCustomer(customer: Customer): void {
    setSelectedCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      customer_type: customer.customer_type,
      consultant_email: customer.consultant_email,
      department: customer.department,
      default_currency: customer.default_currency,
      default_quote_terms: customer.default_quote_terms,
      customer_level: customer.customer_level,
      status: customer.status,
      remark: customer.remark,
    });
  }

  async function createManagedCustomer(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedUser || !customerForm.name.trim()) {
      return;
    }
    setCustomerMessage("");
    try {
      const response = await fetch(`${apiBase}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify({
          ...customerForm,
          name: customerForm.name.trim(),
          consultant_email: selectedUser.role === "admin" ? customerForm.consultant_email : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error("customer create failed");
      }
      const created = (await response.json()) as Customer;
      setCustomers((current) => [created, ...current]);
      setSelectedCustomerId(created.id);
      setCustomerForm({
        ...initialCustomerForm,
        consultant_email: selectedUser.role === "admin" ? customerForm.consultant_email : selectedUser.email,
      });
      setCustomerContactForm(initialCustomerContactForm);
      setCustomerMessage(`客户已创建：${created.customer_no}`);
      setConnection("online");
    } catch {
      setConnection("fallback");
      setCustomerMessage("客户创建失败，请确认后端已启动。");
    }
  }

  async function updateManagedCustomer(
    event: FormEvent<HTMLFormElement>,
    customerId: string,
  ): Promise<void> {
    event.preventDefault();
    if (!selectedUser || !customerForm.name.trim()) {
      return;
    }
    setCustomerMessage("");
    try {
      const response = await fetch(`${apiBase}/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify({
          ...customerForm,
          name: customerForm.name.trim(),
          consultant_email: selectedUser.role === "admin" ? customerForm.consultant_email : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error("customer update failed");
      }
      const updated = (await response.json()) as Customer;
      setCustomers((current) => current.map((customer) => (customer.id === updated.id ? updated : customer)));
      setSelectedCustomerId(updated.id);
      setCustomerMessage("客户信息已保存。");
      setConnection("online");
    } catch {
      setConnection("fallback");
      setCustomerMessage("客户信息保存失败。");
    }
  }

  async function createManagedCustomerContact(
    event: FormEvent<HTMLFormElement>,
    customerId: string,
  ): Promise<void> {
    event.preventDefault();
    if (!selectedUser || !customerContactForm.name.trim()) {
      return;
    }
    setCustomerMessage("");
    try {
      const response = await fetch(`${apiBase}/customers/${customerId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify({ ...customerContactForm, name: customerContactForm.name.trim() }),
      });
      if (!response.ok) {
        throw new Error("contact create failed");
      }
      const created = (await response.json()) as CustomerContact;
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === customerId
            ? {
                ...customer,
                contacts: [
                  created,
                  ...customer.contacts.map((contact) =>
                    created.is_primary ? { ...contact, is_primary: false } : contact,
                  ),
                ],
              }
            : customer,
        ),
      );
      setCustomerContactForm(initialCustomerContactForm);
      setCustomerMessage("联系人已添加。");
      setConnection("online");
    } catch {
      setConnection("fallback");
      setCustomerMessage("联系人添加失败。");
    }
  }

  async function updateDraftBasicInfo(draftId: string, values: DraftBasicForm): Promise<boolean> {
    if (!selectedUser) {
      return false;
    }
    setDraftMessage("");
    try {
      const response = await fetch(`${apiBase}/quotation-drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("draft update failed");
      }
      const updated = (await response.json()) as QuotationDraft;
      applyUpdatedDraft(updated);
      setConnection("online");
      setDraftMessage(`草稿基本信息已更新：${updated.draft_no}`);
      return true;
    } catch {
      setConnection("fallback");
      setDraftMessage("草稿基本信息保存失败，请确认该草稿仍可编辑。");
      return false;
    }
  }

  async function deleteDraftItem(draftId: string, itemId: string): Promise<boolean> {
    if (!selectedUser) {
      return false;
    }
    setDraftMessage("");
    try {
      const response = await fetch(`${apiBase}/quotation-drafts/${draftId}/items/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(authToken, selectedUser.email),
      });
      if (!response.ok) {
        throw new Error("draft item delete failed");
      }
      const updated = (await response.json()) as QuotationDraft;
      applyUpdatedDraft(updated);
      setSelectedDraftItemIds((current) => current.filter((id) => id !== itemId));
      setConnection("online");
      setDraftMessage(`草稿明细已删除：${updated.draft_no}`);
      return true;
    } catch {
      setConnection("fallback");
      setDraftMessage("草稿明细删除失败，请确认该明细仍可删除。");
      return false;
    }
  }

  async function createFormalFromDrafts(): Promise<void> {
    if (!selectedUser || selectedDraftItemIds.length === 0) {
      return;
    }
    setDraftMessage("");
    setCanRequestApprovalUnlock(false);
    try {
      const response = await fetch(`${apiBase}/quotations/from-drafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify({ draft_item_ids: selectedDraftItemIds }),
      });
      if (!response.ok) {
        const code = await readApiErrorCode(response);
        if (code === "FORMAL_QUOTE_BLOCKED_OVERDUE_FOLLOWUP") {
          setCanRequestApprovalUnlock(selectedUser.role === "consultant");
          throw new Error("存在逾期超过 7 天的跟进任务，请先补充跟进记录或申请审批解锁。");
        }
        if (code === "FORMAL_QUOTE_BLOCKED_UNCONVERTED") {
          setCanRequestApprovalUnlock(selectedUser.role === "consultant");
          throw new Error("未转化开卷报价已超过 10 条，需要管理员或审批人确认后才能继续生成正式报价。");
        }
        throw new Error("正式报价生成失败，请确认选择的草稿明细仍可用。");
      }
      const quotation = (await response.json()) as Quotation;
      const convertedIds = new Set(selectedDraftItemIds);
      setQuotations((current) => [quotation, ...current]);
      setDrafts((current) =>
        current
          .map((draft) => ({
            ...draft,
            items: draft.items.filter((item) => !convertedIds.has(item.id)),
          }))
          .filter((draft) => draft.items.length > 0),
      );
      setSelectedDraftItemIds([]);
      setSelectedQuotationId(quotation.id);
      setServerStatistics(null);
      setConnection("online");
      setActiveTab("list");
    } catch (error) {
      setConnection("fallback");
      setDraftMessage(error instanceof Error ? error.message : "正式报价生成失败，请确认选择的草稿明细仍可用。");
    }
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
      const response = await fetch(`${apiBase}/quotations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const code = await readApiErrorCode(response);
        if (code === "FOLLOWUP_DATE_REQUIRED") {
          throw new Error("请先添加一条跟进记录并填写下次跟进日期，再标记为已发送客户或跟进中。");
        }
        throw new Error("状态保存失败。");
      }
      const updated = (await response.json()) as Quotation;
      setQuotations((current) =>
        current.map((quotation) => (quotation.id === updated.id ? updated : quotation)),
      );
      setServerStatistics(null);
      setConnection("online");
    } catch (error) {
      setQuotations(previous);
      setConnection("fallback");
      setFollowupMessage(error instanceof Error ? error.message : "状态保存失败。");
    }
  }

  async function requestApprovalUnlock(): Promise<void> {
    if (!selectedUser || selectedUser.role !== "consultant") {
      return;
    }
    setApprovalMessage("");
    const response = await fetch(`${apiBase}/quotation-approval-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({ reason: approvalReason }),
    });
    if (!response.ok) {
      setApprovalMessage("审批解锁申请提交失败。");
      return;
    }
    const created = (await response.json()) as ApprovalRequest;
    setApprovalRequests((current) => [created, ...current]);
    setApprovalMessage("审批解锁申请已提交。");
    setCanRequestApprovalUnlock(false);
    setConnection("online");
  }

  async function reviewApprovalRequest(requestId: string, status: "已通过" | "已拒绝"): Promise<void> {
    if (!selectedUser || !["admin", "approver"].includes(selectedUser.role)) {
      return;
    }
    setApprovalMessage("");
    const response = await fetch(`${apiBase}/quotation-approval-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        status,
        reviewer_comment: status === "已通过" ? "允许继续生成正式报价。" : "请先维护跟进或转化记录。",
        valid_days: 30,
      }),
    });
    if (!response.ok) {
      setApprovalMessage("审批处理失败。");
      return;
    }
    const updated = (await response.json()) as ApprovalRequest;
    setApprovalRequests((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setApprovalMessage(status === "已通过" ? "已通过审批解锁。" : "已拒绝审批申请。");
    setConnection("online");
  }

  async function saveFeeRule(rule: FeeRule): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setRulesMessage("");
    const response = await fetch(`${apiBase}/fee-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        amount: Number(rule.amount),
        currency: rule.currency,
        quote_currency: rule.quote_currency ?? "",
        item_group_key: rule.item_group_key ?? "",
        fee_type: rule.fee_type,
        fee_category: rule.fee_category ?? "",
        trigger_condition: rule.trigger_condition ?? "",
        tax_included: rule.tax_included ?? false,
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

  async function createFeeRule(rule: FeeRule): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setRulesMessage("");
    const response = await fetch(`${apiBase}/fee-rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        version_id: rule.version_id ?? null,
        country_code: rule.country_code,
        application_type: rule.application_type,
        filing_route: rule.filing_route,
        pct_route_detail: rule.pct_route_detail ?? "",
        entity_type: rule.entity_type ?? "",
        stage: rule.stage,
        item_group_key: rule.item_group_key ?? "",
        item_name: rule.item_name,
        fee_type: rule.fee_type,
        fee_category: rule.fee_category ?? "其他",
        amount: Number(rule.amount),
        currency: rule.currency,
        quote_currency: rule.quote_currency ?? rule.currency,
        is_multi_currency: rule.is_multi_currency ?? false,
        tax_included: rule.tax_included ?? false,
        is_default: rule.is_default,
        is_active: rule.is_active,
        cost_nature: rule.cost_nature,
        trigger_condition: rule.trigger_condition ?? "",
        remark: rule.remark,
      }),
    });
    if (!response.ok) {
      setRulesMessage("费用规则新增失败。");
      return;
    }
    const created = (await response.json()) as FeeRule;
    setFeeRules((current) => [...current, created]);
    setRulesMessage("费用规则已新增，新报价会使用启用且默认的规则。");
    setConnection("online");
  }

  async function deleteFeeRule(ruleId: string): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setRulesMessage("");
    const response = await fetch(`${apiBase}/fee-rules/${ruleId}`, {
      method: "DELETE",
      headers: authHeaders(authToken, selectedUser.email),
    });
    if (!response.ok) {
      setRulesMessage("费用规则删除失败。");
      return;
    }
    setFeeRules((current) => current.filter((rule) => rule.id !== ruleId));
    setRulesMessage("费用规则已删除。");
    setConnection("online");
  }

  async function saveCountryConfigRow(country: Country): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}/countries/${country.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        name_cn: country.name_cn,
        name_en: country.name_en,
        display_code: country.display_code ?? country.code,
        enabled: country.enabled,
        business_region: country.business_region ?? [],
        region_remark: country.region_remark ?? "",
        is_enabled: country.is_enabled ?? country.enabled,
        manual_override: country.manual_override ?? false,
        remarks: country.remarks ?? "",
      }),
    });
    if (!response.ok) {
      setCountryConfigMessage("国家/地区/受理局主档保存失败。");
      return;
    }
    const updated = (await response.json()) as Country;
    setCountryConfig((current) => ({
      ...current,
      countries: current.countries.map((item) => (item.code === updated.code ? updated : item)),
    }));
    setCountryConfigMessage("国家/地区/受理局主档已保存。");
    setConnection("online");
  }

  async function createCountryConfigRow(country: CountryCreate): Promise<boolean> {
    if (!selectedUser) {
      return false;
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}/countries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        ...country,
        // Legacy compatibility only. Currency rules belong in the FX/tax module.
        default_currency: "USD",
        internal_code: country.internal_code || country.code,
        display_code: country.display_code || country.code,
        is_enabled: country.enabled,
      }),
    });
    if (!response.ok) {
      const code = await readApiErrorCode(response);
      setCountryConfigMessage(code === "COUNTRY_EXISTS" ? "国家/地区/受理局已存在。" : "国家/地区/受理局新增失败。");
      return false;
    }
    const created = (await response.json()) as Country;
    setCountryConfig((current) => ({
      ...current,
      countries: [...current.countries, created].sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0) || left.code.localeCompare(right.code)),
    }));
    setCountryConfigMessage("国家/地区/受理局已新增。");
    setConnection("online");
    return true;
  }

  async function bulkCreateCountriesFromReference(referenceIds: string[]): Promise<CountryBulkFromReferenceResponse> {
    if (!selectedUser) {
      throw new Error("请先登录管理员账号。");
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}/countries/bulk-from-reference`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({
        reference_ids: referenceIds,
        source_verified: true,
        source_verified_by: selectedUser.email || "local_admin",
        batch_note: "从本地 reference 批量添加",
      }),
    });
    if (!response.ok) {
      const message = await readApiErrorMessage(response);
      throw new Error(message || "从 reference 批量新增/恢复失败。");
    }
    const result = (await response.json()) as CountryBulkFromReferenceResponse;
    const createdItems = result.created_items ?? result.added ?? [];
    const restoredItems = result.restored_items ?? result.restored ?? [];
    const changedCountries = [...createdItems, ...restoredItems].map((item) => item.country).filter((country): country is Country => Boolean(country));
    if (changedCountries.length) {
      setCountryConfig((current) => {
        const byCode = new Map(current.countries.map((country) => [country.code, country]));
        for (const country of changedCountries) {
          byCode.set(country.code, country);
        }
        return {
          ...current,
          countries: Array.from(byCode.values()).sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0) || left.code.localeCompare(right.code)),
        };
      });
    }
    const createdCount = result.created_count ?? result.added_count;
    const restoredCount = result.restored_count ?? 0;
    if (createdCount === 0 && restoredCount === 0 && result.skipped_count > 0 && result.failed_count === 0) {
      setCountryConfigMessage("所选对象均已存在，无需新增。");
    } else {
      setCountryConfigMessage(`本次新增 ${createdCount} 条，恢复 ${restoredCount} 条，跳过 ${result.skipped_count} 条，失败 ${result.failed_count} 条。`);
    }
    setConnection("online");
    return result;
  }

  async function saveJurisdictionDataSource(source: JurisdictionDataSourceForm): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setCountryConfigMessage("");
    const existing = jurisdictionDataSources.some((item) => item.source_id === source.source_id);
    const normalizedSource = {
      ...source,
      last_reviewed_at: normalizeDateTimeForApi(source.last_reviewed_at),
      next_review_due_at: normalizeDateTimeForApi(source.next_review_due_at),
    };
    const response = await fetch(`${apiBase}/jurisdiction-data-sources${existing ? `/${encodeURIComponent(source.source_id)}` : ""}`, {
      method: existing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify(normalizedSource),
    });
    if (!response.ok) {
      setCountryConfigMessage("来源 registry 保存失败。");
      return;
    }
    const saved = (await response.json()) as JurisdictionDataSource;
    setJurisdictionDataSources((current) => {
      const byId = new Map(current.map((item) => [item.source_id, item]));
      byId.set(saved.source_id, saved);
      return [...byId.values()].sort((left, right) => left.source_id.localeCompare(right.source_id));
    });
    setCountryConfigMessage("来源 registry 已保存。");
    setConnection("online");
  }

  function normalizeDateTimeForApi(value?: string | null): string | null {
    if (!value) {
      return null;
    }
    return value.includes("T") ? value : `${value}T00:00:00`;
  }

  async function deleteCountryConfigRow(country: Country, deleteReason: string): Promise<boolean> {
    if (!selectedUser) {
      return false;
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}/countries/${country.code}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify({ delete_reason: deleteReason }),
    });
    if (!response.ok) {
      const message = await readApiErrorMessage(response);
      setCountryConfigMessage(message || "国家/地区/受理局删除失败。");
      return false;
    }
    setCountryConfig((current) => ({
      ...current,
      countries: current.countries.map((item) =>
        item.code === country.code
          ? { ...item, enabled: false, is_enabled: false, is_deleted: true, delete_reason: deleteReason }
          : item,
      ),
    }));
    setCountryConfigMessage("国家/地区/受理局已软删除。");
    setConnection("online");
    return true;
  }

  async function restoreCountryConfigRow(country: Country): Promise<boolean> {
    if (!selectedUser) {
      return false;
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}/countries/${country.code}/restore`, {
      method: "PATCH",
      headers: authHeaders(authToken, selectedUser.email),
    });
    if (!response.ok) {
      const message = await readApiErrorMessage(response);
      setCountryConfigMessage(message || "国家/地区/受理局恢复失败。");
      return false;
    }
    const restored = (await response.json()) as Country;
    setCountryConfig((current) => ({
      ...current,
      countries: current.countries.map((item) => (item.code === restored.code ? restored : item)),
    }));
    setCountryConfigMessage("国家/地区/受理局已恢复。");
    setConnection("online");
    return true;
  }

  async function saveCountryPathConfig(rule: CountryPathRule): Promise<void> {
    await saveCountryConfigResource<CountryPathRule>(
      `/country-path-rules/${rule.id}`,
      {
        route_detail: rule.route_detail,
        affects_official_fee: rule.affects_official_fee,
        affects_local_service_fee: rule.affects_local_service_fee,
        affects_inhouse_service_fee: rule.affects_inhouse_service_fee,
        affects_questions: rule.affects_questions,
        affects_documents: rule.affects_documents,
        affects_deadlines: rule.affects_deadlines,
        affects_translation: rule.affects_translation,
        affects_display: rule.affects_display,
        enabled: rule.enabled,
        effective_date: rule.effective_date,
        remark: rule.remark,
      },
      (current, updated) => ({
        ...current,
        path_rules: current.path_rules.map((item) => (item.id === updated.id ? updated : item)),
      }),
      "路径矩阵已保存。",
      "路径矩阵保存失败。",
    );
  }

  async function saveEntityTypeConfig(rule: EntityTypeRule): Promise<void> {
    await saveCountryConfigResource<EntityTypeRule>(
      `/entity-type-rules/${rule.id}`,
      {
        enabled: rule.enabled,
        entity_types: rule.entity_types,
        affects_official_fee: rule.affects_official_fee,
        affects_questions: rule.affects_questions,
        requires_customer_confirmation: rule.requires_customer_confirmation,
        requires_supporting_documents: rule.requires_supporting_documents,
        remark: rule.remark,
      },
      (current, updated) => ({
        ...current,
        entity_type_rules: current.entity_type_rules.map((item) => (item.id === updated.id ? updated : item)),
      }),
      "实体类型规则已保存。",
      "实体类型规则保存失败。",
    );
  }

  async function saveLanguageConfig(rule: LanguageRule): Promise<void> {
    await saveCountryConfigResource<LanguageRule>(
      `/language-rules/${rule.id}`,
      {
        accepted_languages: rule.accepted_languages,
        source_language: rule.source_language,
        target_language: rule.target_language,
        intermediate_language: rule.intermediate_language,
        needs_second_translation: rule.needs_second_translation,
        recommended_scheme_id: rule.recommended_scheme_id,
        default_translation_fee: rule.default_translation_fee,
        allow_scheme_switch: rule.allow_scheme_switch,
        enabled: rule.enabled,
        remark: rule.remark,
      },
      (current, updated) => ({
        ...current,
        language_rules: current.language_rules.map((item) => (item.id === updated.id ? updated : item)),
      }),
      "语言与翻译路径已保存。",
      "语言与翻译路径保存失败。",
    );
  }

  async function saveFxTaxConfig(rule: FxTaxRule): Promise<void> {
    await saveCountryConfigResource<FxTaxRule>(
      `/fx-tax-rules/${rule.id}`,
      {
        official_currency: rule.official_currency,
        official_quote_currency: rule.official_quote_currency,
        local_service_currency: rule.local_service_currency,
        local_service_currency_options: rule.local_service_currency_options,
        quote_currency: rule.quote_currency,
        fx_rate: Number(rule.fx_rate),
        tax_rate: Number(rule.tax_rate),
        tax_included: rule.tax_included,
        lock_on_formal_quote: rule.lock_on_formal_quote,
        version: rule.version,
        enabled: rule.enabled,
        remark: rule.remark,
      },
      (current, updated) => ({
        ...current,
        fx_tax_rules: current.fx_tax_rules.map((item) => (item.id === updated.id ? updated : item)),
      }),
      "汇率税率规则已保存。",
      "汇率税率规则保存失败。",
    );
  }

  async function saveSpecialConfig(rule: SpecialRule): Promise<void> {
    await saveCountryConfigResource<SpecialRule>(
      `/special-rules/${rule.id}`,
      {
        enabled: rule.enabled,
        triggers_extra_fee: rule.triggers_extra_fee,
        triggers_risk_warning: rule.triggers_risk_warning,
        requires_customer_confirmation: rule.requires_customer_confirmation,
        risk_summary: rule.risk_summary,
        linked_rule_code: rule.linked_rule_code,
        remark: rule.remark,
      },
      (current, updated) => ({
        ...current,
        special_rules: current.special_rules.map((item) => (item.id === updated.id ? updated : item)),
      }),
      "非常规事项规则已保存。",
      "非常规事项规则保存失败。",
    );
  }

  async function createCountryPathConfig(rule: CountryPathRule): Promise<void> {
    await createCountryConfigResource<CountryPathRule>(
      "/country-path-rules",
      {
        country_code: rule.country_code,
        application_type: rule.application_type,
        filing_route: rule.filing_route,
        route_detail: rule.route_detail,
        affects_official_fee: rule.affects_official_fee,
        affects_local_service_fee: rule.affects_local_service_fee,
        affects_inhouse_service_fee: rule.affects_inhouse_service_fee,
        affects_questions: rule.affects_questions,
        affects_documents: rule.affects_documents,
        affects_deadlines: rule.affects_deadlines,
        affects_translation: rule.affects_translation,
        affects_display: rule.affects_display,
        enabled: rule.enabled,
        effective_date: rule.effective_date,
        remark: rule.remark,
      },
      (current, created) => ({ ...current, path_rules: [...current.path_rules, created] }),
      "路径矩阵已新增。",
      "路径矩阵新增失败。",
    );
  }

  async function createEntityTypeConfig(rule: EntityTypeRule): Promise<void> {
    await createCountryConfigResource<EntityTypeRule>(
      "/entity-type-rules",
      {
        country_code: rule.country_code,
        application_type: rule.application_type,
        filing_route: rule.filing_route,
        enabled: rule.enabled,
        entity_types: rule.entity_types,
        affects_official_fee: rule.affects_official_fee,
        affects_questions: rule.affects_questions,
        requires_customer_confirmation: rule.requires_customer_confirmation,
        requires_supporting_documents: rule.requires_supporting_documents,
        remark: rule.remark,
      },
      (current, created) => ({ ...current, entity_type_rules: [...current.entity_type_rules, created] }),
      "实体类型规则已新增。",
      "实体类型规则新增失败。",
    );
  }

  async function createLanguageConfig(rule: LanguageRule): Promise<void> {
    await createCountryConfigResource<LanguageRule>(
      "/language-rules",
      {
        country_code: rule.country_code,
        application_type: rule.application_type,
        accepted_languages: rule.accepted_languages,
        source_language: rule.source_language,
        target_language: rule.target_language,
        intermediate_language: rule.intermediate_language,
        needs_second_translation: rule.needs_second_translation,
        recommended_scheme_id: rule.recommended_scheme_id,
        default_translation_fee: rule.default_translation_fee,
        allow_scheme_switch: rule.allow_scheme_switch,
        enabled: rule.enabled,
        remark: rule.remark,
      },
      (current, created) => ({ ...current, language_rules: [...current.language_rules, created] }),
      "语言与翻译路径已新增。",
      "语言与翻译路径新增失败。",
    );
  }

  async function createFxTaxConfig(rule: FxTaxRule): Promise<void> {
    await createCountryConfigResource<FxTaxRule>(
      "/fx-tax-rules",
      {
        country_code: rule.country_code,
        official_currency: rule.official_currency,
        official_quote_currency: rule.official_quote_currency,
        local_service_currency: rule.local_service_currency,
        local_service_currency_options: rule.local_service_currency_options,
        quote_currency: rule.quote_currency,
        fx_rate: Number(rule.fx_rate),
        tax_rate: Number(rule.tax_rate),
        tax_included: rule.tax_included,
        lock_on_formal_quote: rule.lock_on_formal_quote,
        version: rule.version,
        enabled: rule.enabled,
        remark: rule.remark,
      },
      (current, created) => ({ ...current, fx_tax_rules: [...current.fx_tax_rules, created] }),
      "汇率税率规则已新增。",
      "汇率税率规则新增失败。",
    );
  }

  async function createSpecialConfig(rule: SpecialRule): Promise<void> {
    await createCountryConfigResource<SpecialRule>(
      "/special-rules",
      {
        country_code: rule.country_code,
        application_type: rule.application_type,
        filing_route: rule.filing_route,
        rule_type: rule.rule_type,
        enabled: rule.enabled,
        triggers_extra_fee: rule.triggers_extra_fee,
        triggers_risk_warning: rule.triggers_risk_warning,
        requires_customer_confirmation: rule.requires_customer_confirmation,
        risk_summary: rule.risk_summary,
        linked_rule_code: rule.linked_rule_code,
        remark: rule.remark,
      },
      (current, created) => ({ ...current, special_rules: [...current.special_rules, created] }),
      "非常规事项规则已新增。",
      "非常规事项规则新增失败。",
    );
  }

  async function deleteCountryPathConfig(ruleId: string): Promise<void> {
    await deleteCountryConfigResource(
      `/country-path-rules/${ruleId}`,
      (current) => ({ ...current, path_rules: current.path_rules.filter((rule) => rule.id !== ruleId) }),
      "路径矩阵已删除。",
      "路径矩阵删除失败。",
    );
  }

  async function deleteEntityTypeConfig(ruleId: string): Promise<void> {
    await deleteCountryConfigResource(
      `/entity-type-rules/${ruleId}`,
      (current) => ({
        ...current,
        entity_type_rules: current.entity_type_rules.filter((rule) => rule.id !== ruleId),
      }),
      "实体类型规则已删除。",
      "实体类型规则删除失败。",
    );
  }

  async function deleteLanguageConfig(ruleId: string): Promise<void> {
    await deleteCountryConfigResource(
      `/language-rules/${ruleId}`,
      (current) => ({ ...current, language_rules: current.language_rules.filter((rule) => rule.id !== ruleId) }),
      "语言与翻译路径已删除。",
      "语言与翻译路径删除失败。",
    );
  }

  async function deleteFxTaxConfig(ruleId: string): Promise<void> {
    await deleteCountryConfigResource(
      `/fx-tax-rules/${ruleId}`,
      (current) => ({ ...current, fx_tax_rules: current.fx_tax_rules.filter((rule) => rule.id !== ruleId) }),
      "汇率税率规则已删除。",
      "汇率税率规则删除失败。",
    );
  }

  async function deleteSpecialConfig(ruleId: string): Promise<void> {
    await deleteCountryConfigResource(
      `/special-rules/${ruleId}`,
      (current) => ({ ...current, special_rules: current.special_rules.filter((rule) => rule.id !== ruleId) }),
      "非常规事项规则已删除。",
      "非常规事项规则删除失败。",
    );
  }

  async function deleteCountryConfigResource(
    path: string,
    applyDeleted: (current: CountryConfig) => CountryConfig,
    successMessage: string,
    failureMessage: string,
  ): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}${path}`, {
      method: "DELETE",
      headers: authHeaders(authToken, selectedUser.email),
    });
    if (!response.ok) {
      setCountryConfigMessage(failureMessage);
      return;
    }
    setCountryConfig((current) => applyDeleted(current));
    setCountryConfigMessage(successMessage);
    setConnection("online");
  }

  async function createCountryConfigResource<T extends { id: string }>(
    path: string,
    payload: Record<string, unknown>,
    applyCreated: (current: CountryConfig, created: T) => CountryConfig,
    successMessage: string,
    failureMessage: string,
  ): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setCountryConfigMessage(failureMessage);
      return;
    }
    const created = (await response.json()) as T;
    setCountryConfig((current) => applyCreated(current, created));
    setCountryConfigMessage(successMessage);
    setConnection("online");
  }

  async function saveCountryConfigResource<T extends { id: string }>(
    path: string,
    payload: Record<string, unknown>,
    applyUpdated: (current: CountryConfig, updated: T) => CountryConfig,
    successMessage: string,
    failureMessage: string,
  ): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setCountryConfigMessage("");
    const response = await fetch(`${apiBase}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(authToken, selectedUser.email) },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setCountryConfigMessage(failureMessage);
      return;
    }
    const updated = (await response.json()) as T;
    setCountryConfig((current) => applyUpdated(current, updated));
    setCountryConfigMessage(successMessage);
    setConnection("online");
  }

  async function saveTranslationRule(rule: TranslationRule): Promise<void> {
    if (!selectedUser) {
      return;
    }
    setRulesMessage("");
    const response = await fetch(`${apiBase}/translation-rules/${rule.id}`, {
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
    const response = await fetch(`${apiBase}/users`, {
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
    const response = await fetch(`${apiBase}/users/${user.id}`, {
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
    const response = await fetch(`${apiBase}/users/${userId}/password`, {
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
    const response = await fetch(`${apiBase}/quotations/${quotation.id}/followups`, {
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
    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id
          ? {
              ...item,
              next_followup_date: created.next_followup_date,
              last_followup_at: created.followup_date,
              status: ["已发送客户", "待跟进", "跟进逾期", "需价格调整"].includes(item.status)
                ? "跟进中"
                : item.status,
              is_sent: ["已发送客户", "待跟进", "跟进中", "跟进逾期", "需价格调整"].includes(item.status)
                ? true
                : item.is_sent,
            }
          : item,
      ),
    );
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
  const showWorkspaceAside = activeTab === "create" || activeTab === "list";
  const showQuotationDetail = activeTab === "list" && selectedQuotation !== null;

  function openApprovalsTab(): void {
    setActiveTab("approvals");
    void loadApprovalRequests();
  }

  function logout(): void {
    clearStoredAuth();
    setSelectedUser(null);
    setAuthToken("");
    setLoginPassword("");
    setSelectedQuotationId(null);
  }

  useEffect(() => {
    if (!selectedUser || !selectedQuotation || followupsByQuotationId[selectedQuotation.id]) {
      return;
    }
    async function loadFollowups(): Promise<void> {
      if (!selectedUser || !selectedQuotation) {
        return;
      }
      try {
        const response = await fetch(`${apiBase}/quotations/${selectedQuotation.id}/followups`, {
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

  if (!authReady) {
    return <main className="min-h-screen bg-[oklch(97%_0.012_178)]" />;
  }

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
            const response = await fetch(`${apiBase}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            if (!response.ok) {
              throw new Error("login failed");
            }
            const data = (await response.json()) as LoginResponse;
            saveStoredAuth(data);
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
        <Sidebar
          activeTab={activeTab}
          user={selectedUser}
          activeCountryConfigSection={activeCountryConfigSection}
          setActiveTab={setActiveTab}
          setCountryConfigSection={setActiveCountryConfigSection}
          openApprovalsTab={openApprovalsTab}
          logout={logout}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[oklch(84%_0.025_178)] bg-[oklch(98%_0.008_178)] px-4 py-4 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-[oklch(44%_0.045_178)]">内部报价工作台</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-normal">标准化报价生成与客户跟进管理</h2>
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
            <MobileNav
              activeTab={activeTab}
              user={selectedUser}
              activeCountryConfigSection={activeCountryConfigSection}
              setActiveTab={setActiveTab}
              setCountryConfigSection={setActiveCountryConfigSection}
              openApprovalsTab={openApprovalsTab}
            />
          </header>

          <div className={`grid flex-1 gap-6 px-4 py-6 sm:px-8 ${showWorkspaceAside ? "xl:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
            <div className="min-w-0">
              {activeTab === "create" ? (
                <QuotationFormView
                  bootstrap={bootstrap}
                  form={form}
                  generated={generated}
                  workbenchOptions={workbenchOptions}
                  onSubmit={handleSubmit}
                  updateField={updateField}
                  toggleCountry={toggleCountry}
                  draftMessage={draftMessage}
                  isAdmin={selectedUser.role === "admin"}
                  users={users}
                />
              ) : null}
              {activeTab === "create" ? (
                <DraftWorkbench
                  drafts={drafts}
                  selectedItemIds={selectedDraftItemIds}
                  toggleItem={toggleDraftItem}
                  createFormalQuote={createFormalFromDrafts}
                  updateDraftBasicInfo={updateDraftBasicInfo}
                  deleteDraftItem={deleteDraftItem}
                  canRequestApprovalUnlock={canRequestApprovalUnlock}
                  approvalReason={approvalReason}
                  setApprovalReason={setApprovalReason}
                  requestApprovalUnlock={requestApprovalUnlock}
                  message={draftMessage}
                />
              ) : null}
              {activeTab === "customers" ? (
                <CustomersPanel
                  customers={customers}
                  users={users}
                  currentUser={selectedUser}
                  form={customerForm}
                  contactForm={customerContactForm}
                  message={customerMessage}
                  selectedCustomerId={selectedCustomerId}
                  keyword={customerKeyword}
                  setKeyword={setCustomerKeyword}
                  setForm={setCustomerForm}
                  setContactForm={setCustomerContactForm}
                  selectCustomer={selectCustomer}
                  createCustomer={createManagedCustomer}
                  updateCustomer={updateManagedCustomer}
                  createContact={createManagedCustomerContact}
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
              {activeTab === "approvals" ? (
                <ApprovalPanel
                  requests={approvalRequests}
                  message={approvalMessage}
                  canReview={["admin", "approver"].includes(selectedUser.role)}
                  refresh={loadApprovalRequests}
                  review={reviewApprovalRequest}
                />
              ) : null}
              {activeTab === "country-config" && activeCountryConfigSection === "treaty" && ["admin", "approver"].includes(selectedUser.role) ? (
                <IpSystemsPanel
                  currentUser={selectedUser}
                  authToken={authToken}
                  countries={selectedUser.role === "admin" ? countryConfig.countries : bootstrap.countries}
                />
              ) : null}
              {activeTab === "country-config" && activeCountryConfigSection !== "treaty" && selectedUser.role === "admin" ? (
                <CountryConfigPanel
                  config={countryConfig}
                  message={countryConfigMessage}
                  activeSection={activeCountryConfigSection}
                  referenceCandidates={referenceCandidates}
                  dataSources={jurisdictionDataSources}
                  setConfig={setCountryConfig}
                  createCountry={createCountryConfigRow}
                  bulkCreateCountries={bulkCreateCountriesFromReference}
                  saveDataSource={saveJurisdictionDataSource}
                  saveCountry={saveCountryConfigRow}
                  deleteCountry={deleteCountryConfigRow}
                  restoreCountry={restoreCountryConfigRow}
                  savePathRule={saveCountryPathConfig}
                  saveEntityTypeRule={saveEntityTypeConfig}
                  saveLanguageRule={saveLanguageConfig}
                  saveFxTaxRule={saveFxTaxConfig}
                  saveSpecialRule={saveSpecialConfig}
                  createPathRule={createCountryPathConfig}
                  createEntityTypeRule={createEntityTypeConfig}
                  createLanguageRule={createLanguageConfig}
                  createFxTaxRule={createFxTaxConfig}
                  createSpecialRule={createSpecialConfig}
                  deletePathRule={deleteCountryPathConfig}
                  deleteEntityTypeRule={deleteEntityTypeConfig}
                  deleteLanguageRule={deleteLanguageConfig}
                  deleteFxTaxRule={deleteFxTaxConfig}
                  deleteSpecialRule={deleteSpecialConfig}
                />
              ) : null}
              {activeTab === "rules" && selectedUser.role === "admin" ? (
                <RulesPanel
                  feeRules={feeRules}
                  translationRules={translationRules}
                  message={rulesMessage}
                  setFeeRules={setFeeRules}
                  setTranslationRules={setTranslationRules}
                  saveFeeRule={saveFeeRule}
                  createFeeRule={createFeeRule}
                  deleteFeeRule={deleteFeeRule}
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
            {showWorkspaceAside ? (
            <aside className="space-y-4">
              {showQuotationDetail ? (
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
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
