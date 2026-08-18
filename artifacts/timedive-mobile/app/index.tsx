import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Body, Button, Heading, useBottomInset, useTopInset } from '@/components/UI';
import { useColors } from '@/hooks/useColors';

export default function Welcome() {
  const { user, isLoading } = useAuth();
  const c = useColors();
  const top = useTopInset();
  const bottom = useBottomInset();

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.onboardingComplete) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [user, isLoading]);

  if (isLoading || user) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoSmall} />
        <ActivityIndicator color={c.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.background, paddingTop: top + 40, paddingBottom: bottom + 24 },
      ]}
    >
      <View style={[styles.center, { flex: 1 }]}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        <Heading size={36} style={{ marginTop: 28 }}>
          TimeDive
        </Heading>
        <Body muted style={{ marginTop: 10, textAlign: 'center', paddingHorizontal: 32 }}>
          Dive into history with stories written just for you — and listen to
          them anywhere.
        </Body>
      </View>
      <View style={{ gap: 12, paddingHorizontal: 24 }}>
        <Button testID="welcome-register" title="Get Started" onPress={() => router.push('/register')} />
        <Button
          testID="welcome-login"
          title="I already have an account"
          variant="ghost"
          onPress={() => router.push('/login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: 160, height: 160, borderRadius: 36 },
  logoSmall: { width: 96, height: 96, borderRadius: 24 },
});
