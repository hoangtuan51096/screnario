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
.preview-carousel-container {
  display: -webkit-box;
}
.preview-text-message {
  border-radius: 0.25em;
  background-color: white;
  margin-right: 0.25em;
  width: 14em;
}
.preview-text-content {
  padding: 0.25em;
  font-size: small;
  position: relative;
  z-index: 2;
  margin-bottom: 0em !important;
}
.row.image {
  margin: 0;
}
.preview-button-template-image {
  height: 10em;
  width: -webkit-fill-available;
}
.preview-button-title {
  padding-left: 1em;
  font-weight: bold;
}
.preview-button-text {
  padding-left: 1em;
}
.preview-button-option {
  color: #688bbc;
}
.image-fit-cover {
  object-fit: cover;
}
.image-fit-contain {
  object-fit: contain;
}
</style>

<template>
  <v-container class="preview-carousel-container">
    <template v-for="index in message.columnCount">
      <div class="preview-text-message" v-bind:key="'carousel_' + index">
        <div class="preview-text-content">
          <template
            class="image"
            v-if="
              message['useThumbnailImage'] &&
              (message['thumbnail.' + (index - 1)] != '' || message['thumbnail.' + (index - 1)] != 'none')
            "
          >
            <img
              v-if="message && message['thumbnail.' + (index - 1)] && message['thumbnail.' + (index - 1)].startsWith('data:image')"
              v-bind:src="message['thumbnail.' + (index - 1)]"
              onclick="window.open(this.src)"
              :class="[
                'preview-button-template-image',
                message.imageSize == 'contain' ? 'image-fit-contain' : 'image-fit-cover',
              ]"
            />
            <img
              v-else
              v-bind:src="message['thumbnail.' + (index - 1)] + '?x-request=html'"
              onclick="window.open(this.src)"
              :class="[
                'preview-button-template-image',
                message.imageSize == 'contain' ? 'image-fit-contain' : 'image-fit-cover',
              ]"
            />
          </template>
          <v-row v-if="message['useTitle']">
            <label class="preview-button-title">{{ message["title." + (index - 1)] }}</label>
          </v-row>
          <v-row>
            <label class="preview-button-text">{{ message["text." + (index - 1)] }}</label>
          </v-row>
          <v-divider></v-divider>
          <template v-for="actionIndex in message.actionCount">
            <v-row
              v-if="message['action.' + (index - 1) + '.' + (actionIndex - 1)]"
              align="center"
              justify="center"
              :key="'actiondisplay_' + actionIndex"
              class="preview-button-option"
            >
              {{ message["action." + (index - 1) + "." + (actionIndex - 1)].label }}
            </v-row>
          </template>
        </div>
      </div>
    </template>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "CarouselPreview",
  props: {
    message: Object,
  },
  data() {
    return {};
  },
  watch: {},
  components: {},
  computed: {
    ...mapState({}),
  },
  methods: {},
});
</script>
