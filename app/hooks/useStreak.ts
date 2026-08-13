import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface StreakData {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
}

// Utility function to get local date in YYYY-MM-DD format
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Separate pure function to compute streak updates, making it testable & reusable
export function calculateStreakUpdate(
  currentStreakRow: StreakData | null,
  challengeCompleted: boolean
): Omit<StreakData, 'user_id'> {
  const current = currentStreakRow?.current_streak || 0;
  const longest = currentStreakRow?.longest_streak || 0;
  const lastCheckin = currentStreakRow?.last_checkin_date;

  const todayStr = getLocalDateString(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (challengeCompleted) {
    // If they already checked in today, keep the current values (avoid duplicate inflation)
    if (lastCheckin === todayStr) {
      return {
        current_streak: current,
        longest_streak: longest,
        last_checkin_date: lastCheckin,
      };
    }

    // Check if the check-in is consecutive (last check-in was yesterday)
    const isConsecutive = lastCheckin === yesterdayStr;
    const newStreak = isConsecutive ? current + 1 : 1;
    const newLongest = Math.max(longest, newStreak);

    return {
      current_streak: newStreak,
      longest_streak: newLongest,
      last_checkin_date: todayStr,
    };
  } else {
    // Reset streak on challenge failure
    return {
      current_streak: 0,
      longest_streak: longest,
      last_checkin_date: lastCheckin || null,
    };
  }
}

export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStreak = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data: dbData, error: dbError } = await supabase
            .from('streaks')
            .select('user_id, current_streak, longest_streak, last_checkin_date')
            .eq('user_id', user.id)
            .maybeSingle();

          if (dbError) throw dbError;

          if (dbData) {
            setStreakData(dbData as StreakData);
            setCurrentStreak(dbData.current_streak || 0);
          } else {
            const emptyData: StreakData = {
              user_id: user.id,
              current_streak: 0,
              longest_streak: 0,
              last_checkin_date: null,
            };
            setStreakData(emptyData);
            setCurrentStreak(0);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch streak');
        setCurrentStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  return { currentStreak, streakData, loading, error };
}
