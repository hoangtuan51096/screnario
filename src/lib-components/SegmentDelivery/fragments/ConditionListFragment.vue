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
  <v-data-table :headers="headers" :items="surveySchema" :items-per-page="perOnPage" :loading="loading" :page="page">
    <template v-slot:item="{ item }">
      <tr v-if="isSelection(item)">
        <td>{{ item.itemKey }}</td>
        <td>{{ item.title }}</td>
        <td>{{ item.blockType }}</td>
        <td>
          <v-autocomplete
            v-if="item.blockType === 'dropdown' || item.blockType === 'radio'"
            v-model="selection[getIndex(item.itemKey)]"
            @change="onChangeConditionOption($event, item)"
            :items="getConditionOptions(item)"
            :placeholder="item.title"
            class="my-4 body-2"
            outlined
            dense
            clearable
            hide-details
          ></v-autocomplete>
          <v-autocomplete
            v-if="item.blockType === 'checkboxes'"
            v-model="selection[getIndex(item.itemKey)]"
            @change="onChangeConditionOption($event, item)"
            :items="getConditionOptions(item)"
            :placeholder="item.title"
            class="my-4 body-2"
            multiple
            outlined
            dense
            clearable
            hide-details
          ></v-autocomplete>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";

import { cloneDeep } from "lodash";

export default {
  props: {
    visible: Boolean,
    isFormConfigChanged: Boolean,
    conditions: Array,
    loading: Boolean,
    distItem: Object
  },
  data() {
    return {
      perOnPage: 10,
      page: 1,
      headers: [
        { text: "アイテムキー", value: "itemKey", sortable: false },
        { text: "タイトル", value: "title", sortable: false },
        { text: "ブロック種別", value: "ype", sortable: false },
        { text: "配信条件", value: "options", sortable: false, width: "30em" },
      ],

      selection: [],
      conditionSchema: [],
      initialSchema: [],
    };
  },
  computed: {
    ...mapState({
      surveySchema: (state) => state.segments.surveySchema,
    }),
  },
  watch: {
    visible(value) {
      if (value) {
        this.setConditions();
      }
    },
    surveySchema(value) {
      if (value) {
        this.initialSchema = cloneDeep(value);
        this.setConditions();
      }
    },
    isFormConfigChanged: {
      handler(new_value, old_value) {
        if (new_value !== old_value) {
          this.setConditions();
        }
      },
      deep: true,
    },
  },
  methods: {
    isSelection(item) {
      return item.blockType === "dropdown" || item.blockType === "radio" || item.blockType == "checkboxes";
    },
    getConditionOptions(item) {
      let options = [];

      this.surveySchema.find((obj) => {
        if (obj.itemKey === item.itemKey) {
          options.push(
            ...Object.keys(obj.conditionValues).map((key) => {
              let value = obj.conditionValues[key];
              return {
                value: value,
                text: value,
              };
            })
          );
        }
      });

      return options;
    },
    setConditions() {
      this.conditionSchema = JSON.parse(JSON.stringify(this.surveySchema));
      if (this.conditions && this.conditions.length !== 0) {
        this.conditions.forEach((element, index) => {
          this.selection[index] = element.conditionValues;
        });
      } else {
        this.selection = [];
      }

      if (this.initialSchema.length > 0 && this.surveySchema.length > 0 && this.initialSchema[0].itemKey !== this.surveySchema[0].itemKey) {
        this.selection[0] = null;
      }
    },
    onChangeConditionOption(value , item) {
      this.conditionSchema.forEach((element, index) => {
        if (element.itemKey === item.itemKey) {
          element.conditionValues = value;
        } else {
          element.conditionValues = this.selection[index];
        }
      });

      this.$emit("onChangeCondition", this.conditionSchema);
    },
    getIndex(itemKey)  {
      return this.surveySchema.findIndex((obj) => obj.itemKey === itemKey);
    },
  },
  created() {},
};
</script>
