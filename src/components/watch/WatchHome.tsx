import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withDelay,
  withSequence,
  withTiming,
  type EasingFunction,
} from 'react-native-reanimated';
import { artists } from '@/lib/data';
import {
  BASE_BLOB,
  BUBBLE,
  cubicIn,
  cubicInOut,
  clamp,
  cubicOut,
  elasticOut,
  expoOut,
  linear,
  project,
  quadOut,
} from '@/lib/fisheye';
import { makeField, type Cell } from '@/lib/honeycomb';
import { colors, fonts } from '@/lib/theme';
import { ArtistCard, CloseButton } from './ArtistCard';
import { Bubble, type Scene } from './Bubble';

const DESIGN_WIDTH = 768;
const WINDOW_STEP = 120;

const ease = (fn: (t: number) => number) => fn as EasingFunction;

type Phase = 'closed' | 'open' | 'closing';

export function WatchHome() {
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const [field] = useState(() => makeField(artists, Platform.OS !== 'web'));
  const [phase, setPhase] = useState<Phase>('closed');
  const [selected, setSelected] = useState<Cell | null>(null);
  const [showClose, setShowClose] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const [windowCenter, setWindowCenter] = useState(() => ({
    x: Math.round((field.minX + field.maxX) / 2 / WINDOW_STEP) * WINDOW_STEP,
    y: Math.round((field.minY + field.maxY) / 2 / WINDOW_STEP) * WINDOW_STEP,
  }));

  const sx = useSharedValue((field.minX + field.maxX) / 2);
  const sy = useSharedValue((field.minY + field.maxY) / 2);
  const blob = useSharedValue(BASE_BLOB + 0.3);
  const shift = useSharedValue(BASE_BLOB + 0.5);
  const active = useSharedValue(-1);
  const discScale = useSharedValue(1);
  const discOpacity = useSharedValue(0.7);
  const cardProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const curtain = useSharedValue(1);
  const loadBar = useSharedValue(0);
  const rippleP = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // The original is designed for a 768px-wide viewport; phones are shown scaled down to match.
  const k = Math.min(1, layout.w / DESIGN_WIDTH) || 1;
  const vw = layout.w / k;
  const vh = layout.h / k;
  const size = Math.min(vw, vh);
  const scene: Scene = {
    sx,
    sy,
    blob,
    shift,
    active,
    discScale,
    discOpacity,
    k,
    size,
    cx: layout.w / 2,
    cy: layout.h / 2,
  };

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setLayout((prev) => {
        if (prev.w === 0 && width > 0) {
          loadBar.set(withTiming(1, { duration: 700, easing: ease(linear) }));
          curtain.set(withDelay(800, withTiming(0, { duration: 800, easing: ease(quadOut) })));
          blob.set(withDelay(850, withTiming(BASE_BLOB, { duration: 1200, easing: ease(elasticOut) })));
          shift.set(withDelay(850, withTiming(BASE_BLOB, { duration: 1200, easing: ease(elasticOut) })));
        }
        return { w: width, h: height };
      });
    },
    [blob, curtain, loadBar, shift],
  );

  // Only mount bubbles that can be visible; re-evaluate as the field is panned.
  useAnimatedReaction(
    () => ({
      x: Math.round(sx.get() / WINDOW_STEP) * WINDOW_STEP,
      y: Math.round(sy.get() / WINDOW_STEP) * WINDOW_STEP,
    }),
    (cur, prev) => {
      if (!prev || cur.x !== prev.x || cur.y !== prev.y) runOnJS(setWindowCenter)(cur);
    },
  );

  const reach = size * 0.85 + WINDOW_STEP * 2;
  const visible = useMemo(
    () =>
      layout.w
        ? field.cells.filter((c) => {
            const dx = c.x - windowCenter.x;
            const dy = c.y - windowCenter.y;
            return (
              dx * dx + dy * dy < reach * reach && Math.abs(dx) < vw * 0.7 + BUBBLE && Math.abs(dy) < vh * 0.7 + BUBBLE
            );
          })
        : [],
    [field, layout.w, reach, vw, vh, windowCenter],
  );

  const pan = Gesture.Pan()
    .enabled(phase === 'closed')
    .minDistance(6)
    .onBegin(() => {
      cancelAnimation(sx);
      cancelAnimation(sy);
      startX.set(sx.get());
      startY.set(sy.get());
    })
    .onUpdate((e) => {
      sx.set(clamp(startX.get() - e.translationX / k, field.minX, field.maxX));
      sy.set(clamp(startY.get() - e.translationY / k, field.minY, field.maxY));
    })
    .onEnd((e) => {
      sx.set(withDecay({ velocity: -e.velocityX / k, clamp: [field.minX, field.maxX] }));
      sy.set(withDecay({ velocity: -e.velocityY / k, clamp: [field.minY, field.maxY] }));
    });

  const openCell = useCallback(
    (cell: Cell, screenX: number, screenY: number) => {
      setSelected(cell);
      setPhase('open');
      setShowClose(false);
      setRipple({ x: screenX, y: screenY, key: Date.now() });
      rippleP.set(0);
      rippleP.set(withTiming(1, { duration: 500, easing: ease(linear) }));

      cancelAnimation(sx);
      cancelAnimation(sy);
      active.set(cell.id);
      cardScale.set(1);
      cardProgress.set(0);
      sx.set(withTiming(cell.x, { duration: 500, easing: ease(quadOut) }));
      sy.set(withTiming(cell.y, { duration: 500, easing: ease(quadOut) }));

      discScale.set(
        withSequence(
          withTiming(0.75, { duration: 300, easing: ease(expoOut) }),
          withDelay(50, withTiming(20, { duration: 600, easing: ease(cubicIn) })),
        ),
      );
      discOpacity.set(withTiming(0.95, { duration: 300 }));
      blob.set(withDelay(100, withTiming(BASE_BLOB + 0.3, { duration: 600, easing: ease(cubicOut) })));
      shift.set(withDelay(100, withTiming(BASE_BLOB + 1, { duration: 600, easing: ease(linear) })));
      cardProgress.set(
        withDelay(
          750,
          withTiming(1, { duration: 800, easing: ease(linear) }, (done) => {
            if (done) runOnJS(setShowClose)(true);
          }),
        ),
      );
    },
    [active, blob, cardProgress, cardScale, discOpacity, discScale, rippleP, shift, sx, sy],
  );

  const handleTap = useCallback(
    (x: number, y: number) => {
      if (phase !== 'closed') return;
      let best: { cell: Cell; scale: number; px: number; py: number } | null = null;
      for (const c of visible) {
        const p = project(c.x - sx.get(), c.y - sy.get(), blob.get(), shift.get(), size);
        const px = layout.w / 2 + p.x * k;
        const py = layout.h / 2 + p.y * k;
        const r = (BUBBLE / 2) * p.scale * k;
        if (p.delta >= 0.2 && Math.hypot(x - px, y - py) <= r && (!best || p.scale > best.scale)) {
          best = { cell: c, scale: p.scale, px, py };
        }
      }
      if (best) openCell(best.cell, best.px, best.py);
    },
    [phase, visible, sx, sy, blob, shift, size, layout, k, openCell],
  );

  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e, ok) => {
      if (ok) runOnJS(handleTap)(e.x, e.y);
    });

  const close = useCallback(() => {
    setPhase('closing');
    setShowClose(false);
    cardScale.set(withTiming(0, { duration: 500, easing: ease(cubicInOut) }));
    discOpacity.set(withTiming(0.7, { duration: 500 }));
    discScale.set(
      withSequence(
        withTiming(0.75, { duration: 500, easing: ease(cubicInOut) }),
        withTiming(1, { duration: 1000, easing: ease(elasticOut) }, (done) => {
          if (done) {
            active.set(-1);
            runOnJS(setPhase)('closed');
            runOnJS(setSelected)(null);
          }
        }),
      ),
    );
    shift.set(withDelay(300, withTiming(BASE_BLOB, { duration: 1200, easing: ease(elasticOut) })));
    blob.set(withTiming(BASE_BLOB, { duration: 2100, easing: ease(elasticOut) }));
    cardProgress.set(withDelay(500, withTiming(0, { duration: 1 })));
  }, [active, blob, cardProgress, cardScale, discOpacity, discScale, shift]);

  const goToArtist = useCallback(() => {
    if (selected) router.push({ pathname: '/artist/[slug]', params: { slug: selected.artist.slug } });
  }, [selected]);

  const curtainStyle = useAnimatedStyle(() => ({ opacity: curtain.value }));
  const barStyle = useAnimatedStyle(() => ({ width: 150 * loadBar.value }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * Math.pow(1 - rippleP.value, 3),
    transform: [{ scale: 28 * rippleP.value }],
  }));

  // Mouse-wheel / trackpad panning on web, like iScroll's mouseWheel option.
  const webWheel =
    Platform.OS === 'web'
      ? {
          onWheel: (e: { deltaX: number; deltaY: number }) => {
            if (phase !== 'closed') return;
            cancelAnimation(sx);
            cancelAnimation(sy);
            sx.set(clamp(sx.get() + e.deltaX / k, field.minX, field.maxX));
            sy.set(clamp(sy.get() + e.deltaY / k, field.minY, field.maxY));
          },
        }
      : {};

  return (
    <View style={styles.root} onLayout={onLayout} {...webWheel}>
      <GestureDetector gesture={Gesture.Race(pan, tap)}>
        <View style={StyleSheet.absoluteFill} collapsable={false}>
          {layout.w > 0 && visible.map((cell) => <Bubble key={cell.id} cell={cell} scene={scene} />)}
        </View>
      </GestureDetector>

      {ripple && (
        <Animated.View
          pointerEvents="none"
          style={[styles.ripple, { left: ripple.x - 20, top: ripple.y - 20 }, rippleStyle]}
          key={ripple.key}
        />
      )}

      {selected && (
        <View style={styles.cardLayer} pointerEvents="box-none">
          <ArtistCard artist={selected.artist} progress={cardProgress} scale={cardScale} onView={goToArtist} />
          {showClose && (
            <View style={styles.closeSlot}>
              <CloseButton onPress={close} />
            </View>
          )}
        </View>
      )}

      <Animated.View style={[styles.curtain, curtainStyle]} pointerEvents="none">
        <Text style={styles.loading}>loading..</Text>
        <Animated.View style={[styles.bar, barStyle]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  cardLayer: {
    ...StyleSheet.flatten(StyleSheet.absoluteFill),
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSlot: { position: 'absolute', top: '12%', right: 24 },
  ripple: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 15,
  },
  curtain: {
    ...StyleSheet.flatten(StyleSheet.absoluteFill),
    backgroundColor: colors.background,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: { color: '#fff', fontFamily: fonts.body, fontSize: 10, letterSpacing: 1.4, marginBottom: 12 },
  bar: { height: 1, backgroundColor: '#fff', borderRadius: 4 },
});
