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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import { GeometricLogoMark } from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export default function AuthScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<{ title: string; message: string }>({
    title: '',
    message: '',
  });

  // Active input focus states
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

  useEffect(() => {
    const checkActiveSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleSessionRouting(session.user.id);
        }
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        setLoading(false);
      }
    };
    checkActiveSession();
  }, []);

  const handleSessionRouting = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.onboarding_completed) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as any }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'OnboardingIdentity' }],
        });
      }
    } catch (err) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'OnboardingIdentity' }],
      });
    }
  };

  const handleAuth = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      if (activeTab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        // Display polished success dialog card
        setPassword('');
        setActiveTab('signin');
        setDialogContent({
          title: 'Account Created',
          message:
            'Your account is ready! Please sign in with your email and password to begin your confidence journey.',
        });
        setShowDialog(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          await handleSessionRouting(data.user.id);
        }
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('rate limit') || err.status === 429)) {
        setDialogContent({
          title: 'Rate Limit Exceeded',
          message:
            'Supabase email limit reached. If you already created an account, please switch to Sign In, or try again in a few minutes.',
        });
        setShowDialog(true);
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please try again.');
      }
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
          
          {/* Header Title & Branding */}
          <View style={styles.headerContainer}>
            <GeometricLogoMark size={32} color={theme.colors.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.brandTitle}>Confidence</Text>
            <Text style={styles.brandSubtitle}>
              {activeTab === 'signin'
                ? 'Welcome back. Sign in to access your daily practice.'
                : 'Create an account to build your evidence-backed identity.'}
            </Text>
          </View>

          {/* Segmented Auth Control Switcher */}
          <View style={styles.segmentedControlContainer}>
            <Pressable
              style={[
                styles.segmentButton,
                activeTab === 'signin' && styles.segmentButtonActive,
              ]}
              onPress={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  activeTab === 'signin' && styles.segmentButtonTextActive,
                ]}
              >
                Sign In
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.segmentButton,
                activeTab === 'signup' && styles.segmentButtonActive,
              ]}
              onPress={() => {
                setActiveTab('signup');
                setErrorMessage(null);
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  activeTab === 'signup' && styles.segmentButtonTextActive,
                ]}
              >
                Create Account
              </Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[
                  styles.input,
                  isEmailFocused && styles.inputFocused,
                ]}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Password Input with Eye Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                {activeTab === 'signin' && (
                  <Pressable
                    onPress={async () => {
                      if (!email.trim()) {
                        setDialogContent({
                          title: 'Email Required',
                          message: 'Please enter your email address in the field above first, then click "Forgot?".',
                        });
                        setShowDialog(true);
                        return;
                      }

                      try {
                        setLoading(true);
                        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
                        if (error) throw error;

                        setDialogContent({
                          title: 'Reset Link Sent',
                          message: `We have sent a password reset link to ${email.trim()}. Please check your inbox to update your password.`,
                        });
                        setShowDialog(true);
                      } catch (err: any) {
                        setDialogContent({
                          title: 'Reset Request Failed',
                          message: err.message || 'Could not send reset email. Please try again.',
                        });
                        setShowDialog(true);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot?</Text>
                  </Pressable>
                )}
              </View>
              
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    isPasswordFocused && styles.inputFocused,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '🔒'}</Text>
                </Pressable>
              </View>
            </View>

            {/* Error Banner */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Main Action Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                loading && styles.buttonDisabled,
                pressed && !loading && styles.buttonPressed,
              ]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textOnPrimary} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {activeTab === 'signin' ? 'Sign In to Practice' : 'Create Account'}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Quiet Terms Subtext */}
          <Text style={styles.footerTermsText}>
            By continuing, you agree to build your evidence step by step.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modern Dialog Card Overlay */}
      {showDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <GeometricLogoMark size={24} color={theme.colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.dialogTitle}>{dialogContent.title}</Text>
            <Text style={styles.dialogMessage}>{dialogContent.message}</Text>
            
            <Pressable
              style={({ pressed }) => [styles.dialogOkBtn, pressed && styles.buttonPressed]}
              onPress={() => setShowDialog(false)}
            >
              <Text style={styles.dialogOkBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      )}
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },

  // Branding
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  brandTitle: {
    fontSize: theme.typography.sizes.screenTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  brandSubtitle: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.body,
    maxWidth: 290,
  },

  // Segmented Control Switcher
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  segmentButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
  segmentButtonText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },

  // Form Card
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  input: {
    height: 52,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  eyeIconText: {
    fontSize: 16,
  },

  // Error Banner
  errorBanner: {
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

  // Submit Button
  submitButton: {
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
    ...theme.shadows.button,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  submitButtonText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
  footerTermsText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },

  // Floating Modal Dialog Card
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 42, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    zIndex: 1000,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  dialogTitle: {
    fontSize: theme.typography.sizes.cardTitle,
    fontFamily: theme.typography.fontFamilyHeadline,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  dialogMessage: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.secondary,
    marginBottom: theme.spacing.lg,
  },
  dialogOkBtn: {
    height: 46,
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  dialogOkBtnText: {
    fontSize: theme.typography.sizes.secondary,
    fontFamily: theme.typography.fontFamilyBody,
    fontWeight: '600',
    color: theme.colors.textOnPrimary,
  },
});
