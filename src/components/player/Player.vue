<!--
  - Copyright (c) 2023, reAudioPlayer ONE.
  - Licenced under the GNU General Public License v3.0
  -->

<script lang="ts" setup>
import { useInsightStore } from "../../stores/insight";
import { ref } from "vue";
import ProgressBar from "../ProgressBar.vue";
import type { Playable } from "./player";
import WaveAudio from "./WaveAudio.vue";

const insights = useInsightStore();
const playable = ref<Playable>();
const upload = ref<HTMLInputElement>();

const onFileChange = (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    playable.value!.onSongChange(e.target.result);
    insights.onSongChange();
    hasUploaded.value = true;
  };
  reader.readAsDataURL(file);
};

const doUpload = () => {
  upload.value!.click();
};

const hasUploaded = ref(false);
const muted = ref(false);

const toggleMuted = () => {
  muted.value = !muted.value;
  playable.value!.setMute(muted.value);
};

const playPause = () => {
  if (!hasUploaded.value) {
    doUpload();
    return;
  }
  if (insights.player.playing) {
    playable.value!.pause();
  } else {
    playable.value!.play();
  }
};
</script>
<template>
  <input
    v-show="false"
    type="file"
    id="file"
    ref="upload"
    accept="audio/*"
    @change="onFileChange"
  />
  <div class="player relative">
    <div class="desktop mx-4">
      <div class="controls">
        <div class="top relative">
          <span
            class="cursor-pointer material-symbols-rounded ms-fill text-4xl"
            @click="playPause"
          >
            {{
              hasUploaded
                ? insights.player.playing
                  ? "pause_circle"
                  : "play_circle"
                : "file_upload"
            }}
          </span>
        </div>
        <div class="bottom">
          <div class="display">
            <span class="text-xs text-muted text-right cursor-pointer">
              {{ insights.displayProgress }}
            </span>
            <WaveAudio ref="playable" />
            <span class="text-xs text-muted text-left">
              {{ insights.displayDuration }}
            </span>
          </div>
        </div>
      </div>
      <div class="aux relative">
        <span
          class="icon cursor-pointer material-symbols-rounded ms-fill select-none"
          @click="doUpload"
        >
          file_upload
        </span>
        <span
          class="icon cursor-pointer material-symbols-rounded ms-fill select-none"
          @click="toggleMuted"
        >
          {{ muted ? "volume_off" : "volume_up" }}
        </span>
        <ProgressBar
          v-model="insights.player.volume"
          max="100"
          @change="(e: any) => playable!.setVolume(e)"
        />
      </div>
    </div>
  </div>
</template>
<style>
.player .on-this-device > .material-symbols-rounded {
  color: var(--fg-secondary);
}
</style>
<style scoped>
.player {
  background: var(--bg-base-lt);
  border-top: 1px solid var(--border-base);
  z-index: 2;
}

.icon {
  color: var(--fg-base-dk);

  &:hover {
    color: var(--fg-base);
  }
}

.desktop {
  display: grid;
  height: calc(var(--h-player) - 1px);
  grid-template-columns: 1fr max-content;
  grid-template-areas: "controls aux";
  gap: 10px;
  padding: 0 1em;

  .song-info {
    grid-area: song-info;
    display: grid;
    align-items: center;
    grid-template-columns: calc(var(--h-player) - 40px) fit-content(100%) 20px 20px;
    gap: 10px;
    overflow: hidden;

    .title-artist {
      overflow: hidden;
    }

    & div {
      margin: auto 0;
    }
  }

  .controls {
    grid-area: controls;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;

    .top {
      display: grid;
      grid-template-columns: 40px;
      gap: 1.5em;
      justify-content: center;

      & span {
        margin: auto 0;
        font-size: 2.5rem;
      }
    }

    .bottom .display {
      display: grid;
      grid-template-columns: 4ch 10fr 4ch;
      margin-bottom: 0.5em;
      align-items: center;
    }
  }

  .aux {
    grid-area: aux;
    justify-content: end;
    display: grid;
    grid-template-columns: 20px 20px minmax(auto, 8vw);
    gap: 1em;
    align-items: center;

    a.icon {
      display: flex;
      text-decoration: none;

      &.router-link-active {
        color: var(--fg-secondary);
      }
    }
  }
}
</style>
