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
  <div>
    <div v-for="(message, index) in messages" :key="index" class="balloon-left">
      <template v-if="message.contents.type === 'text'">
        <template v-if="hasContents(message.contents)">
          <div class="avatar">
            <v-avatar color="grey lighten-2">
              <v-icon dark large>mdi-account</v-icon>
            </v-avatar>
          </div>
          <div row>
            <p class="username">{{ userStore.username }}</p>
            <p class="text-preview">{{ message.contents.text }}</p>
          </div>
        </template>
      </template>
      <template v-if="message.contents.type === 'image'">
        <template v-if="hasContents(message.contents)">
          <div class="avatar">
            <v-avatar color="grey lighten-2">
              <v-icon dark large>mdi-account</v-icon>
            </v-avatar>
          </div>
          <div row>
            <p class="username">{{ userStore.username }}</p>
            <v-img class="image-preview" :src="message.contents.previewImageUrl" max-width="180" contain> </v-img>
          </div>
        </template>
      </template>
      <template v-if="message.contents.type === 'imagemap'">
        <template v-if="hasContents(message.contents)">
          <div class="avatar">
            <v-avatar color="grey lighten-2">
              <v-icon dark large>mdi-account</v-icon>
            </v-avatar>
          </div>
          <div row>
            <p class="username">{{ userStore.username }}</p>
            <v-img class="image-preview" :src="imagemapUrl(message.contents.imagemapRenderingPayload.baseUrl)" max-width="180" contain> </v-img>
          </div>
        </template>
      </template>
      <template v-if="message.contents.type === 'flex'">
        <template v-if="hasContents(message.contents)">
          <div class="avatar">
            <v-avatar color="grey lighten-2">
              <v-icon dark large>mdi-account</v-icon>
            </v-avatar>
          </div>
          <div row class="flex-preview">
            <p class="username">{{ userStore.username }}</p>
              <template>
                <BubbleFlexPreview :message="message.contents.flexPayload.payload"/>
              </template>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import BubbleFlexPreview from "../DistributionCreation/fragments/BubbleFlexPreview.vue";

const RENDER_COMPONENTS = {
  text: "text",
  image: "image",
};

export default Vue.extend({
  components: { BubbleFlexPreview },
  mixins: [],
  props: {
    messages: Array,
  },
  computed: {
    ...mapState({
      userStore: (state: any) => state.auth.user,
    }),
  },
  methods: {
    hasContents(value: any): boolean {
      switch (value.type) {
        case "text":
          return value.text.length !== 0 && value.text.trim().length !== 0;
        case "image":
          return value.previewImageUrl.length !== 0;
        case "imagemap":
          return value.imagemapRenderingPayload && value.imagemapRenderingPayload.baseUrl;
        case "flex":
          return value.flexPayload.validateResult && value.flexPayload.payload;
      }
    },
    imagemapUrl(baseUrl): string {
      return baseUrl.startsWith("data:") ? baseUrl : baseUrl + '/1040'
    }
  },
  data() {
    return {};
  },
  created() {},
});
</script>

<style>
.balloon-left {
  margin: 10px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.balloon-left {
  margin-right: 20px;
}

.avatar {
  margin: 10px 20px 0 0;
}

.username {
  color: white;
  margin: 0 !important;
}

.text-preview {
  margin: 0 !important;
  font-size: small;
  max-width: 210px;
  display: inline-block;
  flex-wrap: wrap;
  position: relative;
  word-wrap: break-word;
  padding: 10px 15px 10px 15px;
  border-radius: 12px;
  background: white;
  box-sizing: border-box;
  line-height: 1.5;
  white-space: pre-line;
}

.image-preview {
  border-radius: 12px;
}

.text-preview:after {
  content: "";
  position: absolute;
  top: 10px;
  border: 10px solid transparent;
}

.balloon-left .text-preview:after {
  left: -20px;
  border-right: 22px solid white;
}
</style>
