import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

export type CheckinRow = Database['public']['Tables']['checkins']['Row'];
export type StreakRow = Database['public']['Tables']['streaks']['Row'];

export function useEvidenceLog() {
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);
  const [streakData, setStreakData] = useState<StreakRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidenceLog = useCallback(async () => {
    setLoading(true);
    setError(null);

    let userId: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;
      }
    } catch (authErr) {
      console.warn('Auth check error in useEvidenceLog:', authErr);
    }

    if (!userId) {
      setCheckins([]);
      setStreakData(null);
      setLoading(false);
      return;
    }

    try {
      // Execute parallel queries for streaks and checkins
      const [streakRes, checkinsRes] = await Promise.all([
        supabase
          .from('streaks')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('checkins')
          .select('*')
          .eq('user_id', userId)
          .order('day_number', { ascending: false }),
      ]);

      if (streakRes.error) {
        console.warn('Error fetching streaks:', streakRes.error);
      } else if (streakRes.data) {
        setStreakData(streakRes.data);
      }

      if (checkinsRes.error) {
        console.warn('Error fetching checkins:', checkinsRes.error);
        setError(checkinsRes.error.message);
      } else {
        setCheckins(checkinsRes.data || []);
      }
    } catch (err: any) {
      console.warn('Evidence log fetch error:', err);
      setError(err.message || 'Failed to load evidence log');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidenceLog();
  }, [fetchEvidenceLog]);

  return {
    checkins,
    currentStreak: streakData?.current_streak || 0,
    longestStreak: streakData?.longest_streak || 0,
    loading,
    error,
    refetch: fetchEvidenceLog,
  };
}
