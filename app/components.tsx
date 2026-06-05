"use client";

import { FormEvent, Fragment, useState } from "react";

import { followupMethodOptions, roleOptions, statusOptions } from "./constants";
import type {
  ApprovalRequest,
  Bootstrap,
  Country,
  DraftBasicForm,
  FeeRule,
  Followup,
  FollowupForm,
  FollowupMethod,
  GeneratedQuotation,
  Quotation,
  QuotationDraft,
  QuotationDraftItem,
  QuotationForm,
  Statistics,
  TranslationRule,
  User,
  UserForm,
  UserRole,
  UserStatus,
} from "./types";
import { apiBase, formatDateTime, formatMoney, toOption } from "./utils";

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

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
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

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
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

function SelectInput({
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
