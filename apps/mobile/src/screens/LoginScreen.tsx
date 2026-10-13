/**
 * Mobile Login Screen
 * Conforms to docs/design.md: light mode, cobalt and white, zero emojis.
 * Built with React Native primitives (View, Text, TextInput, Pressable, StyleSheet).
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from '../primitives.js';
import { mobileColors, mobileSpacing, mobileRadii } from '../theme/tokens.js';
import { mobileApi } from '../api/mobile-client.js';

interface LoginScreenProps {
  onLoginSuccess: (user: any, tenant: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('owner@callivaan.demo');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await mobileApi.login(email, password);
      onLoginSuccess(res.user, res.tenant);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <Text style={styles.title}>Callivaan</Text>
        <Text style={styles.subtitle}>AI Voice Assistant Control Surface</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Work Email</Text>
          <TextInput
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="owner@callivaan.demo"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="password123"
          />
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }: { pressed: boolean }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Light mode direct distribution release • Version 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: mobileSpacing.xl,
    backgroundColor: mobileColors.white,
    minHeight: '100vh',
  },
  header: {
    alignItems: 'center',
    marginBottom: mobileSpacing.xl,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: mobileRadii.md,
    backgroundColor: mobileColors.cobalt,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: mobileColors.white,
    fontWeight: '700',
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: mobileColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: mobileColors.textSecondary,
    marginTop: 4,
  },
  errorBox: {
    padding: mobileSpacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: mobileRadii.md,
    marginBottom: mobileSpacing.md,
  },
  errorText: {
    color: mobileColors.statusError,
    fontSize: 13,
  },
  form: {
    gap: mobileSpacing.md,
  },
  fieldGroup: {
    marginBottom: mobileSpacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: mobileColors.textPrimary,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: mobileRadii.md,
    borderWidth: 1,
    borderColor: mobileColors.border,
    fontSize: 14,
    backgroundColor: mobileColors.white,
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: mobileRadii.md,
    backgroundColor: mobileColors.cobalt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: mobileSpacing.sm,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: mobileColors.border,
  },
  buttonText: {
    color: mobileColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: mobileSpacing.xl,
  },
  footerText: {
    fontSize: 12,
    color: mobileColors.textMuted,
  },
});
