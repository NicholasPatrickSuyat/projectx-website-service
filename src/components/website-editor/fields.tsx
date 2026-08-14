export const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-[0_1px_1px_rgba(15,23,42,0.03)] outline-none transition-colors placeholder:text-muted";

export const labelClass = "block text-sm font-medium text-foreground";

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-rose-700" role="alert">
      {message}
    </p>
  );
}

export function FieldHint({ children }: { children: string }) {
  return <p className="mt-1 text-xs leading-5 text-muted">{children}</p>;
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: "text" | "email" | "tel" | "url";
  placeholder?: string;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  placeholder,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={inputClass}
      />
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <FieldError message={error} />
    </div>
  );
}

type TextAreaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  rows?: number;
};

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`${inputClass} resize-y`}
      />
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <FieldError message={error} />
    </div>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  hint?: string;
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  hint,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <FieldError message={error} />
    </div>
  );
}

type ColorFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function ColorField({ id, label, value, onChange, error }: ColorFieldProps) {
  const pickerValue = /^#([0-9a-fA-F]{6})$/.test(value) ? value : "#000000";

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color picker`}
          className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1"
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={inputClass.replace("mt-1.5 ", "")}
          spellCheck={false}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}
