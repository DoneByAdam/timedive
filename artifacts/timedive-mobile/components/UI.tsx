import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

export function useTopInset(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.top, Platform.OS === 'web' ? 67 : 0);
}

export function useBottomInset(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 0);
}

export function Heading({
  children,
  size = 24,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  style?: object;
}) {
  const c = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize: size,
          color: c.foreground,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  muted = false,
  size = 15,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  size?: number;
  style?: object;
}) {
  const c = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: 'Inter_400Regular',
          fontSize: size,
          lineHeight: size * 1.55,
          color: muted ? c.mutedForeground : c.foreground,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: colors.radius,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  testID,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const bg =
    variant === 'primary'
      ? c.primary
      : variant === 'accent'
        ? c.accent
        : variant === 'secondary'
          ? c.secondary
          : 'transparent';
  const isDisabled = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: c.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.primaryForeground} />
      ) : (
        <>
          {icon}
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 16,
              color: c.primaryForeground,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function Input(props: TextInputProps & { testID?: string }) {
  const c = useColors();
  return (
    <TextInput
      placeholderTextColor={c.mutedForeground}
      {...props}
      style={[
        {
          backgroundColor: c.input,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: colors.radius,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: 'Inter_400Regular',
          fontSize: 16,
          color: c.foreground,
        },
        props.style,
      ]}
    />
  );
}

export function Chip({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const c = useColors();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? c.primary : c.secondary,
          borderColor: selected ? c.primary : c.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 14,
          color: selected ? c.primaryForeground : c.mutedForeground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: colors.radius,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
