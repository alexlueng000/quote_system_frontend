"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

import type { FeeRule, TranslationRule } from "../types";

const feeTypeOptions = [
  "目标国官费",
  "当地所服务费",
  "本所服务费",
  "第三方代垫付费用",
  "官方费",
  "外所费",
  "本所费",
  "翻译费",
  "年费",
];

const inputClass =
  "h-9 rounded-md border border-[oklch(80%_0.024_178)] bg-white px-2.5 text-sm text-[oklch(20%_0.025_180)] shadow-[inset_0_1px_0_oklch(100%_0_0)] outline-none transition placeholder:text-[oklch(58%_0.032_178)] focus:border-[oklch(45%_0.088_178)] focus:ring-2 focus:ring-[oklch(84%_0.04_178)]";
const labelClass = "text-xs font-medium text-[oklch(43%_0.044_178)]";
const tableHeadClass =
  "sticky top-0 z-20 border-b border-[oklch(24%_0.07_178)] bg-[oklch(32%_0.09_178)] text-xs font-semibold text-[oklch(96%_0.008_178)]";
const cellClass = "border-b border-[oklch(90%_0.015_178)] px-3 py-2.5 align-middle";

type RulesPanelProps = {
  feeRules: FeeRule[];
  translationRules: TranslationRule[];
  message: string;
  setFeeRules: (rules: FeeRule[]) => void;
  setTranslationRules: (rules: TranslationRule[]) => void;
  saveFeeRule: (rule: FeeRule) => Promise<void>;
  createFeeRule: (rule: FeeRule) => Promise<void>;
  deleteFeeRule: (ruleId: string) => Promise<void>;
  saveTranslationRule: (rule: TranslationRule) => Promise<void>;
};

