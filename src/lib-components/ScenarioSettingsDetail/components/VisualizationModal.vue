<!-- 
Copyright 2021 LINE Fukuoka Corporation * * LINE Corporation licenses this
file to you under the Apache License, * version 2.0 (the "License"); you may not
use this file except in compliance * with the License. You may obtain a copy of
the License at: * * https://www.apache.org/licenses/LICENSE-2.0 * * Unless
required by applicable law or agreed to in writing, software * distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT * WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the * License for the
specific language governing permissions and limitations * under the License. 
-->
<template>
  <v-dialog scrollable v-model="show">
    <v-card>
      <v-system-bar color="primary" dark height="5"> </v-system-bar>
      <v-toolbar flat>
        <v-toolbar-title>全体構成</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="closeComponent">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-container fluid style="overflow-x: auto">
        <FlowChart :chartId="selectedTalk" :dataSource="dataSource" @nodeClick="onNodeClick" />
      </v-container>

      <v-divider></v-divider>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import FlowChart from "@/components/FlowChart/index.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { cloneDeep } from "lodash";
import { BOT_ITEM_TYPES } from "../../../../store/modules/scenarios/scenarios.constants";

interface LocalState {
  dataSource: any;
}

export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
    selectedTalk: String,
  },
  data(): LocalState {
    return {
      dataSource: null
    };
  },
  watch: {
    visible(val) {
      if (val) {
        if (this.selectedTalk && this.selectedTalk !== "") {
          this.dataSource = this.diagramChartSourceByTalk(this.selectedTalk);
        } else {
          if (this.scenarioTalks) this.dataSource = this.diagramChartSource;
        }
      }
    },
    diagramChartSource: {
      deep: true,
      immediate: true,
      handler() {
        if (this.selectedTalk && this.selectedTalk !== "" && !this.isLbdWebTalk(this.selectedTalk)) {
          this.dataSource = this.diagramChartSourceByTalk(this.selectedTalk);
        }
      },
    },
  },
  components: { FlowChart },
  computed: {
    ...mapState({
      scenarioTalks: (state: any) => state.scenarios.scenarioTalks,
      scenarioMessages: (state: any) => state.scenarios.scenarioMessages,
      userMessages: (state: any) => state.scenarios.userMessages,
      scenarioTextMap: (state: any) => state.scenarios.scenarioTextmap,
    }),
    ...mapGetters(["diagramChartSource", "diagramChartSourceByTalk"]),
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
  },
  methods: {
    closeComponent(): void {
      this.show = false;
    },
    onNodeClick(id: any): void {
      this.$emit("nodeClick", id);
    },
    isLbdWebTalk(talkName: any): boolean {
      if (!this.scenarioTalks) {
        return false;
      }
      return (
        this.scenarioTalks.findIndex((talk) => talk.params.name === talkName && talk.params.editor === "lbd-web") !== -1
      );
    },
  },
  created() {
    this.dataSource = this.diagramChartSource || [];
  }
});
</script>
