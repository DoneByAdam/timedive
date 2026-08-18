import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  updatePreferences,
  updateProfile,
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import {
  Body,
  Button,
  Chip,
  Heading,
  Input,
  useBottomInset,
  useTopInset,
} from '@/components/UI';
import { useColors } from '@/hooks/useColors';

const HOBBY_OPTIONS = [
  'Soccer',
  'Basketball',
  'Video games',
  'Reading',
  'Drawing',
  'Music',
  'Dancing',
  'Cooking',
  'Space',
  'Dinosaurs',
  'Animals',
  'Movies',
  'Science',
  'Building things',
];

const TOPIC_OPTIONS = [
  'Ancient Egypt',
  'The Roman Empire',
  'Vikings',
  'The Moon Landing',
  'Medieval Knights',
  'The Wild West',
];

function ageToMode(age: number): 'kid' | 'teen' | 'adult' {
  if (age < 13) return 'kid';
  if (age < 18) return 'teen';
  return 'adult';
}

export default function Onboarding() {
  const { refreshUser } = useAuth();
  const c = useColors();
  const top = useTopInset();
  const bottom = useBottomInset();
  const [step, setStep] = useState<number>(0);
  const [age, setAge] = useState<string>('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [topic, setTopic] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleHobby = (h: string) => {
    setHobbies((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h],
    );
  };

  const finish = async () => {
    const ageNum = parseInt(age, 10);
    setBusy(true);
    setError(null);
    try {
      await updateProfile({
        age: ageNum,
        ageMode: ageToMode(ageNum),
        onboardingComplete: true,
      });
      await updatePreferences({ hobbies });
      await refreshUser();
      if (topic.trim()) {
        router.replace({
          pathname: '/(tabs)/create',
          params: { topic: topic.trim() },
        });
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      setError('Could not save your answers. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const ageValid = (() => {
    const n = parseInt(age, 10);
    return Number.isInteger(n) && n >= 4 && n <= 120;
  })();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: top + 24,
        paddingBottom: bottom + 32,
        paddingHorizontal: 24,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Body muted size={13} style={{ marginBottom: 8 }}>
        {`Step ${step + 1} of 3`}
      </Body>

      {step === 0 && (
        <View>
          <Heading size={28}>How old are you?</Heading>
          <Body muted style={{ marginTop: 8, marginBottom: 24 }}>
            We tailor every story to your age.
          </Body>
          <Input
            testID="onboarding-age"
            placeholder="Your age"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            maxLength={3}
          />
          <Button
            testID="onboarding-age-next"
            title="Next"
            onPress={() => setStep(1)}
            disabled={!ageValid}
            style={{ marginTop: 24 }}
          />
        </View>
      )}

      {step === 1 && (
        <View>
          <Heading size={28}>What do you love?</Heading>
          <Body muted style={{ marginTop: 8, marginBottom: 24 }}>
            Pick a few interests — your stories will weave them in.
          </Body>
          <View style={styles.chips}>
            {HOBBY_OPTIONS.map((h) => (
              <Chip
                key={h}
                testID={`hobby-${h}`}
                label={h}
                selected={hobbies.includes(h)}
                onPress={() => toggleHobby(h)}
              />
            ))}
          </View>
          <Button
            testID="onboarding-hobbies-next"
            title="Next"
            onPress={() => setStep(2)}
            disabled={hobbies.length === 0}
            style={{ marginTop: 28 }}
          />
          <Button title="Back" variant="ghost" onPress={() => setStep(0)} style={{ marginTop: 10 }} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Heading size={28}>Pick your first dive</Heading>
          <Body muted style={{ marginTop: 8, marginBottom: 24 }}>
            Choose a topic — or type anything you're curious about.
          </Body>
          <View style={styles.chips}>
            {TOPIC_OPTIONS.map((t) => (
              <Chip
                key={t}
                testID={`topic-${t}`}
                label={t}
                selected={topic === t}
                onPress={() => setTopic(topic === t ? '' : t)}
              />
            ))}
          </View>
          <Input
            testID="onboarding-topic"
            placeholder="Or type your own topic…"
            value={TOPIC_OPTIONS.includes(topic) ? '' : topic}
            onChangeText={setTopic}
            style={{ marginTop: 16 }}
          />
          {error ? (
            <Body size={14} style={{ color: c.destructive, marginTop: 12 }}>
              {error}
            </Body>
          ) : null}
          <Button
            testID="onboarding-finish"
            title={topic.trim() ? 'Dive In' : 'Skip & Explore'}
            onPress={finish}
            loading={busy}
            style={{ marginTop: 28 }}
          />
          <Button title="Back" variant="ghost" onPress={() => setStep(1)} style={{ marginTop: 10 }} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
