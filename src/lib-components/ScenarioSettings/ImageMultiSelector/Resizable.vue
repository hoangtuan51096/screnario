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
  <div class="handler">
    <!-- resize handler -->
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler w"
      :style="{
        position: 'absolute',
        cursor: 'w-resize',
        display: 'block',
        left: item.x + posImg.left - 6 + 'px',
        top: item.y + posImg.top + item.height / 2 - 4 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 'w')"
    ></div>
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler sw"
      :style="{
        position: 'absolute',
        cursor: 'sw-resize',
        display: 'block',
        left: item.x + posImg.left - 4 + 'px',
        top: item.y + posImg.top + item.height - 6 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 'sw')"
    ></div>
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler s"
      :style="{
        position: 'absolute',
        cursor: 's-resize',
        display: 'block',
        left: item.x + posImg.left + item.width / 2 - 4 + 'px',
        top: item.y + posImg.top + item.height - 6 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 's')"
    ></div>
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler se"
      :style="{
        position: 'absolute',
        cursor: 'se-resize',
        display: 'block',
        left: item.x + posImg.left + item.width - 6 + 'px',
        top: item.y + posImg.top + item.height - 6 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 'se')"
    ></div>
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler e"
      :style="{
        position: 'absolute',
        cursor: 'e-resize',
        display: 'block',
        left: item.x + posImg.left + item.width - 6 + 'px',
        top: item.y + posImg.top + item.height / 2 - 6 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 'e')"
    ></div>
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler ne"
      :style="{
        position: 'absolute',
        cursor: 'ne-resize',
        display: 'block',
        left: item.x + posImg.left + item.width - 6 + 'px',
        top: item.y + posImg.top - 4 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 'ne')"
    ></div>
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler n"
      :style="{
        position: 'absolute',
        cursor: 'n-resize',
        display: 'block',
        left: item.x + posImg.left + item.width / 2 - 4 + 'px',
        top: item.y + posImg.top - 4 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 'n')"
    ></div>
    <div
      v-if="item.resizable"
      class="select-areas-resize-handler nw"
      :style="{
        position: 'absolute',
        cursor: 'nw-resize',
        display: 'block',
        left: item.x + posImg.left - 4 + 'px',
        top: item.y + posImg.top - 4 + 'px',
        'z-index': item.z + 10,
      }"
      @mousedown.stop.prevent="startDrag(item, 'nw')"
    ></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

interface LocalState {
  pos: any;
}

export default Vue.extend({
  data(): LocalState {
    return {
      pos: null,
    };
  },
  props: {
    item: {
      type: Object,
      default: () => {
        return {
          id: 0,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          z: 0,
          resizable: false,
        };
      },
    },
    posImg: {
      type: Object,
      default: null,
    },
  },
  methods: {
    startDrag(item: any, type: any): void {
      this.pos = type;
      document.addEventListener("mousemove", this.doDrag);
      this.$emit("startDrag", this.item);
    },
    doDrag(e: any): void {
      this.$emit("doDrag", this.item, this.pos, e);
    },
  },
  updated() {
    if (this.item.resizable === false) {
      window.addEventListener("mouseup", (document as any).removeEventListener("mousemove", this.doDrag));
    }
  },
});
</script>

<style lang="scss" scoped>
.select-areas-resize-handler {
  background-color: #00b900;
  height: 8px;
  width: 8px;
  overflow: hidden;
}
</style>
