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
.tab-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.tab-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.tab-header-title {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.tab-header-title-item,
.tab-header-indicator {
  display: flex;
  justify-content: center;
}
.tab-header-indicator-item {
  width: 0.333em;
  opacity: 0.4;
}
.tab-header-indicator-item-active {
  opacity: 1;
}
.tab-header-move-button {
  min-width: 0 !important;
  padding: 0 0.5em !important;
}
</style>

<template>
  <div class="tab-root">
    <div class="tab-header">
      <v-btn class="tab-header-move-button" color="#FFFFFF" :disabled="index === 0" @click="onClickBackButton()">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="tab-header-title">
        <div class="tab-header-title-item">{{ title }}</div>
        <div class="tab-header-indicator">
          <span v-for="(tab, i) in tabs" :key="i">
            <v-icon
              :class="
                i === index ? 'tab-header-indicator-item tab-header-indicator-item-active' : 'tab-header-indicator-item'
              "
              >mdi-circle-small</v-icon
            >
          </span>
        </div>
      </div>
      <v-btn
        class="tab-header-move-button"
        color="#FFFFFF"
        :disabled="index === tabs.length - 1"
        @click="onClickNextButton()"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>
    <div class="tab-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

interface LocalState {
  index: number;
  tabs: Array<any>;
  title: string;
}

export default Vue.extend({
  name: "Tabs",
  props: {},
  data(): LocalState {
    return {
      index: -1,
      tabs: [],
      title: "",
    };
  },
  watch: {},
  components: {},
  created() {
    this.tabs = this.$slots.default;
    if (this.tabs.length > 0) {
      this.index = 0;
    }
  },
  mounted() {
    if (this.index >= 0) {
      this.select();
    }
  },
  computed: {},
  methods: {
    onClickBackButton(): void {
      if (this.index !== 0) {
        this.index = this.index - 1;
        this.select();
      }
    },
    onClickNextButton(): void {
      if (this.index < this.tabs.length) {
        this.index = this.index + 1;
        this.select();
      }
    },
    select(index: any = -1): void {
      if (index < 0) {
        index = this.index;
      }
      this.tabs.forEach((tab, i) => {
        console.log(tab);
        if (i === index) {
          tab.child.active = true;
          this.title = tab.child.title;
        } else {
          tab.child.active = false;
        }
      });
    },
  },
});
</script>
