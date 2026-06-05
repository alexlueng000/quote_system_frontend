"use client";

import type { GeneratedQuotation, Statistics } from "../types";
import { formatMoney } from "../utils";

export function LoginScreen({
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

export function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
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

export function StatisticsPanel({ statistics }: { statistics: Statistics }) {
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

export function SummaryPanel({ generated, statistics }: { generated: GeneratedQuotation | null; statistics: Statistics }) {
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

export function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[oklch(46%_0.045_178)]">{label}</dt>
      <dd className={strong ? "text-lg font-semibold" : "font-medium"}>{value}</dd>
    </div>
  );
}

export function NotesPanel({ notes }: { notes: string[] }) {
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

export function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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

export function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
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

export function SelectInput({
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
