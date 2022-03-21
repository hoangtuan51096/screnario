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
  white-space: pre-line;
}

.preview-confirm-title {
  padding: 0 1em;
}

.preview-confirm-option {
  color: #688bbc;
}
</style>

<template>
  <v-container>
    <div class="preview-text-message">
      <div class="preview-text-content">
        <v-row>
          <label class="preview-confirm-title">{{ message.text }}</label>
        </v-row>
        <v-divider></v-divider>
        <v-row>
          <v-col align="center" class="preview-confirm-option" justify="center">
            {{ message.actionLeft.label }}
          </v-col>
          <v-col align="center" class="preview-confirm-option" justify="center">
            {{ message.actionRight.label }}
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
  name: "ConfirmPreview",
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
