import React, { useEffect } from "react";
import { colors, transitions, zIndex } from "../lib/constants";
import { CloseIcon } from "./Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const SharedModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: zIndex.modal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  };

  const contentStyles: React.CSSProperties = {
    backgroundColor: colors.background.white,
    borderRadius: "0.5rem",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxWidth: sizeStyles[size],
    width: "100%",
    maxHeight: "calc(100vh - 2rem)",
    overflow: "auto",
    position: "relative",
  };

  const headerStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.5rem",
    borderBottom: `1px solid ${colors.border}`,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: colors.primary.black,
    margin: 0,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.25rem",
    transition: transitions.fast,
  };

  const bodyStyles: React.CSSProperties = {
    padding: "1.5rem",
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
        className="shared-modal-content"
      >
        {title && (
          <div style={headerStyles} className="shared-modal-header">
            <h3 style={titleStyles}>{title}</h3>
            <button
              onClick={onClose}
              style={closeButtonStyles}
              aria-label="Close modal"
            >
              <CloseIcon size={20} color={colors.primary.gray} />
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
