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
  width: 14em;
}
.preview-text-content {
  padding: 0.25em;
  font-size: small;
  position: relative;
  z-index: 2;
  margin-bottom: 0em !important;
  white-space: pre-line;
}
.preview-button-template-image {
  height: 10em;
  width: 100%;
}
.preview-button-title {
  padding-left: 1em;
  width: 95%;
  font-weight: bold;
}
.preview-button-text {
  width: 95%;
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
  <v-container>
    <div class="preview-text-message">
      <div class="preview-text-content">
        <template
          v-if="
            message.thumbnailImageUrl != null && message.thumbnailImageUrl != '' && message.thumbnailImageUrl != 'none'
          "
        >
          <img
            v-if="
              message.thumbnailImageUrl &&
              message.thumbnailImageUrl.startsWith &&
              message.thumbnailImageUrl.startsWith('data:image')
            "
            v-bind:src="message.thumbnailImageUrl"
            onclick="window.open(this.src)"
            :class="[
              'preview-button-template-image',
              message.imageSize == 'contain' ? 'image-fit-contain' : 'image-fit-cover',
            ]"
          />
          <img
            v-else
            v-bind:src="message.thumbnailImageUrl + '?x-request=html'"
            onclick="window.open(this.src)"
            :class="[
              'preview-button-template-image',
              message.imageSize == 'contain' ? 'image-fit-contain' : 'image-fit-cover',
            ]"
          />
        </template>
        <v-row>
          <label class="preview-button-title">{{ message.title }}</label>
        </v-row>
        <v-row>
          <label class="preview-button-text">{{ message.text }}</label>
        </v-row>
        <v-divider></v-divider>
        <template v-for="(action, index) in message.actionCount">
          <v-row align="center" justify="center" :key="'actiondisplay_' + index" class="preview-button-option">
            {{ message["actions." + index].label }}
          </v-row>
        </template>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "ButtonTemplatePreview",
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
