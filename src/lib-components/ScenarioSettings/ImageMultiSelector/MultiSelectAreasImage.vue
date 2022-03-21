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
    <div class="image-decorator" ref="image-area">
      <div :style="{ positon: 'relative' }" @mousemove="doMove(null, $event)">
        <img class="original-image" :src="url" alt="Original Image" v-if="url" :width="width" />
        <div
          class="select-areas--overlay"
          :style="{
            opacity: opacityOverlay,
            position: 'absolute',
            width: originImgSize.w + 'px',
            height: originImgSize.h + 'px',
            display: 'block',
          }"
        ></div>

        <div
          :style="{
            'background-color': 'rgb(0, 0, 0)',
            opacity: 0,
            position: 'absolute',
            width: originImgSize.w + 'px',
            height: originImgSize.h + 'px',
            cursor: 'crosshair',
          }"
          @mousedown="mouseDown"
          @mousemove="mouseMove"
        ></div>

        <div v-for="item in areas" :key="item.id" @click="selectAreaClicked">
          <div @mousedown.stop.prevent="startMove(item, $event)" @mousemove="doMove(item, $event)">
            <div
              class="select-areas--outline"
              :style="{
                opacity: 1,
                position: 'absolute',
                cursor: 'default',
                'border-width': '2px',
                'border-style': 'solid',
                'border-color': item.selected ? '#00b900' : 'gray',
                width: item.width + 2 + 'px',
                height: item.height + 2 + 'px',
                left: item.x + posImg.left - 2 + 'px',
                top: item.y + posImg.top - 2 + 'px',
                'z-index': item.z,
              }"
            ></div>
            <div
              class="select-areas--background_area"
              :style="{
                opacity: 1,
                position: 'absolute',
                cursor: 'move',
                width: item.width + 'px',
                height: item.height + 'px',
                left: item.x + posImg.left + 'px',
                top: item.y + posImg.top + 'px',
                'z-index': item.z + 2,
              }"
              @click="changeResizable(item.id)"
            ></div>
            <!-- resize handler -->
            <Resizable :item="item" :posImg="posImg" @startDrag="startDrag" @doDrag="doDrag" />
          </div>
        </div>
      </div>
      <div class="c-crop--hide_main" :style="{ 'user-select': 'none' }">
        <img id="c-crop--hide_img" :src="url" alt="" :width="width" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Resizable from "./Resizable.vue";
import cloneDeep from "lodash/cloneDeep";

interface LocalState {
  mousedown: boolean;
  originImgSize: any;
  url:  any;
  posImg: any;
  areas: Array<any>;
  moveTempX: number;
  moveTempY: number;
  moveCurrentX: number;
  moveCurrentY: number;
  temp: number;
  tempStartX: any;
  tempStartY: any;
  tempRightBound: any;
  tempBottomBound: any;
  dragdown: boolean;
  move: boolean;
}

