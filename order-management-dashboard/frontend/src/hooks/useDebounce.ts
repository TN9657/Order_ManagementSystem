import { useCallback, useState } from 'react';

export const useDebounce = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const debounce = useCallback((val: string) => {
    const handler = setTimeout(() => {
      setDebouncedValue(val);
    }, delay);

    return () => clearTimeout(handler);
  }, [delay]);

  return { debouncedValue, debounce };
};
