"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import type {
  Country,
  IpSystemApplyUpdatesResponse,
  IpSystemCheckUpdatesResponse,
  IpSystemDataSource,
  IpSystemJurisdictionMembershipGroup,
  IpSystemJurisdictionOption,
  IpSystemMembersResponse,
  IpSystemQueryMember,
  IpSystemQuerySystem,
  IpSystemReferenceObjectsResponse,
  IpSystemUpdateHistoryItem,
  IpSystemUpdateDiff,
  User,
} from "../types";
import { apiBase, authHeaders, readApiErrorMessage } from "../utils";

type IpSystemsPanelProps = {
  currentUser: User;
  authToken: string;
  countries: Country[];
};

const categoryLabels: Record<string, string> = {
  international_treaty: "国际条约",
  regional_patent_system: "区域专利体系",
  regional_design_system: "区域外观设计体系",
  regional_trademark_system: "区域商标体系",
  regional_organization: "区域组织",
  court_or_unitary_effect_system: "统一专利体系",
};

const diffLabels: Record<IpSystemUpdateDiff["change_type"], string> = {
  added_member: "新增",
  removed_member: "删除",
  effective_date_changed: "日期变化",
  name_changed: "名称变化",
  code_changed: "代码变化",
  remark_changed: "备注变化",
  source_changed: "来源变化",
  route_type_changed: "路径类型变化",
  object_type_changed: "对象类型变化",
  profile_url_changed: "profile 链接变化",
};

const sourceTypeLabels: Record<string, string> = {
  treaty_membership_source: "成员数据源",
  paris_non_pct_route_source: "Paris 非 PCT 路径",
  regional_route_source: "区域路径",
  reference_source: "参考名录来源",
  design_scope_source: "欧盟外观适用范围",
  extension_state_source: "EPC 延伸关系",
  validation_state_source: "EPC 生效关系",
};

const applyTargetLabels: Record<string, string> = {
  "confirmed membership baseline": "正式成员数据",
  "PCT regional route baseline": "PCT 区域路径数据",
  "Paris non-PCT route baseline": "Paris 非 PCT 路径数据",
  "reference object baseline": "参考对象数据",
  "EU Design/RCD scope baseline": "欧盟外观适用范围数据",
  "EPC extension relation baseline": "EPC 延伸关系数据",
  "EPC validation relation baseline": "EPC 生效关系数据",
};

const pageSizeOptions = [10, 20, 50, "all"] as const;

type PageSize = typeof pageSizeOptions[number];

type PagedResult<T> = {
  pageItems: T[];
  totalPages: number;
  start: number;
  end: number;
};

type MemberSortKey =
  | "name_zh"
  | "name_en"
  | "code"
  | "effective_date"
  | "master_status_label"
  | "membership_relation_type_label"
  | "internal_remark";

type SortDirection = "asc" | "desc";

