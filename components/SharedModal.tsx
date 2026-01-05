import React, { useEffect } from "react";
import { colors, transitions, zIndex } from "../lib/constants";
import { CloseIcon } from "./Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  theme?: "light" | "dark";
}

const SharedModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  theme = "light",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles: Record<string, string> = {
    sm: "400px",
    md: "600px",
    lg: "800px",
    xl: "1000px",
    "2xl": "1280px",
    full: "95vw",
  };

  const overlayStyles: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: zIndex.modal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    backdropFilter: "blur(4px)",
  };

  const contentStyles: React.CSSProperties = {
    backgroundColor: theme === "dark" ? "#1e293b" : colors.background.white, // slate-800
    color: theme === "dark" ? "#f8fafc" : colors.primary.black,
    borderRadius: "1rem",
    boxShadow:
      theme === "dark"
        ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxWidth: sizeStyles[size],
    width: "100%",
    maxHeight: "calc(100vh - 2rem)",
    overflow: "auto",
    position: "relative",
    border: theme === "dark" ? "1px solid #334155" : "none",
  };

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.5rem",
    borderBottom: `1px solid ${theme === "dark" ? "#334155" : colors.border}`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme === "dark" ? "#f8fafc" : colors.primary.black,
    margin: 0,
    backgroundColor: "transparent",
  };

  const closeButtonStyles: React.CSSProperties = {
    background: theme === "dark" ? "rgba(255,255,255,0.1)" : "none",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    transition: transitions.fast,
    color: theme === "dark" ? "#94a3b8" : colors.primary.gray,
  };

  const bodyStyles: React.CSSProperties = {
    padding: "0", // Handled by children for full control
  };

  return (
    <div
      style={overlayStyles}
      onClick={onClose}
      className="shared-modal-overlay"
    >
      <div
        style={contentStyles}
        onClick={(e) => e.stopPropagation()}
        className={`shared-modal-content ${
          theme === "dark"
            ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
            : ""
        }`}
      >
        {title && (
          <div style={headerStyles} className="shared-modal-header">
            <h3 style={titleStyles}>{title}</h3>
            <button
              onClick={onClose}
              style={closeButtonStyles}
              aria-label="Close modal"
              className="hover:bg-opacity-20 hover:text-white"
            >
              <CloseIcon
                size={20}
                color={theme === "dark" ? "#fff" : colors.primary.gray}
              />
            </button>
          </div>
        )}
        <div style={bodyStyles} className="shared-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SharedModal;
