import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[150] max-w-[414px] mx-auto"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-[200] max-w-[414px] mx-auto flex flex-col max-h-[85vh] shadow-2xl"
          >
            <div className="p-4 text-center border-b border-border relative">
              <span className="text-base font-medium text-text-main">{title}</span>
              <button onClick={onClose} className="absolute right-4 top-4 text-text-sub hover:text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
