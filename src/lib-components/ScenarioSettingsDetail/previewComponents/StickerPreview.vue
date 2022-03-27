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
<template>
  <v-container class="sticker-preview">
    <img
      :src="require('@/assets/line-stickers/' + message.sticker.packageId + '/' + message.sticker.stickerId + '.png')"
      class="preview-sticker-message"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "StickerPreview",
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

<style lang="less">
.preview-sticker-message {
  height: 10em;
  width: 10em;
}
</style>
