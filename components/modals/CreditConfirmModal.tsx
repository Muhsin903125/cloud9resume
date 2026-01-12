import React from "react";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CreditConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cost: number;
  balance: number;
  isLoading?: boolean;
}

export const CreditConfirmModal: React.FC<CreditConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cost,
  balance,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const hasEnoughCredits = balance >= cost;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all border border-slate-200">
        {/* Header with Background Pattern */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10 pointer-events-none" />

        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 shadow-sm">
              <SparklesIcon className="w-8 h-8 text-indigo-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {description}
            </p>

            {/* Credit Info Box */}
            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  Action Cost
                </span>
                <span className="text-indigo-600 font-bold text-lg">
                  {cost} Credits
                </span>
              </div>
              <div className="h-px bg-slate-200 w-full mb-2" />
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                  Current Balance
                </span>
                <span
                  className={`font-bold ${
                    hasEnoughCredits ? "text-slate-900" : "text-rose-600"
                  }`}
                >
                  {balance} Credits
                </span>
              </div>
            </div>

            {/* Warning if not enough credits */}
            {!hasEnoughCredits && (
              <div className="w-full p-3 bg-rose-50 rounded-lg border border-rose-100 mb-6">
                <p className="text-rose-700 text-xs font-medium">
                  You don't have enough credits for this action.
                </p>
              </div>
            )}

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={onConfirm}
                disabled={!hasEnoughCredits || isLoading}
                className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                  hasEnoughCredits
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm & Proceed"
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors"
                disabled={isLoading}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
