// Validation and payload building for the configurable contact form. The core fields keep the original rules
// (utils/contactForm.ts) and go to the API under the same names; extra fields travel in `customFields`.
import {
  hasErrors, interpretContactResponse, toContactPayload, validateContactForm,
  type ContactApiResponse, type ContactField, type ContactOutcome,
} from "../../../utils/contactForm.ts";

export type FieldDefinition = {
  id: string; type: string; binding: string; label: string; required: boolean;
  options?: string[]; min?: number; max?: number; maxLength?: number;
};
export type FieldValue = string | boolean;
export type Values = Record<string, FieldValue>;
export type Errors = Record<string, string | undefined>;

/** Values and errors are stored under the server field name for core fields, and under the field id for the rest. */
export const fieldKey = (field: { binding: string; id: string }) => field.binding === "custom" ? field.id : field.binding;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateCustom(field: FieldDefinition, value: FieldValue | undefined): string | undefined {
  if (field.type === "CheckboxField") return field.required && value !== true ? "Please tick this box" : undefined;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return field.required ? `Enter ${field.label.toLowerCase()}` : undefined;
  if (text.length > (field.maxLength ?? 1000)) return `Use at most ${field.maxLength ?? 1000} characters`;
  if (field.type === "EmailInput" && !EMAIL.test(text)) return "Enter a valid email address";
  if (field.type === "PhoneInput") {
    const digits = text.replace(/\D/g, "").length;
    if (digits < 7 || digits > 15) return "Enter a valid phone number (7–15 digits)";
  }
  if (field.type === "NumberInput") {
    const number = Number(text);
    if (!/^-?\d+(\.\d+)?$/.test(text)) return "Enter a number";
    if (field.min !== undefined && number < field.min) return `Enter ${field.min} or more`;
    if (field.max !== undefined && number > field.max) return `Enter ${field.max} or less`;
  }
  if ((field.type === "Dropdown" || field.type === "RadioGroup") && !field.options?.includes(text)) return "Choose one of the options";
  return undefined;
}

const text = (values: Values, key: string) => typeof values[key] === "string" ? values[key] as string : "";

const coreValues = (values: Values, honeypot: string) =>
  ({ name: text(values, "name"), email: text(values, "email"), phone: text(values, "phone"), message: text(values, "message"), website: honeypot });

export function validateFields(fields: FieldDefinition[], values: Values): Errors {
  const errors: Errors = {};
  const core = validateContactForm(coreValues(values, ""));
  for (const field of fields) {
    if (field.binding === "custom") {
      const error = validateCustom(field, values[field.id]);
      if (error) errors[field.id] = error;
      continue;
    }
    const key = field.binding as ContactField;
    if (field.binding === "phone" && field.required && !text(values, "phone").trim()) errors.phone = "Enter your phone number";
    else if (core[key]) errors[key] = core[key];
  }
  return errors;
}

export function toBuilderPayload(formId: string, fields: FieldDefinition[], values: Values, honeypot: string) {
  const customFields = fields.filter(field => field.binding === "custom").flatMap<{ id: string; value: FieldValue }>(field => {
    const value = values[field.id];
    if (field.type === "CheckboxField") return value === true ? [{ id: field.id, value: true }] : [];
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed ? [{ id: field.id, value: trimmed }] : [];
  });
  return { ...toContactPayload(coreValues(values, honeypot)), formId, ...(customFields.length ? { customFields } : {}) };
}

export function interpretBuilderResponse(response: (ContactApiResponse) | null | undefined): ContactOutcome | { kind: "validation"; message: string; fieldErrors: Errors } {
  const outcome = interpretContactResponse(response);
  if (outcome.kind !== "validation") return outcome;
  const fieldErrors: Errors = { ...outcome.fieldErrors };
  if (Array.isArray(response?.details)) {
    for (const issue of response.details as { path?: unknown[]; message?: unknown }[]) {
      if (issue.path?.[1] === "customFields" && typeof issue.path[2] === "string" && typeof issue.message === "string") fieldErrors[issue.path[2]] = issue.message;
    }
  }
  return { kind: "validation", message: outcome.message, fieldErrors };
}

export { hasErrors };
