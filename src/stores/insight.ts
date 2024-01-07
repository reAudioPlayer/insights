/*
 * Copyright (c) 2023, reAudioPlayer ONE.
 * Licenced under the GNU General Public License v3.0
 */

import { defineStore } from "pinia";
import { watch } from "vue";
// @ts-ignore
import { LoudnessMeter } from "@domchristie/needles";
import { correlation, getData, stereoField } from "../helpers/correlationMeter";

export const useInsightStore = defineStore({
  id: "insights",
  state: () => ({
    stereo: {
      left: 0,
      right: 0,
      correlation: 0,
      field: [] as { x: number; y: number }[],
      _analyserL: null as any | null,
      _analyserR: null as any | null,
    },
    tonalBalance: {
      data: null as Uint8Array | null,
      _analyser: null as any | null,
    },
    truePeak: {
      left: -Infinity,
      right: -Infinity,
    },
    loudness: {
      momentary: -Infinity,
      maxMomentary: -Infinity,
      shortterm: -Infinity,
      integrated: -Infinity,
    },
    _meter: null as any | null,
    player: {
      playing: false,
      volume: 100,
      progress: 0,
      duration: 0,
    },
  }),
  getters: {
    displayDuration() {
      // format as mm:ss
      const minutes = Math.floor(this.player.duration / 60);
      const seconds = Math.floor(this.player.duration % 60);
      return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    },
    displayProgress() {
      // format as mm:ss
      const minutes = Math.floor(this.player.progress / 60);
      const seconds = Math.floor(this.player.progress % 60);
      return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    },
  },
  actions: {
    _reset() {
      this.stereo.left = 0;
      this.stereo.right = 0;
      this.truePeak.left = -Infinity;
      this.truePeak.right = -Infinity;
      this.loudness.momentary = -Infinity;
      this.loudness.maxMomentary = -Infinity;
      this.loudness.shortterm = -Infinity;
      this.loudness.integrated = -Infinity;
    },
    setSource(source: MediaElementAudioSourceNode, context: AudioContext) {
      this._meter = new LoudnessMeter({
        source,
        workerUri: "/insights/assets/needles/needles-worker.js",
      });
      this._meter?.start();
      this._meter?.pause();

      this.stereo._analyserL = context.createAnalyser();
      this.stereo._analyserR = context.createAnalyser();
      this.tonalBalance._analyser = context.createAnalyser();

      this.tonalBalance._analyser.fftSize = 256;
      source.connect(this.tonalBalance._analyser);
      this.tonalBalance.data = new Uint8Array(
        this.tonalBalance._analyser.frequencyBinCount
      );

      var splitter = context.createChannelSplitter(2);
      source.connect(splitter);
      splitter.connect(this.stereo._analyserR, 1);
      splitter.connect(this.stereo._analyserL, 0);
      this._stereo();
    },
    _stereo() {
      const pcmDataR = new Float32Array(this.stereo._analyserR.fftSize);
      const pcmDataL = new Float32Array(this.stereo._analyserL.fftSize);
      const onFrame = () => {
        this.tonalBalance._analyser.getByteFrequencyData(
          this.tonalBalance.data
        );

        this.stereo._analyserR.getFloatTimeDomainData(pcmDataR);
        this.stereo._analyserL.getFloatTimeDomainData(pcmDataL);
        let sumR = 0.0;
        let sumL = 0.0;
        for (const amplitude of pcmDataR) {
          sumR += amplitude * amplitude;
        }
        for (const amplitude of pcmDataL) {
          sumL += amplitude * amplitude;
        }
        this.stereo.right = Math.sqrt(sumR / pcmDataR.length);
        this.stereo.left = Math.sqrt(sumL / pcmDataL.length);

        const data = getData(this.stereo._analyserL, this.stereo._analyserR);
        this.stereo.correlation = correlation(data);
        this.stereo.field = stereoField(data);

        window.requestAnimationFrame(onFrame);
      };
      window.requestAnimationFrame(onFrame);
    },
    onSongChange() {
      this._reset();
      this._meter?.reset();
      this._meter?.on("dataavailable", (e: any) =>
        this._setLoudness(e.data.mode, e.data.value)
      );
    },
    initialise() {
      watch(
        () => this.player.playing,
        () => {
          if (this.player.playing) {
            this._meter?.resume();
          } else {
            this._meter?.pause();
          }
        }
      );
    },
    _setLoudness(mode: string, value: number) {
      switch (mode) {
        case "momentary":
          this.loudness.momentary = value;
          this.loudness.maxMomentary = Math.max(
            this.loudness.maxMomentary,
            value
          );
          break;
        case "short-term":
          this.loudness.shortterm = value;
          break;
        case "integrated":
          this.loudness.integrated = value;
          break;
      }
    },
  },
});
