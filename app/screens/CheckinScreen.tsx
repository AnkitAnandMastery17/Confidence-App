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
import { calculateStreakUpdate } from '../hooks/useStreak';
import { theme } from '../theme';

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

      const { data: currentStreakRow, error: streakFetchError } = await supabase
        .from('streaks')
        .select('user_id, current_streak, longest_streak, last_checkin_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakFetchError) throw streakFetchError;

      const updatedStreak = calculateStreakUpdate(currentStreakRow, completed);

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

          {/* Header Close Link */}
          <View style={styles.headerRow}>
            <Text style={styles.dayText}>Day {dayNumber} Check-in</Text>
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
                completed === true && styles.toggleOptionActive,
              ]}
              onPress={() => setCompleted(true)}
              disabled={loading}
            >
              <Text style={[styles.toggleText, completed === true && styles.toggleTextActive]}>
                I completed today's action
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.toggleOption,
                completed === false && styles.toggleOptionActive,
              ]}
              onPress={() => setCompleted(false)}
              disabled={loading}
            >
              <Text style={[styles.toggleText, completed === false && styles.toggleTextActive]}>
                I didn't get to it today
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
              placeholder="A win, a struggle, or anything that stood out..."
              placeholderTextColor={theme.colors.textMuted}
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

          {/* Save Action */}
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
                <ActivityIndicator color={theme.colors.textOnPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Save entry</Text>
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
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dayText: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  titleContainer: {
    marginBottom: theme.spacing.lg,
  },
  headline: {
    fontSize: theme.typography.sizes.screenTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.body,
  },
  toggleContainer: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  toggleOption: {
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.card,
  },
  toggleOptionActive: {
    borderColor: theme.colors.borderSelected,
    backgroundColor: theme.colors.surfaceAlt,
  },
  toggleText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  toggleTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  charCount: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textMuted,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 120,
  },
  errorContainer: {
    backgroundColor: theme.colors.errorBg,
    borderColor: theme.colors.errorBorder,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.errorText,
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    lineHeight: theme.typography.lineHeights.secondary,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
});
