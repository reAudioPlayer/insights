export interface Playable {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  onSongChange: (src: string) => void;
  setMute: (mute: boolean) => void;
}
