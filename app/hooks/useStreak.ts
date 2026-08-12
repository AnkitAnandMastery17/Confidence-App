import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
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
          const { data: streakData, error: dbError } = await supabase
            .from('streaks')
            .select('current_streak')
            .eq('user_id', user.id)
            .maybeSingle();

          if (dbError) throw dbError;

          if (streakData) {
            setCurrentStreak(streakData.current_streak || 0);
          } else {
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

  return { currentStreak, loading, error };
}
