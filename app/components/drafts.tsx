"use client";

import { FormEvent, Fragment, useState } from "react";

import { NumberInput, SelectInput, TextInput } from "./common";
import type { Bootstrap, DraftBasicForm, GeneratedQuotation, QuotationDraft, QuotationDraftItem, QuotationForm, User } from "../types";
import { formatMoney, toOption } from "../utils";

export function QuotationFormView({
  bootstrap,
  form,
  generated,
  onSubmit,
  updateField,
  toggleCountry,
  draftMessage,
  isAdmin,
  users,
}: {
  bootstrap: Bootstrap;
  form: QuotationForm;
  generated: GeneratedQuotation | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  updateField: <K extends keyof QuotationForm>(key: K, value: QuotationForm[K]) => void;
  toggleCountry: (code: string) => void;
  draftMessage: string;
  isAdmin: boolean;
  users: User[];
}) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">报价草稿</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">先保存草稿，勾选一个或多个草稿明细后再生成正式报价编号。</p>
          </div>
          <button className="h-10 rounded-md bg-[oklch(37%_0.105_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(32%_0.115_178)]" type="submit">
            保存草稿
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextInput label="客户名称" value={form.client_name} onChange={(value) => updateField("client_name", value)} />
          <TextInput label="客户联系人" value={form.client_contact} onChange={(value) => updateField("client_contact", value)} />
          <TextInput label="案件名称" value={form.case_title} onChange={(value) => updateField("case_title", value)} />
          {isAdmin ? (
            <SelectInput
              label="归属顾问"
              value={form.consultant_email}
              options={users.filter((user) => user.role === "consultant").map((user) => ({ label: `${user.name} (${user.email})`, value: user.email }))}
              onChange={(value) => updateField("consultant_email", value)}
            />
          ) : null}
          <SelectInput label="申请类型" value={form.application_type} options={bootstrap.application_types.map(toOption)} onChange={(value) => updateField("application_type", value)} />
          <SelectInput label="申请途径" value={form.filing_route} options={bootstrap.filing_routes.map(toOption)} onChange={(value) => updateField("filing_route", value)} />
          <NumberInput label="申请人数量" value={form.applicant_count} onChange={(value) => updateField("applicant_count", value)} />
          <NumberInput label="优先权数量" value={form.priority_count} onChange={(value) => updateField("priority_count", value)} />
          <NumberInput label="权利要求项数" value={form.claim_count} onChange={(value) => updateField("claim_count", value)} />
          <NumberInput label="说明书页数" value={form.description_pages} onChange={(value) => updateField("description_pages", value)} />
          <NumberInput label="附图页数" value={form.drawing_pages} onChange={(value) => updateField("drawing_pages", value)} />
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">国家/地区</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {bootstrap.countries.map((country) => (
              <label
                key={country.code}
                className={`flex h-11 items-center justify-between rounded-md border px-3 text-sm transition ${
                  form.country_codes.includes(country.code)
                    ? "border-[oklch(48%_0.09_178)] bg-[oklch(92%_0.026_178)]"
                    : "border-[oklch(80%_0.026_178)] bg-[oklch(99%_0.006_178)]"
                }`}
              >
                <span>{country.name_cn} ({country.code})</span>
                <input
                  checked={form.country_codes.includes(country.code)}
                  type="checkbox"
                  onChange={() => toggleCountry(country.code)}
                />
              </label>
            ))}
          </div>
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
        {draftMessage ? <p className="mt-4 text-sm font-medium text-[oklch(36%_0.075_178)]">{draftMessage}</p> : null}
      </section>

      <FeeTable generated={generated} />
    </form>
  );
}

