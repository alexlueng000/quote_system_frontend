import type { GeneratedQuotation, QuotationForm, QuotationItem } from "./types";
import { importantNotes } from "./constants";

export const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1").trim().replace(/\/$/, "");

export function toOption(value: string): { label: string; value: string } {
  return { label: value, value };
}

export async function readApiErrorCode(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: { code?: string } };
    return data.detail?.code ?? "";
  } catch {
    return "";
  }
}

export function buildLocalPreview(payload: QuotationForm): GeneratedQuotation {
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

export function formatMoney(value: string | number, currency: string): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function authHeaders(token: string, email: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : { "X-User-Email": email };
}
