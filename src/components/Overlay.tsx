import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Overlay({ isOpen, onClose, title, children, actions }: OverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-bg-main z-[100] max-w-[414px] mx-auto flex flex-col h-screen"
        >
          <div className="h-[50px] bg-card flex items-center justify-between px-4 border-b border-border shrink-0">
            <button onClick={onClose} className="text-text-main hover:text-primary transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-medium text-text-main truncate max-w-[60%]">{title}</h1>
            <div className="flex gap-4">
              {actions}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
