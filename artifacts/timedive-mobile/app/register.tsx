import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Body, Button, Heading, Input, useTopInset } from '@/components/UI';
import { useColors } from '@/hooks/useColors';

export default function Register() {
  const { register } = useAuth();
  const c = useColors();
  const top = useTopInset();
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const submit = async () => {
    if (!displayName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(email.trim(), password, displayName.trim());
      router.replace('/onboarding');
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes('409')
          ? 'That email is already in use.'
          : 'Could not create your account. Please try again.',
      );
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
      <Pressable testID="register-back" onPress={() => router.back()} style={styles.back}>
        <Feather name="arrow-left" size={24} color={c.foreground} />
      </Pressable>
      <Heading size={30}>Create your account</Heading>
      <Body muted style={{ marginTop: 8, marginBottom: 28 }}>
        Personalized history stories start here.
      </Body>
      <View style={{ gap: 14 }}>
        <Input
          testID="register-name"
          placeholder="Display name"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <Input
          testID="register-email"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          testID="register-password"
          placeholder="Password (8+ characters)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? (
          <Body size={14} style={{ color: c.destructive }}>
            {error}
          </Body>
        ) : null}
        <Button testID="register-submit" title="Create Account" onPress={submit} loading={busy} />
        <Button
          testID="register-to-login"
          title="I already have an account"
          variant="ghost"
          onPress={() => router.replace('/login')}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 48 },
  back: { marginBottom: 20, width: 44, height: 44, justifyContent: 'center' },
});
