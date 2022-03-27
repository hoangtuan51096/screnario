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
  <v-snackbar v-model="visible" :timeout="type === 'error' ? -1 : timeout" style="white-space: pre-wrap">
    <v-icon left color="yellow accent-4" v-if="type === 'error'">mdi-alert-outline</v-icon>
    {{ text }}
    <template v-slot:action="{ attrs }">
      <v-btn color="white" text v-bind="attrs" @click="visible = false">閉じる</v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from "vue";
import Snackbar from "@/plugins/snackbar";

export default Vue.extend({
  data() {
    return {
      visible: false,
      title: "",
      text: "",
      timeout: 3000,
      type: "info",
    };
  },
  beforeMount() {
    // here we need to listen for emited events
    // we declared those events inside our plugin
    Snackbar.EventBus.$on("show", (params) => {
      this.show(params);
    });
    Snackbar.EventBus.$on("hide", () => {
      this.hide();
    });
  },
  methods: {
    hide() {
      this.visible = false;
    },
    confirm() {
      // we must check if this.onConfirm is function
      if (typeof this.onConfirm === "function") {
        // run passed function and then close the modal
        this.onConfirm();
        this.hide();
      } else {
        // we only close the modal
        this.hide();
      }
    },
    show(params) {
      // making modal visible
      this.visible = true;
      this.text = params.text;
      this.type = params.type || "info";
    },
  },
});
</script>
