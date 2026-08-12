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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { content, dayNumber, loading: contentLoading, error: contentError } = useDailyContent();
  const { currentStreak, loading: streakLoading } = useStreak();

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation loop when speech is playing
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    if (isSpeaking && !isPaused) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
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

  // Clean up speech on unmount
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

  const isLoading = contentLoading || streakLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Preparing today's program...</Text>
      </SafeAreaView>
    );
  }

  if (contentError || !content) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Daily content unavailable</Text>
          <Text style={styles.errorSub}>
            {contentError || "We couldn't load today's program. Please try again later."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.dayTitle}>Day {dayNumber}</Text>
          {currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakDot}>🔥</Text>
              <Text style={styles.streakText}>{currentStreak} day streak</Text>
            </View>
          )}
        </View>

        {/* Affirmations Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TODAY'S AFFIRMATIONS</Text>
          <View style={styles.affirmationList}>
            <View style={styles.affirmationRow}>
              <Text style={styles.affirmationNumber}>1</Text>
              <Text style={styles.affirmationText}>{content.affirmation_1}</Text>
            </View>
            <View style={styles.affirmationDivider} />
            <View style={styles.affirmationRow}>
              <Text style={styles.affirmationNumber}>2</Text>
              <Text style={styles.affirmationText}>{content.affirmation_2}</Text>
            </View>
            <View style={styles.affirmationDivider} />
            <View style={styles.affirmationRow}>
              <Text style={styles.affirmationNumber}>3</Text>
              <Text style={styles.affirmationText}>{content.affirmation_3}</Text>
            </View>
          </View>
        </View>

        {/* Visualization Script Card */}
        <View style={styles.card}>
          <View style={styles.visualizationHeader}>
            <Text style={styles.cardLabel}>VISUALIZATION PRACTICE</Text>
            {isSpeaking && !isPaused && (
              <Animated.View style={[styles.visualPulse, { transform: [{ scale: pulseAnim }] }]} />
            )}
          </View>
          
          <Text style={styles.visualizationScript}>
            {content.visualization_script}
          </Text>

          <View style={styles.audioControls}>
            {!isSpeaking || isPaused ? (
              <Pressable style={styles.audioButton} onPress={handlePlaySpeech}>
                <Text style={styles.audioButtonText}>{isPaused ? 'Resume' : 'Listen'}</Text>
              </Pressable>
            ) : (
              <Pressable style={[styles.audioButton, styles.pauseButton]} onPress={handlePauseSpeech}>
                <Text style={styles.pauseButtonText}>Pause</Text>
              </Pressable>
            )}

            {isSpeaking && (
              <Pressable style={styles.stopButton} onPress={handleStopSpeech}>
                <Text style={styles.stopButtonText}>Stop</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Challenge Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TODAY'S CHALLENGE</Text>
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
            <Text style={styles.actionButtonText}>I did this</Text>
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#94A3B8', // Slate 400
    fontSize: 15,
  },
  errorCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  streakDot: {
    marginRight: 4,
    fontSize: 14,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  card: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8', // Slate accent blue
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  affirmationList: {
    gap: 16,
  },
  affirmationRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  affirmationNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B', // Slate 500
    backgroundColor: '#0F172A',
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
  },
  affirmationText: {
    fontSize: 15,
    color: '#E2E8F0', // Slate 200
    flex: 1,
    lineHeight: 22,
  },
  affirmationDivider: {
    height: 1,
    backgroundColor: '#334155',
  },
  visualizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  visualPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  visualizationScript: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
  },
  audioButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#38BDF8',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  pauseButton: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  stopButton: {
    width: 80,
    height: 48,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444', // Red 500
  },
  challengeText: {
    fontSize: 16,
    color: '#F8FAFC',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  actionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});
