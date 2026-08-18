import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  useGetBadges,
  useGetProfile,
  useGetProgress,
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { Body, Button, Card, Heading, useBottomInset, useTopInset } from '@/components/UI';
import { useColors } from '@/hooks/useColors';

export default function Profile() {
  const { user, logout } = useAuth();
  const c = useColors();
  const top = useTopInset();
  const bottom = useBottomInset();
  const profile = useGetProfile();
  const progress = useGetProgress();
  const badges = useGetBadges();

  const p = progress.data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: top + 16,
        paddingBottom: bottom + 100,
        paddingHorizontal: 20,
        gap: 14,
      }}
    >
      <Heading size={26}>Profile</Heading>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          <Heading size={22}>
            {(user?.displayName ?? '?').charAt(0).toUpperCase()}
          </Heading>
        </View>
        <View style={{ flex: 1 }}>
          <Heading size={18}>{user?.displayName}</Heading>
          <Body muted size={13}>
            {user?.email}
          </Body>
          {profile.data?.age != null ? (
            <Body muted size={13}>
              Age {profile.data.age}
            </Body>
          ) : null}
        </View>
      </Card>

      {p ? (
        <Card>
          <Heading size={16} style={{ marginBottom: 12 }}>
            Progress
          </Heading>
          <Body muted size={14} style={{ marginBottom: 10 }}>
            {`${p.completedTopics} of ${p.totalTopics} dives completed`}
          </Body>
          <View style={{ gap: 8 }}>
            {p.completedByCategory.map((cat) => (
              <View key={cat.category} style={styles.catRow}>
                <Body size={14} style={{ flex: 1 }}>
                  {cat.category}
                </Body>
                <Body muted size={14}>
                  {`${cat.completed}/${cat.total}`}
                </Body>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <Card>
        <Heading size={16} style={{ marginBottom: 12 }}>
          Badges
        </Heading>
        {badges.data && badges.data.length > 0 ? (
          <View style={{ gap: 10 }}>
            {badges.data.map((b) => (
              <View key={b.id} style={styles.badgeRow}>
                <Feather name="award" size={20} color={c.accent} />
                <View style={{ flex: 1 }}>
                  <Body size={15}>{b.name}</Body>
                  <Body muted size={13}>
                    {b.description}
                  </Body>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.badgeRow}>
            <Feather name="award" size={20} color={c.mutedForeground} />
            <Body muted>Complete dives to earn badges.</Body>
          </View>
        )}
      </Card>

      <Button
        testID="logout-button"
        title="Sign Out"
        variant="ghost"
        onPress={async () => {
          await logout();
          router.replace('/');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catRow: { flexDirection: 'row', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
