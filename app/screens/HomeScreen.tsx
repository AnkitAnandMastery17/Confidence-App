import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../../App';
import { useDailyContent } from '../hooks/useDailyContent';
import { useStreak } from '../hooks/useStreak';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import {
  GeometricLogoMark,
  AffirmationIcon,
  VisualizationIcon,
  ChallengeIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { content, dayNumber, loading: contentLoading, error: contentError } = useDailyContent();
  const { currentStreak, loading: streakLoading } = useStreak();

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Subtle entrance animations for cards
  const fadeAnimHeader = useRef(new Animated.Value(0)).current;
  const slideAnimHeader = useRef(new Animated.Value(12)).current;

  const fadeAnimCard1 = useRef(new Animated.Value(0)).current;
  const slideAnimCard1 = useRef(new Animated.Value(16)).current;

  const fadeAnimCard2 = useRef(new Animated.Value(0)).current;
  const slideAnimCard2 = useRef(new Animated.Value(16)).current;

  const fadeAnimCard3 = useRef(new Animated.Value(0)).current;
  const slideAnimCard3 = useRef(new Animated.Value(16)).current;

  // Pulse animation loop when speech is playing
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isLoading = contentLoading || streakLoading;

  // Trigger staggered entrance animations once content loads
  useEffect(() => {
    if (!isLoading && content) {
      Animated.stagger(80, [
        Animated.parallel([
          Animated.timing(fadeAnimHeader, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimHeader, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnimCard1, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimCard1, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnimCard2, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimCard2, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnimCard3, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimCard3, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isLoading, content]);

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    if (isSpeaking && !isPaused) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      animationLoop.start();
    } else {
      pulseAnim.setValue(1.0);
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isSpeaking, isPaused]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handlePlaySpeech = () => {
    if (!content?.visualization_script) return;

    if (isPaused) {
      Speech.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    } else {
      Speech.speak(content.visualization_script, {
        onStart: () => {
          setIsSpeaking(true);
          setIsPaused(false);
        },
        onDone: () => {
          setIsSpeaking(false);
          setIsPaused(false);
        },
        onStopped: () => {
          setIsSpeaking(false);
          setIsPaused(false);
        },
        onError: (err) => {
          console.error('Speech synthesis error:', err);
          setIsSpeaking(false);
          setIsPaused(false);
        },
      });
    }
  };

  const handlePauseSpeech = () => {
    Speech.pause();
    setIsPaused(true);
  };

  const handleStopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Helper for greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Preparing today's practice...</Text>
      </SafeAreaView>
    );
  }

  if (contentError || !content) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Daily practice unavailable</Text>
          <Text style={styles.errorSub}>
            {contentError || "We couldn't load today's content. Please check back shortly."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Soft Subtle Texture Effect */}
      <View style={styles.bgTextureOverlay} pointerEvents="none">
        <View style={styles.bgGlowCircle} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Area */}
        <Animated.View
          style={[
            styles.headerArea,
            {
              opacity: fadeAnimHeader,
              transform: [{ translateY: slideAnimHeader }],
            },
          ]}
        >
          <View style={styles.brandRowContainer}>
            <View style={styles.brandRow}>
              <GeometricLogoMark size={22} color={theme.colors.primary} />
              <Text style={styles.greetingText}>{getGreeting()}</Text>
            </View>

            {/* Quick Action Navigation Header Icons */}
            <View style={styles.headerActions}>
              <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                onPress={() => navigation.navigate('Progress')}
              >
                <Text style={styles.iconBtnText}>📊</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                onPress={async () => {
                  await supabase.auth.signOut();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                  });
                }}
              >
                <Text style={styles.iconBtnText}>🚪</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaDayText}>Day {dayNumber}</Text>
            {currentStreak > 0 && (
              <>
                <Text style={styles.metaDotSeparator}>•</Text>
                <Text style={styles.metaStreakText}>
                  {currentStreak} {currentStreak === 1 ? 'day' : 'days'} of showing up
                </Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* Card 1: Affirmations Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnimCard1,
              transform: [{ translateY: slideAnimCard1 }],
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <AffirmationIcon size={16} color={theme.colors.primary} />
            <Text style={styles.cardLabel}>TODAY'S AFFIRMATIONS</Text>
          </View>

          <View style={styles.affirmationList}>
            <View style={styles.affirmationRow}>
              <Text style={styles.affirmationNumber}>01</Text>
              <Text style={styles.affirmationText}>{content.affirmation_1}</Text>
            </View>
            <View style={styles.affirmationDivider} />
            <View style={styles.affirmationRow}>
              <Text style={styles.affirmationNumber}>02</Text>
              <Text style={styles.affirmationText}>{content.affirmation_2}</Text>
            </View>
            <View style={styles.affirmationDivider} />
            <View style={styles.affirmationRow}>
              <Text style={styles.affirmationNumber}>03</Text>
              <Text style={styles.affirmationText}>{content.affirmation_3}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Card 2: Visualization Script Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnimCard2,
              transform: [{ translateY: slideAnimCard2 }],
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.headerLeftIconRow}>
              <VisualizationIcon size={16} color={theme.colors.primary} />
              <Text style={styles.cardLabel}>VISUALIZATION PRACTICE</Text>
            </View>
            {isSpeaking && !isPaused && (
              <Animated.View style={[styles.visualPulse, { transform: [{ scale: pulseAnim }] }]} />
            )}
          </View>
          
          <Text style={styles.visualizationScript}>
            "{content.visualization_script}"
          </Text>

          <View style={styles.audioControls}>
            {!isSpeaking || isPaused ? (
              <Pressable
                style={({ pressed }) => [
                  styles.audioButtonPrimary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handlePlaySpeech}
              >
                <Text style={styles.audioButtonPrimaryText}>
                  {isPaused ? 'Resume listening' : 'Listen to practice'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.audioButtonSecondary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handlePauseSpeech}
              >
                <Text style={styles.audioButtonSecondaryText}>Pause</Text>
              </Pressable>
            )}

            {isSpeaking && (
              <Pressable
                style={({ pressed }) => [
                  styles.stopButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleStopSpeech}
              >
                <Text style={styles.stopButtonText}>Stop</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Card 3: Challenge Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnimCard3,
              transform: [{ translateY: slideAnimCard3 }],
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <ChallengeIcon size={16} color={theme.colors.primary} />
            <Text style={styles.cardLabel}>TODAY'S ACTION</Text>
          </View>

          <Text style={styles.challengeText}>
            {content.challenge}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => navigation.navigate('Checkin', { dayNumber })}
          >
            <Text style={styles.actionButtonText}>Complete today's check-in</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  bgTextureOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgGlowCircle: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#F0E6D8',
    opacity: 0.45,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
  },
  errorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    maxWidth: 320,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.cardTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  errorSub: {
    fontSize: theme.typography.sizes.secondary,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.secondary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // Header styles
  headerArea: {
    marginBottom: theme.spacing.lg,
  },
  brandRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 14,
  },
  greetingText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaDayText: {
    fontSize: theme.typography.sizes.screenTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  metaDotSeparator: {
    marginHorizontal: 12,
    fontSize: 14,
    color: theme.colors.accentGold,
  },
  metaStreakText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.accentGold,
    fontWeight: '500',
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerLeftIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginLeft: 8,
  },

  // Affirmations card
  affirmationList: {
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  affirmationRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  affirmationNumber: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.accentGold,
    marginTop: 2,
  },
  affirmationText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: theme.typography.lineHeights.body,
  },
  affirmationDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },

  // Visualization card
  visualPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accentGold,
  },
  visualizationScript: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
    marginTop: 4,
  },
  audioControls: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  audioButtonPrimary: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonPrimaryText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  audioButtonSecondary: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonSecondaryText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  stopButton: {
    width: 72,
    height: 48,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stopButtonText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.errorText,
  },

  // Challenge card
  challengeText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.body,
    marginBottom: theme.spacing.md,
    marginTop: 4,
  },
  actionButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  actionButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  actionButtonText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
