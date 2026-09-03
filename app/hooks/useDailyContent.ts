import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface DailyContent {
  affirmation_1: string;
  affirmation_2: string;
  affirmation_3: string;
  challenge: string;
  visualization_script: string;
}

const CACHE_KEY = '@confidence_daily_content_cache';

export function useDailyContent() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyContent = async () => {
      setLoading(true);
      setError(null);

      // Try loading cached content first for instantaneous offline launch
      try {
        const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cachedData = JSON.parse(cachedRaw);
          if (cachedData.content && cachedData.dayNumber) {
            setContent(cachedData.content);
            setDayNumber(cachedData.dayNumber);
          }
        }
      } catch (cacheErr) {
        console.log('Cache read error:', cacheErr);
      }

      try {
        // 1. Get authenticated user ID
        let user: any = null;
        try {
          const { data, error: authError } = await supabase.auth.getUser();
          if (!authError && data?.user) {
            user = data.user;
          }
        } catch (authErr) {
          console.warn('Supabase auth network fetch failed:', authErr);
        }

        if (!user) {
          // Serve static fallback practice content when offline or unauthenticated
          const defaultFallbackContent: DailyContent = {
            affirmation_1: 'I am capable of speaking my mind and sharing my views.',
            affirmation_2: 'My voice is valuable, and my perspective is unique.',
            affirmation_3: 'I step outside my comfort zone to grow and learn.',
            challenge: 'Express your honest opinion or voice a thought in your next conversation today.',
            visualization_script: 'Take a slow, deep breath. Picture yourself standing tall in a room full of people. You have something to say, and you express it calmly, clearly, and confidently. Feel the weight lift as your words flow naturally.',
          };
          setContent((prev) => prev || defaultFallbackContent);
          return;
        }

        // 2. Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('program_start_date, belief_category_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) {
          throw new Error('User profile not found. Please complete onboarding.');
        }

        const beliefCategoryId = profile.belief_category_id;
        if (!beliefCategoryId) {
          throw new Error('No limiting belief category selected. Please complete onboarding.');
        }

        // 3. Compute day_number
        let computedDay = 1;
        if (profile.program_start_date) {
          const start = new Date(profile.program_start_date);
          const today = new Date();
          
          const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          const diffTime = todayDate.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          computedDay = Math.max(1, diffDays + 1);
        }
        setDayNumber(computedDay);

        // 4. Try fetching daily_content
        let fetchedContent: DailyContent | null = null;

        const { data: dailyContent, error: dailyError } = await supabase
          .from('daily_content')
          .select('affirmation_1, affirmation_2, affirmation_3, challenge, visualization_script')
          .eq('user_id', user.id)
          .eq('day_number', computedDay)
          .maybeSingle();

        if (dailyError) throw dailyError;

        if (dailyContent) {
          fetchedContent = dailyContent as DailyContent;
        } else {
          // 5. Fallback: fetch from content_templates
          const { data: templates, error: templatesError } = await supabase
            .from('content_templates')
            .select('affirmation_1, affirmation_2, affirmation_3, challenge, visualization_script')
            .eq('belief_category_id', beliefCategoryId)
            .limit(1);

          if (templatesError) throw templatesError;

          if (templates && templates.length > 0) {
            fetchedContent = templates[0] as DailyContent;
          } else {
            // Provide a static default content if template table is empty
            fetchedContent = {
              affirmation_1: 'I am capable of speaking my mind and sharing my views.',
              affirmation_2: 'My voice is valuable, and my perspective is unique.',
              affirmation_3: 'I step outside my comfort zone to grow and learn.',
              challenge: 'Express your honest opinion or voice a thought in your next conversation today.',
              visualization_script: 'Take a slow, deep breath. Picture yourself standing tall in a room full of people. You have something to say, and you express it calmly, clearly, and confidently. Feel the weight lift as your words flow naturally.',
            };
          }
        }

        if (fetchedContent) {
          setContent(fetchedContent);
          // Persist content to local AsyncStorage cache
          await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ content: fetchedContent, dayNumber: computedDay })
          );
        }
      } catch (err: any) {
        console.warn('Network fetch error, serving offline default practice content:', err);
        
        // Provide static default content so app functions seamlessly offline
        const defaultFallbackContent: DailyContent = {
          affirmation_1: 'I am capable of speaking my mind and sharing my views.',
          affirmation_2: 'My voice is valuable, and my perspective is unique.',
          affirmation_3: 'I step outside my comfort zone to grow and learn.',
          challenge: 'Express your honest opinion or voice a thought in your next conversation today.',
          visualization_script: 'Take a slow, deep breath. Picture yourself standing tall in a room full of people. You have something to say, and you express it calmly, clearly, and confidently. Feel the weight lift as your words flow naturally.',
        };

        setContent((prev) => prev || defaultFallbackContent);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyContent();
  }, []);

  return { content, dayNumber, loading, error };
}
