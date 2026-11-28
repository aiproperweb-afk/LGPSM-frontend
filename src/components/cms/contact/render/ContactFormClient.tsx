"use client";

import PhoneInput from "@/components/common/PhoneInput";
import PopupMessage from "@/components/common/PopupMessage";
import { apiClient } from "@/services/apiClient";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type FormEvent, type HTMLAttributes, type ReactNode, type Ref } from "react";
import {
  fieldKey, hasErrors, interpretBuilderResponse, toBuilderPayload, validateFields,
  type Errors, type FieldDefinition, type FieldValue, type Values,
} from "../formLogic.ts";

type FormState = {
  formId: string;
  values: Values;
  errors: Errors;
  sending: boolean;
  setValue: (key: string, value: FieldValue) => void;
  register: (field: FieldDefinition) => () => void;
};

const FormContext = createContext<FormState | null>(null);

const domId = (formId: string, fieldId: string) => `contact-${formId}-${fieldId}`;

export type RootAttributes = HTMLAttributes<HTMLElement> & Record<`data-${string}`, string | undefined>;

type FormProps = {
  formId: string;
  attributes: RootAttributes;
  rootRef?: Ref<HTMLFormElement>;
  successMessage?: string;
  errorMessage?: string;
  invalidMessage?: string;
  /** In the editor the form is shown but never sends anything. */
  editing: boolean;
  sendingLabel?: string;
  children: ReactNode;
};

const SendingLabel = createContext("Sending…");

export function ContactFormRoot({ formId, attributes, rootRef, successMessage, errorMessage, invalidMessage, editing, sendingLabel, children }: FormProps) {
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const fields = useRef(new Map<string, FieldDefinition>());

  const register = useCallback((field: FieldDefinition) => {
    fields.current.set(field.id, field);
    return () => { fields.current.delete(field.id); };
  }, []);

  const setValue = useCallback((key: string, value: FieldValue) => {
    setValues(previous => ({ ...previous, [key]: value }));
    setErrors(previous => previous[key] ? { ...previous, [key]: undefined } : previous);
    // An earlier success or failure message no longer applies once the visitor edits the form.
    setFeedback(null);
  }, []);

  /** Registered fields in the order they appear on the page. */
  const orderedFields = () => [...fields.current.values()].sort((a, b) => {
    const first = document.getElementById(domId(formId, a.id)), second = document.getElementById(domId(formId, b.id));
    if (!first || !second) return 0;
    return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  const focusFirstInvalid = (list: FieldDefinition[], found: Errors) => {
    const first = list.find(field => found[fieldKey(field)]);
    if (first) document.getElementById(domId(formId, first.id))?.focus();
  };

  const invalid = invalidMessage || "Please check the highlighted fields and try again.";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending || editing) return;
    const list = orderedFields();
    const found = validateFields(list, values);
    setErrors(found);
    if (hasErrors(found)) {
      setFeedback({ type: "error", message: invalid });
      focusFirstInvalid(list, found);
      return;
    }
    setSending(true);
    setFeedback(null);
    const response = await apiClient("/api/v1/public/contact", { method: "POST", body: JSON.stringify(toBuilderPayload(values, honeypot)) });
    const outcome = interpretBuilderResponse(response);
    setSending(false);
    if (outcome.kind === "success") {
      // The form is cleared only after the API confirmed the message was stored.
      setValues({});
      setErrors({});
      setFeedback({ type: "success", message: successMessage || outcome.message });
      return;
    }
    // Every failure keeps what the visitor typed.
    if (outcome.kind === "validation") {
      setErrors(outcome.fieldErrors);
      focusFirstInvalid(list, outcome.fieldErrors);
      setFeedback({ type: "error", message: outcome.message });
      return;
    }
    setFeedback({ type: "error", message: errorMessage || outcome.message });
  }

  return (
    <FormContext.Provider value={{ formId, values, errors, sending, setValue, register }}>
      <SendingLabel.Provider value={sendingLabel || "Sending…"}>
        <form {...attributes} ref={rootRef} onSubmit={handleSubmit} noValidate>
          {children}
          {/* Honeypot for bots: invisible and unreachable for people and assistive tech */}
          <div aria-hidden="true" className="cb-honeypot">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={event => setHoneypot(event.target.value)} />
            </label>
          </div>
          {!editing && <PopupMessage message={feedback?.message} type={feedback?.type === "error" ? "error" : "success"} />}
        </form>
      </SendingLabel.Provider>
    </FormContext.Provider>
  );
}

