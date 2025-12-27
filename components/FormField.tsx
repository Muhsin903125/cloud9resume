import React from "react";
import { colors, transitions } from "../lib/constants";

interface FormFieldProps {
  label: string;
  name?: string;
  type?: "text" | "email" | "password" | "tel" | "url" | "date";
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  helpText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  multiline = false,
  rows = 3,
  helpText,
  icon,
  children,
}) => {
  const labelStyles: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: colors.primary.black,
    marginBottom: "0.5rem",
  };

  const inputContainerStyles: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const baseInputStyles: React.CSSProperties = {
    width: "100%",
    padding: icon ? "0.625rem 1rem 0.625rem 2.5rem" : "0.625rem 1rem",
    fontSize: "1rem",
    color: colors.primary.black,
    backgroundColor: colors.background.white,
    border: `1px solid ${error ? colors.accent.red : colors.border}`,
    borderRadius: "0.375rem",
    transition: transitions.normal,
    outline: "none",
    fontFamily: "inherit",
  };

  const iconStyles: React.CSSProperties = {
    position: "absolute",
    left: "0.75rem",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  };

  const errorStyles: React.CSSProperties = {
    marginTop: "0.25rem",
    fontSize: "0.875rem",
    color: colors.accent.red,
  };

  const helpTextStyles: React.CSSProperties = {
    marginTop: "0.25rem",
    fontSize: "0.875rem",
    color: colors.secondary.mediumGray,
  };

  const [isFocused, setIsFocused] = React.useState(false);

  const focusStyles: React.CSSProperties = isFocused
    ? {
        borderColor: colors.primary.blue,
        boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.1)`,
      }
    : {};

  const inputStyles: React.CSSProperties = {
    ...baseInputStyles,
    ...focusStyles,
    ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
  };

  const InputElement = multiline ? "textarea" : "input";

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={name} style={labelStyles}>
        {label}
        {required && (
          <span style={{ color: colors.accent.red, marginLeft: "0.25rem" }}>
            *
          </span>
        )}
      </label>

      <div style={inputContainerStyles}>
        {icon && <div style={iconStyles}>{icon}</div>}
        {children ? (
          children
        ) : (
          <InputElement
            id={name}
            name={name}
            type={!multiline ? type : undefined}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={multiline ? rows : undefined}
            style={inputStyles}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        )}
      </div>

      {error && <div style={errorStyles}>{error}</div>}
      {helpText && !error && <div style={helpTextStyles}>{helpText}</div>}
    </div>
  );
};

export default FormField;
