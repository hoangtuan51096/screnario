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
.preview-image-map-message {
  border-radius: 0.25em;
  height: 10em;
  width: 14em;
}
</style>

<template>
  <v-container>
    <img
      v-if="message && message.baseUrl && message.baseUrl.startsWith('data:image')"
      v-bind:src="message.baseUrl"
      onclick="window.open(this.src)"
      class="preview-image-map-message"
    />
    <img
      v-else
      v-bind:src="message.baseUrl + '/240?x-request=html'"
      onclick="window.open(this.src)"
      class="preview-image-map-message"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "ImageMapPreview",
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
