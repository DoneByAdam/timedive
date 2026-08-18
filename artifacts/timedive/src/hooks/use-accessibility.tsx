import { useEffect, useState } from 'react';

type TextSize = 'base' | 'medium' | 'large';

export function useAccessibility() {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('accessibility-high-contrast') === 'true';
  });
  
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('accessibility-text-size') as TextSize) || 'base';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-base', 'text-size-medium', 'text-size-large');
    if (textSize !== 'base') {
      root.classList.add(`text-size-${textSize}`);
    }
    localStorage.setItem('accessibility-text-size', textSize);
  }, [textSize]);

  return {
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
  };
}
