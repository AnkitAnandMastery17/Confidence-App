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
import { RootStackParamList } from '../../App';
import { theme } from '../theme';
import { GeometricLogoMark } from '../components/Icons';
import { useEvidenceLog, CheckinRow } from '../hooks/useEvidenceLog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Progress'>;

export default function ProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { checkins, currentStreak, longestStreak, loading, refetch } = useEvidenceLog();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Staggered entrance animations matching HomeScreen
  const fadeAnimHeader = useRef(new Animated.Value(0)).current;
  const slideAnimHeader = useRef(new Animated.Value(12)).current;

  const fadeAnimContent = useRef(new Animated.Value(0)).current;
  const slideAnimContent = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (!loading) {
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
          Animated.timing(fadeAnimContent, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimContent, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [loading]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Helper to format truncated preview text (~60 chars)
  const formatPreview = (text: string | null) => {
    if (!text) return null;
    const trimmed = text.trim();
    if (trimmed.length <= 60) return trimmed;
    return `${trimmed.substring(0, 60)}…`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading evidence log…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnimHeader,
              transform: [{ translateY: slideAnimHeader }],
            },
          ]}
        >
          <View style={styles.headerTopRow}>
            <Text style={styles.screenHeadline}>Your evidence</Text>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Close evidence log"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.headerSubtext}>
            Every day you show up becomes proof.
          </Text>

          {/* Understated Stat Line (No badges/pills) */}
          <View style={styles.statsLineRow}>
            {currentStreak > 0 && (
              <Text style={styles.statText}>
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}, current
              </Text>
            )}
            {currentStreak > 0 && longestStreak > 0 && (
              <Text style={styles.statDotSeparator}>•</Text>
            )}
            {longestStreak > 0 && (
              <Text style={styles.statText}>
                {longestStreak} {longestStreak === 1 ? 'day' : 'days'}, best
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Evidence Log List / Empty State */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnimContent,
              transform: [{ translateY: slideAnimContent }],
            },
          ]}
        >
          {checkins.length === 0 ? (
            /* Empty State */
            <View style={styles.emptyStateCard}>
              <GeometricLogoMark size={28} color={theme.colors.accentGold} style={styles.emptyMark} />
              <Text style={styles.emptyHeadline}>Your evidence log starts with today.</Text>
              <Text style={styles.emptySubtext}>
                Complete your daily practice to begin recording your proof of showing up.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyActionBtn, pressed && styles.btnPressed]}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.emptyActionBtnText}>Go to today's practice</Text>
              </Pressable>
            </View>
          ) : (
            /* Scrollable Log List */
            <View style={styles.logList}>
              {checkins.map((item, index) => {
                const itemKey = item.created_at || `day-${item.day_number}-${index}`;
                const isExpanded = expandedId === itemKey;
                const hasReflection = Boolean(item.reflection_text && item.reflection_text.trim());

                return (
                  <Pressable
                    key={itemKey}
                    style={({ pressed }) => [
                      styles.logRowCard,
                      isExpanded && styles.logRowCardExpanded,
                      pressed && styles.rowPressed,
                    ]}
                    onPress={() => toggleExpand(itemKey)}
                  >
                    <View style={styles.rowMainHeader}>
                      {/* Left: Indicator & Day number */}
                      <View style={styles.rowLeftGroup}>
                        {/* Completed vs Not Indicator: Muted filled dot vs neutral outline dot (no harsh colors/X) */}
                        <View style={styles.indicatorContainer}>
                          {item.challenge_completed ? (
                            <View style={styles.indicatorCompletedDot} />
                          ) : (
                            <View style={styles.indicatorIncompleteDot} />
                          )}
                        </View>

                        <Text style={styles.dayLabel}>Day {item.day_number}</Text>
                      </View>

                      {/* Right: Status text or expand indicator */}
                      <Text style={styles.statusLabel}>
                        {item.challenge_completed ? 'Completed' : 'Logged'}
                      </Text>
                    </View>

                    {/* Reflection Text Preview or Expanded Full Text */}
                    {hasReflection && (
                      <View style={styles.reflectionContainer}>
                        <Text style={styles.reflectionText}>
                          {isExpanded ? item.reflection_text : formatPreview(item.reflection_text)}
                        </Text>
                        {!isExpanded && item.reflection_text && item.reflection_text.trim().length > 60 && (
                          <Text style={styles.expandHintText}>Tap to read full note</Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
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
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // Header Styles
  headerSection: {
    marginBottom: theme.spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  screenHeadline: {
    fontSize: theme.typography.sizes.screenTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  headerSubtext: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.body,
    marginBottom: theme.spacing.sm,
  },

  // Stats Line (Plain text, generous spacing, no badges/pills)
  statsLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
  },
  statDotSeparator: {
    marginHorizontal: 10,
    fontSize: 12,
    color: theme.colors.accentGold,
  },

  // Content / Log Container
  contentContainer: {
    flex: 1,
  },
  logList: {
    gap: theme.spacing.xs,
  },
  logRowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  logRowCardExpanded: {
    borderColor: theme.colors.borderSelected,
    backgroundColor: theme.colors.surfaceAlt,
  },
  rowPressed: {
    opacity: 0.94,
  },
  rowMainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Completed vs Incomplete subtle indicator
  indicatorContainer: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorCompletedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accentGold,
  },
  indicatorIncompleteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: theme.colors.textSecondary,
    backgroundColor: 'transparent',
  },

  dayLabel: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
  },
  statusLabel: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },

  // Reflection text
  reflectionContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reflectionText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.secondary,
    fontStyle: 'italic',
  },
  expandHintText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textMuted,
    marginTop: 6,
  },

  // Empty State
  emptyStateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.card,
  },
  emptyMark: {
    marginBottom: theme.spacing.md,
  },
  emptyHeadline: {
    fontSize: theme.typography.sizes.cardTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.secondary,
    marginBottom: theme.spacing.lg,
    maxWidth: 280,
  },
  emptyActionBtn: {
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  emptyActionBtnText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  btnPressed: {
    opacity: 0.9,
  },
});
