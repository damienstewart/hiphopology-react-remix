import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { artistImage } from '@/lib/data';
import { colors, fonts, rgba } from '@/lib/theme';
import type { Artist } from '@/lib/types';

const OVERLAYS = [colors.orange, colors.green, colors.purple, colors.yellow, colors.red];

// Circular photo with a translucent colour wash that lifts on hover, as on the original "View More Artists".
export function ArtistBubble({ artist, index, size }: { artist: Artist; index: number; size: number }) {
  const [hover, setHover] = useState(false);
  const overlay = OVERLAYS[index % OVERLAYS.length];
  return (
    <Link href={{ pathname: '/artist/[slug]', params: { slug: artist.slug } }} asChild>
      <Pressable
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        accessibilityRole="link"
        accessibilityLabel={artist.stageName}
        style={styles.item}
      >
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
          <Image source={artistImage(artist.slug)} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: rgba(overlay, hover ? 0.2 : 0.5) }]} />
        </View>
        <Text style={[styles.name, hover && styles.hover]} numberOfLines={1}>
          {artist.stageName}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center' },
  name: { color: colors.muted, fontFamily: fonts.body, fontSize: 16, marginTop: 8, textAlign: 'center' },
  hover: { textDecorationLine: 'underline' },
});
