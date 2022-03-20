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
<style lang="less">
.preview-video-message {
  border-radius: 0.25em;
  width: 14em;
}
</style>

<template>
  <v-container>
    <video
      v-if="message.originalContentUrl.startsWith('data:video')"
      controls
      :poster="message.previewImageUrl + '?x-request=html'"
      :src="message.originalContentUrl"
      type="video/mp4"
      class="preview-video-message"
    ></video>
    <video
      v-else
      controls
      :poster="message.previewImageUrl + '?x-request=html'"
      :src="message.originalContentUrl + '?x-request=html'"
      type="video/mp4"
      class="preview-video-message"
    ></video>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "VideoPreview",
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