type FieldProps = FieldDefinition & {
  attributes: RootAttributes;
  rootRef?: Ref<HTMLDivElement>;
  placeholder?: string;
  helpText?: string;
  optionalText?: string;
  checkboxText?: string;
  rows?: number;
};

const AUTOCOMPLETE: Record<string, string> = { name: "name", email: "email", phone: "tel" };
const CORE_LIMIT: Record<string, number> = { name: 100, email: 254, message: 2000 };

export function FormField({ attributes, rootRef, placeholder, helpText, optionalText, checkboxText, rows, ...definition }: FieldProps) {
  const form = useContext(FormContext);
  const { id, type, binding, label, required } = definition;
  const register = form?.register;
  const signature = JSON.stringify(definition);
  useEffect(() => register?.(JSON.parse(signature) as FieldDefinition), [register, signature]);

  const key = fieldKey(definition);
  const control = domId(form?.formId ?? "preview", id);
  const value = form?.values[key];
  const error = form?.errors[key];
  const disabled = form?.sending ?? false;
  const change = (next: FieldValue) => form?.setValue(key, next);
  const part = (name: string) => `${id}:${name}`;
  const describedBy = [error ? control + "-error" : "", helpText ? control + "-help" : ""].filter(Boolean).join(" ") || undefined;
  const shared = {
    id: control,
    name: binding === "custom" ? id : binding,
    "aria-required": required || undefined,
    "aria-invalid": !!error,
    "aria-describedby": describedBy,
    disabled,
  };
  const inputProps = { ...shared, className: "cb-input", "data-cb-part": part("control"), placeholder };
  const marker = required ? <span className="cb-required"> *</span> : optionalText ? <span className="cb-optional"> {optionalText}</span> : null;
  const text = typeof value === "string" ? value : "";
  const maxLength = definition.maxLength ?? CORE_LIMIT[binding] ?? 1000;
  const options = definition.options ?? [];
  const group = type === "RadioGroup";

  return (
    <div {...attributes} ref={rootRef}>
      {group
        ? <span id={control + "-label"} className="cb-label" data-cb-part={part("label")}>{label}{marker}</span>
        : <label htmlFor={control} className="cb-label" data-cb-part={part("label")}>{label}{marker}</label>}
      {(type === "TextInput" || type === "EmailInput") && (
        <input {...inputProps} type={type === "EmailInput" ? "email" : "text"} autoComplete={AUTOCOMPLETE[binding] ?? "off"} maxLength={maxLength} value={text} onChange={event => change(event.target.value)} />
      )}
      {type === "PhoneInput" && (
        <PhoneInput {...inputProps} autoComplete="tel" value={text} onValueChange={change} />
      )}
      {type === "NumberInput" && (
        <input {...inputProps} type="number" inputMode="decimal" min={definition.min} max={definition.max} value={text} onChange={event => change(event.target.value)} />
      )}
      {type === "TextArea" && (
        <textarea {...inputProps} rows={rows ?? 4} maxLength={maxLength} value={text} onChange={event => change(event.target.value)} />
      )}
      {type === "Dropdown" && (
        <select {...shared} className="cb-input" data-cb-part={part("control")} value={text} onChange={event => change(event.target.value)}>
          <option value="">{placeholder || "Select…"}</option>
          {options.map((option, index) => <option key={index} value={option}>{option}</option>)}
        </select>
      )}
      {group && (
        <div role="radiogroup" id={control} tabIndex={-1} aria-labelledby={control + "-label"} aria-describedby={describedBy} aria-required={required || undefined} className="cb-choices" data-cb-part={part("control")}>
          {options.map((option, index) => (
            <label key={index} className="cb-choice">
              <input type="radio" name={control} value={option} checked={value === option} disabled={disabled} onChange={() => change(option)} />
              {option}
            </label>
          ))}
        </div>
      )}
      {type === "CheckboxField" && (
        <label className="cb-choice" data-cb-part={part("control")}>
          <input {...shared} type="checkbox" checked={value === true} onChange={event => change(event.target.checked)} />
          {checkboxText || label}
        </label>
      )}
      {helpText && <p id={control + "-help"} className="cb-help" data-cb-part={part("help")}>{helpText}</p>}
      {error && <p id={control + "-error"} className="cb-error">{error}</p>}
    </div>
  );
}

export function SubmitControl({ attributes, rootRef, children }: { attributes: RootAttributes; rootRef?: Ref<HTMLButtonElement>; children: ReactNode }) {
  const form = useContext(FormContext);
  const sendingLabel = useContext(SendingLabel);
  return (
    <button {...attributes} ref={rootRef} type="submit" disabled={form?.sending}>
      {form?.sending ? sendingLabel : children}
    </button>
  );
}
