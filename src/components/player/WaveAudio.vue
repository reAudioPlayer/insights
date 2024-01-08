<!--
  - Copyright (c) 2023, reAudioPlayer ONE.
  - Licenced under the GNU General Public License v3.0
  -->

<script lang="ts" setup>
import type { Playable } from "./player";
import { onMounted, ref } from "vue";
// @ts-ignore
import WaveSurfer from "wavesurfer.js";

import { useInsightStore } from "../../stores/insight";

const audio = ref<any>(null);
const audioElement = ref<any>();

onMounted(() => {
  const fgBase = getComputedStyle(document.documentElement).getPropertyValue(
    "--fg-base"
  );
  const waveColor = fgBase;
  const fgSecondary = getComputedStyle(
    document.documentElement
  ).getPropertyValue("--fg-secondary");
  const progressColor = fgSecondary;

  // @ts-ignore
  audio.value = WaveSurfer.create({
    container: "#waveform",
    waveColor,
    progressColor,
    cursorWidth: 0,
    barWidth: 1,
    barGap: 3,
    responsive: true,
    backend: "MediaElement",
  });

  audio.value.on("play", () => {
    insights.player.playing = true;
  });
  audio.value.on("pause", () => {
    insights.player.playing = false;
  });
  audio.value.on("audioprocess", () => {
    insights.player.progress = audio.value.getCurrentTime();
  });
  audio.value.on("waveform-ready", () => {
    if (!audio.value) return;
    insights.player.duration = audio.value.getDuration();
  });
});

const insights = useInsightStore();

const setElement = (el: any) => {
  audioElement.value = el;
  const context = new AudioContext();
  var source = context.createMediaElementSource(audioElement.value!);
  source.connect(context.destination);
  insights.setSource(source, context);
};

const onSongChange = (newAudio: any) => {
  if (!audioElement.value) {
    setElement(newAudio);
  }
  insights.player.playing = false;
  audio.value.load(newAudio);
};

const play = () => {
  audioElement.value.play();
};

const pause = () => {
  audioElement.value.pause();
};

const seek = (time: number) => {
  audio.value.seekTo(time / insights.player.duration);
};

const setVolume = (volume: number) => {
  let asPercent = volume / 100;
  asPercent = Math.min(Math.max(asPercent, 0), 1);
  audio.value!.setVolume(asPercent);
};

const setMute = (muted: boolean) => {
  audio.value.setMute(muted);
};

const playable: Playable = {
  play,
  pause,
  seek,
  setVolume,
  setMute,
  onSongChange,
  setElement,
};

defineExpose(playable);
</script>
<template>
  <div id="waveform" />
</template>
<style>
#waveform {
  width: 100%;
  & wave,
  & canvas {
    width: 100%;
    height: calc(var(--h-player) / 2 - 1em) !important;
  }
}
</style>
