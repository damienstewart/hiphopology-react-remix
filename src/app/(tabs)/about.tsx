import type { ReactNode } from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import { Block } from '@/components/Block';
import { Screen } from '@/components/Screen';
import { colors, fonts } from '@/lib/theme';

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Text style={styles.link} onPress={() => Linking.openURL(href)} accessibilityRole="link">
      {children}
    </Text>
  );
}

export default function AboutScreen() {
  return (
    <Screen>
      <Block title="About" accent="red">
        <Text style={styles.p}>
          Hiphopology is a text mining tool that handles data for the partial discographies of 50 hip-hop artists. Every
          artists included in this list must have at least 5 full length projects released. The data is mined from all
          the verses (lyrics in bridges, refrains, hooks, choruses, feature verses, etc. were not taken into account) on
          each project from each artist. This tool is not meant to compare artists, only to better understand the work
          and process of each artist as an individual.
        </Text>
        <Text style={styles.p}>
          This project was built in 2019 and does not serve as an up to date reference for the current state of the
          represented artists discographies.
        </Text>
        <Text style={styles.p}>
          Built by <ExternalLink href="https://www.instagram.com/gotoheck/">Damien Stewart</ExternalLink>
        </Text>
      </Block>
    </Screen>
  );
}

const styles = StyleSheet.create({
  p: { color: colors.bodyText, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, marginBottom: 14 },
  link: { color: colors.yellow, textDecorationLine: 'underline' },
});