export default Vue.extend({
  name: "MultiSelectAreasImage",
  data(): LocalState {
    return {
      mousedown: false, // state mouse down event
      originImgSize: {
        // root size image
        w: 0,
        h: 0,
        r: 0,
      },
      url: null,
      posImg: {
        // position box image in screen
        top: -100000,
        left: -100000,
      },
      areas: [],
      moveTempX: 0,
      moveTempY: 0,
      moveCurrentX: 0,
      moveCurrentY: 0,
      temp: 0,
      tempStartX: null,
      tempStartY: null,
      tempRightBound: null,
      tempBottomBound: null,
      dragdown: false, // state mouse event drag,
      move: false,
    };
  },
  props: {
    cropUrl: {
      type: String,
      default: null,
    },
    width: {
      type: Number,
      default: 1500,
    },
    height: {
      type: Number,
      default: 250,
    },
    opacityOutline: {
      type: Number,
      default: 0.5,
    },
    opacityOverlay: {
      type: Number,
      default: 0.5,
    },
    displayAreas: Array,
    emitAreaEvent: {
      type: Boolean,
      default: true,
    },
    ignoreWatchArea: {
      type: Boolean,
      default: false,
    },
    scrollTop: {
      type: Number,
      default: 0,
    },
    scrollLeft: {
      type: Number,
      default: 0,
    }
  },
  components: {
    Resizable,
  },
  created() {
    this.url = this.cropUrl;
    this.mouseUp = this.mouseUp.bind(this);
    this.endMove = this.endMove.bind(this);
    this.endDrag = this.endDrag.bind(this);
  },
  watch: {
    cropUrl(val) {
      this.url = val;
      if (val == null) {
        this.areas = [];
      }
      setTimeout(() => {
        this.setSize();
      }, 200);
    },
    // send data to parent when list areas change
    areas() {
      if (!this.ignoreWatchArea) {
        setTimeout(() => {
          this.getListAreas();
        }, 200);
      }
    },
    displayAreas: {
      immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.areas = cloneDeep(val);
        }
      },
    },
  },
  methods: {
    async setSize(): Promise<void> {
      if (!this.url) {
        return;
      }
      let imgSize = await this.getSize(this.url);
      this.originImgSize = imgSize;
    },
    // Get the size of the src image
    getSize(src: any): Promise<any> {
      let _this = this;
      let img = this.$el.querySelector("#c-crop--hide_img");
      return new Promise((resolve) => {
        if (src && img) {
          img.onload = function (event) {
            // Compatible with unacceptable size
            const size = _this.getSizeImg(img);
            resolve(size);
          };
          img.src = src;
        } else {
          resolve({
            w: 0,
            h: 0,
            r: 0,
          });
        }
      });
    },
    getSizeImg(img: any): any {
      let w = img.width;
      let h = img.height;
      let r = w === 0 && h === 0 ? 0 : w / h;
      return {
        w: w,
        h: h,
        r: r,
      };
    },
    calcPosOfBox(): void {
      // set posImg static
      let ref = this.$refs["image-area"];
      if (ref && !this.dragdown) {
        this.posImg.top = ref.getBoundingClientRect().top == 0 ? -100000 : ref.getBoundingClientRect().top + this.scrollTop;
        this.posImg.left = ref.getBoundingClientRect().left == 0 ? -100000 : ref.getBoundingClientRect().left + this.scrollLeft;
      }
    },
    // draw rectangle on image mouseDown mouseMove mouseUp
    mouseDown(e: any): any {
      if (e.path.find((path) => path.classList && path.classList.contains("rich-menu-properties-col"))) {
        // NOTE: we should ignore event
        return true;
      }

      if (this.areas.length < 20) {
        this.mousedown = true;

        this.areas
          .filter((item) => item.selected)
          .map((item) => {
            item.selected = false;
            item.z = 0;
            item.resizable = false;
          });
        if (this.areas.length > 0) {
          let idArea = this.areas.slice(-1).pop().id; // get last areas
          if (idArea) {
            this.areas.push({
              id: idArea + 1,
              x: e.pageX - this.posImg.left,
              y: e.pageY - this.posImg.top,
              width: 0,
              height: 0,
              z: 100,
              resizable: false,
              selected: true,
            });
            this.temp = idArea + 1;
          }
        } else {
          this.areas.push({
            id: 1,
            x: e.pageX - this.posImg.left,
            y: e.pageY - this.posImg.top,
            width: 0,
            height: 0,
            z: 100,
            resizable: false,
            selected: true,
          });
          this.temp = 1;
        }

        var fixedYScrollOffset = window.pageYOffset || document.documentElement.scrollTop;
        this.tempStartX = e.pageX - this.posImg.left;
        this.tempStartY = e.pageY - fixedYScrollOffset - this.posImg.top;
      }
    },
    mouseMove(e: any): void {
      //Use this to draw
      if (this.mousedown) {
        this.drawRectangle(e);
      }
    },
    mouseUp(e: any): void {
      if (!this.mousedown) {
        return;
      }

      this.drawRectangle(e);
      this.tempStartX = null;
      this.tempStartY = null;
      this.mousedown = false;
      this.areas
        .filter((item) => item.selected)
        .map((item) => {
          item.resizable = true;
        });
      // delete all point width is = 0
      this.areas = this.areas.filter((item) => item.width !== 0 || item.height !== 0);
      this.getListAreas();
    },
    // after click rectangle area select active resizable and dragable
    changeResizable(id: any): void {
      this.areas
        .filter((item) => item.id === id)
        .map((item) => {
          item.resizable = true;
          item.z = 100;
        });
      this.areas
        .filter((item) => item.id !== id)
        .map((item) => {
          item.resizable = false;
          item.z = 0;
        });
    },
    drawRectangle(e: any): void {
      if (this.tempStartX && this.tempStartY) {
        var fixedYScrollOffset = window.pageYOffset || document.documentElement.scrollTop;
        var oldX = this.tempStartX;
        var oldY = this.tempStartY;
        var newX = e.pageX - this.posImg.left;
        var newY = e.pageY - fixedYScrollOffset - this.posImg.top;
        if (newX < 0) {
          newX = 0;
        }
        if (newX > this.originImgSize.w) {
          newX = this.originImgSize.w;
        }
        if (newY < 0) {
          newY = 0;
        }
        if (newY > this.originImgSize.h) {
          newY = this.originImgSize.h;
        }
        this.areas
          .filter((x) => x.id === this.temp)
          .map((item) => {
            item.x = newX < oldX ? newX : oldX;
            item.y = newY < oldY ? newY : oldY;
            item.width = newX < oldX ? oldX - newX : newX - oldX;
            item.height = newY < oldY ? oldY - newY : newY - oldY;
          });
      }
    },
    // delete item area
    deleteSelected(id: any): void {
      this.areas = this.areas.filter((item) => item.id !== id);
    },
    // drag point around rectangle on image startDrag doDrag endDrag
    startDrag(item: any): void {
      this.dragdown = true;
      this.tempRightBound = item.x + item.width;
      this.tempBottomBound = item.y + item.height;
    },
    doDrag(item: any, type: any, e: any): void {
      if (this.dragdown) {
        switch (type) {
          case "w":
            // fix drag outside box w position
            this.handleDragWest(item, e);
            break;
          case "sw":
            // fix drag outside box sw position
            this.handleDragSouth(item, e);
            this.handleDragWest(item, e);
            break;
          case "s":
            // fix drag outside box s position
            this.handleDragSouth(item, e);
            break;
          case "se":
            // fix drag outside box se position
            this.handleDragSouth(item, e);
            this.handleDragEast(item, e);
            break;
          case "e":
            // fix drag outside box e position
            this.handleDragEast(item, e);
            break;
          case "ne":
            // fix drag outside box ne position
            this.handleDragNorth(item, e);
            this.handleDragEast(item, e);
            break;
          case "n":
            // fix drag outside box n position
            this.handleDragNorth(item, e);
            break;
          case "nw":
            // fix drag outside box nw position
            this.handleDragNorth(item, e);
            this.handleDragWest(item, e);
            break;
          default:
            break;
        }
      }
    },
    endDrag(): void {
      if (!this.dragdown) {
        return;
      }

      this.dragdown = false;
      this.tempRightBound = null;
      this.tempBottomBound = null;
      this.getListAreas();
    },
    // Helpers for the dragging directions
    handleDragNorth(item: any, e: any): void {
      var fixedYScrollOffset = window.pageYOffset || document.documentElement.scrollTop;
      var fixedPageY = e.pageY - fixedYScrollOffset;
      if (fixedPageY - this.posImg.top >= 0) {
        if (fixedPageY - this.posImg.top <= this.tempBottomBound) {
          item.height = item.height + (item.y + this.posImg.top - fixedPageY);
          item.y = fixedPageY - this.posImg.top;
        } else {
          item.y = this.tempBottomBound;
          item.height = 0;
        }
      } else {
        item.y = 0;
        item.height = this.tempBottomBound;
      }

      if (item.height < 0) {
        item.height = 0;
      }
    },
    handleDragEast(item: any, e: any): void {
      if (e.pageX - this.posImg.left <= this.originImgSize.w) {
        item.width = e.pageX - this.posImg.left - item.x;
      } else {
        item.width = this.originImgSize.w - item.x;
      }

      if (item.width < 0) {
        item.width = 0;
      }
    },
    handleDragWest(item: any, e: any): void {
      if (e.pageX - this.posImg.left >= 0) {
        if (e.pageX - this.posImg.left <= this.tempRightBound) {
          item.x = e.pageX - this.posImg.left;
          item.width =
            this.tempRightBound - (e.pageX - this.posImg.left) < 0
              ? 0
              : this.tempRightBound - (e.pageX - this.posImg.left);
        } else {
          item.x = this.tempRightBound;
          item.width = 0;
        }
      } else {
        item.x = 0;
        item.width = this.tempRightBound;
      }

      if (item.width < 0) {
        item.width = 0;
      }
    },
    handleDragSouth(item: any, e: any): void {
      var fixedYScrollOffset = window.pageYOffset || document.documentElement.scrollTop;
      var fixedPageY = e.pageY - fixedYScrollOffset;
      if (fixedPageY - this.posImg.top <= this.originImgSize.h) {
        item.height = fixedPageY - this.posImg.top - item.y;
      } else {
        item.height = this.originImgSize.h - item.y;
      }

      if (item.height < 0) {
        item.height = 0;
      }
    },
    // move rectangle area startMove doMove endMove
    startMove(item: any, e: any): void {
      this.areas.forEach((elem) => {
        elem.selected = false;
        elem.resizable = false;
        elem.z = 0;
      });
      item.selected = true;
      item.resizable = true;
      item.z = 100;
      this.move = true;
      this.moveTempX = e.clientX;
      this.moveTempY = e.clientY;
      this.moveCurrentX = item.x;
      this.moveCurrentY = item.y;
      this.getListAreas();
    },
    doMove(item: any, e: any): void {
      if (this.move && item && item.selected) {
        let x = this.moveCurrentX + (e.clientX - this.moveTempX);
        let y = this.moveCurrentY + (e.clientY - this.moveTempY);
        let maxX = this.originImgSize.w - item.width;
        let maxY = this.originImgSize.h - item.height;
        item.x = x < 0 ? 0 : x > maxX ? maxX : x;
        item.y = y < 0 ? 0 : y > maxY ? maxY : y;
      } else if (this.move) {
        this.areas
          .filter((item) => item.selected)
          .map((item) => {
            if (item) {
              let x = this.moveCurrentX + (e.clientX - this.moveTempX);
              let y = this.moveCurrentY + (e.clientY - this.moveTempY);
              let maxX = this.originImgSize.w - item.width;
              let maxY = this.originImgSize.h - item.height;
              item.x = x < 0 ? 0 : x > maxX ? maxX : x;
              item.y = y < 0 ? 0 : y > maxY ? maxY : y;
            }
          });
      } else if (this.mousedown) {
        this.drawRectangle(e);
      }
    },
    endMove(): void {
      if (!this.move) {
        // NOTE: we should ignore event
        return;
      }

      this.move = false;
      this.getListAreas();
    },
    // send data from child to parent $emit
    getListAreas(): void {
      if (this.emitAreaEvent) {
        this.$emit("getListAreas", this.areas);
      } else {
        this.areas = [];
      }
    },
    // send data from child to parent about area being clicked
    selectAreaClicked(): void {
      this.$emit("selectAreaClicked");
    },
  },
  updated() {
    setTimeout(() => {
      this.calcPosOfBox();
    }, 200);
  },
  mounted() {
    this.setSize();
    //window.addEventListener('mousemove', this.calcPosOfBox)
    this.calcPosOfBox();
    window.addEventListener("mouseup", this.mouseUp);
    window.addEventListener("mouseup", this.endMove);
    window.addEventListener("mouseup", this.endDrag);
  },
  beforeDestroy() {
    window.removeEventListener("mouseup", this.mouseUp);
    window.removeEventListener("mouseup", this.endMove);
    window.removeEventListener("mouseup", this.endDrag);
  },
});
</script>

