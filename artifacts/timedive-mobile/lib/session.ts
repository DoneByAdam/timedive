import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'timedive.authToken';

let currentToken: string | null = null;

export function getToken(): string | null {
  return currentToken;
}

export async function loadToken(): Promise<string | null> {
  currentToken = await AsyncStorage.getItem(TOKEN_KEY);
  return currentToken;
}

export async function saveToken(token: string | null): Promise<void> {
  currentToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}
