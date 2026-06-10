"use client";

import { FormEvent, useMemo, useState } from "react";

import {
  customerLevelOptions,
  customerStatusOptions,
  customerTypeOptions,
  initialCustomerContactForm,
} from "../constants";
import type {
  Customer,
  CustomerContact,
  CustomerContactForm,
  CustomerForm,
  CustomerLevel,
  CustomerStatus,
  CustomerType,
  User,
} from "../types";
import { formatDateTime, toOption } from "../utils";
import { SelectInput, TextInput } from "./common";

type CustomerMode = "list" | "create" | "edit";

export function CustomersPanel({
  customers,
  users,
  currentUser,
  form,
  contactForm,
  message,
  selectedCustomerId,
  keyword,
  setKeyword,
  setForm,
  setContactForm,
  selectCustomer,
  createCustomer,
  updateCustomer,
  createContact,
}: {
  customers: Customer[];
  users: User[];
  currentUser: User;
  form: CustomerForm;
  contactForm: CustomerContactForm;
  message: string;
  selectedCustomerId: string | null;
  keyword: string;
  setKeyword: (keyword: string) => void;
  setForm: (form: CustomerForm) => void;
  setContactForm: (form: CustomerContactForm) => void;
  selectCustomer: (customer: Customer) => void;
  createCustomer: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateCustomer: (event: FormEvent<HTMLFormElement>, customerId: string) => Promise<void>;
  createContact: (event: FormEvent<HTMLFormElement>, customerId: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<CustomerMode>("list");
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0] ?? null;
  const consultantOptions = users
    .filter((user) => user.role === "consultant")
    .map((user) => ({ label: `${user.name} (${user.email})`, value: user.email }));

  const filteredCustomers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) {
      return customers;
    }
    return customers.filter((customer) => {
      const primaryContact = primaryCustomerContact(customer);
      return (
        customer.name.toLowerCase().includes(normalized) ||
        customer.customer_no.toLowerCase().includes(normalized) ||
        customer.consultant_name.toLowerCase().includes(normalized) ||
        customer.consultant_email.toLowerCase().includes(normalized) ||
        primaryContact?.name.toLowerCase().includes(normalized)
      );
    });
  }, [customers, keyword]);

  function startCreate(): void {
    setForm({
      name: "",
      customer_type: "企业",
      consultant_email: currentUser.role === "admin" ? consultantOptions[0]?.value ?? "" : currentUser.email,
      department: "",
      default_currency: "CNY",
      default_quote_terms: "",
      customer_level: "普通",
      status: "active",
      remark: "",
    });
    setContactForm(initialCustomerContactForm);
    setMode("create");
  }

  function startEdit(customer: Customer): void {
    selectCustomer(customer);
    setForm(customerToForm(customer));
    setContactForm(initialCustomerContactForm);
    setMode("edit");
  }

  function chooseCustomer(customer: Customer): void {
    selectCustomer(customer);
    setMode("list");
  }

  function updateForm<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]): void {
    setForm({ ...form, [key]: value });
  }

  function updateContactForm<K extends keyof CustomerContactForm>(
    key: K,
    value: CustomerContactForm[K],
  ): void {
    setContactForm({ ...contactForm, [key]: value });
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    await createCustomer(event);
    setMode("list");
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>, customerId: string): Promise<void> {
    await updateCustomer(event, customerId);
    setMode("list");
  }

  if (mode === "create") {
    return (
      <CustomerFormPage
        currentUser={currentUser}
        form={form}
        message={message}
        mode="create"
        consultantOptions={consultantOptions}
        updateForm={updateForm}
        onCancel={() => setMode("list")}
        onSubmit={(event) => void submitCreate(event)}
      />
    );
  }

  if (mode === "edit" && selectedCustomer) {
    return (
      <CustomerFormPage
        currentUser={currentUser}
        form={form}
        message={message}
        mode="edit"
        consultantOptions={consultantOptions}
        updateForm={updateForm}
        onCancel={() => setMode("list")}
        onSubmit={(event) => void submitEdit(event, selectedCustomer.id)}
      />
    );
  }

  return (
    <section className="min-h-[calc(100vh-160px)] overflow-hidden rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
      <div className="flex flex-col gap-3 border-b border-[oklch(84%_0.025_178)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold">客户管理</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            当前显示 {filteredCustomers.length} / {customers.length} 个客户
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            className="h-10 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 text-sm sm:w-80"
            placeholder="搜索客户、编号、顾问、联系人"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button
            className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)]"
            type="button"
            onClick={startCreate}
          >
            新增客户
          </button>
        </div>
      </div>

      <div className="grid min-h-[620px] lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
        <CustomerIndex
          customers={filteredCustomers}
          selectedCustomerId={selectedCustomer?.id ?? null}
          onSelect={chooseCustomer}
        />
        <div className="border-t border-[oklch(86%_0.02_178)] bg-[oklch(98%_0.006_178)] p-5 lg:border-l lg:border-t-0">
          {selectedCustomer ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <CustomerDetail customer={selectedCustomer} onEdit={() => startEdit(selectedCustomer)} />
              <ContactForm
                form={contactForm}
                setForm={setContactForm}
                updateField={updateContactForm}
                message={message}
                onSubmit={(event) => void createContact(event, selectedCustomer.id)}
              />
            </div>
          ) : (
            <div className="grid min-h-96 place-items-center rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(99%_0.006_178)] text-sm text-[oklch(48%_0.045_178)]">
              选择一个客户查看详情。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CustomerIndex({
  customers,
  selectedCustomerId,
  onSelect,
}: {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelect: (customer: Customer) => void;
}) {
  return (
    <div className="max-h-[720px] overflow-y-auto bg-[oklch(99%_0.006_178)]">
      {customers.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-[oklch(48%_0.045_178)]">暂无客户。</div>
      ) : (
        <div className="divide-y divide-[oklch(88%_0.018_178)]">
          {customers.map((customer) => {
            const primaryContact = primaryCustomerContact(customer);
            const active = selectedCustomerId === customer.id;
            return (
              <button
                key={customer.id}
                className={`block w-full px-4 py-3 text-left transition ${
                  active ? "bg-[oklch(92%_0.026_178)]" : "hover:bg-[oklch(96%_0.012_178)]"
                }`}
                type="button"
                onClick={() => onSelect(customer)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{customer.name}</p>
                    <p className="mt-1 truncate font-mono text-xs text-[oklch(46%_0.045_178)]">
                      {customer.customer_no}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 text-xs ${
                      customer.status === "active"
                        ? "bg-[oklch(90%_0.055_155)] text-[oklch(30%_0.08_155)]"
                        : "bg-[oklch(92%_0.02_40)] text-[oklch(42%_0.06_40)]"
                    }`}
                  >
                    {customer.status === "active" ? "启用" : "停用"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[oklch(48%_0.045_178)]">
                  <span className="truncate">{customer.customer_level}</span>
                  <span className="truncate text-right">{customer.consultant_name || customer.consultant_email}</span>
                  <span className="col-span-2 truncate">
                    {primaryContact ? `${primaryContact.name} ${primaryContact.email || primaryContact.phone}` : "暂无联系人"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomerFormPage({
  currentUser,
  form,
  message,
  mode,
  consultantOptions,
  updateForm,
  onCancel,
  onSubmit,
}: {
  currentUser: User;
  form: CustomerForm;
  message: string;
  mode: "create" | "edit";
  consultantOptions: { label: string; value: string }[];
  updateForm: <K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="rounded-lg border border-[oklch(82%_0.026_178)] bg-[oklch(99%_0.006_178)]">
      <div className="flex flex-col gap-3 border-b border-[oklch(84%_0.025_178)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">{mode === "create" ? "新增客户" : "编辑客户"}</h3>
          <p className="mt-1 text-sm text-[oklch(46%_0.045_178)]">
            维护客户主档、默认报价口径和归属顾问。
          </p>
        </div>
        <button
          className="h-10 rounded-md border border-[oklch(74%_0.03_178)] px-4 text-sm font-medium text-[oklch(34%_0.06_178)] hover:bg-[oklch(92%_0.024_178)]"
          type="button"
          onClick={onCancel}
        >
          返回列表
        </button>
      </div>

      <form className="mx-auto max-w-4xl space-y-5 px-5 py-5" onSubmit={onSubmit}>
        <TextInput label="客户名称" value={form.name} onChange={(value) => updateForm("name", value)} />
        <div className="grid gap-4 md:grid-cols-2">
          <SelectInput
            label="客户类型"
            value={form.customer_type}
            options={customerTypeOptions.map(toOption)}
            onChange={(value) => updateForm("customer_type", value as CustomerType)}
          />
          <SelectInput
            label="客户等级"
            value={form.customer_level}
            options={customerLevelOptions.map(toOption)}
            onChange={(value) => updateForm("customer_level", value as CustomerLevel)}
          />
          <TextInput label="所属部门" value={form.department} onChange={(value) => updateForm("department", value)} />
          <TextInput
            label="默认币种"
            value={form.default_currency}
            onChange={(value) => updateForm("default_currency", value.toUpperCase())}
          />
          {currentUser.role === "admin" ? (
            <SelectInput
              label="归属顾问"
              value={form.consultant_email}
              options={consultantOptions}
              onChange={(value) => updateForm("consultant_email", value)}
            />
          ) : null}
          <SelectInput
            label="客户状态"
            value={form.status}
            options={customerStatusOptions}
            onChange={(value) => updateForm("status", value as CustomerStatus)}
          />
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">默认报价条款</span>
          <textarea
            className="min-h-28 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 py-2 outline-none transition focus:border-[oklch(47%_0.1_178)]"
            value={form.default_quote_terms}
            onChange={(event) => updateForm("default_quote_terms", event.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">内部备注</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-[oklch(78%_0.028_178)] bg-[oklch(99%_0.006_178)] px-3 py-2 outline-none transition focus:border-[oklch(47%_0.1_178)]"
            value={form.remark}
            onChange={(event) => updateForm("remark", event.target.value)}
          />
        </label>
        <div className="flex flex-col gap-3 border-t border-[oklch(86%_0.02_178)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-h-5 text-sm font-medium text-[oklch(38%_0.065_178)]">{message}</p>
          <div className="flex gap-2">
            <button
              className="h-10 rounded-md border border-[oklch(74%_0.03_178)] px-4 text-sm font-medium text-[oklch(34%_0.06_178)] hover:bg-[oklch(92%_0.024_178)]"
              type="button"
              onClick={onCancel}
            >
              取消
            </button>
            <button
              className="h-10 rounded-md bg-[oklch(35%_0.09_178)] px-5 text-sm font-semibold text-[oklch(97%_0.008_178)] transition hover:bg-[oklch(30%_0.105_178)] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!form.name.trim()}
              type="submit"
            >
              {mode === "create" ? "创建客户" : "保存客户"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function CustomerDetail({ customer, onEdit }: { customer: Customer; onEdit: () => void }) {
  const rows = [
    ["客户编号", customer.customer_no],
    ["客户名称", customer.name],
    ["客户类型", customer.customer_type],
    ["归属顾问", customer.consultant_name || customer.consultant_email],
    ["所属部门", customer.department || "-"],
    ["默认币种", customer.default_currency],
    ["客户等级", customer.customer_level],
    ["更新时间", formatDateTime(customer.updated_at)],
  ];
  return (
    <div className="rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(99%_0.006_178)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold">{customer.name}</h4>
          <p className="mt-1 font-mono text-xs text-[oklch(46%_0.045_178)]">{customer.customer_no}</p>
        </div>
        <button
          className="h-9 shrink-0 rounded-md bg-[oklch(35%_0.09_178)] px-3 text-sm font-medium text-[oklch(97%_0.008_178)]"
          type="button"
          onClick={onEdit}
        >
          编辑主档
        </button>
      </div>
      <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[96px_minmax(0,1fr)_96px_minmax(0,1fr)]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-[oklch(48%_0.045_178)]">{label}</dt>
            <dd className="min-w-0 break-words font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {customer.default_quote_terms ? (
        <div className="mt-4 rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(98%_0.008_178)] px-3 py-3 text-sm leading-6">
          {customer.default_quote_terms}
        </div>
      ) : null}
      <div className="mt-5">
        <h4 className="text-sm font-semibold">联系人</h4>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {customer.contacts.length === 0 ? (
            <p className="rounded-md border border-[oklch(86%_0.02_178)] px-3 py-3 text-sm text-[oklch(48%_0.045_178)]">
              暂无联系人。
            </p>
          ) : (
            customer.contacts.map((contact) => <ContactSummary key={contact.id} contact={contact} />)
          )}
        </div>
      </div>
    </div>
  );
}

function ContactSummary({ contact }: { contact: CustomerContact }) {
  return (
    <div className="rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(98%_0.008_178)] px-3 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium">
          {contact.name}
          {contact.title ? <span className="ml-2 text-[oklch(48%_0.045_178)]">{contact.title}</span> : null}
        </div>
        {contact.is_primary ? (
          <span className="rounded-md bg-[oklch(90%_0.055_155)] px-2 py-1 text-xs text-[oklch(30%_0.08_155)]">
            主联系人
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-[oklch(48%_0.045_178)]">
        {[contact.email, contact.phone, contact.wechat].filter(Boolean).join(" / ") || "-"}
      </p>
    </div>
  );
}

function ContactForm({
  form,
  setForm,
  updateField,
  message,
  onSubmit,
}: {
  form: CustomerContactForm;
  setForm: (form: CustomerContactForm) => void;
  updateField: <K extends keyof CustomerContactForm>(key: K, value: CustomerContactForm[K]) => void;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="rounded-md border border-[oklch(86%_0.02_178)] bg-[oklch(99%_0.006_178)] p-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">新增联系人</h4>
        <button
          className="h-8 rounded-md border border-[oklch(74%_0.03_178)] px-3 text-xs font-medium text-[oklch(34%_0.06_178)] hover:bg-[oklch(92%_0.024_178)]"
          type="button"
          onClick={() => setForm(initialCustomerContactForm)}
        >
          清空
        </button>
      </div>
      <div className="mt-3 space-y-3">
        <TextInput label="姓名" value={form.name} onChange={(value) => updateField("name", value)} />
        <TextInput label="职务" value={form.title} onChange={(value) => updateField("title", value)} />
        <TextInput label="邮箱" value={form.email} onChange={(value) => updateField("email", value)} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <TextInput label="电话" value={form.phone} onChange={(value) => updateField("phone", value)} />
          <TextInput label="微信" value={form.wechat} onChange={(value) => updateField("wechat", value)} />
        </div>
        <label className="flex h-10 items-center gap-3 rounded-md border border-[oklch(78%_0.028_178)] px-3 text-sm">
          <input
            checked={form.is_primary}
            type="checkbox"
            onChange={(event) => updateField("is_primary", event.target.checked)}
          />
          设为主联系人
        </label>
        <button
          className="h-10 w-full rounded-md bg-[oklch(35%_0.09_178)] px-4 text-sm font-semibold text-[oklch(97%_0.008_178)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!form.name.trim()}
          type="submit"
        >
          添加联系人
        </button>
        {message ? <p className="text-sm font-medium text-[oklch(38%_0.065_178)]">{message}</p> : null}
      </div>
    </form>
  );
}

function customerToForm(customer: Customer): CustomerForm {
  return {
    name: customer.name,
    customer_type: customer.customer_type,
    consultant_email: customer.consultant_email,
    department: customer.department,
    default_currency: customer.default_currency,
    default_quote_terms: customer.default_quote_terms,
    customer_level: customer.customer_level,
    status: customer.status,
    remark: customer.remark,
  };
}

function primaryCustomerContact(customer: Customer): CustomerContact | undefined {
  return customer.contacts.find((contact) => contact.is_primary) ?? customer.contacts[0];
}