type FeeRuleCreateFormProps = {
  feeForm: FeeRule;
  setFeeForm: (rule: FeeRule) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

type FeeRulesTableProps = {
  feeRules: FeeRule[];
  updateFeeRule: (id: string, patch: Partial<FeeRule>) => void;
  saveFeeRule: (rule: FeeRule) => Promise<void>;
  deleteFeeRule: (ruleId: string) => Promise<void>;
};

type TranslationRulesTableProps = {
  translationRules: TranslationRule[];
  updateTranslationRule: (id: string, patch: Partial<TranslationRule>) => void;
  saveTranslationRule: (rule: TranslationRule) => Promise<void>;
};

function defaultFeeRule(): FeeRule {
  return {
    id: "",
    version_id: null,
    country_code: "US",
    application_type: "发明",
    filing_route: "PCT进入",
    pct_route_detail: "",
    entity_type: "",
    stage: "申请阶段",
    item_group_key: "application",
    item_name: "新增费用项",
    fee_type: "官方费",
    fee_category: "官费",
    amount: "0",
    currency: "USD",
    quote_currency: "USD",
    is_multi_currency: false,
    tax_included: false,
    is_default: true,
    is_active: true,
    cost_nature: "当前费用",
    trigger_condition: "",
    price_version: "",
    remark: "",
  };
}

function formatAmount(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return value || "0";
  }
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function fieldOptions(currentValue: string): string[] {
  if (!currentValue || feeTypeOptions.includes(currentValue)) {
    return feeTypeOptions;
  }
  return [currentValue, ...feeTypeOptions];
}

function FormField({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function RuleInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

function RuleSelect({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  );
}

function RuleSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center justify-center" title={label}>
      <input
        aria-label={label}
        checked={checked}
        className="peer sr-only"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-5 w-9 rounded-full border border-[oklch(77%_0.028_178)] bg-[oklch(92%_0.016_178)] transition peer-checked:border-[oklch(35%_0.09_178)] peer-checked:bg-[oklch(35%_0.09_178)]">
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "translate-x-4" : ""}`} />
      </span>
    </label>
  );
}

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" }) {
  const toneClass =
    tone === "green"
      ? "border-[oklch(77%_0.065_150)] bg-[oklch(95%_0.032_150)] text-[oklch(34%_0.078_150)]"
      : tone === "amber"
        ? "border-[oklch(82%_0.07_80)] bg-[oklch(96%_0.038_80)] text-[oklch(42%_0.075_70)]"
        : "border-[oklch(84%_0.018_178)] bg-[oklch(96%_0.01_178)] text-[oklch(38%_0.044_178)]";

  return (
    <span className={`inline-flex h-7 items-center whitespace-nowrap rounded-md border px-2 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

function ActionButton({
  children,
  danger = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  const className = danger
    ? "h-8 rounded-md border border-[oklch(74%_0.052_25)] px-3 text-xs font-semibold text-[oklch(42%_0.08_25)] transition hover:bg-[oklch(96%_0.018_25)]"
    : "h-8 rounded-md bg-[oklch(34%_0.09_178)] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[oklch(29%_0.105_178)]";

  return (
    <button className={className} type="button" {...props}>
      {children}
    </button>
  );
}

function MetricTile({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-md border border-[oklch(86%_0.018_178)] bg-white px-4 py-3 shadow-sm">
      <div className={`mb-2 h-1 w-8 rounded-full ${accent}`} />
      <p className="text-xs font-medium text-[oklch(48%_0.04_178)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[oklch(20%_0.03_180)]">{value}</p>
    </div>
  );
}

function RulesSummary({
  feeRules,
  translationRules,
}: {
  feeRules: FeeRule[];
  translationRules: TranslationRule[];
}) {
  const activeCount = feeRules.filter((rule) => rule.is_active).length;
  const defaultCount = feeRules.filter((rule) => rule.is_default).length;
  const countryCount = new Set(feeRules.map((rule) => rule.country_code).filter(Boolean)).size;

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <MetricTile accent="bg-[oklch(38%_0.09_178)]" label="费用规则" value={feeRules.length} />
      <MetricTile accent="bg-[oklch(55%_0.12_150)]" label="已启用" value={activeCount} />
      <MetricTile accent="bg-[oklch(68%_0.12_70)]" label="默认带出" value={defaultCount} />
      <MetricTile accent="bg-[oklch(48%_0.1_230)]" label="国家与翻译" value={`${countryCount}/${translationRules.length}`} />
    </div>
  );
}

function FeeRuleCreateForm({ feeForm, setFeeForm, onSubmit }: FeeRuleCreateFormProps) {
  return (
    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-12" onSubmit={onSubmit}>
      <FormField label="国家">
        <RuleInput
          value={feeForm.country_code}
          onChange={(event) => setFeeForm({ ...feeForm, country_code: event.target.value.toUpperCase() })}
        />
      </FormField>
      <FormField label="申请类型">
        <RuleInput
          value={feeForm.application_type}
          onChange={(event) => setFeeForm({ ...feeForm, application_type: event.target.value })}
        />
      </FormField>
      <FormField label="申请途径">
        <RuleInput
          value={feeForm.filing_route}
          onChange={(event) => setFeeForm({ ...feeForm, filing_route: event.target.value })}
        />
      </FormField>
      <FormField label="阶段">
        <RuleInput value={feeForm.stage} onChange={(event) => setFeeForm({ ...feeForm, stage: event.target.value })} />
      </FormField>
      <FormField label="项目名称" wide>
        <RuleInput
          value={feeForm.item_name}
          onChange={(event) => setFeeForm({ ...feeForm, item_name: event.target.value })}
        />
      </FormField>
      <FormField label="费用类型">
        <RuleSelect value={feeForm.fee_type} onChange={(event) => setFeeForm({ ...feeForm, fee_type: event.target.value })}>
          {fieldOptions(feeForm.fee_type).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </RuleSelect>
      </FormField>
      <FormField label="费用类别">
        <RuleInput
          value={feeForm.fee_category ?? ""}
          onChange={(event) => setFeeForm({ ...feeForm, fee_category: event.target.value })}
        />
      </FormField>
      <FormField label="金额">
        <RuleInput
          min={0}
          type="number"
          value={feeForm.amount}
          className="text-right tabular-nums"
          onChange={(event) => setFeeForm({ ...feeForm, amount: event.target.value })}
        />
      </FormField>
      <div className="flex items-end">
        <button
          className="h-9 w-full rounded-md bg-[oklch(34%_0.09_178)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[oklch(29%_0.105_178)]"
          type="submit"
        >
          新增费用
        </button>
      </div>
    </form>
  );
}

function FeeRulesTable({ feeRules, updateFeeRule, saveFeeRule, deleteFeeRule }: FeeRulesTableProps) {
  if (!feeRules.length) {
    return (
      <div className="border-t border-[oklch(88%_0.018_178)] px-5 py-10 text-center text-sm text-[oklch(48%_0.04_178)]">
        暂无费用规则
      </div>
    );
  }

  return (
    <div className="max-h-[66vh] overflow-auto border-t border-[oklch(88%_0.018_178)]">
      <table className="min-w-[1880px] border-separate border-spacing-0 text-left text-sm">
        <thead className={tableHeadClass}>
          <tr>
            <th className="sticky left-0 z-30 bg-[oklch(32%_0.09_178)] px-3 py-3">国家</th>
            <th className="px-3 py-3">类型/途径</th>
            <th className="px-3 py-3">阶段</th>
            <th className="px-3 py-3">展示项</th>
            <th className="px-3 py-3">项目</th>
            <th className="px-3 py-3">费用类型</th>
            <th className="px-3 py-3">费用类别</th>
            <th className="px-3 py-3 text-right">金额</th>
            <th className="px-3 py-3">币种</th>
            <th className="px-3 py-3">报价币种</th>
            <th className="px-3 py-3 text-center">含税</th>
            <th className="px-3 py-3 text-center">启用</th>
            <th className="px-3 py-3 text-center">默认</th>
            <th className="px-3 py-3">触发条件</th>
            <th className="px-3 py-3">价格版本</th>
            <th className="px-3 py-3">备注</th>
            <th className="sticky right-0 z-30 bg-[oklch(32%_0.09_178)] px-3 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {feeRules.map((rule) => (
            <tr
              key={rule.id}
              className="bg-[oklch(99%_0.004_178)] text-[oklch(20%_0.025_180)] transition hover:bg-[oklch(96%_0.012_178)]"
            >
              <td className={`${cellClass} sticky left-0 z-10 bg-inherit`}>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="rounded-md bg-[oklch(92%_0.024_178)] px-2 py-1 font-mono text-xs font-semibold text-[oklch(32%_0.075_178)]">
                    {rule.country_code}
                  </span>
                </div>
              </td>
              <td className={`${cellClass} whitespace-nowrap`}>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{rule.application_type}</span>
                  <span className="text-xs text-[oklch(48%_0.04_178)]">{rule.filing_route}</span>
                </div>
              </td>
              <td className={`${cellClass} whitespace-nowrap`}>{rule.stage}</td>
              <td className={cellClass}>
                <RuleInput
                  className="w-32"
                  value={rule.item_group_key ?? ""}
                  onChange={(event) => updateFeeRule(rule.id, { item_group_key: event.target.value })}
                />
              </td>
              <td className={`${cellClass} min-w-56`}>
                <div className="max-w-64 whitespace-normal font-medium leading-5">{rule.item_name}</div>
              </td>
              <td className={cellClass}>
                <RuleSelect
                  className="w-40"
                  value={rule.fee_type}
                  onChange={(event) => updateFeeRule(rule.id, { fee_type: event.target.value })}
                >
                  {fieldOptions(rule.fee_type).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </RuleSelect>
              </td>
              <td className={cellClass}>
                <RuleInput
                  className="w-48"
                  value={rule.fee_category ?? ""}
                  onChange={(event) => updateFeeRule(rule.id, { fee_category: event.target.value })}
                />
              </td>
              <td className={`${cellClass} text-right`}>
                <div className="flex flex-col items-end gap-1">
                  <RuleInput
                    className="w-32 text-right tabular-nums"
                    min={0}
                    type="number"
                    value={rule.amount}
                    onChange={(event) => updateFeeRule(rule.id, { amount: event.target.value })}
                  />
                  <span className="text-xs tabular-nums text-[oklch(52%_0.035_178)]">{formatAmount(rule.amount)}</span>
                </div>
              </td>
              <td className={cellClass}>
                <RuleInput
                  className="w-24 uppercase"
                  value={rule.currency}
                  onChange={(event) => updateFeeRule(rule.id, { currency: event.target.value.toUpperCase() })}
                />
              </td>
              <td className={cellClass}>
                <RuleInput
                  className="w-24 uppercase"
                  value={rule.quote_currency ?? ""}
                  onChange={(event) => updateFeeRule(rule.id, { quote_currency: event.target.value.toUpperCase() })}
                />
              </td>
              <td className={`${cellClass} text-center`}>
                <RuleSwitch
                  checked={rule.tax_included ?? false}
                  label="含税"
                  onChange={(checked) => updateFeeRule(rule.id, { tax_included: checked })}
                />
              </td>
              <td className={`${cellClass} text-center`}>
                <RuleSwitch
                  checked={rule.is_active}
                  label="启用"
                  onChange={(checked) => updateFeeRule(rule.id, { is_active: checked })}
                />
              </td>
              <td className={`${cellClass} text-center`}>
                <RuleSwitch
                  checked={rule.is_default}
                  label="默认"
                  onChange={(checked) => updateFeeRule(rule.id, { is_default: checked })}
                />
              </td>
              <td className={cellClass}>
                <RuleInput
                  className="w-64"
                  value={rule.trigger_condition ?? ""}
                  onChange={(event) => updateFeeRule(rule.id, { trigger_condition: event.target.value })}
                />
              </td>
              <td className={`${cellClass} whitespace-nowrap`}>
                {rule.price_version ? <Pill tone="amber">{rule.price_version}</Pill> : <Pill>未发布</Pill>}
              </td>
              <td className={cellClass}>
                <RuleInput
                  className="w-60"
                  value={rule.remark}
                  onChange={(event) => updateFeeRule(rule.id, { remark: event.target.value })}
                />
              </td>
              <td className={`${cellClass} sticky right-0 z-10 bg-inherit`}>
                <div className="flex gap-2">
                  <ActionButton onClick={() => void saveFeeRule(rule)}>保存</ActionButton>
                  <ActionButton danger onClick={() => void deleteFeeRule(rule.id)}>
                    删除
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TranslationRulesTable({
  translationRules,
  updateTranslationRule,
  saveTranslationRule,
}: TranslationRulesTableProps) {
  if (!translationRules.length) {
    return (
      <div className="border-t border-[oklch(88%_0.018_178)] px-5 py-10 text-center text-sm text-[oklch(48%_0.04_178)]">
        暂无翻译费规则
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-t border-[oklch(88%_0.018_178)]">
      <table className="min-w-[980px] border-separate border-spacing-0 text-left text-sm">
        <thead className={tableHeadClass}>
          <tr>
            <th className="px-3 py-3">项目名称</th>
            <th className="px-3 py-3">单位</th>
            <th className="px-3 py-3 text-right">单价</th>
            <th className="px-3 py-3 text-right">最低收费</th>
            <th className="px-3 py-3">币种</th>
            <th className="px-3 py-3 text-center">启用</th>
            <th className="px-3 py-3 text-center">默认</th>
            <th className="px-3 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {translationRules.map((rule) => (
            <tr
              key={rule.id}
              className="bg-[oklch(99%_0.004_178)] text-[oklch(20%_0.025_180)] transition hover:bg-[oklch(96%_0.012_178)]"
            >
              <td className={cellClass}>
                <RuleInput
                  className="w-72"
                  value={rule.item_name}
                  onChange={(event) => updateTranslationRule(rule.id, { item_name: event.target.value })}
                />
              </td>
              <td className={cellClass}>
                <RuleInput
                  className="w-20"
                  value={rule.unit}
                  onChange={(event) => updateTranslationRule(rule.id, { unit: event.target.value })}
                />
              </td>
              <td className={`${cellClass} text-right`}>
                <RuleInput
                  className="w-32 text-right tabular-nums"
                  min={0}
                  type="number"
                  value={rule.unit_price}
                  onChange={(event) => updateTranslationRule(rule.id, { unit_price: event.target.value })}
                />
              </td>
              <td className={`${cellClass} text-right`}>
                <RuleInput
                  className="w-32 text-right tabular-nums"
                  min={0}
                  type="number"
                  value={rule.min_fee}
                  onChange={(event) => updateTranslationRule(rule.id, { min_fee: event.target.value })}
                />
              </td>
              <td className={cellClass}>
                <RuleInput
                  className="w-24 uppercase"
                  value={rule.currency}
                  onChange={(event) => updateTranslationRule(rule.id, { currency: event.target.value.toUpperCase() })}
                />
              </td>
              <td className={`${cellClass} text-center`}>
                <RuleSwitch
                  checked={rule.enabled}
                  label="启用翻译费"
                  onChange={(checked) => updateTranslationRule(rule.id, { enabled: checked })}
                />
              </td>
              <td className={`${cellClass} text-center`}>
                <RuleSwitch
                  checked={rule.is_default}
                  label="默认翻译费"
                  onChange={(checked) => updateTranslationRule(rule.id, { is_default: checked })}
                />
              </td>
              <td className={cellClass}>
                <ActionButton onClick={() => void saveTranslationRule(rule)}>保存</ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RulesPanel({
  feeRules,
  translationRules,
  message,
  setFeeRules,
  setTranslationRules,
  saveFeeRule,
  createFeeRule,
  deleteFeeRule,
  saveTranslationRule,
}: RulesPanelProps) {
  const [feeForm, setFeeForm] = useState<FeeRule>(() => defaultFeeRule());
  const groupedFeeTypes = useMemo(
    () => Array.from(new Set(feeRules.map((rule) => rule.fee_type).filter(Boolean))).slice(0, 5),
    [feeRules],
  );

  function updateFeeRule(id: string, patch: Partial<FeeRule>): void {
    setFeeRules(feeRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  function updateTranslationRule(id: string, patch: Partial<TranslationRule>): void {
    setTranslationRules(
      translationRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  }

  async function submitFeeRule(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await createFeeRule(feeForm);
    setFeeForm(defaultFeeRule());
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(98.5%_0.006_178)] shadow-sm">
        <div className="border-b border-[oklch(86%_0.02_178)] bg-white px-5 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[oklch(18%_0.028_180)]">费用规则</h3>
              <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
                修改后只影响新创建的报价，历史报价保持原明细。
              </p>
              {message ? <p className="mt-2 text-sm font-medium text-[oklch(38%_0.08_155)]">{message}</p> : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedFeeTypes.map((type) => (
                <Pill key={type} tone={type.includes("官") ? "green" : "neutral"}>
                  {type}
                </Pill>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <RulesSummary feeRules={feeRules} translationRules={translationRules} />
          </div>
        </div>

        <div className="border-b border-[oklch(86%_0.02_178)] px-5 py-4">
          <FeeRuleCreateForm feeForm={feeForm} setFeeForm={setFeeForm} onSubmit={submitFeeRule} />
        </div>

        <FeeRulesTable
          feeRules={feeRules}
          updateFeeRule={updateFeeRule}
          saveFeeRule={saveFeeRule}
          deleteFeeRule={deleteFeeRule}
        />
      </section>

      <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[oklch(18%_0.028_180)]">翻译费规则</h3>
            <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">按项目维护翻译单价、最低收费和默认带出状态。</p>
          </div>
          <Pill tone="amber">{translationRules.length} 项</Pill>
        </div>
        <TranslationRulesTable
          translationRules={translationRules}
          updateTranslationRule={updateTranslationRule}
          saveTranslationRule={saveTranslationRule}
        />
      </section>
    </div>
  );
}
