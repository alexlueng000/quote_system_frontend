"use client";

import { FormEvent } from "react";

import { SelectInput, SummaryRow } from "./common";
import { followupMethodOptions } from "../constants";
import type { Country, Followup, FollowupForm, FollowupMethod, Quotation, User } from "../types";
import { apiBase, formatDateTime, formatMoney, toOption } from "../utils";

export function QuotationList({
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
    window.open(`${apiBase}/quotations/${id}/export`, "_blank", "noopener,noreferrer");
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

export function QuotationDetail({
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
    window.open(`${apiBase}/quotations/${quotation.id}/export`, "_blank", "noopener,noreferrer");
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
    ["下次跟进", quotation.next_followup_date || "-"],
    ["最近跟进", quotation.last_followup_at ? formatDateTime(quotation.last_followup_at) : "-"],
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