export function IpSystemsPanel({ currentUser, authToken }: IpSystemsPanelProps) {
  const isAdmin = currentUser.role === "admin";
  const [systems, setSystems] = useState<IpSystemQuerySystem[]>([]);
  const [selectedSystemCode, setSelectedSystemCode] = useState("");
  const [membersResponse, setMembersResponse] = useState<IpSystemMembersResponse | null>(null);
  const [keyword, setKeyword] = useState("");
  const [jurisdictionOptions, setJurisdictionOptions] = useState<IpSystemJurisdictionOption[]>([]);
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<IpSystemJurisdictionOption[]>([]);
  const [membershipGroups, setMembershipGroups] = useState<IpSystemJurisdictionMembershipGroup[]>([]);
  const [showDataSources, setShowDataSources] = useState(false);
  const [dataSourceSystemCode, setDataSourceSystemCode] = useState("PCT");
  const [dataSources, setDataSources] = useState<IpSystemDataSource[]>([]);
  const [updateHistory, setUpdateHistory] = useState<IpSystemUpdateHistoryItem[]>([]);
  const [referenceObjects, setReferenceObjects] = useState<IpSystemReferenceObjectsResponse | null>(null);
  const [showReferenceObjects, setShowReferenceObjects] = useState(false);
  const [checkResult, setCheckResult] = useState<IpSystemCheckUpdatesResponse | null>(null);
  const [systemsPage, setSystemsPage] = useState(1);
  const [systemsPageSize, setSystemsPageSize] = useState<PageSize>(10);
  const [showSystemsList, setShowSystemsList] = useState(true);
  const [showMemberDetail, setShowMemberDetail] = useState(true);
  const [showCheckResult, setShowCheckResult] = useState(false);
  const [activeQueryMode, setActiveQueryMode] = useState<"system" | "jurisdiction">("system");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const diffPreviewRef = useRef<HTMLDivElement | null>(null);

  const pagedSystems = useMemo(
    () => paginateItems(systems, systemsPage, systemsPageSize),
    [systems, systemsPage, systemsPageSize],
  );

  const apiGet = useCallback(async <T,>(path: string): Promise<T> => {
    const response = await fetch(`${apiBase}${path}`, {
      headers: authHeaders(authToken, currentUser.email),
    });
    if (!response.ok) {
      throw new Error((await readApiErrorMessage(response)) || "请求失败");
    }
    return (await response.json()) as T;
  }, [authToken, currentUser.email]);

  const apiPost = useCallback(async <T,>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { ...authHeaders(authToken, currentUser.email), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error((await readApiErrorMessage(response)) || "请求失败");
    }
    return (await response.json()) as T;
  }, [authToken, currentUser.email]);

  const apiPatch = useCallback(async <T,>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${apiBase}${path}`, {
      method: "PATCH",
      headers: { ...authHeaders(authToken, currentUser.email), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error((await readApiErrorMessage(response)) || "请求失败");
    }
    return (await response.json()) as T;
  }, [authToken, currentUser.email]);

  const loadSystems = useCallback(async (): Promise<void> => {
    try {
      setSystems(await apiGet<IpSystemQuerySystem[]>("/ip-system-query/systems"));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "条约/体系列表加载失败。");
    }
  }, [apiGet]);

  const searchJurisdictions = useCallback(async (value: string): Promise<void> => {
    try {
      const data = await apiGet<IpSystemJurisdictionOption[]>(`/ip-system-query/jurisdictions/search?keyword=${encodeURIComponent(value)}`);
      setJurisdictionOptions(data.filter((item) => !selectedJurisdictions.some((selected) => optionKey(selected) === optionKey(item))));
    } catch {
      setJurisdictionOptions([]);
    }
  }, [apiGet, selectedJurisdictions]);

  const loadDataSources = useCallback(async (systemCode?: string): Promise<void> => {
    if (!isAdmin) {
      return;
    }
    try {
      const code = systemCode ?? dataSourceSystemCode;
      const query = code && code !== "ALL" ? `?system_code=${encodeURIComponent(code)}` : "";
      setDataSources(await apiGet<IpSystemDataSource[]>(`/ip-system-query/data-sources${query}`));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "数据源加载失败。");
    }
  }, [apiGet, dataSourceSystemCode, isAdmin]);

  const loadUpdateHistory = useCallback(async (sourceId?: string): Promise<void> => {
    if (!isAdmin) {
      return;
    }
    try {
      const query = sourceId ? `?source_id=${encodeURIComponent(sourceId)}&limit=1000` : "?limit=1000";
      setUpdateHistory(await apiGet<IpSystemUpdateHistoryItem[]>(`/ip-system-query/update-history${query}`));
    } catch {
      setUpdateHistory([]);
    }
  }, [apiGet, isAdmin]);

  useEffect(() => {
    window.queueMicrotask(() => {
      void loadSystems();
    });
  }, [loadSystems]);

  useEffect(() => {
    const value = keyword.trim();
    const timeoutId = window.setTimeout(() => {
      if (!value) {
        setJurisdictionOptions([]);
        return;
      }
      void searchJurisdictions(value);
    }, 220);
    return () => window.clearTimeout(timeoutId);
  }, [keyword, searchJurisdictions]);

  useEffect(() => {
    if (showDataSources) {
      window.queueMicrotask(() => {
        void loadDataSources();
        void loadUpdateHistory();
      });
    }
  }, [loadDataSources, loadUpdateHistory, showDataSources]);

  async function loadMembers(systemCode: string): Promise<void> {
    try {
      setLoading(true);
      setSelectedSystemCode(systemCode);
      setCheckResult(null);
      setShowMemberDetail(true);
      setShowCheckResult(false);
      setMembersResponse(await apiGet<IpSystemMembersResponse>(`/ip-system-query/systems/${encodeURIComponent(systemCode)}/members`));
      if (showDataSources) {
        setDataSourceSystemCode(systemCode);
        await loadDataSources(systemCode);
      }
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "成员列表加载失败。");
    } finally {
      setLoading(false);
    }
  }

  function selectJurisdiction(option: IpSystemJurisdictionOption): void {
    if (selectedJurisdictions.some((item) => optionKey(item) === optionKey(option))) {
      return;
    }
    setSelectedJurisdictions([...selectedJurisdictions, option]);
    setKeyword("");
    setJurisdictionOptions([]);
  }

  function removeJurisdiction(key: string): void {
    setSelectedJurisdictions(selectedJurisdictions.filter((item) => optionKey(item) !== key));
  }

  async function queryMemberships(): Promise<void> {
    if (!selectedJurisdictions.length) {
      setMessage("请先选择国家/地区。");
      return;
    }
    try {
      setLoading(true);
      setMembershipGroups(await apiPost<IpSystemJurisdictionMembershipGroup[]>("/ip-system-query/jurisdictions/memberships", {
        jurisdiction_ids: selectedJurisdictions.map((item) => item.jurisdiction_id).filter(Boolean),
        jurisdiction_codes: selectedJurisdictions.map((item) => item.code).filter(Boolean),
      }));
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "条约/体系加入情况查询失败。");
    } finally {
      setLoading(false);
    }
  }

  async function checkUpdates(systemCode: string): Promise<void> {
    try {
      setLoading(true);
      const result = await apiPost<IpSystemCheckUpdatesResponse>(
        `/ip-system-query/systems/${encodeURIComponent(systemCode)}/check-updates`,
        {},
      );
      setCheckResult(result);
      setShowCheckResult(true);
      setMessage(result.message || (result.has_changes ? "发现变化" : "未发现变化"));
      if (result.has_changes) {
        window.setTimeout(() => diffPreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "检查更新失败。");
    } finally {
      setLoading(false);
    }
  }

  async function applyUpdates(): Promise<void> {
    if (!checkResult) {
      return;
    }
    if (checkResult.apply_allowed === false || checkResult.check_status === "failed") {
      setMessage("本次检查不允许确认更新。");
      return;
    }
    try {
      setLoading(true);
      const result = await apiPost<IpSystemApplyUpdatesResponse>(
        checkResult.source_id
          ? `/ip-system-query/data-sources/${encodeURIComponent(checkResult.source_id)}/apply-updates`
          : `/ip-system-query/systems/${encodeURIComponent(checkResult.system_code)}/apply-updates`,
        { diffs: checkResult.diffs },
      );
      setMessage(result.summary || result.message || "更新完成。");
      setCheckResult(null);
      await loadSystems();
      await loadUpdateHistory();
      if (selectedSystemCode) {
        await loadMembers(selectedSystemCode);
      }
      if (showDataSources) {
        await loadDataSources();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "确认更新失败。");
    } finally {
      setLoading(false);
    }
  }

  async function toggleDataSources(): Promise<void> {
    const nextVisible = !showDataSources;
    setShowDataSources(nextVisible);
    if (nextVisible) {
      const code = selectedSystemCode || dataSourceSystemCode || "PCT";
      setDataSourceSystemCode(code);
      await loadDataSources(code);
      await loadUpdateHistory();
    }
  }

  async function changeDataSourceSystem(systemCode: string): Promise<void> {
    setDataSourceSystemCode(systemCode);
    await loadDataSources(systemCode);
    await loadUpdateHistory();
  }

  async function openReferenceObjects(): Promise<void> {
    try {
      setLoading(true);
      setReferenceObjects(await apiGet<IpSystemReferenceObjectsResponse>("/ip-system-query/reference-objects"));
      setShowReferenceObjects(true);
      setDataSourceSystemCode("REFERENCE");
      await loadDataSources("REFERENCE");
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "参考对象加载失败。");
    } finally {
      setLoading(false);
    }
  }

  async function saveMemberRemark(member: IpSystemQueryMember, internalRemark: string): Promise<void> {
    if (!selectedSystemCode) {
      return;
    }
    try {
      const updated = await apiPatch<IpSystemQueryMember>(
        `/ip-system-query/systems/${encodeURIComponent(selectedSystemCode)}/members/${encodeURIComponent(member.code)}/remark`,
        { internal_remark: internalRemark },
      );
      setMembersResponse((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          members: current.members.map((item) => (item.code === updated.code ? { ...item, ...updated } : item)),
        };
      });
      setMessage("备注已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "备注保存失败。");
    }
  }

  return (
    <div className="space-y-4 text-[13px]">
      <section className="border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">条约/体系成员信息查询</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <button
                className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
                type="button"
                onClick={() => void toggleDataSources()}
              >
                数据源管理
              </button>
            ) : null}
            <button
              className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
              type="button"
              onClick={() => void openReferenceObjects()}
            >
              WIPO Lex 参考对象看板
            </button>
            <button
              className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
              type="button"
              onClick={() => void loadSystems()}
            >
              刷新
            </button>
          </div>
        </div>
        {message ? <p className="mt-2 rounded-md bg-[oklch(94%_0.02_178)] px-2 py-1.5 text-xs font-medium text-[oklch(32%_0.075_178)]">{message}</p> : null}
      </section>

      {isAdmin && showDataSources ? (
        <DataSourcePanel
          dataSources={dataSources}
          selectedSystemCode={dataSourceSystemCode}
          loading={loading}
          onCollapse={() => setShowDataSources(false)}
          onOpenReferenceObjects={openReferenceObjects}
          updateHistory={updateHistory}
          onSystemChange={changeDataSourceSystem}
          onCreate={async (payload) => {
            setLoading(true);
            try {
              await apiPost<IpSystemDataSource>("/ip-system-query/data-sources", payload);
              await loadDataSources();
              setMessage("数据源已新增。");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "数据源新增失败。");
            } finally {
              setLoading(false);
            }
          }}
          onPatch={async (sourceId, payload) => {
            setLoading(true);
            try {
              await apiPatch<IpSystemDataSource>(`/ip-system-query/data-sources/${encodeURIComponent(sourceId)}`, payload);
              await loadDataSources();
              setMessage("数据源已保存。");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "数据源保存失败。");
            } finally {
              setLoading(false);
            }
          }}
          onCheck={async (sourceId) => {
            setLoading(true);
            try {
              const result = await apiPost<IpSystemCheckUpdatesResponse>(`/ip-system-query/data-sources/${encodeURIComponent(sourceId)}/check-updates`, {});
              setCheckResult(result);
              setShowCheckResult(true);
              await loadDataSources();
              await loadUpdateHistory(sourceId);
              setMessage(result.message || "检查完成。");
              if (result.has_changes || result.apply_allowed) {
                window.setTimeout(() => diffPreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              }
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "检查更新失败。");
            } finally {
              setLoading(false);
            }
          }}
          onLoadHistory={loadUpdateHistory}
        />
      ) : null}

      {showReferenceObjects && referenceObjects ? (
        <ReferenceObjectsPanel
          response={referenceObjects}
          onClose={() => setShowReferenceObjects(false)}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          className={`h-8 rounded-md px-3 text-xs font-semibold ${activeQueryMode === "system" ? "bg-[oklch(35%_0.09_178)] text-white" : "border border-[oklch(72%_0.045_178)] bg-white"}`}
          type="button"
          onClick={() => setActiveQueryMode("system")}
        >
          按条约/体系查询
        </button>
        <button
          className={`h-8 rounded-md px-3 text-xs font-semibold ${activeQueryMode === "jurisdiction" ? "bg-[oklch(35%_0.09_178)] text-white" : "border border-[oklch(72%_0.045_178)] bg-white"}`}
          type="button"
          onClick={() => setActiveQueryMode("jurisdiction")}
        >
          按国家/地区查询
        </button>
      </div>

      <div className="space-y-4">
        {activeQueryMode === "system" ? (
        <section className="border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold">已录入条约、体系</h3>
            <div className="flex items-center gap-2">
              {loading ? <span className="text-sm text-[oklch(44%_0.045_178)]">处理中...</span> : null}
              <button
                className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
                type="button"
                onClick={() => setShowSystemsList(!showSystemsList)}
              >
                {showSystemsList ? "收起" : "展开"}
              </button>
            </div>
          </div>
          {showSystemsList ? (
            <>
              <div className="mt-2 overflow-hidden rounded-md border border-[oklch(84%_0.022_178)] bg-white">
                <table className="w-full table-fixed text-left text-xs">
                  <thead className="bg-[oklch(42%_0.035_178)] text-white">
                    <tr>
                      <th className="px-2 py-1.5">中文名称</th>
                      <th className="px-2 py-1.5">英文简称</th>
                      <th className="px-2 py-1.5">类型</th>
                      <th className="px-2 py-1.5">最近检查时间</th>
                      <th className="px-2 py-1.5">备注</th>
                      <th className="px-2 py-1.5">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedSystems.pageItems.map((system) => (
                      <tr key={system.system_code} className="border-b border-[oklch(88%_0.018_178)] align-top">
                        <td className="px-2 py-1.5 font-semibold"><span className="block truncate" title={system.name_zh}>{system.name_zh}</span></td>
                        <td className="px-2 py-1.5"><span className="block truncate" title={system.short_name || system.system_code}>{system.short_name || system.system_code}</span></td>
                        <td className="px-2 py-1.5"><span className="block truncate" title={categoryLabel(system.category)}>{categoryLabel(system.category)}</span></td>
                        <td className="whitespace-nowrap px-2 py-1.5">{formatDate(system.last_checked_at)}</td>
                        <td className="px-2 py-1.5 text-[oklch(44%_0.045_178)]">
                          <span className="block truncate" title={system.remark || "-"}>{system.remark || "-"}</span>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-nowrap gap-1 whitespace-nowrap">
                            <button
                              className={`h-6 rounded-md px-2 text-xs font-semibold ${selectedSystemCode === system.system_code ? "bg-[oklch(35%_0.09_178)] text-white" : "border border-[oklch(72%_0.045_178)]"}`}
                              type="button"
                              onClick={() => void loadMembers(system.system_code)}
                            >
                              查看成员
                            </button>
                            {isAdmin ? (
                              <button
                                className="h-6 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
                                type="button"
                                onClick={() => void checkUpdates(system.system_code)}
                              >
                                检查更新
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!systems.length ? (
                      <tr>
                        <td className="px-3 py-4 text-center text-[oklch(44%_0.045_178)]" colSpan={6}>暂无已录入条约/体系。</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <PaginationBar
                page={systemsPage}
                pageSize={systemsPageSize}
                total={systems.length}
                totalPages={pagedSystems.totalPages}
                start={pagedSystems.start}
                end={pagedSystems.end}
                onPageChange={setSystemsPage}
                onPageSizeChange={(value) => {
                  setSystemsPageSize(value);
                  setSystemsPage(1);
                }}
              />
            </>
          ) : (
              <p className="mt-2 rounded-md border border-[oklch(84%_0.022_178)] bg-white px-2 py-1.5 text-xs text-[oklch(44%_0.045_178)]">
              已录入条约/体系列表已收起。
            </p>
          )}

          {membersResponse ? (
            <div className="mt-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[oklch(42%_0.06_178)]">成员详情</p>
                  <p className="text-xs font-semibold uppercase text-[oklch(42%_0.06_178)]">{membersResponse.system.short_name || membersResponse.system.system_code}</p>
                  <h4 className="mt-1 text-base font-semibold">{membersResponse.system.name_zh}</h4>
                </div>
                <button
                  className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
                  type="button"
                  onClick={() => setShowMemberDetail(!showMemberDetail)}
                >
                  {showMemberDetail ? "收起" : "展开"}
                </button>
              </div>
              {showMemberDetail ? (
                <>
                  <StatsBlock response={membersResponse} />
                  {membersResponse.overall_remark ? (
                    <div className="mt-2 rounded-md border border-[oklch(84%_0.022_178)] bg-white px-2 py-1.5 text-xs">
                      <p className="text-xs font-semibold text-[oklch(44%_0.045_178)]">体系说明 / 总体备注</p>
                      <p className="mt-1">{membersResponse.overall_remark}</p>
                    </div>
                  ) : null}
                  <MemberTable
                    historicalMembers={membersResponse.historical_members || []}
                    isAdmin={isAdmin}
                    members={membersResponse.members}
                    onSaveRemark={saveMemberRemark}
                  />
                </>
              ) : (
                <p className="mt-2 rounded-md border border-[oklch(84%_0.022_178)] bg-white px-2 py-1.5 text-xs text-[oklch(44%_0.045_178)]">
                  当前体系成员详情已收起。
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-[oklch(84%_0.022_178)] bg-white px-3 py-4 text-xs text-[oklch(44%_0.045_178)]">
              请选择一个条约/体系查看成员。
            </div>
          )}

          {checkResult && showCheckResult ? (
            <CheckResultPanel
              refNode={diffPreviewRef}
              isAdmin={isAdmin}
              result={checkResult}
              onApply={applyUpdates}
              onCollapse={() => setShowCheckResult(false)}
            />
          ) : null}
        </section>
        ) : null}

        {activeQueryMode === "jurisdiction" ? (
        <section className="border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] px-3 py-3">
          <h3 className="text-base font-semibold">按国家/地区查询</h3>
          <div className="relative mt-3">
            <input
              className="h-7 w-full rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs"
              placeholder="输入国家/地区中文名或代码，可多选"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            {jurisdictionOptions.length ? (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-[oklch(82%_0.026_178)] bg-white shadow-lg">
                {jurisdictionOptions.map((option) => (
                  <button
                    key={optionKey(option)}
                    className="block w-full px-2 py-1.5 text-left text-xs hover:bg-[oklch(94%_0.02_178)]"
                    type="button"
                    onClick={() => selectJurisdiction(option)}
                  >
                    <span className="font-semibold">{option.name_zh}</span>
                    <span className="ml-2 text-[oklch(44%_0.045_178)]">{option.code} · {option.name_en || "-"}</span>
                    <span className="ml-2 text-xs text-[oklch(44%_0.045_178)]">{option.master_status_label} · {option.object_type_label || option.member_type || "对象"}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-2 min-h-12 rounded-md border border-[oklch(84%_0.022_178)] bg-white p-2">
            {selectedJurisdictions.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedJurisdictions.map((item) => (
                  <span key={optionKey(item)} className="inline-flex items-center gap-1.5 rounded-md bg-[oklch(94%_0.02_178)] px-2 py-1 text-xs font-semibold">
                    {item.name_zh} {item.code}
                    <span className="text-xs font-medium text-[oklch(44%_0.045_178)]">{item.master_status_label}</span>
                    <span className="text-xs font-medium text-[oklch(44%_0.045_178)]">{item.object_type_label || item.member_type || "对象"}</span>
                    <button className="text-[oklch(40%_0.05_28)]" type="button" onClick={() => removeJurisdiction(optionKey(item))}>移除</button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[oklch(44%_0.045_178)]">已选国家/地区会显示在这里。</p>
            )}
          </div>

          <button
            className="mt-2 h-7 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-xs font-semibold text-white disabled:opacity-50"
            disabled={!selectedJurisdictions.length || loading}
            type="button"
            onClick={() => void queryMemberships()}
          >
            查询条约/体系加入情况
          </button>

          <div className="mt-4 space-y-2">
            {membershipGroups.map((group) => (
              <article key={group.jurisdiction_id || group.code} className="rounded-md border border-[oklch(84%_0.022_178)] bg-white p-2.5">
                <div>
                  <h4 className="text-sm font-semibold">{group.name_zh} {group.code}</h4>
                  <p className="mt-1 text-xs text-[oklch(44%_0.045_178)]">{group.name_en || "-"} · {group.master_status_label} · {group.object_type_label || "对象"}</p>
                </div>
                {group.memberships.length ? (
                  <div className="mt-3 overflow-hidden rounded-md border border-[oklch(88%_0.018_178)]">
                    <table className="w-full table-fixed text-left text-xs">
                      <thead className="bg-[oklch(94%_0.02_178)]">
                        <tr>
                          <th className="px-2 py-1.5">已加入/适用体系</th>
                          <th className="px-2 py-1.5">关系类型</th>
                          <th className="px-2 py-1.5">PCT 路径提示</th>
                          <th className="px-2 py-1.5">加入/生效/适用时间</th>
                          <th className="px-2 py-1.5">备注</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.memberships.map((membership) => (
                          <tr key={`${group.jurisdiction_id || group.code}-${membership.system_code}`} className="border-t border-[oklch(88%_0.018_178)]">
                            <td className="px-2 py-1.5 font-semibold"><span className="block truncate" title={`${membership.system_name_zh}（${membership.short_name || membership.system_code}）`}>{membership.system_name_zh}（{membership.short_name || membership.system_code}）</span></td>
                            <td className="px-2 py-1.5">{membership.membership_relation_type_label || "-"}</td>
                            <td className="px-2 py-1.5">
                              {membership.pct_route_type_label ? (
                                <span className="block truncate" title={membership.pct_route_type_label}>{membership.pct_route_type_label}</span>
                              ) : "-"}
                            </td>
                            <td className="px-2 py-1.5">{formatDate(membership.effective_date)}</td>
                            <td className="px-2 py-1.5"><span className="block truncate" title={membership.internal_remark || membership.route_remark || membership.remark || "-"}>{membership.internal_remark || membership.route_remark || membership.remark || "-"}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 rounded-md bg-[oklch(96%_0.008_178)] px-3 py-2 text-xs text-[oklch(44%_0.045_178)]">
                    当前没有可展示的已确认条约/体系加入情况。
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
        ) : null}
      </div>
    </div>
  );
}

function DataSourcePanel({
  dataSources,
  selectedSystemCode,
  loading,
  updateHistory,
  onCollapse,
  onOpenReferenceObjects,
  onSystemChange,
  onCreate,
  onPatch,
  onCheck,
  onLoadHistory,
}: {
  dataSources: IpSystemDataSource[];
  selectedSystemCode: string;
  loading: boolean;
  updateHistory: IpSystemUpdateHistoryItem[];
  onCollapse: () => void;
  onOpenReferenceObjects: () => Promise<void>;
  onSystemChange: (systemCode: string) => Promise<void>;
  onCreate: (payload: Partial<IpSystemDataSource>) => Promise<void>;
  onPatch: (sourceId: string, payload: Partial<IpSystemDataSource>) => Promise<void>;
  onCheck: (sourceId: string) => Promise<void>;
  onLoadHistory: (sourceId?: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState({
    system_code: "PCT",
    source_name: "",
    source_type: "treaty_membership_source",
    source_url: "",
    purpose_note: "",
    is_enabled: true,
  });
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState<Partial<IpSystemDataSource>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [historySourceFilter, setHistorySourceFilter] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyKeyword, setHistoryKeyword] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState<PageSize>(10);
  const editingSource = useMemo(
    () => dataSources.find((source) => source.id === editingId) ?? null,
    [dataSources, editingId],
  );

  const filteredHistory = useMemo(() => {
    const keyword = historyKeyword.trim().toLowerCase();
    return updateHistory.filter((item) => {
      const created = item.created_at ? item.created_at.slice(0, 10) : "";
      const matchesSource = !historySourceFilter || item.source_id === historySourceFilter;
      const matchesType = !historyTypeFilter || item.source_type === historyTypeFilter || item.update_type === historyTypeFilter;
      const matchesStart = !historyStartDate || (created && created >= historyStartDate);
      const matchesEnd = !historyEndDate || (created && created <= historyEndDate);
      const text = `${item.source_name} ${item.system_code} ${item.system_summary} ${item.admin_note} ${item.actor}`.toLowerCase();
      return matchesSource && matchesType && matchesStart && matchesEnd && (!keyword || text.includes(keyword));
    });
  }, [historyEndDate, historyKeyword, historySourceFilter, historyStartDate, historyTypeFilter, updateHistory]);

  const pagedHistory = useMemo(
    () => paginateItems(filteredHistory, historyPage, historyPageSize),
    [filteredHistory, historyPage, historyPageSize],
  );

  const historyTypes = useMemo(
    () => Array.from(new Set(updateHistory.map((item) => item.source_type || item.update_type).filter(Boolean))),
    [updateHistory],
  );

  return (
    <section className="border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] px-3 py-3 text-[13px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold">数据源管理</h3>
          <select
            className="h-7 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs"
            value={selectedSystemCode}
            onChange={(event) => void onSystemChange(event.target.value)}
          >
            {["PCT", "PARIS", "EPC", "EU_DESIGN", "REFERENCE", "ALL"].map((code) => (
              <option key={code} value={code}>{code === "ALL" ? "全部" : code}</option>
            ))}
          </select>
          {loading ? <span className="text-xs text-[oklch(44%_0.045_178)]">处理中...</span> : null}
        </div>
        <button className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={onCollapse}>
          收起
        </button>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-[90px_minmax(150px,1fr)_150px_minmax(180px,1.2fr)_minmax(180px,1.2fr)_64px]">
        <select className="h-7 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs" value={draft.system_code} onChange={(event) => setDraft({ ...draft, system_code: event.target.value })}>
          {["PCT", "PARIS", "EPC", "EU_DESIGN", "REFERENCE"].map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
        <input className="h-7 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs" placeholder="数据源名称" value={draft.source_name} onChange={(event) => setDraft({ ...draft, source_name: event.target.value })} />
        <select className="h-7 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs" value={draft.source_type} onChange={(event) => setDraft({ ...draft, source_type: event.target.value })}>
          {Object.entries(sourceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input className="h-7 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs" placeholder="URL" value={draft.source_url} onChange={(event) => setDraft({ ...draft, source_url: event.target.value })} />
        <input className="h-7 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs" placeholder="用途说明" value={draft.purpose_note} onChange={(event) => setDraft({ ...draft, purpose_note: event.target.value })} />
        <button
          className="h-7 rounded-md bg-[oklch(35%_0.09_178)] px-2 text-xs font-semibold text-white disabled:opacity-50"
          disabled={!draft.source_name.trim() || loading}
          type="button"
          onClick={() => {
            void onCreate(draft).then(() => setDraft({ ...draft, source_name: "", source_url: "", purpose_note: "" }));
          }}
        >
          新增
        </button>
      </div>

      <div className="mt-2 overflow-x-auto rounded-md border border-[oklch(84%_0.022_178)] bg-white">
        <table className="w-full min-w-[1680px] table-fixed text-left text-[13px]">
          <thead className="bg-[oklch(94%_0.02_178)]">
            <tr>
              <th className="w-20 whitespace-nowrap px-2 py-1.5">体系</th>
              <th className="w-56 whitespace-nowrap px-2 py-1.5">数据源名称</th>
              <th className="w-36 whitespace-nowrap px-2 py-1.5">类型</th>
              <th className="w-24 whitespace-nowrap px-2 py-1.5">URL</th>
              <th className="w-72 whitespace-nowrap px-2 py-1.5">用途说明</th>
              <th className="w-16 whitespace-nowrap px-2 py-1.5">启用</th>
              <th className="w-28 whitespace-nowrap px-2 py-1.5">最近检查</th>
              <th className="w-72 whitespace-nowrap px-2 py-1.5">检查摘要</th>
              <th className="w-32 whitespace-nowrap px-2 py-1.5">最近成功更新</th>
              <th className="w-72 whitespace-nowrap px-2 py-1.5">系统更新摘要</th>
              <th className="w-56 whitespace-nowrap px-2 py-1.5">管理员说明</th>
              <th className="w-64 whitespace-nowrap px-2 py-1.5">操作</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((source) => {
              return (
                <tr key={source.id} className="border-t border-[oklch(88%_0.018_178)] align-top">
                  <td className="whitespace-nowrap px-2 py-1.5 font-semibold">{source.system_code}</td>
                  <td className="px-2 py-1.5">
                    <span className="block truncate" title={source.source_name}>{source.source_name}</span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5">{sourceTypeLabels[source.source_type] || source.source_type}</td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    {source.source_url ? <a className="text-[oklch(35%_0.09_178)]" href={source.source_url} target="_blank" rel="noreferrer">打开</a> : "-"}
                  </td>
                  <td className="px-2 py-1.5">
                    <span className="block truncate" title={businessText(source.purpose_note || "-")}>{businessText(source.purpose_note || "-")}</span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5">
                    {source.is_enabled ? "是" : "否"}
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5">{formatDate(source.last_checked_at)}</td>
                  <td className="px-2 py-1.5"><span className="block truncate" title={businessText(source.last_check_summary || source.last_check_message || "-")}>{businessText(source.last_check_summary || source.last_check_message || "-")}</span></td>
                  <td className="whitespace-nowrap px-2 py-1.5">{formatDate(source.last_success_at)}</td>
                  <td className="px-2 py-1.5">
                    <span className="block truncate" title={businessText(source.last_update_summary || "-")}>{businessText(source.last_update_summary || "-")}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className="block truncate" title={source.admin_update_note || "-"}>{source.admin_update_note || "-"}</span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex flex-nowrap gap-1 whitespace-nowrap">
                      <button className="h-6 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={() => { setEditingId(source.id); setEditDraft(source); }}>编辑</button>
                      <button className="h-6 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={() => void onCheck(source.id)}>检查</button>
                      <button
                        className="h-6 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
                        type="button"
                        onClick={() => {
                          setShowHistory(true);
                          setHistorySourceFilter(source.id);
                          setHistoryPage(1);
                          void onLoadHistory();
                        }}
                      >
                        历史
                      </button>
                      {source.source_type === "reference_source" && source.source_url ? (
                        <button className="h-6 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={() => void onOpenReferenceObjects()}>
                          参考对象
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!dataSources.length ? (
              <tr>
                <td className="px-3 py-4 text-center text-[oklch(44%_0.045_178)]" colSpan={12}>暂无数据源。</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold"
          type="button"
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) {
              setHistorySourceFilter("");
              void onLoadHistory();
            }
          }}
        >
          {showHistory ? "收起历史摘要" : "查看历史摘要"}
        </button>
        <span className="text-xs text-[oklch(44%_0.045_178)]">历史摘要默认收起，可按数据源、类型、日期和关键词筛选。</span>
      </div>
      {showHistory ? (
        <UpdateHistoryPanel
          dataSources={dataSources}
          history={pagedHistory.pageItems}
          historyTypes={historyTypes}
          page={historyPage}
          pageSize={historyPageSize}
          total={filteredHistory.length}
          totalPages={pagedHistory.totalPages}
          start={pagedHistory.start}
          end={pagedHistory.end}
          sourceFilter={historySourceFilter}
          typeFilter={historyTypeFilter}
          startDate={historyStartDate}
          endDate={historyEndDate}
          keyword={historyKeyword}
          onSourceFilterChange={(value) => {
            setHistorySourceFilter(value);
            setHistoryPage(1);
          }}
          onTypeFilterChange={(value) => {
            setHistoryTypeFilter(value);
            setHistoryPage(1);
          }}
          onStartDateChange={(value) => {
            setHistoryStartDate(value);
            setHistoryPage(1);
          }}
          onEndDateChange={(value) => {
            setHistoryEndDate(value);
            setHistoryPage(1);
          }}
          onKeywordChange={(value) => {
            setHistoryKeyword(value);
            setHistoryPage(1);
          }}
          onPageChange={setHistoryPage}
          onPageSizeChange={(value) => {
            setHistoryPageSize(value);
            setHistoryPage(1);
          }}
        />
      ) : null}
      {editingSource ? (
        <DataSourceEditDialog
          draft={{ ...editingSource, ...editDraft }}
          loading={loading}
          onChange={(payload) => setEditDraft({ ...editDraft, ...payload })}
          onClose={() => {
            setEditingId("");
            setEditDraft({});
          }}
          onSave={() => {
            void onPatch(editingSource.id, editDraft).then(() => {
              setEditingId("");
              setEditDraft({});
            });
          }}
        />
      ) : null}
    </section>
  );
}

function DataSourceEditDialog({
  draft,
  loading,
  onChange,
  onClose,
  onSave,
}: {
  draft: Partial<IpSystemDataSource>;
  loading: boolean;
  onChange: (payload: Partial<IpSystemDataSource>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/20 p-3">
      <div className="mt-8 max-h-[calc(100vh-4rem)] w-full max-w-xl overflow-y-auto rounded-md border border-[oklch(82%_0.026_178)] bg-white text-[13px] shadow-xl">
        <div className="flex items-center justify-between border-b border-[oklch(88%_0.018_178)] px-3 py-2">
          <div>
            <h4 className="text-sm font-semibold">编辑数据源</h4>
            <p className="mt-0.5 text-xs text-[oklch(44%_0.045_178)]">{draft.source_name || draft.id}</p>
          </div>
          <button className="h-6 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="grid gap-2 px-3 py-2 md:grid-cols-2">
          <label className="text-xs font-semibold">
            体系
            <select className="mt-1 h-7 w-full rounded-md border px-2 font-normal" value={String(draft.system_code || "")} onChange={(event) => onChange({ system_code: event.target.value })}>
              {["PCT", "PARIS", "EPC", "EU_DESIGN", "REFERENCE"].map((code) => <option key={code} value={code}>{code}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold">
            类型
            <select className="mt-1 h-7 w-full rounded-md border px-2 font-normal" value={String(draft.source_type || "")} onChange={(event) => onChange({ source_type: event.target.value })}>
              {Object.entries(sourceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold md:col-span-2">
            数据源名称
            <input className="mt-1 h-7 w-full rounded-md border px-2 font-normal" value={String(draft.source_name || "")} onChange={(event) => onChange({ source_name: event.target.value })} />
          </label>
          <label className="text-xs font-semibold md:col-span-2">
            URL
            <textarea className="mt-1 min-h-14 w-full resize-y rounded-md border px-2 py-1 font-normal" value={String(draft.source_url || "")} onChange={(event) => onChange({ source_url: event.target.value })} />
          </label>
          <label className="text-xs font-semibold md:col-span-2">
            用途说明
            <textarea className="mt-1 min-h-16 w-full resize-y rounded-md border px-2 py-1 font-normal" value={String(draft.purpose_note || "")} onChange={(event) => onChange({ purpose_note: event.target.value })} />
          </label>
          <label className="text-xs font-semibold">
            系统更新摘要
            <textarea className="mt-1 min-h-14 w-full resize-y rounded-md border px-2 py-1 font-normal" value={String(draft.last_update_summary || "")} onChange={(event) => onChange({ last_update_summary: event.target.value })} />
          </label>
          <label className="text-xs font-semibold">
            管理员说明
            <textarea className="mt-1 min-h-14 w-full resize-y rounded-md border px-2 py-1 font-normal" value={String(draft.admin_update_note || "")} onChange={(event) => onChange({ admin_update_note: event.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input type="checkbox" checked={Boolean(draft.is_enabled)} onChange={(event) => onChange({ is_enabled: event.target.checked })} />
            启用
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-[oklch(88%_0.018_178)] px-3 py-2">
          <button className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-3 text-xs font-semibold" type="button" onClick={onClose}>
            取消
          </button>
          <button className="h-7 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-xs font-semibold text-white disabled:opacity-50" disabled={loading || !String(draft.source_name || "").trim()} type="button" onClick={onSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function UpdateHistoryPanel({
  dataSources,
  history,
  historyTypes,
  page,
  pageSize,
  total,
  totalPages,
  start,
  end,
  sourceFilter,
  typeFilter,
  startDate,
  endDate,
  keyword,
  onSourceFilterChange,
  onTypeFilterChange,
  onStartDateChange,
  onEndDateChange,
  onKeywordChange,
  onPageChange,
  onPageSizeChange,
}: {
  dataSources: IpSystemDataSource[];
  history: IpSystemUpdateHistoryItem[];
  historyTypes: string[];
  page: number;
  pageSize: PageSize;
  total: number;
  totalPages: number;
  start: number;
  end: number;
  sourceFilter: string;
  typeFilter: string;
  startDate: string;
  endDate: string;
  keyword: string;
  onSourceFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onPageChange: (value: number) => void;
  onPageSizeChange: (value: PageSize) => void;
}) {
  return (
    <div className="mt-2 rounded-md border border-[oklch(84%_0.022_178)] bg-white p-2">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_160px_140px_140px_minmax(180px,1fr)]">
        <select className="h-8 rounded-md border px-2 text-xs" value={sourceFilter} onChange={(event) => onSourceFilterChange(event.target.value)}>
          <option value="">全部数据源</option>
          {dataSources.map((source) => (
            <option key={source.id} value={source.id}>{source.source_name}</option>
          ))}
        </select>
        <select className="h-8 rounded-md border px-2 text-xs" value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value)}>
          <option value="">全部更新类型</option>
          {historyTypes.map((type) => (
            <option key={type} value={type}>{sourceTypeLabel(type)}</option>
          ))}
        </select>
        <input className="h-8 rounded-md border px-2 text-xs" type="date" value={startDate} onChange={(event) => onStartDateChange(event.target.value)} />
        <input className="h-8 rounded-md border px-2 text-xs" type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} />
        <input className="h-8 rounded-md border px-2 text-xs" placeholder="搜索数据源、摘要、说明" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} />
      </div>
      <div className="mt-2 overflow-x-auto rounded-md border border-[oklch(88%_0.018_178)]">
        <table className="w-full min-w-[1180px] table-fixed text-left text-xs">
          <thead className="bg-[oklch(94%_0.02_178)]">
          <tr>
            <th className="w-36 whitespace-nowrap px-2 py-1.5">时间</th>
            <th className="w-64 whitespace-nowrap px-2 py-1.5">数据源</th>
            <th className="w-32 whitespace-nowrap px-2 py-1.5">操作人</th>
            <th className="w-36 whitespace-nowrap px-2 py-1.5">更新类型</th>
            <th className="w-20 whitespace-nowrap px-2 py-1.5">数量</th>
            <th className="w-[420px] whitespace-nowrap px-2 py-1.5">系统摘要</th>
            <th className="w-56 whitespace-nowrap px-2 py-1.5">管理员说明</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id} className="border-t border-[oklch(88%_0.018_178)] align-top">
              <td className="whitespace-nowrap px-2 py-1.5">{formatDateTime(item.created_at)}</td>
              <td className="px-2 py-1.5"><span className="block truncate" title={item.source_name || item.system_code}>{item.source_name || item.system_code}</span></td>
              <td className="px-2 py-1.5"><span className="block truncate" title={item.actor || "-"}>{item.actor || "-"}</span></td>
              <td className="whitespace-nowrap px-2 py-1.5">{sourceTypeLabel(item.source_type || item.update_type)}</td>
              <td className="whitespace-nowrap px-2 py-1.5">{item.update_count}</td>
              <td className="px-2 py-1.5"><span className="block truncate" title={businessText(item.system_summary || item.failure_reason || "-")}>{businessText(item.system_summary || item.failure_reason || "-")}</span></td>
              <td className="px-2 py-1.5"><span className="block truncate" title={item.admin_note || "-"}>{item.admin_note || "-"}</span></td>
            </tr>
          ))}
          {!history.length ? (
            <tr>
              <td className="px-2 py-4 text-center text-[oklch(44%_0.045_178)]" colSpan={7}>暂无历史更新摘要。</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        start={start}
        end={end}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

function ReferenceObjectsPanel({
  response,
  onClose,
}: {
  response: IpSystemReferenceObjectsResponse;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [objectTypeFilter, setObjectTypeFilter] = useState("");
  const [masterFilter, setMasterFilter] = useState("");
  const [pctFilter, setPctFilter] = useState("");
  const [parisFilter, setParisFilter] = useState("");
  const [epcFilter, setEpcFilter] = useState("");
  const [designFilter, setDesignFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const objectTypes = useMemo(
    () => Array.from(new Set(response.objects.map((item) => item.object_type_label).filter(Boolean))),
    [response.objects],
  );

  const filteredObjects = useMemo(() => {
    const value = query.trim().toLowerCase();
    return response.objects.filter((item) => (
      (!value
      || item.name_zh.toLowerCase().includes(value)
      || item.name_en.toLowerCase().includes(value)
      || item.code.toLowerCase().includes(value)
      || item.object_type_label.toLowerCase().includes(value))
      && (!objectTypeFilter || item.object_type_label === objectTypeFilter)
      && (!masterFilter || (masterFilter === "exists" ? item.master_status !== "missing" : item.master_status === "missing"))
      && (!pctFilter || booleanFilterValue(item.is_pct_contracting_state, pctFilter))
      && (!parisFilter || booleanFilterValue(item.is_paris_contracting_party, parisFilter))
      && (!epcFilter || booleanFilterValue(Boolean(item.epc_relation_type), epcFilter))
      && (!designFilter || booleanFilterValue(item.is_eu_design_covered, designFilter))
    ));
  }, [designFilter, epcFilter, masterFilter, objectTypeFilter, parisFilter, pctFilter, query, response.objects]);

  const pagedObjects = useMemo(
    () => paginateItems(filteredObjects, page, pageSize),
    [filteredObjects, page, pageSize],
  );

  function resetPage(): void {
    setPage(1);
  }

  return (
    <section className="border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)] px-3 py-3 text-[13px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">WIPO Lex 参考对象看板</h3>
          <p className="mt-1 text-xs text-[oklch(44%_0.045_178)]">{response.source_name} · 标称数量 {response.reference_count}</p>
        </div>
        <button className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={onClose}>
          收起
        </button>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-3 xl:grid-cols-[minmax(180px,1.4fr)_150px_140px_120px_120px_120px_120px]">
        <input
          className="h-8 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-xs"
          placeholder="搜索中文名、英文名、代码"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            resetPage();
          }}
        />
        <select className="h-8 rounded-md border px-2 text-xs" value={objectTypeFilter} onChange={(event) => { setObjectTypeFilter(event.target.value); resetPage(); }}>
          <option value="">全部对象类型</option>
          {objectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select className="h-8 rounded-md border px-2 text-xs" value={masterFilter} onChange={(event) => { setMasterFilter(event.target.value); resetPage(); }}>
          <option value="">全部主档状态</option>
          <option value="exists">已录入主档</option>
          <option value="missing">未录入主档</option>
        </select>
        <BoolFilter value={pctFilter} onChange={(value) => { setPctFilter(value); resetPage(); }} label="PCT" />
        <BoolFilter value={parisFilter} onChange={(value) => { setParisFilter(value); resetPage(); }} label="Paris" />
        <BoolFilter value={epcFilter} onChange={(value) => { setEpcFilter(value); resetPage(); }} label="EPC" />
        <BoolFilter value={designFilter} onChange={(value) => { setDesignFilter(value); resetPage(); }} label="RCD" />
      </div>
      <div className="mt-2 overflow-x-auto rounded-md border border-[oklch(84%_0.022_178)] bg-white">
        <table className="w-full min-w-[1380px] table-fixed text-left text-xs">
          <thead className="bg-[oklch(94%_0.02_178)]">
            <tr>
              <th className="w-14 whitespace-nowrap px-2 py-1.5">序号</th>
              <th className="w-36 whitespace-nowrap px-2 py-1.5">中文名</th>
              <th className="w-56 whitespace-nowrap px-2 py-1.5">英文名</th>
              <th className="w-16 whitespace-nowrap px-2 py-1.5">代码</th>
              <th className="w-32 whitespace-nowrap px-2 py-1.5">对象类型</th>
              <th className="w-28 whitespace-nowrap px-2 py-1.5">主档</th>
              <th className="w-16 whitespace-nowrap px-2 py-1.5">PCT</th>
              <th className="w-16 whitespace-nowrap px-2 py-1.5">Paris</th>
              <th className="w-28 whitespace-nowrap px-2 py-1.5">EPC</th>
              <th className="w-28 whitespace-nowrap px-2 py-1.5">EU Design/RCD</th>
              <th className="w-80 whitespace-nowrap px-2 py-1.5">系统提示</th>
              <th className="w-28 whitespace-nowrap px-2 py-1.5">WIPO Lex profile</th>
              <th className="w-44 whitespace-nowrap px-2 py-1.5">内部备注</th>
            </tr>
          </thead>
          <tbody>
            {pagedObjects.pageItems.map((item) => (
              <tr key={item.code} className="border-t border-[oklch(88%_0.018_178)] align-top">
                <td className="whitespace-nowrap px-2 py-1.5">{item.sequence_no}</td>
                <td className="px-2 py-1.5 font-semibold"><span className="block truncate" title={item.name_zh || "-"}>{item.name_zh || "-"}</span></td>
                <td className="px-2 py-1.5"><span className="block truncate" title={item.name_en || "-"}>{item.name_en || "-"}</span></td>
                <td className="whitespace-nowrap px-2 py-1.5">{item.code}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{item.object_type_label}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{item.master_status_label}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{item.is_pct_contracting_state ? "是" : "否"}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{item.is_paris_contracting_party ? "是" : "否"}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{item.epc_relation_type_label || "否"}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{item.is_eu_design_covered ? "是" : "否"}</td>
                <td className="px-2 py-1.5"><span className="block truncate" title={businessText(item.system_hint || "-")}>{businessText(item.system_hint || "-")}</span></td>
                <td className="whitespace-nowrap px-2 py-1.5"><a className="text-[oklch(35%_0.09_178)]" href={item.profile_url} target="_blank" rel="noreferrer">打开</a></td>
                <td className="px-2 py-1.5"><span className="block truncate" title={item.internal_remark || "-"}>{item.internal_remark || "-"}</span></td>
              </tr>
            ))}
            {!pagedObjects.pageItems.length ? (
              <tr>
                <td className="px-2 py-4 text-center text-[oklch(44%_0.045_178)]" colSpan={13}>没有匹配的参考对象。</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={filteredObjects.length}
        totalPages={pagedObjects.totalPages}
        start={pagedObjects.start}
        end={pagedObjects.end}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
    </section>
  );
}

function StatsBlock({ response }: { response: IpSystemMembersResponse }) {
  const stats = response.stats;
  const relationSummary = Object.entries(stats.relation_type_counts || {})
    .map(([type, count]) => `${relationTypeLabel(type)} ${count}`)
    .join(" / ");
  return (
    <div className="mt-2 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
      <StatItem label="官方成员总数" value={String(stats.official_member_count)} />
      <StatItem label="已录入本系统" value={String(stats.existing_in_master_count)} />
      <StatItem label="未录入本系统" value={String(stats.missing_in_master_count)} />
      <StatItem label="适用关系总数" value={String(stats.applicable_relation_count || stats.official_member_count)} />
      <StatItem label="关系分布" value={relationSummary || "-"} wide />
      <StatItem label="最近检查时间" value={formatDate(stats.last_checked_at)} />
      <StatItem label="数据来源" value={stats.source_name || response.system.source_name || "-"} wide />
      <StatItem label="来源链接" value={stats.source_url ? "官方页面" : "-"} href={stats.source_url} />
    </div>
  );
}

function StatItem({ label, value, href, wide = false }: { label: string; value: string; href?: string; wide?: boolean }) {
  return (
    <div className={`min-h-14 rounded-md border border-[oklch(84%_0.022_178)] bg-white px-2 py-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-xs text-[oklch(44%_0.045_178)]">{label}</p>
      {href ? (
        <a className="mt-0.5 block truncate text-xs font-semibold text-[oklch(35%_0.09_178)]" href={href} target="_blank" rel="noreferrer">{value}</a>
      ) : (
        <p className="mt-0.5 truncate text-xs font-semibold">{value}</p>
      )}
    </div>
  );
}

