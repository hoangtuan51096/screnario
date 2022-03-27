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
  <!-- <div :key="componentKey" id="mermaid" class="mermaid" ref="mermaid">
    {{ parseCode }}
  </div> -->
  <div v-if="dataLocal">
    <content-loading v-if="isLoading" :size="50" text="" />
    <vue-mermaid
      v-else
      :nodes="dataLocal"
      :chartId="chartId"
      :type="chartId ? 'graph LR' : 'graph TD'"
      @nodeClick="onNodeClick"
    ></vue-mermaid>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueMermaid from "../common/VueMermaid.vue";
import { cloneDeep, debounce } from "lodash";

export default Vue.extend({
  props: {
    dataSource: Array,
    chartId: String,
  },
  components: { VueMermaid },
  data() {
    return {
      componentKey: 0,
      isLoading: false,
      dataLocal: [],
    };
  },
  computed: {
    parseCode() {
      let _parseCode = ["graph TD", "userInput([ユーザーテキスト])", "richMenu([リッチメニュー])"];

      if (this.nodes) {
        this.nodes.forEach((node) => {
          _parseCode.push(`${node.id}["${node.name}"]`);
        });
      }

      // if(this.richMenu){
      //   console.log(this.richMenu.params)
      //   for(let i = 0; i < this.richMenu.params.actionCount; i++){
      //     let _action = this.richMenu.params[`area.${i}`]
      //     if(_action.type === "message"){
      //       _parseCode.push(`richMenu --> |${_action.text}| area.${i}[Action.${i}]`)
      //     }

      //   }
      // }
      console.log("parseCode -> _parseCode", _parseCode.join("\n"));
      return _parseCode.join("\n");
    },
  },
  watch: {
    dataSource: {
      immediate: true,
      deep: true,
      handler(val) {
        this.isLoading = true;
        this.setup(val);
      },
    },
  },
  methods: {
    load(code) {
      if (code) {
        var container = this.$refs.mermaid;
        if (container) {
          container.removeAttribute("data-processed");
          container.replaceChild(document.createTextNode(code), container.firstChild);
        }
        try {
          // mermaid can be exported via VueMermaid
          // @ts-ignore
          mermaid.init(code, container); // eslint-disable-line no-undef
        } catch (error) {
          console.error(error);
        }
      }
    },
    setup: debounce(function (val) {
      this.dataLocal = cloneDeep(val);
      this.isLoading = false;
    }, 500),
    onNodeClick(nodeId) {
      let _node = this.dataLocal.find((obj) => obj.id == nodeId);
      if (_node.uri) {
        this.openInNewTab(_node.uri);
      } else {
        this.$emit("nodeClick", nodeId);
      }
    },
    openInNewTab(url) {
      var win = window.open(url, "_blank");
      win.focus();
    }
  },

  // beforeMount() {
  //   import("mermaid/dist/mermaid").then((m) => {
  //     m.initialize({
  //       startOnLoad: true,
  //     });
  //     m.init();
  //   });
  // },
});
</script>

<style></style>
