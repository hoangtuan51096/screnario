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
    <v-row no-gutters class="mb-3">
      <v-col cols="3" class="text-right pr-4">
        <label :class="datetimeTypeStyle">{{ type }}</label>
      </v-col>
      <v-col cols="9">
        <v-row no-gutters class="mb-3" v-if="['datetime', 'date'].includes(mode)">
          <v-col cols="4" class="text-right pr-4">
            <label class="grey--text pt-2">Date</label>
          </v-col>
          <v-col cols="8">
            <v-menu
              ref="menu1"
              :close-on-content-click="true"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="date"
                  v-on="on"
                  hide-details
                  single-line
                  outlined
                  readonly
                  :disabled="disabledPremade"
                  dense
                ></v-text-field>
              </template>
              <v-date-picker color="primary" v-model="date" no-title></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-row no-gutters class="mb-3" v-if="['datetime', 'time'].includes(mode)">
          <v-col cols="4" class="text-right pr-4">
            <label class="grey--text pt-2">Time</label>
          </v-col>
          <v-col cols="8">
            <v-menu
              ref="menu"
              :close-on-content-click="true"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="time"
                  hide-details
                  single-line
                  outlined
                  readonly
                  dense
                  :disabled="disabledPremade"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker v-model="time" full-width format="24hr" scrollable></v-time-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";

export default Vue.extend({
  props: {
    type: String,
    mode: String,
    value: String,
    disabledPremade: Boolean,
  },
  watch: {
    value(val) {
      console.log("value changed");
      this.value = val;
    },
  },
  computed: {
    datetimeTypeStyle(): string {
      return `grey--text ${this.mode === "datetime" ? "pt-8" : "pt-2"}`;
    },
    date: {
      get() {
        let datetime = moment.now();
        if (this.value) {
          datetime = this.value.includes("T")
            ? this.value
            : this.value + "T" + moment(moment.now()).format("HH:mm").toString();
        }
        return moment(datetime).format("YYYY-MM-DD");
      },
      set(val) {
        console.log("set -> val", val);
        this.$emit("updateDateTime", {
          type: this.type,
          value: { date: val },
        });
      },
    },
    time: {
      get() {
        let datetime = this.value || moment.now();
        if (this.mode === "time" || !this.value.toString().includes("T")) {
          var buildString = moment(moment.now()).format("YYYY-MM-DD").toString() + "T" + this.value;
          return moment(buildString).format("HH:mm");
        }
        return moment(datetime).format("HH:mm");
      },
      set(val) {
        console.log("set -> val", val);
        this.$emit("updateDateTime", {
          type: this.type,
          value: { time: val },
        });
      },
    },
  },
});
</script>