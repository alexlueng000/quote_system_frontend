"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  ApprovalPanel,
  RulesPanel,
  UsersPanel,
} from "./components/admin";
import { LoginScreen, NotesPanel, StatisticsPanel, SummaryPanel } from "./components/common";
import { DraftWorkbench, QuotationFormView } from "./components/drafts";
import { QuotationDetail, QuotationList } from "./components/quotations";
import { MobileNav, Sidebar } from "./components/sidebar";
import { fallbackBootstrap, importantNotes, initialFollowupForm, initialForm, initialUserForm } from "./constants";
import type {
  ActiveTab,
  ApprovalRequest,
  Bootstrap,
  DraftBasicForm,
  FeeRule,
  Followup,
  FollowupForm,
  GeneratedQuotation,
  LoginResponse,
  Quotation,
  QuotationDraft,
  QuotationForm,
  Statistics,
  TranslationRule,
  User,
  UserForm,
} from "./types";
import { apiBase, authHeaders, buildLocalPreview, readApiErrorCode } from "./utils";

export default function Home() {
  const [bootstrap, setBootstrap] = useState<Bootstrap>(fallbackBootstrap);
  const [form, setForm] = useState<QuotationForm>(initialForm);
  const [generated, setGenerated] = useState<GeneratedQuotation | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [drafts, setDrafts] = useState<QuotationDraft[]>([]);
  const [selectedDraftItemIds, setSelectedDraftItemIds] = useState<string[]>([]);
  const [draftMessage, setDraftMessage] = useState<string>("");
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
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvalMessage, setApprovalMessage] = useState<string>("");
  const [approvalReason, setApprovalReason] = useState<string>("需要继续为客户生成正式报价，请审批解锁。");
  const [canRequestApprovalUnlock, setCanRequestApprovalUnlock] = useState<boolean>(false);
  const [serverStatistics, setServerStatistics] = useState<Statistics | null>(null);
  const [quoteFilters, setQuoteFilters] = useState({
    keyword: "",
    country: "",
    status: "",
    consultant: "",
    dateFrom: "",
    dateTo: "",
  });

  const previewPayload = useMemo<QuotationForm>(
    () => ({ ...form, country_code: form.country_codes[0] ?? form.country_code }),
    [form],
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
      return {
        ...current,
        country_codes: nextCodes,
        country_code: nextCodes[0] ?? current.country_code,
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
          setActiveTab={setActiveTab}
          openApprovalsTab={openApprovalsTab}
          logout={logout}
        />

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
            <MobileNav
              activeTab={activeTab}
              user={selectedUser}
              setActiveTab={setActiveTab}
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
