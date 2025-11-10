import React from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/**
 * Reusable Confirmation Modal Component
 * Used for confirming important actions like sign out, delete, etc.
 */
export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full transform transition-all">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Loading...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
