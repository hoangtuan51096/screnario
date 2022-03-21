<!--
Copyright 2021 LINE Fukuoka Corporation

LINE Corporation licenses this file to you under the Apache License,
version 2.0 (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at:

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations
under the License.
-->
<style scoped>
.preview-text-message {
  border-radius: 0.25em;
  background-color: white;
  display: flex;
  width: 14em;
}
.preview-text-content {
  padding: 0.25em;
  font-size: small;
  position: relative;
  z-index: 2;
  margin-bottom: 0em !important;
  display: flex;
}
.on {
  display: block;
}
.off {
  display: none;
}
.content-wrap {
  position: relative;
  display: flex;
  width: 200px;
  height: 42px;
}
.button-wrap {
  margin-top: 10px;
  margin-left: 14px;
  width: 22px;
  height: 22px;
}
#play {
  width: 22px;
  height: 22px;
  background: url("~@/assets/line-message-items/audio_play.png") no-repeat;
  background-size: 22px 22px;
}
#stop {
  width: 22px;
  height: 22px;
  background: url("~@/assets/line-message-items/audio_pause.png") no-repeat;
  background-size: 22px 22px;
}
.audio-animation-wrap {
  display: flex;
  top: 15px;
  right: 10px;
  height: 12px;
  align-items: center;
  margin-top: 1em;
}
.audio-animation-bar {
  width: 2px;
  height: 100%;
  background-color: #3496fc;
  margin-right: 2px;
}
.time-wrap {
  display: flex;
  margin-left: 5px;
  width: 90px;
  justify-content: left;
}
.min {
  margin-top: 11px;
  text-align: left;
  font-size: 17px;
  font-weight: 600;
}
.colon {
  margin-top: 11px;
  margin-right: 1px;
  text-align: left;
  font-size: 17px;
  font-weight: 600;
}
.sec {
  margin-top: 11px;
  text-align: left;
  font-size: 17px;
  font-weight: 600;
}
.audio-animation-wrap.animation-on .duration1 {
  animation-duration: 2s;
}
.audio-animation-wrap.animation-on .duration2 {
  animation-duration: 3s;
}
.audio-animation-wrap.animation-on .duration3 {
  animation-duration: 3.5s;
}
.audio-animation-wrap.animation-on .duration4 {
  animation-duration: 1.5s;
}
.audio-animation-wrap.animation-on .duration5 {
  animation-duration: 2.5s;
}
.audio-animation-wrap.animation-on .duration6 {
  animation-duration: 3.25s;
}

.audio-animation-wrap.animation-on .audio-animation-bar {
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.wave-animation {
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.height100 {
  animation: wave3;
}

.height60 {
  animation: wave2;
}

.height30 {
  animation: wave;
}

@keyframes wave {
  0%,
  100% {
    transform: scale(0.3);
  }
  16.67% {
    transform: scaleY(0.6);
  }
  33.33% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(0.6);
  }
  66.67% {
    transform: scaleY(0.3);
  }
  83.34% {
    transform: scaleY(0.6);
  }
}

@keyframes wave2 {
  0%,
  100% {
    transform: scale(0.6);
  }
  16.67% {
    transform: scaleY(0.9);
  }
  33.33% {
    transform: scaleY(0.6);
  }
  50% {
    transform: scaleY(0.9);
  }
  66.67% {
    transform: scaleY(0.6);
  }
  83.34% {
    transform: scaleY(0.9);
  }
}

@keyframes wave3 {
  0%,
  100% {
    transform: scale(0.3);
  }
  16.67% {
    transform: scaleY(0.9);
  }
  33.33% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(0.9);
  }
  66.67% {
    transform: scaleY(0.3);
  }
  83.34% {
    transform: scaleY(0.9);
  }
}

.tri-right.left-top:after {
  content: " ";
  position: relative;
  width: 0;
  height: 0;
  left: -12.75em;
  right: auto;
  top: 0.25em;
  bottom: auto;
  border: 22px solid;
  border-color: white transparent transparent transparent;
  z-index: 1;
}
</style>

