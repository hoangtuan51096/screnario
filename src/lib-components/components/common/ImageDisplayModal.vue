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
  <v-dialog scrollable max-width="800" v-model="show" transition="slide-y-transition">
    <v-card>
      <p class="text-justify" style="margin-bottom: 0px;">
        <v-img :src="getImageSource" max-width="800"> </v-img>
      </p>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ImageDisplayModal",
  props: {
    visible: Boolean,
    imgSrc: String,
  },
  data() {
    return {};
  },
  computed: {
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          this.$emit("close");
        }
      },
    },
    getImageSource: {
      get() {
        return this.imgSrc;
      },
    },
  },
});
</script>
