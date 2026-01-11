'use client';

import { useEffect } from 'react';

export default function TitleWatcher() {
  useEffect(() => {
    const originalTitle = document.title;
    const hiddenTitle = "Hop back in!";

    const handleVisibilityChange = () => {
      document.title = document.hidden ? hiddenTitle : originalTitle;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // This component only sets up the effect; it renders nothing.
  return null;
}