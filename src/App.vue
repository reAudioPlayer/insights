<script setup lang="ts">
import Insights from "./views/Insights.vue";
import Header from "./components/Header.vue";
import Player from "./components/player/Player.vue";
import { useInsightStore } from "./stores/insight";

const insights = useInsightStore();
insights.initialise();
</script>

<template>
  <Header />

  <main>
    <Insights />
  </main>
  <footer>
    <Player />
  </footer>
</template>

<style></style>
