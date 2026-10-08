import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { albumImage } from '@/lib/data';

const vinyl = require('../../assets/images/hiphopology-vinyl.png');

// Sleeve on the left; the spinning record slides out from behind it, like the original player.
export function RecordPlayer({ albumId }: { albumId: number }) {
  const [available, setAvailable] = useState(0);
  const [spin] = useState(() => new Animated.Value(0));
  const [slide] = useState(() => new Animated.Value(0));
  const size = Math.max(0, Math.min(200, available / 1.45));

  useEffect(() => {
    spin.setValue(0);
    slide.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2500, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    Animated.timing(slide, {
      toValue: 1,
      duration: 800,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    return () => loop.stop();
  }, [spin, slide, albumId]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.55] });
  const label = size * 0.4;

  return (
    <View style={styles.wrap} onLayout={(e) => setAvailable(e.nativeEvent.layout.width)}>
      {size > 0 && (
        <View style={{ width: size * 1.45, height: size }}>
          <Animated.View
            style={[
              styles.vinyl,
              { width: size * 0.95, height: size * 0.95, top: size * 0.025, transform: [{ translateX }, { rotate }] },
            ]}
          >
            <Image source={vinyl} style={StyleSheet.absoluteFill} contentFit="cover" />
            <Image
              source={albumImage(albumId)}
              style={{ width: label, height: label, borderRadius: label / 2 }}
              contentFit="cover"
            />
          </Animated.View>
          <Image
            source={albumImage(albumId)}
            style={[styles.sleeve, { width: size, height: size }]}
            contentFit="cover"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center' },
  vinyl: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  },
  sleeve: { position: 'absolute', left: 0, top: 0, boxShadow: '3px 3px 15px rgba(0,0,0,0.65)' },
});
