import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingBelief'>;

interface BeliefOption {
  id: string;
  label: string;
}

const BELIEF_OPTIONS: BeliefOption[] = [
  { id: 'fear_of_judgment', label: 'I worry too much about what people think of me' },
  { id: 'fear_of_rejection', label: "I avoid putting myself out there because I'm afraid of being rejected" },
  { id: 'imposter_feelings', label: "I feel like I don't belong or I'm not good enough" },
  { id: 'body_confidence', label: 'I feel self-conscious about how I look or come across physically' },
  { id: 'freezing_under_pressure', label: 'I get nervous or freeze when I have to speak up or perform' },
  { id: 'general_self_worth', label: 'I generally doubt myself and my decisions' },
];

export default function OnboardingBeliefScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextText, setContextText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTextChange = (text: string) => {
    if (text.length <= 200) {
      setContextText(text);
    }
  };

  const handleSubmit = async () => {
    if (!selectedId) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('No authenticated user found. Please sign in to save your progress.');
      }

      const todayISO = new Date().toISOString();
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          identity_id: 'confidence',
          belief_category_id: selectedId,
          belief_context_text: contextText.trim() || null,
          onboarding_completed: true,
          program_start_date: todayISO,
        });

      if (dbError) {
        throw new Error(dbError.message);
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headline}>What's been holding you back?</Text>
          <Text style={styles.subtext}>Pick the one that fits closest.</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {BELIEF_OPTIONS.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <Pressable
                key={option.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => setSelectedId(option.id)}
                disabled={loading}
              >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Context Input */}
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Anything specific you want to add? (optional)</Text>
            <Text style={styles.charCount}>{contextText.length}/200</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. This shows up most at work, or in dating, or with family"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            value={contextText}
            onChangeText={handleTextChange}
            editable={!loading}
            maxLength={200}
            textAlignVertical="top"
          />
        </View>

        {/* Error Display */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              (!selectedId || loading) && styles.buttonDisabled,
              pressed && selectedId && !loading && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={!selectedId || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textOnPrimary} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerContainer: {
    marginBottom: theme.spacing.lg,
  },
  headline: {
    fontSize: theme.typography.sizes.screenTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.screenTitle,
    marginBottom: theme.spacing.xs,
  },
  subtext: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.body,
  },
  optionsContainer: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 14,
    ...theme.shadows.card,
  },
  cardSelected: {
    borderColor: theme.colors.borderSelected,
    backgroundColor: theme.colors.surfaceAlt,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  cardText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: theme.typography.lineHeights.body,
  },
  cardTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
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
    minHeight: 100,
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
  button: {
    width: '100%',
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
});
