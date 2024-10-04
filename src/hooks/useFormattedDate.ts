import { useState, useEffect } from 'react';

export const useFormattedDate = () => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    const getFormattedDate = () => {
      const unixTimestamp = Math.floor(Date.now() / 1000);
      const date = new Date(unixTimestamp * 1000);
      setFormattedDate(date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }));
    };

    getFormattedDate();
  }, []);

  return formattedDate;
};