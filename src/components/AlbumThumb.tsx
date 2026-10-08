import { Image } from 'expo-image';
import { albumImage } from '@/lib/data';
import { colors } from '@/lib/theme';
import type { Album } from '@/lib/types';

export function AlbumThumb({ album, size = 44 }: { album: Album; size?: number }) {
  return (
    <Image
      source={albumImage(album.id)}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceSolid }}
      contentFit="cover"
      accessibilityLabel={album.name}
    />
  );
}
