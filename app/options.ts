export type SelectOption = {
  label: string;
  value: string;
};

export type BusinessTagOption = SelectOption & {
  group: "BUSINESS_REGION" | "ECONOMIC_ORG" | "INTERNAL_ANALYTICS";
};

export const jurisdictionTypeOptions: SelectOption[] = [
  { label: "单一国家/地区", value: "single_country" },
  { label: "单一国家/地区", value: "special_region" },
  { label: "区域局", value: "regional_office" },
  { label: "国际组织", value: "international_organization" },
  { label: "条约体系入口", value: "treaty_entry" },
  { label: "内部业务对象", value: "internal_business_object" },
];

export const enabledOptions: { label: string; value: boolean }[] = [
  { label: "启用", value: true },
  { label: "停用", value: false },
];

export const geoRegionOptions: SelectOption[] = [
  { label: "亚洲", value: "Asia" },
  { label: "欧洲", value: "Europe" },
  { label: "非洲", value: "Africa" },
  { label: "大洋洲", value: "Oceania" },
  { label: "北美", value: "North America" },
  { label: "拉美", value: "Latin America and the Caribbean" },
  { label: "中东", value: "Middle East" },
  { label: "其他", value: "Other" },
];

export const officeTypeOptions: SelectOption[] = [
  { label: "国家/地区主管局", value: "national_ip_office" },
  { label: "区域局", value: "regional_office" },
  { label: "国际局/国际组织", value: "international_office" },
];

export const businessRegionOptions: SelectOption[] = [
  { label: "欧洲", value: "EUROPE" },
  { label: "北美", value: "NORTH_AMERICA" },
  { label: "拉美", value: "LATIN_AMERICA" },
  { label: "东南亚", value: "SOUTHEAST_ASIA" },
  { label: "日韩", value: "NORTHEAST_ASIA_JP_KR" },
  { label: "大中华 / 港澳台", value: "GREATER_CHINA" },
  { label: "中东", value: "MIDDLE_EAST" },
  { label: "非洲", value: "AFRICA" },
  { label: "澳新 / 大洋洲", value: "ANZ_OCEANIA" },
  { label: "南亚", value: "SOUTH_ASIA" },
  { label: "一带一路", value: "BELT_AND_ROAD" },
  { label: "其他", value: "OTHER" },
];

export const economicOrgOptions: SelectOption[] = [
  { label: "APEC", value: "APEC" },
  { label: "ASEAN", value: "ASEAN" },
  { label: "BRICS", value: "BRICS" },
  { label: "欧盟", value: "EU" },
];

export const internalAnalyticsTagOptions: SelectOption[] = [
  { label: "高成本市场", value: "HIGH_COST_MARKET" },
  { label: "高频报价市场", value: "HIGH_FREQUENCY_QUOTATION_MARKET" },
  { label: "高成交市场", value: "HIGH_CONVERSION_MARKET" },
  { label: "低频高价值市场", value: "LOW_FREQUENCY_HIGH_VALUE_MARKET" },
  { label: "重点市场", value: "KEY_MARKET" },
];

export const businessTagOptions: BusinessTagOption[] = [
  ...businessRegionOptions.map((option) => ({ ...option, group: "BUSINESS_REGION" as const })),
  ...economicOrgOptions.map((option) => ({ ...option, group: "ECONOMIC_ORG" as const })),
];

export function optionLabel(options: SelectOption[], value?: string | null): string {
  if (!value) {
    return "";
  }
  return options.find((option) => option.value === value)?.label ?? value;
}

export function optionLabels(options: SelectOption[], values?: string[] | null): string {
  if (!values?.length) {
    return "";
  }
  return values.map((value) => optionLabel(options, value)).join("，");
}
