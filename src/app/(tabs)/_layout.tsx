import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, useWindowDimensions, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/lib/theme';

// Labels sit below the icons on narrow portrait screens (same rule as the tab bar's own default).
const TAB_BAR_TABLET_WIDTH = 768;
// Stacked item: 5px padding + 28px icon + label line + 5px padding.
const STACKED_LABEL_LINE_HEIGHT = 14;
const STACKED_ITEM_HEIGHT = 5 + 28 + STACKED_LABEL_LINE_HEIGHT + 5;
const STACKED_BAR_PADDING = 8;

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
  const { width, height } = useWindowDimensions();
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const labelsBelowIcons = width < TAB_BAR_TABLET_WIDTH && width <= height;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background, borderBottomColor: colors.yellow, borderBottomWidth: 1 },
        headerTintColor: colors.yellow,
        headerTitleStyle: { fontFamily: fonts.heading, fontSize: 20, textTransform: 'uppercase' },
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          // Even space above and below stacked items, and enough room that label descenders aren't clipped.
          ...(labelsBelowIcons && {
            height: STACKED_ITEM_HEIGHT + 2 * STACKED_BAR_PADDING + safeAreaBottom,
            paddingTop: STACKED_BAR_PADDING,
            paddingBottom: STACKED_BAR_PADDING + safeAreaBottom,
          }),
        },
        tabBarActiveTintColor: colors.yellow,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.body,
          ...(labelsBelowIcons && { lineHeight: STACKED_LABEL_LINE_HEIGHT }),
        },
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
