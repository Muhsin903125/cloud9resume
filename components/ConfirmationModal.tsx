import React from "react";
import SharedModal from "./SharedModal";
import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-4 space-y-2">
        <p className="text-gray-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </SharedModal>
  );
};

export default ConfirmationModal;
