import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
  switch (type) {
  case "danger":
  return <AlertTriangle className="w-6 h-6 text-red-500" />;
  case "warning":
  default:
  return <AlertTriangle className="w-6 h-6 text-amber-500" />;
  }
  };

  const getButtonStyles = () => {
  switch (type) {
  case "danger":
  return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
  case "warning":
  default:
  return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";
  }
  };

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div
  className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
  onClick={onClose}
  />

  {/* Modal */}
  <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform animate-in fade-in zoom-in duration-200">
  {/* Close button */}
  <button
  onClick={onClose}
  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
  >
  <X className="w-5 h-5" />
  </button>

  {/* Icon */}
  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-slate-50 rounded-full">
  {getIcon()}
  </div>

  {/* Title */}
  <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
  {title}
  </h3>

  {/* Message */}
  <p className="text-slate-600 text-center mb-6 leading-relaxed">
  {message}
  </p>

  {/* Buttons */}
  <div className="flex gap-3">
  <button
  onClick={onClose}
  className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
  >
  {cancelText}
  </button>
  <button
  onClick={onConfirm}
  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getButtonStyles()}`}
  >
  {confirmText}
  </button>
  </div>
  </div>
  </div>
  );
};

export default ConfirmDialog;
