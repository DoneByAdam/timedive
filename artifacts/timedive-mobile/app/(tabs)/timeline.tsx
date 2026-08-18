import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useListTopics, type Topic } from '@workspace/api-client-react';
import { Body, Card, Heading, useBottomInset, useTopInset } from '@/components/UI';
import { useColors } from '@/hooks/useColors';

export default function Timeline() {
  const c = useColors();
  const top = useTopInset();
  const bottom = useBottomInset();
  const topics = useListTopics();

  const grouped = useMemo(() => {
    const map = new Map<number, Topic[]>();
    for (const t of topics.data ?? []) {
      const list = map.get(t.depthLevel) ?? [];
      list.push(t);
      map.set(t.depthLevel, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [topics.data]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: top + 16,
        paddingBottom: bottom + 100,
        paddingHorizontal: 20,
        gap: 12,
      }}
      refreshControl={
        <RefreshControl
          refreshing={topics.isRefetching}
          onRefresh={() => topics.refetch()}
          tintColor={c.mutedForeground}
        />
      }
    >
      <Heading size={26}>Timeline</Heading>
      <Body muted style={{ marginBottom: 8 }}>
        Dive deeper to travel further back in time.
      </Body>

      {topics.isLoading ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
      ) : topics.isError ? (
        <Card>
          <Body muted>Couldn't load topics. Pull to retry.</Body>
        </Card>
      ) : (
        grouped.map(([depth, list]) => (
          <View key={depth} style={{ gap: 10 }}>
            <View style={styles.depthRow}>
              <View style={[styles.depthBadge, { backgroundColor: c.primary }]}>
                <Body size={13} style={{ color: c.primaryForeground }}>
                  {depth}
                </Body>
              </View>
              <Body muted size={13}>
                Depth level {depth}
              </Body>
            </View>
            {list.map((t) => (
              <Pressable
                key={t.id}
                testID={`topic-${t.id}`}
                onPress={() => router.push(`/story/${t.id}`)}
              >
                {({ pressed }) => (
                  <Card style={{ opacity: pressed ? 0.8 : 1 }}>
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Heading size={16}>{t.eraName}</Heading>
                        <Body muted size={13} style={{ marginTop: 4 }}>
                          {t.category}
                        </Body>
                      </View>
                      {t.isCompleted ? (
                        <Feather name="check-circle" size={20} color={c.accent} />
                      ) : (
                        <Feather name="chevron-right" size={20} color={c.mutedForeground} />
                      )}
                    </View>
                  </Card>
                )}
              </Pressable>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  depthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  depthBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
});
