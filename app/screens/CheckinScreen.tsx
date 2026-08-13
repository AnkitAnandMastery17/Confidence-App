import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';
import { calculateStreakUpdate, getLocalDateString } from '../hooks/useStreak';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkin'>;
type CheckinRouteProp = RouteProp<RootStackParamList, 'Checkin'>;

export default function CheckinScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CheckinRouteProp>();

  const [dayNumber, setDayNumber] = useState<number>(route.params?.dayNumber || 1);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [reflection, setReflection] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If dayNumber wasn't passed in params, calculate it from profile start date
  useEffect(() => {
    if (route.params?.dayNumber) {
      setDayNumber(route.params.dayNumber);
      return;
    }

    const calculateDayNumber = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('program_start_date')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.program_start_date) {
          const start = new Date(profile.program_start_date);
          const today = new Date();
          
          const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          const diffTime = todayDate.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          setDayNumber(Math.max(1, diffDays + 1));
        }
      } catch (err) {
        console.error('Failed to calculate day number', err);
      }
    };

    calculateDayNumber();
  }, [route.params?.dayNumber]);

  const handleTextChange = (text: string) => {
    if (text.length <= 500) {
      setReflection(text);
    }
  };

  const handleSave = async () => {
    if (completed === null) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user session found.');

      // 1. Save check-in record (Upsert because user can check in multiple times per day)
      const { error: checkinError } = await supabase
        .from('checkins')
        .upsert(
          {
            user_id: user.id,
            day_number: dayNumber,
            challenge_completed: completed,
            reflection_text: reflection.trim() || null,
          },
          { onConflict: 'user_id,day_number' }
        );

      if (checkinError) throw checkinError;

      // 2. Fetch current streak record to update it
      const { data: currentStreakRow, error: streakFetchError } = await supabase
        .from('streaks')
        .select('user_id, current_streak, longest_streak, last_checkin_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakFetchError) throw streakFetchError;

      // 3. Compute updated streak details
      const updatedStreak = calculateStreakUpdate(currentStreakRow, completed);

      // 4. Save updated streak back
      const { error: streakUpdateError } = await supabase
        .from('streaks')
        .upsert(
          {
            user_id: user.id,
            ...updatedStreak,
          },
          { onConflict: 'user_id' }
        );

      if (streakUpdateError) throw streakUpdateError;

      // 5. Navigate back to Home and reset the stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Custom Minimalist Header Close Link */}
          <View style={styles.headerRow}>
            <Text style={styles.dayText}>Day {dayNumber} Practice</Text>
            <Pressable 
              onPress={() => navigation.goBack()} 
              style={styles.closeButton}
              disabled={loading}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.headline}>How did today go?</Text>
            <Text style={styles.subtext}>
              Be honest with yourself. Reflection is the foundation of change.
            </Text>
          </View>

          {/* Selector Options */}
          <View style={styles.toggleContainer}>
            <Pressable
              style={[
                styles.toggleOption,
                completed === true && styles.toggleOptionYesActive,
              ]}
              onPress={() => setCompleted(true)}
              disabled={loading}
            >
              <Text style={[styles.toggleText, completed === true && styles.toggleTextActive]}>
                I did it
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.toggleOption,
                completed === false && styles.toggleOptionNoActive,
              ]}
              onPress={() => setCompleted(false)}
              disabled={loading}
            >
              <Text style={[styles.toggleText, completed === false && styles.toggleTextActive]}>
                I didn't get to it
              </Text>
            </Pressable>
          </View>

          {/* Reflection Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Anything you want to remember about today? (optional)</Text>
              <Text style={styles.charCount}>{reflection.length}/500</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="A win, a struggle, anything that stood out..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={6}
              value={reflection}
              onChangeText={handleTextChange}
              editable={!loading}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Submit Action */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                (completed === null || loading) && styles.saveButtonDisabled,
                pressed && completed !== null && !loading && styles.saveButtonPressed,
              ]}
              onPress={handleSave}
              disabled={completed === null || loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  titleContainer: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  toggleOption: {
    flex: 1,
    height: 60,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleOptionYesActive: {
    borderColor: '#0EA5E9', // Soft cyan active border
    backgroundColor: '#0F2E4A', // Dark cyan tint background
  },
  toggleOptionNoActive: {
    borderColor: '#64748B', // Low pressure slate active border
    backgroundColor: '#1E293B',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  toggleTextActive: {
    color: '#F8FAFC',
  },
  inputContainer: {
    marginBottom: 32,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    flex: 1,
    marginRight: 10,
  },
  charCount: {
    fontSize: 11,
    color: '#64748B',
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 120,
  },
  errorContainer: {
    backgroundColor: '#451A1A',
    borderColor: '#7F1D1D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
