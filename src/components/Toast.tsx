'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isSpecial?: boolean;
  onClose: () => void;
}

export default function Toast({ message, isSpecial = false, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      data-testid="toast"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold max-w-xs text-center ${
        isSpecial
          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
          : 'bg-green-500'
      }`}
    >
      {message}
    </div>
  );
}
