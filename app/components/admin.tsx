"use client";

import { FormEvent } from "react";

import { roleOptions, statusOptions } from "../constants";
import type { ApprovalRequest, FeeRule, TranslationRule, User, UserForm, UserRole, UserStatus } from "../types";
import { formatDateTime } from "../utils";

export function UsersPanel({
  currentUserId,
  users,
  userForm,
  message,
  newPasswordByUserId,
  setUserForm,
  setUsers,
  setNewPasswordByUserId,
  createUser,
  saveUser,
  resetPassword,
}: {
  currentUserId: string;
  users: User[];
  userForm: UserForm;
  message: string;
  newPasswordByUserId: Record<string, string>;
  setUserForm: (form: UserForm) => void;
  setUsers: (users: User[]) => void;
  setNewPasswordByUserId: (passwords: Record<string, string>) => void;
  createUser: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  saveUser: (user: User) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>;
}) {
  function updateUser(id: string, patch: Partial<User>): void {
    setUsers(users.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  function updatePassword(userId: string, password: string): void {
    setNewPasswordByUserId({ ...newPasswordByUserId, [userId]: password });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <h3 className="text-xl font-semibold">用户管理</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            管理员维护顾问、审批人和管理员账号，禁用后账号将不能登录。
          </p>
          {message ? <p className="mt-2 text-sm font-medium text-[oklch(38%_0.08_155)]">{message}</p> : null}
        </div>

        <form className="grid gap-3 border-b border-[oklch(86%_0.02_178)] px-5 py-4 md:grid-cols-2 xl:grid-cols-[1fr_1.4fr_1fr_150px_130px_auto]" onSubmit={createUser}>
          <input
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            placeholder="姓名"
            value={userForm.name}
            onChange={(event) => setUserForm({ ...userForm, name: event.target.value })}
          />
          <input
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            placeholder="邮箱"
            type="email"
            value={userForm.email}
            onChange={(event) => setUserForm({ ...userForm, email: event.target.value })}
          />
          <input
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            placeholder="初始密码"
            type="password"
            value={userForm.password}
            onChange={(event) => setUserForm({ ...userForm, password: event.target.value })}
          />
          <select
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            value={userForm.role}
            onChange={(event) => setUserForm({ ...userForm, role: event.target.value as UserRole })}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3"
            value={userForm.status}
            onChange={(event) => setUserForm({ ...userForm, status: event.target.value as UserStatus })}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)]"
            type="submit"
          >
            新增账号
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-[1120px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">姓名</th>
                <th className="px-3 py-3">邮箱</th>
                <th className="px-3 py-3">角色</th>
                <th className="px-3 py-3">状态</th>
                <th className="px-3 py-3">新密码</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-36 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={user.name}
                      onChange={(event) => updateUser(user.id, { name: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-64 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      type="email"
                      value={user.email}
                      onChange={(event) => updateUser(user.id, { email: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={user.role}
                      onChange={(event) => updateUser(user.id, { role: event.target.value as UserRole })}
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="h-9 w-24 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={user.status}
                      onChange={(event) => updateUser(user.id, { status: event.target.value as UserStatus })}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-44 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      placeholder="至少 6 位"
                      type="password"
                      value={newPasswordByUserId[user.id] ?? ""}
                      onChange={(event) => updatePassword(user.id, event.target.value)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
                        type="button"
                        onClick={() => void saveUser(user)}
                      >
                        保存
                      </button>
                      <button
                        className="h-9 rounded-md border border-[oklch(72%_0.045_178)] px-3 text-sm font-medium text-[oklch(32%_0.075_178)] transition hover:bg-[oklch(92%_0.026_178)]"
                        type="button"
                        onClick={() => void resetPassword(user.id)}
                      >
                        重置密码
                      </button>
                      {user.id === currentUserId ? (
                        <span className="inline-flex h-9 items-center rounded-md bg-[oklch(92%_0.024_178)] px-3 text-xs font-medium text-[oklch(38%_0.055_178)]">
                          当前账号
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
  saveTranslationRule,
}: {
  feeRules: FeeRule[];
  translationRules: TranslationRule[];
  message: string;
  setFeeRules: (rules: FeeRule[]) => void;
  setTranslationRules: (rules: TranslationRule[]) => void;
  saveFeeRule: (rule: FeeRule) => Promise<void>;
  saveTranslationRule: (rule: TranslationRule) => Promise<void>;
}) {
  function updateFeeRule(id: string, patch: Partial<FeeRule>): void {
    setFeeRules(feeRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  function updateTranslationRule(id: string, patch: Partial<TranslationRule>): void {
    setTranslationRules(
      translationRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <h3 className="text-xl font-semibold">费用规则</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            修改后只影响新创建的报价，历史报价保持原明细。
          </p>
          {message ? <p className="mt-2 text-sm font-medium text-[oklch(38%_0.08_155)]">{message}</p> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">国家</th>
                <th className="px-3 py-3">类型</th>
                <th className="px-3 py-3">途径</th>
                <th className="px-3 py-3">阶段</th>
                <th className="px-3 py-3">项目</th>
                <th className="px-3 py-3">金额</th>
                <th className="px-3 py-3">币种</th>
                <th className="px-3 py-3">启用</th>
                <th className="px-3 py-3">默认</th>
                <th className="px-3 py-3">备注</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {feeRules.map((rule) => (
                <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-3">{rule.country_code}</td>
                  <td className="px-3 py-3">{rule.application_type}</td>
                  <td className="px-3 py-3">{rule.filing_route}</td>
                  <td className="px-3 py-3">{rule.stage}</td>
                  <td className="px-3 py-3">{rule.item_name}</td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right"
                      min={0}
                      type="number"
                      value={rule.amount}
                      onChange={(event) => updateFeeRule(rule.id, { amount: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-20 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.currency}
                      onChange={(event) => updateFeeRule(rule.id, { currency: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.is_active}
                      type="checkbox"
                      onChange={(event) => updateFeeRule(rule.id, { is_active: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.is_default}
                      type="checkbox"
                      onChange={(event) => updateFeeRule(rule.id, { is_default: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-52 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.remark}
                      onChange={(event) => updateFeeRule(rule.id, { remark: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
                      type="button"
                      onClick={() => void saveFeeRule(rule)}
                    >
                      保存
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
        <div className="border-b border-[oklch(84%_0.025_178)] px-5 py-4">
          <h3 className="text-xl font-semibold">翻译费规则</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] text-left text-sm">
            <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
              <tr>
                <th className="px-3 py-3">项目名称</th>
                <th className="px-3 py-3">单位</th>
                <th className="px-3 py-3">单价</th>
                <th className="px-3 py-3">最低收费</th>
                <th className="px-3 py-3">币种</th>
                <th className="px-3 py-3">启用</th>
                <th className="px-3 py-3">默认</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {translationRules.map((rule) => (
                <tr key={rule.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-56 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.item_name}
                      onChange={(event) => updateTranslationRule(rule.id, { item_name: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-16 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.unit}
                      onChange={(event) => updateTranslationRule(rule.id, { unit: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right"
                      min={0}
                      type="number"
                      value={rule.unit_price}
                      onChange={(event) => updateTranslationRule(rule.id, { unit_price: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-28 rounded-md border border-[oklch(78%_0.028_178)] px-2 text-right"
                      min={0}
                      type="number"
                      value={rule.min_fee}
                      onChange={(event) => updateTranslationRule(rule.id, { min_fee: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="h-9 w-20 rounded-md border border-[oklch(78%_0.028_178)] px-2"
                      value={rule.currency}
                      onChange={(event) => updateTranslationRule(rule.id, { currency: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.enabled}
                      type="checkbox"
                      onChange={(event) => updateTranslationRule(rule.id, { enabled: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      checked={rule.is_default}
                      type="checkbox"
                      onChange={(event) => updateTranslationRule(rule.id, { is_default: event.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      className="h-9 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
                      type="button"
                      onClick={() => void saveTranslationRule(rule)}
                    >
                      保存
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function ApprovalPanel({
  requests,
  message,
  canReview,
  refresh,
  review,
}: {
  requests: ApprovalRequest[];
  message: string;
  canReview: boolean;
  refresh: () => Promise<void>;
  review: (requestId: string, status: "已通过" | "已拒绝") => Promise<void>;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
      <div className="flex flex-col gap-3 border-b border-[oklch(84%_0.025_178)] px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">审批解锁</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            超过未转化或逾期跟进规则时，顾问需要审批通过后继续生成正式报价。
          </p>
        </div>
        <button
          className="h-10 rounded-md border border-[oklch(72%_0.035_178)] px-4 text-sm font-medium text-[oklch(34%_0.075_178)] transition hover:bg-[oklch(93%_0.018_178)]"
          type="button"
          onClick={() => void refresh()}
        >
          刷新
        </button>
      </div>
      {message ? <p className="border-b border-[oklch(88%_0.018_178)] px-5 py-3 text-sm text-[oklch(38%_0.065_178)]">{message}</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="bg-[oklch(35%_0.09_178)] text-[oklch(96%_0.008_178)]">
            <tr>
              <th className="px-4 py-3">顾问</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">未转化数</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">申请理由</th>
              <th className="px-4 py-3">有效期</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[oklch(48%_0.045_178)]" colSpan={7}>
                  暂无审批解锁记录。
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b border-[oklch(88%_0.018_178)] last:border-0">
                  <td className="px-4 py-3">{request.consultant_email}</td>
                  <td className="px-4 py-3">{request.request_type}</td>
                  <td className="px-4 py-3 font-mono">{request.open_unconverted_count}</td>
                  <td className="px-4 py-3">{request.status}</td>
                  <td className="px-4 py-3">{request.reason}</td>
                  <td className="px-4 py-3">{request.valid_until ? formatDateTime(request.valid_until) : "-"}</td>
                  <td className="px-4 py-3">
                    {canReview && request.status === "待审批" ? (
                      <div className="flex gap-2">
                        <button
                          className="h-8 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-xs font-semibold text-[oklch(97%_0.008_178)]"
                          type="button"
                          onClick={() => void review(request.id, "已通过")}
                        >
                          通过
                        </button>
                        <button
                          className="h-8 rounded-md border border-[oklch(78%_0.04_28)] px-3 text-xs font-medium text-[oklch(40%_0.08_28)]"
                          type="button"
                          onClick={() => void review(request.id, "已拒绝")}
                        >
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <span className="text-[oklch(48%_0.045_178)]">-</span>
                    )}
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
