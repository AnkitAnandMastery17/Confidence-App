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
      // 1. Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('No authenticated user found. Please sign in to save your progress.');
      }

      // 2. Update/Upsert the profile row
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

      // 3. Reset stack and navigate to Home on success
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
                {/* Custom Radio Button */}
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
            placeholderTextColor="#64748B" // Slate 500
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
              <ActivityIndicator color="#0F172A" />
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
    backgroundColor: '#0F172A', // Slate 900
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  headerContainer: {
    marginBottom: 28,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
    gap: 12,
  },
  cardSelected: {
    borderColor: '#38BDF8', // Soft sky blue active border
    backgroundColor: '#1E293B',
    ...Platform.select({
      ios: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 0px 8px rgba(56, 189, 248, 0.15)',
      },
    }),
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748B', // Slate 500
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#38BDF8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  cardText: {
    fontSize: 14,
    color: '#CBD5E1', // Slate 300
    flex: 1,
    lineHeight: 20,
  },
  cardTextSelected: {
    color: '#F8FAFC', // Slate 50
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  charCount: {
    fontSize: 11,
    color: '#64748B',
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 90,
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
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
});
