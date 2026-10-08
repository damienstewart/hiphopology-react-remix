import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { artistImage } from '@/lib/data';
import { BUBBLE, project } from '@/lib/fisheye';
import type { Cell } from '@/lib/honeycomb';
import { colors } from '@/lib/theme';

export type Scene = {
  sx: SharedValue<number>;
  sy: SharedValue<number>;
  blob: SharedValue<number>;
  shift: SharedValue<number>;
  active: SharedValue<number>;
  discScale: SharedValue<number>;
  discOpacity: SharedValue<number>;
  k: number;
  size: number;
  cx: number;
  cy: number;
};

function BubbleBase({ cell, scene }: { cell: Cell; scene: Scene }) {
  const { sx, sy, blob, shift, active, discScale, discOpacity, k, size, cx, cy } = scene;

  const wrapStyle = useAnimatedStyle(() => {
    const p = project(cell.x - sx.value, cell.y - sy.value, blob.value, shift.value, size);
    return {
      transform: [{ translateX: p.x * k }, { translateY: p.y * k }, { scale: p.scale * k }],
      zIndex: active.value === cell.id ? 20 : Math.round(p.scale * 10),
    };
  });

  const discStyle = useAnimatedStyle(() => {
    const isActive = active.value === cell.id;
    return {
      transform: [{ scale: isActive ? discScale.value : 1 }],
      opacity: isActive ? discOpacity.value : 0.7,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { width: BUBBLE, height: BUBBLE, left: cx - BUBBLE / 2, top: cy - BUBBLE / 2 }, wrapStyle]}
    >
      <Image
        source={artistImage(cell.artist.slug)}
        style={styles.photo}
        contentFit="cover"
        recyclingKey={`${cell.id}`}
      />
      <Animated.View style={[styles.disc, { backgroundColor: cell.color }, discStyle]} />
    </Animated.View>
  );
}

export const Bubble = memo(BubbleBase);

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  photo: {
    ...StyleSheet.flatten(StyleSheet.absoluteFill),
    borderRadius: BUBBLE / 2,
    backgroundColor: colors.surfaceSolid,
  },
  disc: { ...StyleSheet.flatten(StyleSheet.absoluteFill), borderRadius: BUBBLE / 2 },
});