<style lang="scss" scoped>
.c-crop {
  display: inline-block;
  * {
    box-sizing: border-box;
  }
  img {
    pointer-events: none;
  }
  .c-crop--hide_main {
    width: 0;
    height: 0;
    overflow: hidden;
  }
}
.original-image {
  position: absolute;
}
.select-areas {
  &--overlay {
    overflow: hidden;
    position: absolute;
  }
  &--delete_area {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfjCB0SCQuXtRLQAAABRklEQVQoz4XRMUiUcQCG8V//O6MhuuEwI4VDDg9ubDCC+ILzIgcFySEnP2wOkqDRMffAa+3wpqDBSRAPp6MlC+yTFsnS0EzBursp8ECHS3AIetYXXnjfhy5B2SuJlpZPKkaEbnAJDJh33w/v7SLntpvq5uz5G69IPFWUlZGRVTQrsaK/W74o8UiftHPS+kxJVIWUkucWLHvilkO/kfdY5K2OaR+DSQfqjrWNmzFkyIxxbcdWHZpMi7xzpGNJxl29KGhY0nFk3b0gZ0cH22q2lJVtqdnGiW9ywX8Idg3qQV6sYM2aglgePQbtpDXc0avpoUhDDbFIy0vXDWuk/BH76avIpje++OW7lGs+mzBqnqAqMfWPoza9FlJOfVAy5kTTqcuuuCpnwqx9z7S7svq98MDBBVk31M3Zv7hmRMWGpqYNC0rnus8AXqJjvC9MrWIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMDgtMjlUMTY6MDk6MTErMDI6MDDV30hTAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTA4LTI5VDE2OjA5OjExKzAyOjAwpILw7wAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=);
    cursor: pointer;
    height: 16px;
    width: 16px;
  }
}
.delete-area {
  position: absolute;
  cursor: pointer;
  padding: 5px;
}
</style>
