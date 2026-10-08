import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { artistImage } from '@/lib/data';
import { accentColors, colors, fonts, rgba, type Accent } from '@/lib/theme';
import type { Artist } from '@/lib/types';

const overlays: Accent[] = ['red', 'yellow', 'green', 'purple', 'orange'];

function ArtistTileBase({ artist, index, width }: { artist: Artist; index: number; width: number }) {
  const overlay = accentColors[overlays[index % overlays.length]];
  return (
    <Link href={{ pathname: '/artist/[slug]', params: { slug: artist.slug } }} asChild>
      <Pressable style={{ marginBottom: 14, width }} accessibilityRole="link" accessibilityLabel={artist.stageName}>
        <View style={[styles.photo, { height: width }]}>
          <Image
            source={artistImage(artist.slug)}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={150}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: rgba(overlay, 0.25) }]} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {artist.stageName}
        </Text>
      </Pressable>
    </Link>
  );
}

export const ArtistTile = memo(ArtistTileBase);

const styles = StyleSheet.create({
  photo: { borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surfaceSolid },
  name: { color: colors.muted, fontFamily: fonts.body, fontSize: 15, marginTop: 6, textAlign: 'center' },
});
