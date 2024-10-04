import { useState, useCallback } from 'react';

interface CopyToClipboardResult {
  copyToClipboard: (text: string) => Promise<boolean>;
  copySuccess: string;
}

export const useCopyToClipboard = (): CopyToClipboardResult => {
  const [copySuccess, setCopySuccess] = useState<string>('');

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopySuccess('Failed to copy');
      return false;
    }
  }, []);

  return { copyToClipboard, copySuccess };
};