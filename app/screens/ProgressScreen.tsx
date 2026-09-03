import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import { GeometricLogoMark, ChallengeIcon } from '../components/Icons';
import { useStreak } from '../hooks/useStreak';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Progress'>;

interface CheckinItem {
  id: string;
  day_number: number;
  challenge_completed: boolean;
  reflection_text: string | null;
  created_at: string;
}

export default function ProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { currentStreak, longestStreak, loading: streakLoading } = useStreak();

  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCheckin, setSelectedCheckin] = useState<CheckinItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('day_number', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (err) {
      console.error('Failed to fetch checkin history:', err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = checkins.filter((c) => c.challenge_completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>YOUR JOURNEY</Text>
            <Text style={styles.screenTitle}>Progress & Evidence</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Stats Summary Card */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Days Completed</Text>
          </View>
        </View>

        {/* Upgrade Banner */}
        <Pressable
          style={({ pressed }) => [styles.bannerCard, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Paywall')}
        >
          <View style={styles.bannerLeft}>
            <GeometricLogoMark size={20} color={theme.colors.accentGold} />
            <View>
              <Text style={styles.bannerTitle}>Unlock Deep Practice Analytics</Text>
              <Text style={styles.bannerSub}>Get AI insight synthesis on your daily reflections</Text>
            </View>
          </View>
          <Text style={styles.bannerArrow}>→</Text>
        </Pressable>

        {/* History Log Section */}
        <Text style={styles.sectionTitle}>Reflection Journal</Text>

        {loading || streakLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : checkins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No check-ins recorded yet</Text>
            <Text style={styles.emptySub}>
              Complete your daily practice on the home screen to build your evidence log.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {checkins.map((item) => {
              const isSelected = selectedCheckin?.id === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.historyCard, isSelected && styles.historyCardSelected]}
                  onPress={() => setSelectedCheckin(isSelected ? null : item)}
                >
                  <View style={styles.historyCardHeader}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>Day {item.day_number}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: item.challenge_completed ? theme.colors.accentGold : theme.colors.textMuted },
                        ]}
                      >
                        {item.challenge_completed ? 'Completed' : 'Skipped'}
                      </Text>
                    </View>
                  </View>

                  {item.reflection_text ? (
                    <Text
                      style={styles.reflectionSnippet}
                      numberOfLines={isSelected ? undefined : 2}
                    >
                      "{item.reflection_text}"
                    </Text>
                  ) : (
                    <Text style={styles.noReflectionText}>No reflection written for this day.</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerLabel: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: theme.typography.sizes.screenTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.card,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.border,
  },

  // Banner
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSelected,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  bannerSub: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bannerArrow: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },

  // History List
  sectionTitle: {
    fontSize: theme.typography.sizes.cardTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  emptySub: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.secondary,
  },
  historyList: {
    gap: theme.spacing.xs,
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  historyCardSelected: {
    borderColor: theme.colors.primary,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dayBadgeText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statusBadge: {},
  statusText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
  },
  reflectionSnippet: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.secondary,
    fontStyle: 'italic',
  },
  noReflectionText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textMuted,
  },
  pressed: {
    opacity: 0.9,
  },
});
