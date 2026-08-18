import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

const RATES = [1, 1.25, 1.5, 0.75];

/**
 * Text-to-speech narration controls, mirroring the web app's ReadAloud.
 */
export function ReadAloud({ text }: { text: string }) {
  const c = useColors();
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [rateIndex, setRateIndex] = useState<number>(0);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = useCallback(
    (rate: number) => {
      Speech.stop();
      setSpeaking(true);
      Speech.speak(text, {
        language: 'en-US',
        rate,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    },
    [text],
  );

  const toggle = useCallback(() => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
    } else {
      speak(RATES[rateIndex]);
    }
  }, [speaking, speak, rateIndex]);

  const cycleRate = useCallback(() => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    if (speaking) speak(RATES[next]);
  }, [rateIndex, speaking, speak]);

  return (
    <View style={[styles.row, { backgroundColor: c.secondary }]}>
      <Pressable
        testID="read-aloud-toggle"
        onPress={toggle}
        style={({ pressed }) => [
          styles.playButton,
          { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather
          name={speaking ? 'square' : 'volume-2'}
          size={20}
          color={c.accentForeground}
        />
      </Pressable>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 14,
          color: c.foreground,
          flex: 1,
        }}
      >
        {speaking ? 'Narrating…' : 'Listen to this story'}
      </Text>
      <Pressable
        testID="read-aloud-rate"
        onPress={cycleRate}
        style={({ pressed }) => [
          styles.rateButton,
          { borderColor: c.border, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            fontSize: 13,
            color: c.mutedForeground,
          }}
        >
          {RATES[rateIndex]}x
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: colors.radius,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
