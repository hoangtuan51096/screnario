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
.preview-image-message {
  border-radius: 0.25em;
  height: 10em;
  width: 14em;
}
</style>

<template>
  <v-container>
    <img
      v-if="message.previewImageUrl.startsWith('data:image')"
      v-bind:src="message.previewImageUrl"
      onclick="window.open(this.src)"
      class="preview-image-message"
    />
    <img
      v-else
      v-bind:src="message.previewImageUrl + '?x-request=html'"
      onclick="window.open(this.src)"
      class="preview-image-message"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "ImagePreview",
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
