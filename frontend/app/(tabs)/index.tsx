import { Image } from 'expo-image';
import { Platform, StyleSheet, Text } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, Stack } from 'expo-router';

export default function HomeScreen() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}