<template>
  <v-container>
    <div class="preview-text-message tri-right left-top">
      <div class="preview-text-content">
        <div class="button-wrap" @click="clickThePlayButton">
          <div id="play" :class="{ on: !isPlaying, off: isPlaying }"></div>
          <div id="stop" :class="{ on: isPlaying, off: !isPlaying }"></div>
          <audio
            id="audio"
            v-on:ended="audioEndedNaturally"
            v-if="message.originalContentUrl.startsWith('data:audio')"
            source
            :src="message.originalContentUrl"
            type="audio/mpeg"
          ></audio>
          <audio
            id="audio"
            v-on:ended="audioEndedNaturally"
            v-else
            source
            :src="message.originalContentUrl + '?x-request=html'"
            type="audio/mpeg"
          >
            >
          </audio>
        </div>
        <div class="time-wrap">
          <span class="min">{{ originalMinutes }}</span>
          <span class="colon">:</span>
          <span class="sec">{{ originalSeconds }}</span>
        </div>
        <div
          :class="{ 'audio-animation-wrap': true, 'animation-on': isPlaying }"
          style="transform: translatez(0); will-change: transform"
        >
          <div class="audio-animation-bar wave-animation duration1 height60"></div>
          <div class="audio-animation-bar wave-animation duration1 height100"></div>
          <div class="audio-animation-bar wave-animation duration2 height60"></div>
          <div class="audio-animation-bar wave-animation duration3 height60"></div>
          <div class="audio-animation-bar wave-animation duration2 height100"></div>
          <div class="audio-animation-bar wave-animation duration6 height100"></div>
          <div class="audio-animation-bar wave-animation duration3 height100"></div>
          <div class="audio-animation-bar wave-animation duration5 height30"></div>
          <div class="audio-animation-bar wave-animation duration1 height60"></div>
          <div class="audio-animation-bar wave-animation duration3 height100"></div>
          <div class="audio-animation-bar wave-animation duration4 height60"></div>
          <div class="audio-animation-bar wave-animation duration6 height60"></div>
          <div class="audio-animation-bar wave-animation duration2 height100"></div>
          <div class="audio-animation-bar wave-animation duration3 height60"></div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

interface LocalState {
  minuteInMilliseconds: number;
  isPlaying: boolean;
  originalSeconds: number;
  originalMinutes: number;
}

export default Vue.extend({
  name: "AudioPreview",
  props: {
    message: Object,
  },
  data() {
    return {
      minuteInMilliseconds: 60000,
      isPlaying: false,
      originalSeconds: 0,
      originalMinutes: 0,
    };
  },
  watch: {
    "message.duration": function (value) {
      this.originalSeconds = (value % this.minuteInMilliseconds) / 1000;
      if (this.originalSeconds < 10) {
        this.originalSeconds = "0" + this.originalSeconds;
      }
      this.originalMinutes = Math.floor(this.message.duration / this.minuteInMilliseconds);
      if (this.originalMinutes < 10) {
        this.originalMinutes = "0" + this.originalMinutes;
      }
    },
  },
  components: {},
  computed: {
    ...mapState({}),
  },
  methods: {
    audioEndedNaturally(event: any): void {
      this.isPlaying = !this.isPlaying;
    },
    clickThePlayButton(event: any): void {
      var playButton = this.$el.querySelector("#play");
      var pauseButton = this.$el.querySelector("#pause");
      var audio = this.$el.querySelector("#audio");

      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }

      this.isPlaying = !this.isPlaying;
    },
  },
  created() {
    this.originalSeconds = (this.message.duration % this.minuteInMilliseconds) / 1000;
    if (this.originalSeconds < 10) {
      this.originalSeconds = "0" + this.originalSeconds;
    }
    this.originalMinutes = Math.floor(this.message.duration / this.minuteInMilliseconds);
    if (this.originalMinutes < 10) {
      this.originalMinutes = "0" + this.originalMinutes;
    }
  },
});
</script>
