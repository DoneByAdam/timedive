import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  getGetDashboardSummaryQueryKey,
  getGetProgressQueryKey,
  useGetDashboardSummary,
  useGetProgress,
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { Body, Card, Heading, useBottomInset, useTopInset } from '@/components/UI';
import { useColors } from '@/hooks/useColors';

export default function Home() {
  const { user } = useAuth();
  const c = useColors();
  const top = useTopInset();
  const bottom = useBottomInset();
  const dashboard = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey(), enabled: !!user },
  });
  const progress = useGetProgress({
    query: { queryKey: getGetProgressQueryKey(), enabled: !!user },
  });

  const d = dashboard.data;
  const p = progress.data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: top + 16,
        paddingBottom: bottom + 100,
        paddingHorizontal: 20,
        gap: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={dashboard.isRefetching}
          onRefresh={() => {
            dashboard.refetch();
            progress.refetch();
          }}
          tintColor={c.mutedForeground}
        />
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Body muted size={14}>
            Welcome back
          </Body>
          <Heading size={26}>{user?.displayName ?? 'Explorer'}</Heading>
        </View>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      </View>

      {dashboard.isLoading ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
      ) : dashboard.isError ? (
        <Card>
          <Body muted>Couldn't load your dashboard. Pull to retry.</Body>
        </Card>
      ) : d ? (
        <>
          <Card style={{ flexDirection: 'row', gap: 12 }}>
            <View style={styles.stat}>
              <Heading size={28} style={{ color: c.accent }}>
                {d.completedTopics}
              </Heading>
              <Body muted size={13}>
                Dives done
              </Body>
            </View>
            <View style={styles.stat}>
              <Heading size={28}>{d.totalTopics}</Heading>
              <Body muted size={13}>
                Total topics
              </Body>
            </View>
            <View style={styles.stat}>
              <Heading size={28}>{d.badgeCount ?? 0}</Heading>
              <Body muted size={13}>
                Badges
              </Body>
            </View>
          </Card>

          <Heading size={18}>Suggested dives</Heading>
          {d.suggestedNext.length === 0 ? (
            <Card>
              <Body muted>You've explored everything — amazing!</Body>
            </Card>
          ) : (
            d.suggestedNext.slice(0, 4).map((t) => (
              <Pressable
                key={t.id}
                testID={`suggested-${t.id}`}
                onPress={() => router.push(`/story/${t.id}`)}
              >
                {({ pressed }) => (
                  <Card style={{ opacity: pressed ? 0.8 : 1 }}>
                    <View style={styles.topicRow}>
                      <View style={{ flex: 1 }}>
                        <Heading size={16}>{t.eraName}</Heading>
                        <Body muted size={13} style={{ marginTop: 4 }}>
                          {t.category} · Depth {t.depthLevel}
                        </Body>
                      </View>
                      <Feather name="chevron-right" size={20} color={c.mutedForeground} />
                    </View>
                  </Card>
                )}
              </Pressable>
            ))
          )}

          {p && p.recentCompletions.length > 0 ? (
            <>
              <Heading size={18}>Recent discoveries</Heading>
              {p.recentCompletions.map((r) => (
                <Pressable
                  key={`${r.topicId}-${r.completedAt}`}
                  onPress={() => router.push(`/story/${r.topicId}`)}
                >
                  {({ pressed }) => (
                    <Card style={{ opacity: pressed ? 0.8 : 1 }}>
                      <View style={styles.topicRow}>
                        <Feather name="check-circle" size={18} color={c.accent} />
                        <Body style={{ flex: 1, marginLeft: 10 }}>{r.eraName}</Body>
                      </View>
                    </Card>
                  )}
                </Pressable>
              ))}
            </>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 48, height: 48, borderRadius: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  topicRow: { flexDirection: 'row', alignItems: 'center' },
});
