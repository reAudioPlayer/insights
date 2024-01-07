export interface Playable {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  onSongChange: (element: HTMLAudioElement) => void;
  setMute: (mute: boolean) => void;
  setElement: (element: any) => void;
}