export function FeeTable({ generated }: { generated: GeneratedQuotation | null }) {
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

function draftToBasicForm(draft: QuotationDraft): DraftBasicForm {
  return {
    client_name: draft.client_name,
    client_contact: draft.client_contact,
    has_case: draft.has_case,
    case_title: draft.case_title,
    applicant_count: draft.applicant_count,
    priority_count: draft.priority_count,
    claim_count: draft.claim_count,
    description_pages: draft.description_pages,
    drawing_pages: draft.drawing_pages,
    needs_translation: draft.needs_translation,
    translation_quantity_one: Number(draft.translation_quantity_one),
    translation_quantity_two: Number(draft.translation_quantity_two),
    remark: draft.remark ?? "",
  };
}

export function DraftWorkbench({
  drafts,
  selectedItemIds,
  toggleItem,
  createFormalQuote,
  updateDraftBasicInfo,
  deleteDraftItem,
  canRequestApprovalUnlock,
  approvalReason,
  setApprovalReason,
  requestApprovalUnlock,
  message,
}: {
  drafts: QuotationDraft[];
  selectedItemIds: string[];
  toggleItem: (id: string) => void;
  createFormalQuote: () => Promise<void>;
  updateDraftBasicInfo: (draftId: string, values: DraftBasicForm) => Promise<boolean>;
  deleteDraftItem: (draftId: string, itemId: string) => Promise<boolean>;
  canRequestApprovalUnlock: boolean;
  approvalReason: string;
  setApprovalReason: (reason: string) => void;
  requestApprovalUnlock: () => Promise<void>;
  message: string;
}) {
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftForm, setDraftForm] = useState<DraftBasicForm | null>(null);
  const [savingDraftId, setSavingDraftId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const selectableItems = drafts.flatMap((draft) =>
    draft.items.map((item) => ({
      draft,
      item,
    })),
  );

  function startEditingDraft(draft: QuotationDraft): void {
    setEditingDraftId(draft.id);
    setDraftForm(draftToBasicForm(draft));
  }

  function updateDraftForm<K extends keyof DraftBasicForm>(key: K, value: DraftBasicForm[K]): void {
    setDraftForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function submitDraftEdit(event: FormEvent<HTMLFormElement>, draftId: string): Promise<void> {
    event.preventDefault();
    if (!draftForm || !draftForm.client_name.trim()) {
      return;
    }
    setSavingDraftId(draftId);
    const saved = await updateDraftBasicInfo(draftId, { ...draftForm, client_name: draftForm.client_name.trim() });
    setSavingDraftId(null);
    if (saved) {
      setEditingDraftId(null);
      setDraftForm(null);
    }
  }

  async function confirmDeleteDraftItem(draft: QuotationDraft, item: QuotationDraftItem): Promise<void> {
    const confirmed = window.confirm(`确认删除 ${draft.draft_no} 的 ${item.country_code} 草稿明细？`);
    if (!confirmed) {
      return;
    }
    setDeletingItemId(item.id);
    await deleteDraftItem(draft.id, item.id);
    setDeletingItemId(null);
  }

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
      <div className="flex flex-col gap-3 border-b border-[oklch(84%_0.025_178)] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">草稿池</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            已选择 {selectedItemIds.length} / {selectableItems.length} 条草稿明细
          </p>
        </div>
        <button
          className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={selectedItemIds.length === 0}
          type="button"
          onClick={() => void createFormalQuote()}
        >
          生成正式报价
        </button>
      </div>
      {message || canRequestApprovalUnlock ? (
        <div className="border-b border-[oklch(88%_0.018_178)] px-5 py-3">
          {message ? <p className="text-sm text-[oklch(38%_0.065_178)]">{message}</p> : null}
          {canRequestApprovalUnlock ? (
            <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
              <input
                className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 text-sm"
                value={approvalReason}
                onChange={(event) => setApprovalReason(event.target.value)}
              />
              <button
                className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!approvalReason.trim()}
                type="button"
                onClick={() => void requestApprovalUnlock()}
              >
                申请审批解锁
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
            <tr>
              <th className="w-12 px-4 py-3">选</th>
              <th className="px-4 py-3">草稿编号</th>
              <th className="px-4 py-3">客户</th>
              <th className="px-4 py-3">国家</th>
              <th className="px-4 py-3">类型/途径</th>
              <th className="px-4 py-3 text-right">当前费用</th>
              <th className="px-4 py-3 text-right">后续预估</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {selectableItems.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[oklch(48%_0.045_178)]" colSpan={9}>
                  暂无草稿明细。
                </td>
              </tr>
            ) : (
              selectableItems.map(({ draft, item }) => (
                <Fragment key={item.id}>
                  <tr className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                    <td className="px-4 py-3">
                      <input
                        checked={selectedItemIds.includes(item.id)}
                        type="checkbox"
                        onChange={() => toggleItem(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{draft.draft_no}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{draft.client_name}</div>
                      <div className="mt-1 text-xs text-[oklch(48%_0.045_178)]">{draft.consultant_name}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.country_code}</td>
                    <td className="px-4 py-3">{item.application_type} / {item.filing_route}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoney(item.current_stage_total, item.quote_currency)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoney(item.future_stage_total, item.quote_currency)}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="h-8 rounded-md border border-[oklch(72%_0.035_178)] px-3 text-xs font-medium text-[oklch(34%_0.075_178)] transition hover:bg-[oklch(93%_0.018_178)]"
                          type="button"
                          onClick={() => startEditingDraft(draft)}
                        >
                          编辑
                        </button>
                        <button
                          className="h-8 rounded-md border border-[oklch(78%_0.04_28)] px-3 text-xs font-medium text-[oklch(40%_0.08_28)] transition hover:bg-[oklch(94%_0.025_28)] disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={deletingItemId === item.id}
                          type="button"
                          onClick={() => void confirmDeleteDraftItem(draft, item)}
                        >
                          {deletingItemId === item.id ? "删除中" : "删除明细"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingDraftId === draft.id && draftForm ? (
                    <tr className="border-b border-[oklch(84%_0.024_178)] bg-[oklch(96%_0.012_178)]">
                      <td className="px-4 py-4" colSpan={9}>
                        <form className="space-y-4" onSubmit={(event) => void submitDraftEdit(event, draft.id)}>
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <TextInput label="客户名称" value={draftForm.client_name} onChange={(value) => updateDraftForm("client_name", value)} />
                            <TextInput label="客户联系人" value={draftForm.client_contact} onChange={(value) => updateDraftForm("client_contact", value)} />
                            <TextInput label="案件名称" value={draftForm.case_title} onChange={(value) => updateDraftForm("case_title", value)} />
                            <label className="flex h-11 items-center gap-3 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 text-sm">
                              <input
                                checked={draftForm.has_case}
                                type="checkbox"
                                onChange={(event) => updateDraftForm("has_case", event.target.checked)}
                              />
                              已有案件
                            </label>
                            <NumberInput label="申请人数量" value={draftForm.applicant_count} onChange={(value) => updateDraftForm("applicant_count", value)} />
                            <NumberInput label="优先权数量" value={draftForm.priority_count} onChange={(value) => updateDraftForm("priority_count", value)} />
                            <NumberInput label="权利要求项数" value={draftForm.claim_count} onChange={(value) => updateDraftForm("claim_count", value)} />
                            <NumberInput label="说明书页数" value={draftForm.description_pages} onChange={(value) => updateDraftForm("description_pages", value)} />
                            <NumberInput label="附图页数" value={draftForm.drawing_pages} onChange={(value) => updateDraftForm("drawing_pages", value)} />
                            <NumberInput label="翻译数量一" value={draftForm.translation_quantity_one} onChange={(value) => updateDraftForm("translation_quantity_one", value)} />
                            <NumberInput label="翻译数量二" value={draftForm.translation_quantity_two} onChange={(value) => updateDraftForm("translation_quantity_two", value)} />
                            <label className="flex h-11 items-center gap-3 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 text-sm">
                              <input
                                checked={draftForm.needs_translation}
                                type="checkbox"
                                onChange={(event) => updateDraftForm("needs_translation", event.target.checked)}
                              />
                              需要翻译
                            </label>
                          </div>
                          <label className="block text-sm">
                            <span className="mb-1 block font-medium">备注</span>
                            <textarea
                              className="min-h-20 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 py-2 outline-none transition focus:border-[oklch(47%_0.1_178)]"
                              value={draftForm.remark}
                              onChange={(event) => updateDraftForm("remark", event.target.value)}
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)] disabled:cursor-not-allowed disabled:opacity-45"
                              disabled={savingDraftId === draft.id || !draftForm.client_name.trim()}
                              type="submit"
                            >
                              {savingDraftId === draft.id ? "保存中" : "保存基本信息"}
                            </button>
                            <button
                              className="h-9 rounded-md border border-[oklch(76%_0.026_178)] px-4 text-sm font-medium text-[oklch(40%_0.05_178)] transition hover:bg-[oklch(93%_0.016_178)]"
                              type="button"
                              onClick={() => {
                                setEditingDraftId(null);
                                setDraftForm(null);
                              }}
                            >
                              取消
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
