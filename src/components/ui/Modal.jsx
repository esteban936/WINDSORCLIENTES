import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-soft">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <Button variant="ghost" className="px-2" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

