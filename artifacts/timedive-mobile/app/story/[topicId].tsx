import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetStoryQueryKey,
  getGetTopicQueryKey,
  useCompleteTopic,
  useGenerateStory,
  useGetStory,
  useGetTopic,
} from '@workspace/api-client-react';
import { ReadAloud } from '@/components/ReadAloud';
import {
  Body,
  Button,
  Card,
  Heading,
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

export default function StoryScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const id = Number(topicId);
  const c = useColors();
  const top = useTopInset();
  const bottom = useBottomInset();
  const queryClient = useQueryClient();

  const topic = useGetTopic(id, {
    query: { queryKey: getGetTopicQueryKey(id), enabled: Number.isFinite(id) },
  });
  const story = useGetStory(id, {
    query: {
      queryKey: getGetStoryQueryKey(id),
      enabled: Number.isFinite(id),
      retry: false,
    },
  });
  const generate = useGenerateStory({
    mutation: {
      onSuccess: () => {
        story.refetch();
      },
    },
  });
  const complete = useCompleteTopic({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    },
  });

  const t = topic.data;
  const s = story.data;
  const storyText = s ? cleanText(s.storyText) : '';
  const funFacts = s
    ? cleanText(s.funFacts)
        .split('\n')
        .map((f) => f.replace(/^[-•\d.\s]+/, '').trim())
        .filter(Boolean)
    : [];
  const storyMissing = story.isError;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={[styles.header, { paddingTop: top + 8 }]}>
        <Pressable testID="story-back" onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={c.foreground} />
        </Pressable>
        <Heading size={18} style={{ flex: 1 }} >
          {t?.eraName ?? 'Story'}
        </Heading>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: bottom + 40,
          gap: 14,
        }}
      >
        {topic.isLoading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
        ) : t ? (
          <>
            <Body muted size={13}>
              {t.category} · Depth {t.depthLevel}
            </Body>
            <Body muted>{t.description}</Body>

            {s ? (
              <>
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
                <Button
                  testID="story-complete"
                  title={t.isCompleted ? 'Completed' : 'Mark as Complete'}
                  variant="accent"
                  disabled={t.isCompleted}
                  loading={complete.isPending}
                  onPress={() => complete.mutate({ data: { topicId: id } })}
                  icon={
                    <Feather name="check" size={18} color={c.accentForeground} />
                  }
                />
                <Button
                  title="Regenerate Story"
                  variant="ghost"
                  loading={generate.isPending}
                  onPress={() =>
                    generate.mutate({
                      topicId: id,
                      data: { forceRegenerate: true },
                    })
                  }
                />
              </>
            ) : story.isLoading || generate.isPending ? (
              <Card style={styles.center}>
                <ActivityIndicator color={c.primary} />
                <Body muted style={{ marginTop: 12, textAlign: 'center' }}>
                  {generate.isPending
                    ? 'Writing your personalized story…'
                    : 'Checking for your story…'}
                </Body>
              </Card>
            ) : storyMissing ? (
              <>
                {t.coreFacts.length > 0 ? (
                  <Card>
                    <Heading size={16} style={{ marginBottom: 10 }}>
                      Core facts
                    </Heading>
                    <View style={{ gap: 8 }}>
                      {t.coreFacts.map((f, i) => (
                        <View key={i} style={styles.factRow}>
                          <Body style={{ color: c.accent }}>•</Body>
                          <Body style={{ flex: 1 }}>{f}</Body>
                        </View>
                      ))}
                    </View>
                  </Card>
                ) : null}
                {generate.isError ? (
                  <Body style={{ color: c.destructive }}>
                    Story generation failed. Please try again.
                  </Body>
                ) : null}
                <Button
                  testID="story-generate"
                  title="Generate My Story"
                  onPress={() => generate.mutate({ topicId: id, data: {} })}
                />
              </>
            ) : null}
          </>
        ) : (
          <Body muted>Topic not found.</Body>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', paddingVertical: 32 },
  factRow: { flexDirection: 'row', gap: 8 },
});
