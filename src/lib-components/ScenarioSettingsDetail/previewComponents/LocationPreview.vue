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
.preview-text-message {
  border-radius: 0.25em;
  background-color: white;
  width: 14em;
}
.preview-text-content {
  padding: 0.25em;
  font-size: small;
  position: relative;
  z-index: 2;
  margin-bottom: 0em !important;
}
.tri-right.left-top:after {
  content: " ";
  position: relative;
  width: 0;
  height: 0;
  left: -10px;
  right: auto;
  top: -40px;
  bottom: auto;
  border: 22px solid;
  border-color: white transparent transparent transparent;
  z-index: 1;
}
</style>

<template>
  <v-container class="location-preview">
    <div class="preview-text-message tri-right left-top">
      <div class="preview-text-content">
        <v-row>
          <v-col cols="3">
            <v-icon>mdi-flag-triangle</v-icon>
          </v-col>
          <v-col cols="9">
            <v-row>{{ message.title }}</v-row>
            <v-row>{{ message.address }}</v-row>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default Vue.extend({
  name: "LocationPreview",
  props: {
    message: Object,
  },
  data() {
    return {};
  },
  watch: {},
  components: {},
  computed: {
    ...mapState({}),
  },
  methods: {},
});
</script>
