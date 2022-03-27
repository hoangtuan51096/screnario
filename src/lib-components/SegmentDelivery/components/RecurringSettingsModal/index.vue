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
  <v-dialog v-model="show" max-width="700">
    <v-system-bar color="primary" dark height="5"> </v-system-bar>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>繰り返し指定</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-container>
        <v-row>
          <v-col :cols="gridCols.label">
            <v-subheader>開始日</v-subheader>
          </v-col>
          <v-col :cols="gridCols.date">
            <DatePickerMenu :field="'recurringSettings'" :isEndDate="false" :enablePicker="startType === 'RECURRING'" />
          </v-col>
          <v-col :cols="gridCols.label">
            <v-subheader>終了日</v-subheader>
          </v-col>
          <v-col :cols="gridCols.date">
            <DatePickerMenu :field="'recurringSettings'" :isEndDate="true" :enablePicker="startType === 'RECURRING'" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="gridCols.label">
            <v-subheader>配信時間</v-subheader>
          </v-col>
          <v-col :cols="gridCols.time">
            <TimePickerMenu :field="'recurringSettings'" :enablePicker="startType === 'RECURRING'" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="gridCols.label">
            <v-subheader>配信区分</v-subheader>
          </v-col>
          <v-col :cols="gridCols.period">
            <v-select v-model="period" :items="periodOptions" single-line outlined dense hide-details> </v-select>
          </v-col>
        </v-row>
        <div v-if="period === 'Weekly'">
          <v-row>
            <v-col :cols="gridCols.label">
              <v-subheader>曜日</v-subheader>
            </v-col>
            <v-col>
              <v-chip-group v-model="daysOfWeek" multiple active-class="primary--text">
                <v-chip
                  v-for="day in days"
                  :key="`Weekly_DaysOfWeek_${day.value}`"
                  :value="`daysOfWeek_${day.numericValue}`"
                >
                  {{ day.text }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </div>
        <div v-if="period === 'Monthly'">
          <v-row>
            <v-col :cols="gridCols.label">
              <v-subheader>日付</v-subheader>
            </v-col>
            <v-col>
              <v-chip-group v-model="daysOfMonth" multiple active-class="primary--text" hide-details column>
                <div v-for="dayRowIndex in 5" :key="`dayRowIndex_${dayRowIndex}`">
                  <div v-if="dayRowIndex <= 4">
                    <v-chip
                      v-for="dayColIndex in 7"
                      :key="`Monthly_ThirtyOneDays_${dayRowIndex}${dayColIndex}`"
                      :value="`daysOfMonth_${7 * (dayRowIndex - 1) + dayColIndex}`"
                      class="px-1 mx-1"
                      style="width: 60px"
                    >
                      <v-col> {{ 7 * (dayRowIndex - 1) + dayColIndex }}日 </v-col>
                    </v-chip>
                  </div>
                  <div v-else>
                    <v-chip
                      v-for="dayColIndex in 3"
                      :key="`Monthly_ThirtyOneDays_${dayRowIndex}${dayColIndex}`"
                      :value="`daysOfMonth_${7 * (dayRowIndex - 1) + dayColIndex}`"
                      class="px-1 mx-1"
                      style="width: 60px"
                    >
                      <v-col> {{ 7 * (dayRowIndex - 1) + dayColIndex }}日 </v-col>
                    </v-chip>
                  </div>
                </div>
              </v-chip-group>
            </v-col>
          </v-row>
        </div>
        <div class="ml-2 mb-2 font-italic body-2 text-center" v-if="period == 'LastDay'">
          期間が月末の場合は、日付の月しか指定できません。
        </div>
        <div v-if="period === 'Custom'">
          <v-row>
            <v-col :cols="gridCols.label">
              <v-subheader>カスタムの種類</v-subheader>
            </v-col>
            <v-col cols="3">
              <v-select v-model="customType" :items="customTypes"> </v-select>
            </v-col>
          </v-row>
          <div v-if="customType === 'skip'">
            <v-row>
              <v-col :cols="gridCols.label">
                <v-subheader>隔週の設定</v-subheader>
              </v-col>
              <v-col :cols="gridCols.label">
                <v-select v-model="customSkipPeriod" :items="skipTypes"> </v-select>
              </v-col>
              <v-col :cols="gridCols.label">
                <v-text-field
                  v-model="customSkipLength"
                  single-line
                  type="number"
                  :rules="skipLengthRules[customSkipPeriod]"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div class="ml-2 mb-2 body-2 text-center" v-if="customSkipPeriod === 'days'">
                  <div v-if="!isNaN(customSkipLength)">
                    説明：{{ Math.min(skipTypes[0].lim, customSkipLength)
                    }}{{ skipTypeToJapanese(customSkipPeriod) }}おきに1回
                  </div>
                  <div v-else>説明：{{ skipTypeToJapanese(customSkipPeriod) }}おきに1回</div>
                </div>
                <div class="ml-2 mb-2 body-2 text-center" v-if="customSkipPeriod === 'weeks'">
                  <div v-if="!isNaN(customSkipLength)">
                    説明：{{ Math.min(skipTypes[1].lim, customSkipLength)
                    }}{{ skipTypeToJapanese(customSkipPeriod) }}おきに1回
                  </div>
                  <div v-else>説明：{{ skipTypeToJapanese(customSkipPeriod) }}おきに1回</div>
                </div>
                <div class="ml-2 mb-2 body-2 text-center" v-if="customSkipPeriod === 'months'">
                  <div v-if="!isNaN(customSkipLength)">
                    説明：{{ Math.min(skipTypes[2].lim, customSkipLength) }}ヶ{{
                      skipTypeToJapanese(customSkipPeriod)
                    }}おきに1回
                  </div>
                  <div v-else>説明：ヶ{{ skipTypeToJapanese(customSkipPeriod) }}おきに1回</div>
                </div>
              </v-col>
            </v-row>
          </div>
          <div v-if="customType === 'numberedDayOfWeek'">
            <v-row>
              <v-col :cols="gridCols.label">
                <v-subheader>曜日</v-subheader>
              </v-col>
              <v-col>
                <v-row>
                  <v-col :cols="2">
                    <v-subheader>{{ weekNumbers[0].text }}</v-subheader>
                  </v-col>
                  <v-col>
                    <v-chip-group
                      v-model="customNumberedDayOfWeekFirst"
                      multiple
                      active-class="primary--text"
                      hide-details
                    >
                      <v-chip
                        v-for="day in days"
                        :key="`Custom_NumberedDayOfWeek_First_${day.value}`"
                        :value="`customNumberedDayOfWeekFirst_${day.numericValue}`"
                      >
                        {{ day.text }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col :cols="2">
                    <v-subheader>{{ weekNumbers[1].text }}</v-subheader>
                  </v-col>
                  <v-col>
                    <v-chip-group
                      v-model="customNumberedDayOfWeekSecond"
                      multiple
                      active-class="primary--text"
                      hide-details
                    >
                      <v-chip
                        v-for="day in days"
                        :key="`Custom_NumberedDayOfWeek_Second_${day.value}`"
                        :value="`customNumberedDayOfWeekSecond_${day.numericValue}`"
                      >
                        {{ day.text }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col :cols="2">
                    <v-subheader>{{ weekNumbers[2].text }}</v-subheader>
                  </v-col>
                  <v-col>
                    <v-chip-group
                      v-model="customNumberedDayOfWeekThird"
                      multiple
                      active-class="primary--text"
                      hide-details
                    >
                      <v-chip
                        v-for="day in days"
                        :key="`Custom_NumberedDayOfWeek_Third_${day.value}`"
                        :value="`customNumberedDayOfWeekThird_${day.numericValue}`"
                      >
                        {{ day.text }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col :cols="2">
                    <v-subheader>{{ weekNumbers[3].text }}</v-subheader>
                  </v-col>
                  <v-col>
                    <v-chip-group
                      v-model="customNumberedDayOfWeekFourth"
                      multiple
                      active-class="primary--text"
                      hide-details
                    >
                      <v-chip
                        v-for="day in days"
                        :key="`Custom_NumberedDayOfWeek_Fourth_${day.value}`"
                        :value="`customNumberedDayOfWeekFourth_${day.numericValue}`"
                      >
                        {{ day.text }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col :cols="2">
                    <v-subheader>{{ weekNumbers[4].text }}</v-subheader>
                  </v-col>
                  <v-col>
                    <v-chip-group
                      v-model="customNumberedDayOfWeekFifth"
                      multiple
                      active-class="primary--text"
                      hide-details
                    >
                      <v-chip
                        v-for="day in days"
                        :key="`Custom_NumberedDayOfWeek_Fifth_${day.value}`"
                        :value="`customNumberedDayOfWeekFifth_${day.numericValue}`"
                      >
                        {{ day.text }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          <div v-if="customType === 'dates'">
            <v-row>
              <v-col :cols="gridCols.label">
                <v-subheader>日付</v-subheader>
              </v-col>
              <v-col>
                <v-date-picker v-model="customDates" multiple> </v-date-picker>
              </v-col>
            </v-row>
          </div>
        </div>
        <v-divider></v-divider>
        <div>
          <v-row>
            <v-col>
              <v-checkbox v-model="withExclude" label="除外日を設定する"></v-checkbox>
            </v-col>
          </v-row>
          <template v-if="withExclude">
            除外日設定
            <v-row>
              <v-col :cols="gridCols.label">
                <v-subheader>曜日</v-subheader>
              </v-col>
              <v-col>
                <v-chip-group v-model="excludeDaysOfWeek" multiple active-class="primary--text">
                  <v-chip v-for="day in days" :key="`Exclude_DaysOfWeek_Day_${day.value}`" :value="day.numericValue">
                    {{ day.text }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>
            <v-row>
              <v-col :cols="gridCols.label">
                <v-subheader>日付</v-subheader>
              </v-col>
              <v-col>
                <v-date-picker v-model="excludeDates" multiple> </v-date-picker>
              </v-col>
            </v-row>
          </template>
        </div>
      </v-container>
      <v-divider></v-divider>
      <v-container>
        <v-row>
          <v-col>
            <v-btn color="primary" block elevation="1" @click="show = false">
              <v-icon left>mdi-calendar-multiple-check</v-icon>
              指定
            </v-btn>
          </v-col>
          <v-col>
            <v-btn color="grey lighten-2" block elevation="1" @click="show = false">
              <v-icon left>mdi-close-box-outline</v-icon>
              閉じる
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapState, mapMutations } from "vuex";
import { SET_RECURRING_SETTINGS } from "@/store/mutation-types";
import { DEFAULT_RECURRING_SETTINGS } from "@/store/modules/segments/segments.state";

import DatetimeFormatter from "@/mixins/DatetimeFormatter";

import DatePickerMenu from "../DatetimePickerMenus/DatePickerMenu.vue";
import TimePickerMenu from "../DatetimePickerMenus/TimePickerMenu.vue";

import { cloneDeep, omit } from "lodash";
import moment from "moment";

interface GridCols {
  label;
  date;
  time;
  period;
}
export default Vue.extend({
  props: {
    visible: Boolean,
    close: Function,
  },
  data() {
    return {
      gridCols: {
        label: 2,
        date: 4,
        time: 10,
        period: 10,
      },

      periodOptions: [
        { text: "毎日", value: "Daily" },
        { text: "毎週", value: "Weekly" },
        { text: "毎月", value: "Monthly" },
        { text: "月末", value: "LastDay" },
        { text: "カスタム", value: "Custom" },
      ],

      days: [
        { text: "月", value: "Monday", numericValue: 1 },
        { text: "火", value: "Tuesday", numericValue: 2 },
        { text: "水", value: "Wednesday", numericValue: 3 },
        { text: "木", value: "Thursday", numericValue: 4 },
        { text: "金", value: "Friday", numericValue: 5 },
        { text: "土", value: "Saturday", numericValue: 6 },
        { text: "日", value: "Sunday", numericValue: 7 },
      ],
      customTypes: [
        { text: "隔週", value: "skip" },
        { text: "曜日", value: "numberedDayOfWeek" },
        { text: "カレンダー", value: "dates" },
      ],
      weekNumbers: [
        { text: "第1", value: "First" },
        { text: "第2", value: "Second" },
        { text: "第3", value: "Third" },
        { text: "第4", value: "Fourth" },
        { text: "第5", value: "Fifth" },
      ],
      skipTypes: [
        { text: "日", value: "days", lim: 365 },
        { text: "週", value: "weeks", lim: 52 },
        { text: "月", value: "months", lim: 12 },
      ],
      skipLengthRules: {
        days: [
          // v => (!!v) || '必須',
          (v) => {
            v = Number(v);
            if (isNaN(v)) return "整数";
            return (Number.isInteger(v) && 1 <= v && v <= 365) || "1から365までの整数";
          },
        ],
        weeks: [
          // v => (!!v) || '必須',
          (v) => {
            v = Number(v);
            if (isNaN(v)) return "整数";
            return (Number.isInteger(v) && 1 <= v && v <= 52) || "1から52までの整数";
          },
        ],
        months: [
          // v => (!!v) || '必須',
          (v) => {
            v = Number(v);
            if (isNaN(v)) return "整数";
            return (Number.isInteger(v) && 1 <= v && v <= 12) || "1から12までの整数";
          },
        ],
      },
    };
  },
  components: { DatePickerMenu, TimePickerMenu },
  mixins: [DatetimeFormatter],
  computed: {
    ...mapState({
      distributionDetail: (state) => state.segments.distributionDetail,
    }),
    show: {
      get() {
        return this.visible;
      },
      set(value) {
        if (!value) {
          // this.resetValidation();
          this.$emit("close");
        }
      },
    },
    period: {
      get()  {
        return this.distributionDetail.recurringSettings.period;
      },
      set(value) {
        // this.handleUpdate(omit(cloneDeep(DEFAULT_RECURRING_SETTINGS), ['withExclude', 'exclude']));
        this.handleUpdate({ period: value });
      },
    },
    startType: {
      get()  {
        return this.distributionDetail.startType;
      },
      // warning: startType is not a recurringSettings attribute
    },
    // exclude settings
    withExclude: {
      get()  {
        return this.distributionDetail.recurringSettings.withExclude;
      },
      set(value) {
        this.handleUpdate({ withExclude: value });
      },
    },
    exclude: {
      get()  {
        return this.distributionDetail.recurringSettings.exclude;
      },
      set(value) {
        this.handleUpdate({ exclude: value });
      },
    },
    excludeDaysOfWeek: {
      get()  {
        return this.distributionDetail.recurringSettings.exclude.daysOfWeek;
      },
      set(value) {
        this.handleUpdate({
          exclude: {
            ...this.distributionDetail.recurringSettings.exclude,
            daysOfWeek: value,
          },
        });
      },
    },
    excludeDates: {
      get()  {
        return this.distributionDetail.recurringSettings.exclude.dates;
      },
      set(value) {
        this.handleUpdate({
          exclude: {
            ...this.distributionDetail.recurringSettings.exclude,
            dates: value,
          },
        });
      },
    },
    // Weekly settings
    daysOfWeek: {
      get()  {
        let arr = [];
        for (let item of this.distributionDetail.recurringSettings.daysOfWeek) {
          arr.push(`daysOfWeek_${item}`);
        }
        return arr;
      },
      set(value) {
        let arr = [];
        for (let item of value) {
          const splitResult = item.split("_");
          const number = Number(splitResult[splitResult.length - 1]);
          arr.push(number);
        }
        this.handleUpdate({ daysOfWeek: arr });
      },
    },
    // Monthly settings
    daysOfMonth: {
      get()  {
        let arr = [];
        for (let item of this.distributionDetail.recurringSettings.daysOfMonth) {
          arr.push(`daysOfMonth_${item}`);
        }
        return arr;
      },
      set(value) {
        let arr = [];
        for (let item of value) {
          const splitResult = item.split("_");
          const number = Number(splitResult[splitResult.length - 1]);
          arr.push(number);
        }
        this.handleUpdate({ daysOfMonth: arr });
      },
    },
    // Custom settings
    custom: {
      get()  {
        return this.distributionDetail.recurringSettings.custom;
      },
      set(value) {
        this.handleUpdate({ custom: value });
      },
    },
    customType: {
      get()  {
        return this.distributionDetail.recurringSettings.custom.type;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            type: value,
          },
        });
      },
    },
    customSkip: {
      get()  {
        return this.distributionDetail.recurringSettings.custom.skip;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            skip: value,
          },
        });
      },
    },
    customSkipPeriod: {
      get()  {
        return this.distributionDetail.recurringSettings.custom.skip.period;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            skip: {
              ...this.distributionDetail.recurringSettings.custom.skip,
              period: value,
            },
          },
        });
      },
    },
    customSkipLength: {
      get()  {
        return this.distributionDetail.recurringSettings.custom.skip.length;
      },
      set(value) {
        let num = Number(value);
        let length = 0;
        if (!isNaN(num)) {
          /*
					if(this.customSkipPeriod === 'days' && 1 <= num && num <= this.skipTypes[0].lim) {
						length = num;
					} else if(this.customSkipPeriod === 'weeks' && 1 <= num && num <= this.skipTypes[1].lim) {
						length = num;
					} else if(this.customSkipPeriod === 'months' && 1 <= num && num <= this.skipTypes[2].lim) {
						length = num;
					}
					*/
          length = num;
        }
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            skip: {
              ...this.distributionDetail.recurringSettings.custom.skip,
              length: length,
            },
          },
        });
      },
    },
    customNumberedDayOfWeekFirst: {
      get()  {
        let arr = [];
        for (let item of this.distributionDetail.recurringSettings.custom.numberedDayOfWeek) {
          if (item.number === 1) {
            arr.push(`customNumberedDayOfWeekFirst_${item.dayOfWeek}`);
          }
        }
        return arr;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            numberedDayOfWeek: this.convertCustomNumberedDayOfWeek(1, value),
          },
        });
      },
    },
    customNumberedDayOfWeekSecond: {
      get()  {
        let arr = [];
        for (let item of this.distributionDetail.recurringSettings.custom.numberedDayOfWeek) {
          if (item.number === 2) {
            arr.push(`customNumberedDayOfWeekSecond_${item.dayOfWeek}`);
          }
        }
        return arr;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            numberedDayOfWeek: this.convertCustomNumberedDayOfWeek(2, value),
          },
        });
      },
    },
    customNumberedDayOfWeekThird: {
      get()  {
        let arr = [];
        for (let item of this.distributionDetail.recurringSettings.custom.numberedDayOfWeek) {
          if (item.number === 3) {
            arr.push(`customNumberedDayOfWeekThird_${item.dayOfWeek}`);
          }
        }
        return arr;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            numberedDayOfWeek: this.convertCustomNumberedDayOfWeek(3, value),
          },
        });
      },
    },
    customNumberedDayOfWeekFourth: {
      get()  {
        let arr = [];
        for (let item of this.distributionDetail.recurringSettings.custom.numberedDayOfWeek) {
          if (item.number === 4) {
            arr.push(`customNumberedDayOfWeekFourth_${item.dayOfWeek}`);
          }
        }
        return arr;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            numberedDayOfWeek: this.convertCustomNumberedDayOfWeek(4, value),
          },
        });
      },
    },
    customNumberedDayOfWeekFifth: {
      get()  {
        let arr = [];
        for (let item of this.distributionDetail.recurringSettings.custom.numberedDayOfWeek) {
          if (item.number === 5) {
            arr.push(`customNumberedDayOfWeekFifth_${item.dayOfWeek}`);
          }
        }
        return arr;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            numberedDayOfWeek: this.convertCustomNumberedDayOfWeek(5, value),
          },
        });
      },
    },
    customDates: {
      get()  {
        return this.distributionDetail.recurringSettings.custom.dates;
      },
      set(value) {
        this.handleUpdate({
          custom: {
            ...this.distributionDetail.recurringSettings.custom,
            dates: value,
          },
        });
      },
    },
  },
  watch: {},
  methods: {
    ...mapMutations({
      updateRecurringSettings: SET_RECURRING_SETTINGS,
    }),
    handleUpdate(value) {
      this.updateRecurringSettings({ ...this.distributionDetail.recurringSettings, ...value });
    },
    skipTypeToJapanese(value)  {
      if (value === "days") return "日";
      if (value === "weeks") return "週";
      if (value === "months") return "月";
      return value;
    },
    convertCustomNumberedDayOfWeek(number , value) {
      let arr = [];
      for (let item of this.distributionDetail.recurringSettings.custom.numberedDayOfWeek) {
        if (item.number !== number) {
          arr.push(item);
        }
      }
      for (let item of value) {
        const splitResult = item.split("_");
        const dayOfWeek = Number(splitResult[splitResult.length - 1]);
        arr.push({
          dayOfWeek: dayOfWeek,
          number,
        });
      }
      return arr;
    },
  },
  created() {},
});
</script>
