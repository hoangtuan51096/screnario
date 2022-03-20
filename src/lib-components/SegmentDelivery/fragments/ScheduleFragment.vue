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
  <v-container>
    <h2 style="margin: 1em 0 1em 0">配信スケジュール</h2>
    <h4>Start</h4>
    <div style="display: flex; margin: 1em 0 1em 0">
      <v-btn @click="isDatePickerVisible = true" outlined text>{{ datePicker }}</v-btn>
      <v-btn style="margin-left: 1em" @click="isTimePickerVisible = true" outlined text>{{ timePicker }}</v-btn>
    </div>
    <DatePickerModal
      :visible="isDatePickerVisible"
      :model="datePicker"
      @close="isDatePickerVisible = false"
      @changeDate="updateDatePickerValue"
    />
    <TimePickerModal
      :visible="isTimePickerVisible"
      :model="timePicker"
      @close="isTimePickerVisible = false"
      @changeTime="updateTimePickerValue"
    />
    <div style="height: 1em"></div>
    <h4>Repeat</h4>
    <div style="margin: 1em 0 1em 0">
      <div style="display: flex">
        <p style="margin-top: 0.5em">every</p>
        <div style="display: flex; flex-direction: row">
          <div style="width: 5em; margin-left: 1em">
            <v-text-field v-model="numberValue" outlined dense type="number" :rules="[numberRule]"></v-text-field>
          </div>
          <div style="width: 12em; margin-left: 1em">
            <v-select
              :items="['Seconds', 'Minutes', 'Days', 'Weeks', 'Months', 'Years']"
              dense
              outlined
              placeholder="時間を選択する"
            ></v-select>
          </div>
        </div>
      </div>
      <div style="display: flex">
        <p style="margin-top: 1em">on</p>
        <v-btn-toggle v-model="selectedDays" style="margin-left: 1em" multiple color="primary">
          <v-btn style="border-radius: 50%; margin-right: 0.5em">
            <p style="margin-top: 1em">日</p>
          </v-btn>
          <v-btn style="border-radius: 50%; margin-right: 0.5em">
            <p style="margin-top: 1em">月</p>
          </v-btn>
          <v-btn style="border-radius: 50%; margin-right: 0.5em">
            <p style="margin-top: 1em">火</p>
          </v-btn>
          <v-btn style="border-radius: 50%; margin-right: 0.5em">
            <p style="margin-top: 1em">水</p>
          </v-btn>
          <v-btn style="border-radius: 50%; margin-right: 0.5em">
            <p style="margin-top: 1em">木</p>
          </v-btn>
          <v-btn style="border-radius: 50%; margin-right: 0.5em">
            <p style="margin-top: 1em">金</p>
          </v-btn>
          <v-btn style="border-radius: 50%; margin-right: 0.5em">
            <p style="margin-top: 1em">土</p>
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>
    <h4>Ends</h4>
    <v-radio-group style="margin: 1em 0 1em 0" v-model="radios" :mandatory="true">
      <v-radio label="Never" value="never"></v-radio>
      <div style="display: flex; margin: 0.5em 0 0.5em 0">
        <v-radio style="margin-top: 0.2em" label="On" value="on"></v-radio>
        <v-btn
          style="margin-left: 1em"
          :disabled="radios != 'on'"
          @click="isDatePickerEndVisible = true"
          outlined
          text
          small
          >{{ datePickerEnd }}</v-btn
        >
      </div>
    </v-radio-group>
    <DatePickerModal
      :visible="isDatePickerEndVisible"
      :model="datePickerEnd"
      @close="isDatePickerEndVisible = false"
      @changeDate="updateDatePickerEndValue"
    />
  </v-container>
</template>

<script>
import DatePickerModal from "../components/PickerModals/DatePickerModal";
import TimePickerModal from "../components/PickerModals/TimePickerModal";

export default {
  props: {
    date: String,
    changeDate: Function,
    time: String,
    changeTime: Function,
    dateEnd: String,
    changeDateEnd: Function,
  },
  data() {
    return {
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      isDatePickerEndVisible: false,
      // datePicker: new Date().toISOString().substr(0, 10),
      // timePicker: '00:00',
      numberValue: 0,
      selectedDays: [],
      radios: "never",
      // datePickerEnd: new Date().toISOString().substr(0, 10),
    };
  },
  components: { DatePickerModal, TimePickerModal },
  computed: {
    datePicker: {
      get() {
        return this.date;
      },
      set(value) {
        this.$emit("changeDate", value);
      },
    },
    timePicker: {
      get() {
        return this.time;
      },
      set(value) {
        this.$emit("changeTime", value);
      },
    },
    datePickerEnd: {
      get() {
        return this.dateEnd;
      },
      set(value) {
        this.$emit("changeDateEnd", value);
      },
    },
  },

  methods: {
    numberRule: (v) => {
      if (!isNaN(parseFloat(v)) && v >= 0 && v <= 999) return true;
      return "Number has to be between 0 and 999";
    },
    updateDatePickerValue(value) {
      this.datePicker = value;
    },
    updateTimePickerValue(value) {
      this.timePicker = value;
    },
    updateDatePickerEndValue(value) {
      this.datePickerEnd = value;
    },
  },
  created() {},
};
</script>
