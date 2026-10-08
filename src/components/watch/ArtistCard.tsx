import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { artistImage } from '@/lib/data';
import { bounceIn, bounceOut, cubicOut, expoOut } from '@/lib/fisheye';
import { fonts } from '@/lib/theme';
import type { Artist } from '@/lib/types';

type Props = {
  artist: Artist;
  // 0 -> 1 as the card "unfolds"; scale is 1 normally and shrinks on close.
  progress: SharedValue<number>;
  scale: SharedValue<number>;
  onView: () => void;
};

function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole="link"
      style={styles.button}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Rect
          x={1}
          y={1}
          width="99%"
          height="97%"
          fill="none"
          stroke="#fff"
          strokeWidth={hover ? 4 : 2}
          strokeDasharray={hover ? '15 310' : undefined}
          strokeDashoffset={hover ? 48 : 0}
        />
      </Svg>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function ArtistCard({ artist, progress, scale, onView }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 640;
  const card = wide ? 256 : Math.min(220, width * 0.55);

  const cardStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const b = bounceOut(p);
    const t = cubicOut(p);
    return {
      opacity: expoOut(p),
      transform: [
        { perspective: 900 },
        { translateX: -300 * bounceIn(1 - p) * (1 - p) },
        { rotateY: `${90 * (1 - b)}deg` },
        { rotateX: `${70 * (1 - t)}deg` },
        { rotateZ: `${-20 * (1 - t)}deg` },
      ],
    };
  });

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.75 * Math.min(1, bounceOut(progress.value)),
    transform: [{ scaleX: 0.4 + 0.6 * bounceOut(progress.value) }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: expoOut(progress.value),
    transform: [{ translateX: 30 * (1 - cubicOut(progress.value)) }],
  }));

  const containerStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[styles.container, wide ? styles.row : styles.column, containerStyle]}
      pointerEvents="box-none"
    >
      <View style={{ width: card, height: card + 18 }}>
        <Animated.View style={[styles.shadow, { width: card * 1.1, top: card - 10 }, shadowStyle]}>
          <LinearGradient
            colors={['rgba(58,8,57,0)', 'rgba(58,8,57,0.65)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.card, { width: card, height: card }, cardStyle]}>
          <Image source={artistImage(artist.slug)} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Animated.View>
      </View>
      <Animated.View style={[styles.text, wide ? styles.textWide : styles.textNarrow, textStyle]}>
        <Text style={[styles.name, !wide && styles.centered]}>{artist.stageName}</Text>
        <Text style={[styles.born, !wide && styles.centered]}>
          Born {artist.governmentName}, in {artist.birthYear}
        </Text>
        <View style={wide ? undefined : styles.centerButton}>
          <OutlineButton label="View Artist" onPress={onView} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={16}
      style={styles.close}
    >
      <View style={styles.closeRing} />
      <Ionicons name="close" size={22} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 28 },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#fff',
    transformOrigin: '50% 100%',
  },
  shadow: { position: 'absolute', height: 16, right: 0, borderRadius: 16, overflow: 'hidden' },
  text: { justifyContent: 'center' },
  textWide: { width: 260 },
  textNarrow: { alignItems: 'center' },
  name: { color: '#fff', fontFamily: fonts.heading, fontSize: 40, textTransform: 'uppercase', lineHeight: 46 },
  born: { color: '#fff', fontFamily: fonts.body, fontSize: 16, marginVertical: 12, lineHeight: 22 },
  centered: { textAlign: 'center' },
  centerButton: { alignItems: 'center' },
  button: { width: 160, height: 45, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontFamily: fonts.body, fontSize: 16 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});
