/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  turnstile?: {
    render: (
      container: string | HTMLElement,
      options: {
        sitekey: string;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact' | 'flexible';
        callback?: (token: string) => void;
        'error-callback'?: (errorCode?: string) => void;
        'expired-callback'?: () => void;
      }
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
  };
}
