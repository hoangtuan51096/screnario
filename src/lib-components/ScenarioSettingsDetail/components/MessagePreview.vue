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
.preview-row {
  width: fit-content;
  margin-left: 1em;
}
.line-preview-header {
  font-weight: bold;
  padding-left: 0.25em;
  background-color: #dfe4ea;
  border-top-left-radius: 0.25em;
  border-top-right-radius: 0.25em;
}
.line-preview-box {
  border-radius: 0.25em;
  background-color: #688bbc;
  width: 100%;
  height: auto;
}
.line-preview-elements {
  display: block;
  justify-content: center;
  overflow: auto;
  overflow-y: auto;
}

.line-preview-elements.carousel {
  justify-content: flex-start;
}
</style>

<style>
.preview-row .container {
  padding-left: 0;
  padding-right: 0;
  display: flex;
}

.preview-row .row,
.preview-row .row + .row {
  margin-top: 0;
  margin-bottom: 0;
}
</style>

<template>
  <div class="line-preview-box">
    <div class="line-preview-header"><v-icon @click="expand = !expand">{{ expand ? "mdi-chevron-down" : "mdi-chevron-right" }}</v-icon>プレビュー</div>
    <div v-if="expand" class="line-preview-elements" :class="messages[0] ? messages[0].dataType : ''">
      <div class="preview-row" v-for="item in messages" :key="item.dataId">
        <v-switch-case :value="item.dataType || ''">
          <template #text>
            <TextPreview :message="item.params" />
          </template>
          <template #imagemap>
            <ImageMapPreview :message="item.params" />
          </template>
          <template #sticker>
            <StickerPreview :message="item.params" />
          </template>
          <template #location>
            <LocationPreview :message="item.params" />
          </template>
          <template #confirm>
            <ConfirmPreview :message="item.params" />
          </template>
          <template #image>
            <ImagePreview :message="item.params" />
          </template>
          <template #audio>
            <AudioPreview :message="item.params" />
          </template>
          <template #video>
            <VideoPreview :message="item.params" />
          </template>
          <template #buttons>
            <ButtonTemplatePreview :message="item.params" />
          </template>
          <template #carousel>
            <CarouselPreview :message="item.params" />
          </template>
          <template #richmenu>
            <RichMenuPreview :message="item.params" />
          </template>
          <template #bubbleFlex>
            <BubbleFlexPreview :message="item.params" />
          </template>
          ]
          <template #carouselFlex>
            <CarouselFlexPreview :message="item.params" />
          </template>
          <template #__INITIAL__>
            <div class="my-5 pl-6" style="height: 60px"></div>
          </template>
          <template #default>
            <div class="my-5 pl-6" style="height: 60px">{{ item.dataType }} : 未対応</div>
          </template>
        </v-switch-case>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";
import VSwitchCase from "@/components/common/VSwitchCase.vue";
import ImagePreview from "../previewComponents/ImagePreview.vue";
import ImageMapPreview from "../previewComponents/ImageMapPreview.vue";
import VideoPreview from "../previewComponents/VideoPreview.vue";
import TextPreview from "../previewComponents/TextPreview.vue";
import LocationPreview from "../previewComponents/LocationPreview.vue";
import StickerPreview from "../previewComponents/StickerPreview.vue";
import ConfirmPreview from "../previewComponents/ConfirmPreview.vue";
import ButtonTemplatePreview from "../previewComponents/ButtonTemplatePreview.vue";
import AudioPreview from "../previewComponents/AudioPreview.vue";
import CarouselPreview from "../previewComponents/CarouselPreview.vue";
import RichMenuPreview from "../previewComponents/RichMenuPreview.vue";
import BubbleFlexPreview from "../previewComponents/BubbleFlexPreview.vue";
import CarouselFlexPreview from "../previewComponents/CarouselFlexPreview.vue";

export default Vue.extend({
  name: "MessagePreview",
  props: {
    messages: Array,
  },
  data() {
    return {
      expand: true,
    };
  },
  watch: {},
  components: {
    VSwitchCase,
    ImagePreview,
    VideoPreview,
    TextPreview,
    ImageMapPreview,
    StickerPreview,
    LocationPreview,
    ConfirmPreview,
    ButtonTemplatePreview,
    AudioPreview,
    CarouselPreview,
    RichMenuPreview,
    BubbleFlexPreview,
    CarouselFlexPreview,
  },
  computed: {
    ...mapState({}),
  },
  methods: {},
});
</script>
