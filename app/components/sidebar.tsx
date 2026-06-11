"use client";

import type { ActiveTab, CountryRuleSection, User } from "../types";

type SidebarProps = {
  activeTab: ActiveTab;
  user: User;
  activeCountryConfigSection: CountryRuleSection;
  setActiveTab: (tab: ActiveTab) => void;
  setCountryConfigSection: (section: CountryRuleSection) => void;
  openApprovalsTab: () => void;
  logout: () => void;
};

type NavItem = {
  key: ActiveTab;
  label: string;
  shortLabel: string;
  roles?: User["role"][];
  action?: () => void;
};

function navigationItems(user: User, openApprovalsTab: () => void): NavItem[] {
  const items: NavItem[] = [
    { key: "customers", label: "客户管理", shortLabel: "客户" },
    { key: "create", label: "报价工作台", shortLabel: "工作台" },
    {
      key: "list",
      label: user.role === "admin" ? "全部报价" : "我的报价",
      shortLabel: "报价",
    },
    { key: "stats", label: "统计看板", shortLabel: "统计" },
    { key: "country-config", label: "底层数据维护", shortLabel: "底层数据", roles: ["admin", "approver"] },
    { key: "rules", label: "价格规则", shortLabel: "规则", roles: ["admin"] },
    {
      key: "approvals",
      label: "审批解锁",
      shortLabel: "审批",
      roles: ["consultant", "admin", "approver"],
      action: openApprovalsTab,
    },
    { key: "users", label: "用户管理", shortLabel: "用户", roles: ["admin"] },
  ];
  return items.filter((item) => !item.roles || item.roles.includes(user.role));
}

function roleLabel(role: User["role"]): string {
  if (role === "admin") {
    return "管理员";
  }
  if (role === "approver") {
    return "审批人";
  }
  return "顾问";
}

const countryConfigSubnav: { key: CountryRuleSection; label: string }[] = [
  { key: "overview", label: "管理视图" },
  { key: "countries", label: "国家/地区/受理局主档" },
  { key: "treaty", label: "条约/体系成员信息查询" },
  { key: "path", label: "路径矩阵" },
  { key: "deadline", label: "期限程序" },
  { key: "entity", label: "实体类型" },
  { key: "language", label: "语言翻译" },
  { key: "fx", label: "汇率与税率" },
  { key: "special", label: "非常规事项" },
];

export function Sidebar({
  activeTab,
  user,
  activeCountryConfigSection,
  setActiveTab,
  setCountryConfigSection,
  openApprovalsTab,
  logout,
}: SidebarProps) {
  const items = navigationItems(user, openApprovalsTab);

  function selectItem(item: NavItem): void {
    if (item.action) {
      item.action();
      return;
    }
    if (item.key === "country-config" && user.role === "approver") {
      setCountryConfigSection("treaty");
    }
    setActiveTab(item.key);
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[oklch(82%_0.025_178)] bg-[oklch(94%_0.018_178)] px-4 py-5 lg:flex lg:flex-col">
      <div className="rounded-lg border border-[oklch(80%_0.028_178)] bg-[oklch(97%_0.012_178)] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[oklch(38%_0.08_178)]">ZYIP Quote</p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight">专利报价管理系统</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-[oklch(35%_0.09_178)] text-sm font-semibold text-[oklch(97%_0.008_178)]">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-[oklch(44%_0.045_178)]">{roleLabel(user.role)}</p>
          </div>
        </div>
      </div>

      <nav className="mt-5 grid gap-1">
        {items.map((item) => (
          <div key={item.key}>
            <button
              className={`flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm font-medium transition ${
                activeTab === item.key
                  ? "bg-[oklch(35%_0.09_178)] text-[oklch(97%_0.008_178)] shadow-sm"
                  : "text-[oklch(34%_0.04_178)] hover:bg-[oklch(90%_0.022_178)]"
              }`}
              type="button"
              onClick={() => selectItem(item)}
            >
              <span>{item.label}</span>
              {activeTab === item.key ? <span className="text-xs opacity-80">当前</span> : null}
            </button>
            {item.key === "country-config" && activeTab === "country-config" ? (
              <div className="my-2 ml-4 border-l-4 border-[oklch(38%_0.085_178)] bg-[oklch(97%_0.012_178)] py-1">
                {countryConfigSubnav.filter((section) => user.role === "admin" || section.key === "treaty").map((section) => (
                  <button
                    key={section.key}
                    className={`block min-h-10 w-full px-3 py-2 text-left text-sm font-semibold transition ${
                      activeCountryConfigSection === section.key
                        ? "bg-[oklch(91%_0.02_178)] text-[oklch(31%_0.09_178)]"
                        : "text-[oklch(43%_0.04_178)] hover:bg-[oklch(93%_0.018_178)] hover:text-[oklch(32%_0.075_178)]"
                    }`}
                    type="button"
                    onClick={() => {
                      setCountryConfigSection(section.key);
                      setActiveTab("country-config");
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-[oklch(84%_0.024_178)] pt-4">
        <button
          className="h-10 w-full rounded-md px-3 text-left text-sm font-medium text-[oklch(40%_0.05_28)] transition hover:bg-[oklch(91%_0.026_28)]"
          type="button"
          onClick={logout}
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ activeTab, user, setActiveTab, setCountryConfigSection, openApprovalsTab }: Omit<SidebarProps, "logout">) {
  const items = navigationItems(user, openApprovalsTab);

  function selectItem(item: NavItem): void {
    if (item.action) {
      item.action();
      return;
    }
    if (item.key === "country-config" && user.role === "approver") {
      setCountryConfigSection("treaty");
    }
    setActiveTab(item.key);
  }

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {items.map((item) => (
        <button
          key={item.key}
          className={`h-10 shrink-0 rounded-md px-4 text-sm font-medium transition ${
            activeTab === item.key
              ? "bg-[oklch(35%_0.09_178)] text-[oklch(97%_0.008_178)]"
              : "text-[oklch(34%_0.04_178)] hover:bg-[oklch(90%_0.022_178)]"
          }`}
          type="button"
          onClick={() => selectItem(item)}
        >
          {item.shortLabel}
        </button>
      ))}
    </div>
  );
}
