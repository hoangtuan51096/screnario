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
  <div class="preview-container">
    <div class="line-header">
      <div class="line-toolbar">
        <v-row class="px-2">
          <v-col class="text-center">
            <div>プレビュー</div>
          </v-col>
        </v-row>
      </div>
    </div>
    <div class="content">
      <v-container class="talk-content">
        <template>
          <TalkRendering :messages="messages" ref="talkRendering" />
        </template>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import TalkRendering from "@/pages/admin/SegmentDelivery/TalkRendering/index.vue";

export default Vue.extend({
  components: { TalkRendering },
  props: {
    messages: Array,
  },
  computed: {},
  methods: {},
});
</script>

<style lang="less">
.preview-container .content {
  max-width: 320px;
  width: 320px;
  height: 480px;
  overflow-y: auto;
  background: #666f86;
}

.line-header {
  background: white;
}

.line-toolbar {
  background-color: #353a3f;
  div {
    color: white;
  }
}

.talk-content {
  padding: 5px !important;
  background-color: #666f86;
}
</style>
