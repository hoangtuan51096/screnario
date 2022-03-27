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
  <div class="py-4">
    <v-row>
      <v-col>
        <label>タイトル</label>
        <v-text-field
          outlined
          single-line
          dense
          :rules="[rules.validTextLength, rules.validTextChar]"
          :value="params.title"
          @input="onChangeValue($event, 'title')"
        >
        </v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>住所</label>
        <v-text-field
          outlined
          single-line
          dense
          :rules="[rules.validTextLength, rules.validTextChar]"
          :value="params.address"
          @input="onChangeValue($event, 'address')"
        >
        </v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>緯度</label>
        <v-text-field
          type="number"
          outlined
          single-line
          v-model="params.latitude"
          dense
          hide-details
          @input="onChangeValue($event, 'latitude')"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <label>経度</label>
        <v-text-field
          type="number"
          outlined
          single-line
          v-model="params.longitude"
          dense
          hide-details
          @input="onChangeValue($event, 'longitude')"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ItemLocation",
  props: {
    params: {
      type: Object,
      required: true,
    },
    canSave: Boolean,
  },
  watch: {
    canSave(val) {
      if (val) {
        for (const section of this.textSections) {
          this.isValidText[section] = true; // reset back to true
        }
      }
    },
  },
  data() {
    return {
      rules: {
        validTextLength: (value) => value.length > 0 || "必須",
        validTextChar: (value) => {
          for (var ch of value) {
            if (ch !== "\n" && ch !== " " && ch !== "　") {
              return true;
            }
          }
          return "空白または改行のみは保存出来ません";
        },
      },
      textSections: ["title", "address"],
      isValidText: {
        title: true,
        address: true,
      },
    };
  },
  created() {
    this.reportValidation();
  },
  beforeDestroy() {
    this.$emit("updateSaveStatus", { key: `ItemLocation`, value: true });
  },
  methods: {
    onChangeValue(event , keyValue) {
      if (this.textSections.includes(keyValue)) {
        this.validateText(event, keyValue);
      }
      this.reportValidation();
      this.$emit("updateParams", { key: keyValue, value: event });
    },
    validateText(event , keyValue) {
      if (typeof event !== "undefined" && event.length > 0) {
        for (var ch of event) {
          if (ch !== "\n" && ch !== " " && ch !== "　") {
            this.isValidText[keyValue] = true;
            return;
          }
        }
      }
      this.isValidText[keyValue] = false;
    },
    reportValidation() {
      for (const section of this.textSections) {
        if (!this.isValidText[section]) {
          this.$emit("updateSaveStatus", { key: `ItemLocation`, value: false });
          return;
        }
      }
      if (!this.params.latitude || !this.params.longitude) {
        this.$emit("updateSaveStatus", { key: `ItemLocation`, value: false });
        return;
      }
      this.$emit("updateSaveStatus", { key: `ItemLocation`, value: true });
    },
  },
});
</script>
