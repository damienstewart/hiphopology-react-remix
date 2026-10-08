import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, type ColorValue } from 'react-native';
import { colors, fonts } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={icon} size={size} color={color} />
  ),
});

function BackButton() {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/artists'))}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      style={{ paddingHorizontal: 16 }}
    >
      <Ionicons name="chevron-back" size={24} color={colors.yellow} />
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.yellow,
        headerTitleStyle: { fontFamily: fonts.heading, fontSize: 20, textTransform: 'uppercase' },
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.yellow,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.body },
      }}
    >
      <Tabs.Screen name="index" options={{ ...tab('Home', 'home'), headerShown: false }} />
      <Tabs.Screen name="artists" options={{ ...tab('Artists', 'people'), headerTitle: 'Artists' }} />
      <Tabs.Screen name="averages" options={{ ...tab('Averages', 'stats-chart'), headerTitle: 'Averages' }} />
      <Tabs.Screen name="about" options={{ ...tab('About', 'information-circle'), headerTitle: 'About' }} />
      {/* Not a tab itself, but keeps the tab bar visible and "Artists" highlighted-by-context. */}
      <Tabs.Screen name="artist/[slug]" options={{ href: null, headerLeft: () => <BackButton /> }} />
    </Tabs>
  );
}
