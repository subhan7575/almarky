import React, { useRef, useEffect } from 'react';
import useClickOutside from '../../hooks/useClickOutside.ts';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'center' | 'bottom-sheet';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, position = 'center' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    center: 'items-center justify-center p-4',
    'bottom-sheet': 'items-end sm:items-center justify-center',
  };

  const animationClasses = {
      center: 'animate-in zoom-in-95 duration-300',
      'bottom-sheet': 'animate-in slide-in-from-bottom duration-300'
  }

  const contentClasses = {
      center: 'rounded-[3rem]',
      'bottom-sheet': 'rounded-t-[2.5rem] sm:rounded-[2rem]'
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[100] flex ${positionClasses[position]}`}
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
      <div
        ref={modalRef}
        className={`relative z-10 ${animationClasses[position]} ${contentClasses[position]} overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