function MemberTable({
  historicalMembers,
  isAdmin,
  members,
  onSaveRemark,
}: {
  historicalMembers: IpSystemMembersResponse["members"];
  isAdmin: boolean;
  members: IpSystemMembersResponse["members"];
  onSaveRemark: (member: IpSystemQueryMember, internalRemark: string) => Promise<void>;
}) {
  const [sortKey, setSortKey] = useState<MemberSortKey>("code");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingCode, setEditingCode] = useState("");
  const [draftRemark, setDraftRemark] = useState("");
  const [showHistorical, setShowHistorical] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  const sortedMembers = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...members].sort((left, right) => {
      const leftValue = memberSortValue(left, sortKey);
      const rightValue = memberSortValue(right, sortKey);
      return leftValue.localeCompare(rightValue, "zh-Hans-CN", { numeric: true }) * direction;
    });
  }, [members, sortDirection, sortKey]);
  const pagedMembers = useMemo(
    () => paginateItems(sortedMembers, page, pageSize),
    [page, pageSize, sortedMembers],
  );

  function toggleSort(key: MemberSortKey): void {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }

  function sortLabel(key: MemberSortKey, label: string): string {
    if (sortKey !== key) {
      return label;
    }
    return `${label} ${sortDirection === "asc" ? "↑" : "↓"}`;
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="overflow-hidden rounded-md border border-[oklch(84%_0.022_178)] bg-white">
        <table className="w-full table-fixed text-left text-xs">
        <thead className="bg-[oklch(94%_0.02_178)]">
          <tr>
            <th className="px-2 py-1.5">序号</th>
            <SortableTh label={sortLabel("name_zh", "成员/区域局中文名")} onClick={() => toggleSort("name_zh")} />
            <SortableTh label={sortLabel("name_en", "英文名")} onClick={() => toggleSort("name_en")} />
            <SortableTh label={sortLabel("code", "代码")} onClick={() => toggleSort("code")} />
            <SortableTh label={sortLabel("effective_date", "加入/生效/适用时间")} onClick={() => toggleSort("effective_date")} />
            <SortableTh label={sortLabel("master_status_label", "是否已录入主档")} onClick={() => toggleSort("master_status_label")} />
            <SortableTh label={sortLabel("membership_relation_type_label", "关系类型")} onClick={() => toggleSort("membership_relation_type_label")} />
            <th className="px-2 py-1.5">PCT 路径提示</th>
            <SortableTh label={sortLabel("internal_remark", "内部备注")} onClick={() => toggleSort("internal_remark")} />
            <th className="px-2 py-1.5">官方备注</th>
          </tr>
        </thead>
        <tbody>
          {pagedMembers.pageItems.map((member, index) => (
            <tr key={`${member.code}-${member.name_zh}`} className="border-t border-[oklch(88%_0.018_178)]">
              <td className="whitespace-nowrap px-2 py-1.5 text-[oklch(44%_0.045_178)]">{pagedMembers.start + index}</td>
              <td className="px-2 py-1.5 font-semibold"><span className="block truncate" title={member.name_zh || "-"}>{member.name_zh || "-"}</span></td>
              <td className="px-2 py-1.5"><span className="block truncate" title={member.name_en || "-"}>{member.name_en || "-"}</span></td>
              <td className="whitespace-nowrap px-2 py-1.5">{member.code || "-"}</td>
              <td className="whitespace-nowrap px-2 py-1.5">{formatDate(member.effective_date)}</td>
              <td className="whitespace-nowrap px-2 py-1.5">{member.master_status_label}</td>
              <td className="whitespace-nowrap px-2 py-1.5">{member.membership_relation_type_label || "-"}</td>
              <td className="px-2 py-1.5">
                {member.pct_route_type_label ? (
                  <span className="block truncate" title={member.pct_route_type_label}>{member.pct_route_type_label}</span>
                ) : "-"}
                {member.route_remark ? <p className="mt-1 truncate text-xs text-[oklch(44%_0.045_178)]" title={member.route_remark}>{member.route_remark}</p> : null}
              </td>
              <td className="px-2 py-1.5">
                {isAdmin && editingCode === member.code ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="min-h-16 rounded-md border border-[oklch(78%_0.028_178)] px-2 py-1 text-xs"
                      value={draftRemark}
                      onChange={(event) => setDraftRemark(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="h-7 rounded-md bg-[oklch(35%_0.09_178)] px-2 text-xs font-semibold text-white"
                        type="button"
                        onClick={() => {
                          void onSaveRemark(member, draftRemark).then(() => setEditingCode(""));
                        }}
                      >
                        保存
                      </button>
                      <button className="h-7 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={() => setEditingCode("")}>
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="truncate" title={member.internal_remark || "-"}>{member.internal_remark || "-"}</p>
                    {isAdmin ? (
                      <button
                        className="mt-1 text-xs font-semibold text-[oklch(35%_0.09_178)]"
                        type="button"
                        onClick={() => {
                          setEditingCode(member.code);
                          setDraftRemark(member.internal_remark || "");
                        }}
                      >
                        编辑
                      </button>
                    ) : null}
                  </div>
                )}
              </td>
              <td className="px-2 py-1.5"><span className="block truncate" title={member.remark || "-"}>{member.remark || "-"}</span></td>
            </tr>
          ))}
          {!members.length ? (
            <tr>
              <td className="px-3 py-4 text-center text-[oklch(44%_0.045_178)]" colSpan={10}>当前没有可展示的已确认成员数据。</td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={sortedMembers.length}
        totalPages={pagedMembers.totalPages}
        start={pagedMembers.start}
        end={pagedMembers.end}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
      {historicalMembers.length ? (
        <div className="rounded-md border border-[oklch(84%_0.022_178)] bg-white p-2">
          <button className="text-sm font-semibold text-[oklch(35%_0.09_178)]" type="button" onClick={() => setShowHistorical(!showHistorical)}>
            历史关系（仅供历史案件核对）{showHistorical ? " 收起" : " 展开"}
          </button>
          {showHistorical ? (
            <div className="mt-2 overflow-hidden rounded-md border border-[oklch(88%_0.018_178)]">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="bg-[oklch(94%_0.02_178)]">
                  <tr>
                    <th className="px-2 py-1.5">国家/地区</th>
                    <th className="px-2 py-1.5">代码</th>
                    <th className="px-2 py-1.5">历史关系</th>
                    <th className="px-2 py-1.5">生效日期</th>
                    <th className="px-2 py-1.5">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalMembers.map((member) => (
                    <tr key={`historical-${member.code}-${member.membership_relation_type}`} className="border-t border-[oklch(88%_0.018_178)]">
                      <td className="px-2 py-1.5 font-semibold"><span className="block truncate" title={member.name_zh || "-"}>{member.name_zh || "-"}</span></td>
                      <td className="whitespace-nowrap px-2 py-1.5">{member.code || "-"}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{member.membership_relation_type_label || "-"}</td>
                      <td className="whitespace-nowrap px-2 py-1.5">{formatDate(member.effective_date)}</td>
                      <td className="px-2 py-1.5"><span className="block truncate" title={member.remark || "仅对特定历史日期前/期间的申请可能有意义；当前新案不作为可选路径。"}>{member.remark || "仅对特定历史日期前/期间的申请可能有意义；当前新案不作为可选路径。"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SortableTh({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th className="px-2 py-1.5">
      <button className="block w-full truncate text-left font-semibold" type="button" onClick={onClick} title={label}>
        {label}
      </button>
    </th>
  );
}

function memberSortValue(member: IpSystemQueryMember, key: MemberSortKey): string {
  const value = member[key];
  return value ? String(value) : "";
}

function CheckResultPanel({
  refNode,
  isAdmin,
  result,
  onApply,
  onCollapse,
}: {
  refNode: RefObject<HTMLDivElement | null>;
  isAdmin: boolean;
  result: IpSystemCheckUpdatesResponse;
  onApply: () => Promise<void>;
  onCollapse: () => void;
}) {
  const applyAllowed = result.apply_allowed !== false && result.check_status !== "failed";
  return (
    <div ref={refNode} className="mt-5 rounded-md border border-[oklch(84%_0.022_178)] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">本次检查结果 / 差异预览</h4>
          <p className="mt-1 text-sm text-[oklch(44%_0.045_178)]">{businessText(result.message)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && applyAllowed ? (
            <button className="h-8 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-xs font-semibold text-white" type="button" onClick={() => void onApply()}>
              确认更新
            </button>
          ) : null}
          <button className="h-8 rounded-md border border-[oklch(72%_0.045_178)] px-2 text-xs font-semibold" type="button" onClick={onCollapse}>
            收起
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        <StatItem label="检查状态" value={checkStatusLabel(result.check_status)} />
        <StatItem label="检查时间" value={formatDateTime(result.checked_at)} />
        <StatItem label="数据源" value={result.source_name || "-"} wide />
        <StatItem label="类型" value={sourceTypeLabel(result.source_type)} />
        <StatItem label="写入目标" value={applyTargetLabel(result.apply_target)} wide />
        <StatItem label="影响成员计数" value={result.affects_membership_count ? "是" : "否"} />
        <StatItem label="解析数量" value={result.parsed_count == null ? "-" : String(result.parsed_count)} />
        <StatItem label="解析日期数量" value={result.parsed_date_count == null ? "-" : String(result.parsed_date_count)} />
        <StatItem label="当前基准数量" value={result.current_baseline_count == null ? "-" : String(result.current_baseline_count)} />
        <StatItem label="预期数量" value={result.expected_count == null ? "-" : String(result.expected_count)} />
        <StatItem label="新增" value={String(result.diff_summary?.added_member ?? 0)} />
        <StatItem label="删除" value={String(result.diff_summary?.removed_member ?? 0)} />
        <StatItem label="日期变化" value={String(result.diff_summary?.effective_date_changed ?? 0)} />
        <StatItem label="备注变化" value={String(result.diff_summary?.remark_changed ?? 0)} />
        <StatItem label="来源变化" value={String(result.diff_summary?.source_changed ?? 0)} />
        <StatItem label="允许确认更新" value={applyAllowed ? "是" : "否"} />
      </div>
      {result.expected_scope || result.failure_reason ? (
        <div className="mt-3 rounded-md bg-[oklch(96%_0.008_178)] px-3 py-2 text-sm text-[oklch(44%_0.045_178)]">
          {result.summary_preview ? <p>{businessText(result.summary_preview)}</p> : null}
          {result.expected_scope ? <p>预期范围：{applyTargetLabel(result.expected_scope)}</p> : null}
          {result.failure_reason ? <p className="mt-1 text-[oklch(40%_0.07_28)]">失败原因：{result.failure_reason}</p> : null}
        </div>
      ) : null}
      {result.diffs.length ? (
        <DiffTable
          affectsMembershipCount={result.affects_membership_count}
          applyTarget={result.apply_target}
          diffs={result.diffs}
        />
      ) : (
        result.check_status === "success" ? <p className="mt-3 text-xs text-[oklch(44%_0.045_178)]">未发现变化</p> : null
      )}
    </div>
  );
}

function DiffTable({
  affectsMembershipCount,
  applyTarget,
  diffs,
}: {
  affectsMembershipCount: boolean;
  applyTarget: string;
  diffs: IpSystemUpdateDiff[];
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const pagedDiffs = useMemo(() => paginateItems(diffs, page, pageSize), [diffs, page, pageSize]);

  return (
    <div className="mt-3">
      <div className="overflow-x-auto rounded-md border border-[oklch(88%_0.018_178)]">
      <table className="w-full min-w-[1280px] table-fixed text-left text-xs">
        <thead className="bg-[oklch(94%_0.02_178)]">
          <tr>
            <th className="w-14 whitespace-nowrap px-2 py-2">序号</th>
            <th className="w-24 whitespace-nowrap px-2 py-2">变更类型</th>
            <th className="w-16 whitespace-nowrap px-2 py-2">代码</th>
            <th className="w-32 whitespace-nowrap px-2 py-2">中文名</th>
            <th className="w-44 whitespace-nowrap px-2 py-2">英文名</th>
            <th className="w-44 whitespace-nowrap px-2 py-2">字段</th>
            <th className="w-48 whitespace-nowrap px-2 py-2">变更前</th>
            <th className="w-48 whitespace-nowrap px-2 py-2">变更后</th>
            <th className="w-32 whitespace-nowrap px-2 py-2">是否影响成员计数</th>
            <th className="w-36 whitespace-nowrap px-2 py-2">写入目标</th>
            <th className="w-32 whitespace-nowrap px-2 py-2">备注</th>
          </tr>
        </thead>
        <tbody>
          {pagedDiffs.pageItems.map((diff, index) => (
            <tr key={`${diff.change_type}-${diff.code}-${index}`} className="border-t border-[oklch(88%_0.018_178)]">
              <td className="whitespace-nowrap px-2 py-2">{pagedDiffs.start + index}</td>
              <td className="whitespace-nowrap px-2 py-2 font-semibold">{diffLabels[diff.change_type]}</td>
              <td className="whitespace-nowrap px-2 py-2">{diff.code}</td>
              <td className="px-2 py-2"><span className="block truncate" title={diff.name_zh || "-"}>{diff.name_zh || "-"}</span></td>
              <td className="px-2 py-2"><span className="block truncate" title={diff.name_en || "-"}>{diff.name_en || "-"}</span></td>
              <td className="px-2 py-2"><span className="block truncate" title={diffFieldLabel(diff.change_type)}>{diffFieldLabel(diff.change_type)}</span></td>
              <td className="px-2 py-2"><span className="block truncate" title={diffValue(diff, "old")}>{diffValue(diff, "old")}</span></td>
              <td className="px-2 py-2"><span className="block truncate" title={diffValue(diff, "new")}>{diffValue(diff, "new")}</span></td>
              <td className="whitespace-nowrap px-2 py-2">{affectsMembershipCount ? "是" : "否"}</td>
              <td className="whitespace-nowrap px-2 py-2">{applyTargetLabel(applyTarget)}</td>
              <td className="px-2 py-2"><span className="block truncate" title={diff.change_type === "removed_member" ? "确认后会取消确认" : "-"}>{diff.change_type === "removed_member" ? "确认后会取消确认" : "-"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={diffs.length}
        totalPages={pagedDiffs.totalPages}
        start={pagedDiffs.start}
        end={pagedDiffs.end}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
      />
    </div>
  );
}

function diffValue(diff: IpSystemUpdateDiff, side: "old" | "new"): string {
  const genericValue = side === "old" ? diff.old_value : diff.new_value;
  if (genericValue) {
    return businessText(String(genericValue));
  }
  if (diff.change_type === "effective_date_changed") {
    return formatDate(side === "old" ? diff.old_effective_date : diff.new_effective_date);
  }
  if (diff.change_type === "remark_changed") {
    return side === "old" ? diff.old_remark || "-" : diff.new_remark || "-";
  }
  if (diff.change_type === "source_changed") {
    return side === "old" ? diff.old_source_url || "-" : diff.new_source_url || "-";
  }
  if (diff.change_type === "profile_url_changed") {
    return side === "old" ? diff.old_source_url || "-" : diff.new_source_url || "-";
  }
  if (diff.change_type === "removed_member") {
    return side === "old" ? "当前内部数据" : "-";
  }
  if (diff.change_type === "added_member") {
    return side === "new" ? "官方来源新增" : "-";
  }
  return side === "new" ? "以官方来源为准" : "当前内部数据";
}

function categoryLabel(value: string): string {
  return categoryLabels[value] ?? (value || "-");
}

function sourceTypeLabel(value: string): string {
  return sourceTypeLabels[value] || businessText(value || "-");
}

function applyTargetLabel(value: string): string {
  if (!value) {
    return "-";
  }
  const direct = applyTargetLabels[value];
  if (direct) {
    return direct;
  }
  return businessText(value);
}

function businessText(value: string): string {
  return value
    .replaceAll("PCT confirmed contracting state baseline", "PCT 正式缔约国数据")
    .replaceAll("confirmed membership baseline", "正式成员数据")
    .replaceAll("confirmed contracting state baseline", "正式缔约国数据")
    .replaceAll("P0 confirmed membership baseline", "P0 正式成员数据")
    .replaceAll("PCT regional route baseline", "PCT 区域路径数据")
    .replaceAll("regional route baseline", "区域路径数据")
    .replaceAll("Paris non-PCT route baseline", "Paris 非 PCT 路径数据")
    .replaceAll("reference object baseline", "参考对象数据")
    .replaceAll("WIPO Lex reference object baseline", "WIPO Lex 参考对象数据")
    .replaceAll("EU Design/RCD scope baseline", "欧盟外观适用范围数据")
    .replaceAll("design scope baseline", "欧盟外观适用范围数据")
    .replaceAll("EPC extension relation baseline", "EPC 延伸关系数据")
    .replaceAll("extension relation baseline", "延伸关系数据")
    .replaceAll("EPC validation relation baseline", "EPC 生效关系数据")
    .replaceAll("validation relation baseline", "生效关系数据")
    .replaceAll("treaty_membership_source", "成员数据源")
    .replaceAll("membership_source", "成员数据源")
    .replaceAll("regional_route_source", "区域路径数据源")
    .replaceAll("paris_non_pct_route_source", "Paris 非 PCT 路径数据源")
    .replaceAll("design_scope_source", "欧盟外观适用范围数据源")
    .replaceAll("extension_state_source", "EPC 延伸关系数据源")
    .replaceAll("validation_state_source", "EPC 生效关系数据源")
    .replaceAll("reference_source", "参考名录来源")
    .replaceAll("reference source", "参考名录来源")
    .replaceAll("PCT membership", "PCT 成员数据")
    .replaceAll("PARIS membership", "Paris 成员数据")
    .replaceAll("EPC membership", "EPC 成员数据")
    .replaceAll("EU_DESIGN membership", "EU Design 成员数据")
    .replaceAll("membership_baseline", "成员数据更新")
    .replaceAll("reference/scope baseline", "参考/适用范围数据")
    .replaceAll("non-membership baseline", "非成员关系数据")
    .replaceAll("baseline", "数据")
    .replaceAll("treaty membership", "条约成员关系")
    .replaceAll("membership count", "成员计数")
    .replaceAll("apply 后", "确认后")
    .replaceAll("apply 将", "确认将")
    .replaceAll("apply", "确认");
}

function diffFieldLabel(changeType: IpSystemUpdateDiff["change_type"]): string {
  const labels: Record<IpSystemUpdateDiff["change_type"], string> = {
    added_member: "成员",
    removed_member: "成员",
    effective_date_changed: "加入/生效/适用时间",
    name_changed: "名称",
    code_changed: "代码",
    remark_changed: "官方备注",
    source_changed: "来源链接",
    route_type_changed: "路径类型",
    object_type_changed: "对象类型",
    profile_url_changed: "profile 链接",
  };
  return labels[changeType] || "-";
}

function BoolFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <select className="h-8 rounded-md border px-2 text-xs" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{label} 全部</option>
      <option value="yes">{label} 是</option>
      <option value="no">{label} 否</option>
    </select>
  );
}

function booleanFilterValue(flag: boolean, filter: string): boolean {
  if (filter === "yes") {
    return flag;
  }
  if (filter === "no") {
    return !flag;
  }
  return true;
}

function paginateItems<T>(items: T[], page: number, pageSize: PageSize): PagedResult<T> {
  if (pageSize === "all") {
    return {
      pageItems: items,
      totalPages: 1,
      start: items.length ? 1 : 0,
      end: items.length,
    };
  }
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(items.length, startIndex + pageSize);
  return {
    pageItems: items.slice(startIndex, endIndex),
    totalPages,
    start: items.length ? startIndex + 1 : 0,
    end: endIndex,
  };
}

function PaginationBar({
  page,
  pageSize,
  total,
  totalPages,
  start,
  end,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: PageSize;
  total: number;
  totalPages: number;
  start: number;
  end: number;
  onPageChange: (value: number) => void;
  onPageSizeChange: (value: PageSize) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[oklch(44%_0.045_178)]">
      <span>显示 {start}-{end} / 共 {total} 条</span>
      <div className="flex items-center gap-2">
        <select
          className="h-7 rounded-md border px-1 text-xs"
          value={String(pageSize)}
          onChange={(event) => {
            const value = event.target.value;
            onPageSizeChange(value === "all" ? "all" : Number(value) as PageSize);
          }}
        >
          {pageSizeOptions.map((value) => (
            <option key={String(value)} value={String(value)}>{value === "all" ? "全部" : `${value} 条/页`}</option>
          ))}
        </select>
        <button className="h-7 rounded-md border px-2 disabled:opacity-50" disabled={page <= 1 || pageSize === "all"} type="button" onClick={() => onPageChange(page - 1)}>
          上一页
        </button>
        <span>{pageSize === "all" ? "1 / 1" : `${Math.min(page, totalPages)} / ${totalPages}`}</span>
        <button className="h-7 rounded-md border px-2 disabled:opacity-50" disabled={page >= totalPages || pageSize === "all"} type="button" onClick={() => onPageChange(page + 1)}>
          下一页
        </button>
      </div>
    </div>
  );
}

function checkStatusLabel(value: string): string {
  const labels: Record<string, string> = {
    success: "成功",
    failed: "失败",
    skipped: "跳过",
    changed: "发现变化",
    no_change: "无变化",
  };
  return labels[value] || value || "-";
}

function relationTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    pct_contracting_state: "PCT 缔约国",
    paris_contracting_party: "Paris 缔约方",
    epc_member_state: "EPC 成员国",
    covered_state: "适用成员国",
    extension_state: "延伸国",
    validation_state: "生效国",
    historical_extension_state: "历史延伸",
    historical_validation_state: "历史生效",
  };
  return labels[value] || value;
}

function optionKey(option: Pick<IpSystemJurisdictionOption, "jurisdiction_id" | "code">): string {
  return option.jurisdiction_id || option.code;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }
  return value.slice(0, 10);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }
  return value.replace("T", " ").slice(0, 19);
}
