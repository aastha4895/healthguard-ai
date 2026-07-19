import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-ink-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <h2 className="font-bold text-ink-950 text-lg">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-ink-100 transition-colors">
            <X className="w-4 h-4 text-ink-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
