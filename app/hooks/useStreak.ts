import { useState, useEffect } from 'react';

export function useStreak() {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Streak logic placeholder
    setLoading(false);
  }, []);

  return { streakCount, loading };
}
