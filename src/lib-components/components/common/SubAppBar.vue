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
  <div
      class="sub-app-bar-container"
      :style="!followContainer ? 'margin-top: -12px;' : ''"
  >
    <v-toolbar
        class="sub-app-bar"
        :style="$props.full ? 'flex-direction: row;' : 'flex-direction: column; display: flex; left: 0;'"
        absolute
        min-width="100%"
        width="100%"
        min-height="64px"
        height="auto"
        ref="subAppBar"
        elevation="0"
    >
      <v-container :style="dense ? 'padding: 0 !important' : ''">
        <slot/>
      </v-container>
    </v-toolbar>
    <div
        class="sub-app-bar-spacer"
        :style="'width: 100%; height: '+ spacerHeight + 'px;'"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

interface LocalState {
  spacerHeight: number;
  resizeObserver: any;
}

export default Vue.extend({
  props: {
    full: Boolean,
    followContainer: Boolean,
    dense: Boolean,
  },
  data(): LocalState {
    return {
      spacerHeight: 0,
      resizeObserver: null,
    };
  },
  methods: {
    onUpdateSubAppBar(): void {
      if (!this.$refs.subAppBar) {
        this.spacerHeight = 0;
      }
      this.spacerHeight = this.$refs.subAppBar.$el.clientHeight + 16;
    },
  },
  mounted() {
    // @ts-ignore
    this.resizeObserver = new ResizeObserver(() => {
      this.onUpdateSubAppBar();
    });
    this.resizeObserver.observe(this.$refs.subAppBar.$el);
    this.onUpdateSubAppBar();
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
});
</script>

<style scoped>
.sub-app-bar {
  display: flex;
  left: 0;
}

.sub-app-bar-spacer {
  position: relative;
  top: 0;
}

</style>

<style>
.sub-app-bar>.v-toolbar__content{
  padding-bottom: 0px;
  padding-top: 0px;
  min-height: 64px;
}

.sub-app-bar-container>.sub-app-bar-spacer{
  max-height:64px!important;
  height:64px!important;
}
.sub-app-bar-container>header>.v-toolbar__content>.container{
  padding-top:0px;
  padding-bottom:0px;
}
</style>
