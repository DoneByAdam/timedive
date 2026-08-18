import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  useGenerateCustomStory,
  useGetPreferences,
  useGetProfile,
} from '@workspace/api-client-react';
import { ReadAloud } from '@/components/ReadAloud';
import {
  Body,
  Button,
  Card,
  Heading,
  Input,
  useBottomInset,
  useTopInset,
} from '@/components/UI';
import { useColors } from '@/hooks/useColors';

function cleanText(text: string): string {
  return text
    .replace(/[#*_`>]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function Create() {
  const c = useColors();
  const top = useTopInset();
  const bottom = useBottomInset();
  const params = useLocalSearchParams<{ topic?: string }>();
  const [topic, setTopic] = useState<string>('');
  const profile = useGetProfile();
  const preferences = useGetPreferences();
  const generate = useGenerateCustomStory();
  const autoStarted = useRef<boolean>(false);

  const runGenerate = (t: string) => {
    if (t.trim().length < 2) return;
    generate.mutate({
      data: {
        customTopic: t.trim(),
        ...(profile.data?.age != null ? { age: profile.data.age } : {}),
        ...(preferences.data?.hobbies?.length
          ? { hobbies: preferences.data.hobbies }
          : {}),
      },
    });
  };

  useEffect(() => {
    if (params.topic && !autoStarted.current) {
      autoStarted.current = true;
      setTopic(params.topic);
      runGenerate(params.topic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.topic]);

  const story = generate.data;
  const storyText = story ? cleanText(story.storyText) : '';
  const funFacts = story
    ? cleanText(story.funFacts)
        .split('\n')
        .map((f) => f.replace(/^[-•\d.\s]+/, '').trim())
        .filter(Boolean)
    : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: top + 16,
        paddingBottom: bottom + 100,
        paddingHorizontal: 20,
        gap: 14,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Heading size={26}>Story Generator</Heading>
      <Body muted>Type anything you're curious about and dive in.</Body>

      <Input
        testID="create-topic"
        placeholder="e.g. Ancient Egypt, samurai, the Titanic…"
        value={topic}
        onChangeText={setTopic}
      />
      <Button
        testID="create-generate"
        title={generate.isPending ? 'Writing your story…' : 'Generate My Story'}
        onPress={() => runGenerate(topic)}
        loading={generate.isPending}
        disabled={topic.trim().length < 2}
      />

      {generate.isError ? (
        <Card>
          <Body style={{ color: c.destructive }}>
            Story generation is unavailable right now. Please try again in a
            moment.
          </Body>
        </Card>
      ) : null}

      {story ? (
        <View style={{ gap: 14 }}>
          <Heading size={20}>{story.customTopic}</Heading>
          <ReadAloud text={`${storyText}\n${funFacts.join('. ')}`} />
          <Card>
            <Body>{storyText}</Body>
          </Card>
          {funFacts.length > 0 ? (
            <Card>
              <Heading size={16} style={{ marginBottom: 10 }}>
                Fun facts
              </Heading>
              <View style={{ gap: 8 }}>
                {funFacts.map((f, i) => (
                  <View key={i} style={styles.factRow}>
                    <Body style={{ color: c.accent }}>•</Body>
                    <Body style={{ flex: 1 }}>{f}</Body>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  factRow: { flexDirection: 'row', gap: 8 },
});
