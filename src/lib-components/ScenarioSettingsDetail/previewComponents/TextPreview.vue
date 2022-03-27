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
  position: relative;
}

.preview-text-content {
  padding: 0.25em;
  font-size: small;
  position: relative;
  z-index: 2;
  margin-bottom: 0em !important;
  white-space: pre-line;
}

.tri-right.left-top:before {
  content: " ";
  position: absolute;
  width: 0;
  height: 0;
  top: 0;
  left: -22px;
  right: auto;
  bottom: auto;
  display: inline-block;
  border: 10px solid transparent;
  border-right: 25px solid #ffffff;
  -webkit-transform: rotate(22deg);
  transform: rotate(22deg);
  z-index: 1;
}
</style>

<template>
  <v-container class="text-preview">
    <div class="preview-text-message tri-right left-top">
      <p class="preview-text-content">{{ message.text || " " }}</p>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  name: "TextPreview",
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
