import { useEffect } from 'react';

/** Sets the browser tab title. Each screen sets its own (the timeline also covers its dialog). */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `Benchline — ${title}`;
  }, [title]);
}
