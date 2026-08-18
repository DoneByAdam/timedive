import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Body, Button, Heading, Input, useTopInset } from '@/components/UI';
import { useColors } from '@/hooks/useColors';

export default function Login() {
  const { login } = useAuth();
  const c = useColors();
  const top = useTopInset();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const user = await login(email.trim(), password);
      router.replace(user.onboardingComplete ? '/(tabs)' : '/onboarding');
    } catch (e) {
      setError(e instanceof Error && e.message.includes('401')
        ? 'Invalid email or password.'
        : 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={[styles.content, { paddingTop: top + 16 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={40}
    >
      <Pressable testID="login-back" onPress={() => router.back()} style={styles.back}>
        <Feather name="arrow-left" size={24} color={c.foreground} />
      </Pressable>
      <Heading size={30}>Welcome back</Heading>
      <Body muted style={{ marginTop: 8, marginBottom: 28 }}>
        Sign in to continue your dive through history.
      </Body>
      <View style={{ gap: 14 }}>
        <Input
          testID="login-email"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          testID="login-password"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? (
          <Body size={14} style={{ color: c.destructive }}>
            {error}
          </Body>
        ) : null}
        <Button testID="login-submit" title="Sign In" onPress={submit} loading={busy} />
        <Button
          testID="login-to-register"
          title="Create an account"
          variant="ghost"
          onPress={() => router.replace('/register')}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  back: { marginBottom: 20, width: 44, height: 44, justifyContent: 'center' },
});
