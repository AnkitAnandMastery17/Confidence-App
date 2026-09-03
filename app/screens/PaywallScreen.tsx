import React, { useState } from 'react';
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
import { theme } from '../theme';
import { GeometricLogoMark } from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

export default function PaywallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubscribe = () => {
    setLoading(true);
    // Simulate payment subscription process
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Close */}
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <GeometricLogoMark size={36} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.badgeText}>CONFIDENCE PRO</Text>
          <Text style={styles.headline}>Transform reflection into lasting identity</Text>
          <Text style={styles.subtext}>
            Unlock daily custom audio practices, AI reflection synthesis, and unlimited evidence logging.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>HD Studio Audio Visualizations</Text>
              <Text style={styles.featureSub}>Guided high-quality audio sessions tailored daily</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>AI Pattern & Growth Synthesis</Text>
              <Text style={styles.featureSub}>Discover subtle mind shifts in your reflection journal</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Unlimited Offline History</Text>
              <Text style={styles.featureSub}>Full access to past challenges & reflections anytime</Text>
            </View>
          </View>
        </View>

        {/* Pricing Options */}
        <View style={styles.plansContainer}>
          {/* Annual Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'annual' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.planHeader}>
              <View style={styles.radioOuter}>
                {selectedPlan === 'annual' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planTitle}>Annual Access</Text>
                  <View style={styles.savingsTag}>
                    <Text style={styles.savingsTagText}>SAVE 45%</Text>
                  </View>
                </View>
                <Text style={styles.planSub}>\$4.99 / month (billed annually \$59.99)</Text>
              </View>
            </View>
          </Pressable>

          {/* Monthly Plan */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <View style={styles.radioOuter}>
                {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planTitle}>Monthly Access</Text>
                <Text style={styles.planSub}>\$8.99 / month (cancel anytime)</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* CTA Button */}
        {success ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Welcome to Confidence Pro!</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              loading && styles.ctaDisabled,
              pressed && !loading && styles.pressed,
            ]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textOnPrimary} />
            ) : (
              <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
            )}
          </Pressable>
        )}

        <Text style={styles.disclaimerText}>
          7 days free, then {selectedPlan === 'annual' ? '\$59.99/year' : '\$8.99/month'}. Cancel anytime in settings.
        </Text>

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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.xs,
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

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '700',
    color: theme.colors.accentGold,
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  headline: {
    fontSize: theme.typography.sizes.screenTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.screenTitle,
    marginBottom: theme.spacing.xs,
  },
  subtext: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.body,
    maxWidth: 310,
  },

  // Features
  featuresList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  featureCheck: {
    fontSize: 16,
    color: theme.colors.accentGold,
    fontWeight: '700',
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  featureSub: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Plans
  plansContainer: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  planCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAlt,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  planTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  planSub: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  savingsTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // CTA
  ctaButton: {
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.button,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  successBanner: {
    height: 54,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.accentGold,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  successText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.accentGold,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});
