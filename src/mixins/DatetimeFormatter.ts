import { trim, isNullOrEmpty } from "@/utils/stringUtils";

import moment from "moment";
moment.locale("ja");

export default {
  data() {
    return {
      dateFormatOptions: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
      labelTodayButton: "本日を選ぶ",
      labelCloseButton: "閉じる",
      labelResetButton: "リセット",
      locale: "ja",
    };
  },
  methods: {
    getCurrentYear() {
      return moment().year();
    },
    formatUnixToHHmm(value) {
      return moment.unix(value).format("HH:mm");
    },
    formatUnixToYYYYMMDD(value) {
      return moment.unix(value).format("YYYY-MM-DD");
    },
    formatUnixToYYYYMMDHHmmss(value) {
      return moment.unix(value).format("YYYY-MM-DD HH:mm:ss");
    },
    formatUnixToYYYYMMDDHHmmss(value) {
      return moment.unix(value).format("YYYY-MM-DD HH:mm:ss");
    },
    formatYYYYMMDDToUnix(value) {
      return moment(value).unix();
    },
    formatToYYYYMMDD(value) {
      return moment(value).format("YYYY-MM-DD");
    },
    formatToYYYYMM(value) {
      return moment(value).format("YYYY-MM");
    },
    formatToYYYYMMDDStartOf(value) {
      return moment(value).startOf("month").format("YYYY-MM-DD");
    },
    formatToYYYYMMDDEndOf(value) {
      return moment(value).endOf("month").format("YYYY-MM-DD");
    },
    formatToPrettyYYYYMMDHHmmss(value) {
      return moment(value).format("YYYY/MM/DD\xa0HH:mm:ss");
    },
    formatToYYYYMMDHHmmss(value) {
      return moment(value).format("YYYY-MM-DD HH:mm:ss");
    },
    formatStringToYYYYMMDD(value) {
      return value == 0 || value == null || !value.trim().length ? "" : moment(value, "YYYYMMDD").format("YYYY-MM-DD");
    },
    formatStringToYYYYMMDDHHmm(value) {
      return moment(value, "YYYYMMDDHHmm").format("YYYY-MM-DD\xa0\xa0\xa0\xa0\xa0\xa0\xa0HH:mm");
    },
    formatStringToYYYYMMDDHHmmss(value) {
      return moment(value, "YYYYMMDDHHmm").format("YYYY-MM-DD HH:mm:ss");
    },
    formatStringToYYYYMMDDHHmmssfff(value) {
      let now = moment(value).format("YYYYMMDDHHmmss");
      let ms = String(moment().valueOf()).substr(0, 3);
      return now + ms;
    },
    formatStringToHHmm(value) {
      return moment(value, "YYYYMMDDHHmm").format("HH:mm");
    },
    formatStringToPrettyYYYYMMDD(value) {
      return moment(value, "YYYYMMDD").format("YYYY/MM/DD");
    },
    formatStringToPrettyYYYYMMDDHHmm(value) {
      return moment(value, "YYYYMMDDHHmm").format("YYYY/MM/DD\xa0\xa0\xa0HH:mm");
    },
    formatToShortDate(value) {
      return value === null || value === "" ? null : moment(value).format("YYYYMMDD");
    },
    formatToLongTime(value) {
      return moment(value).format("THHmmss");
    },
    formatCalendar(timestamp) {
      let date = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
      return date.replaceAll(':', '：')
      // let _value = timestamp;
      // if (_value) {
      //   if (_value.length > 10) _value = Math.round(_value / 1000);
      //   if (moment().subtract(5, "days").unix() <= timestamp) {
      //     return moment.unix(_value).calendar();
      //   } else {
      //     return moment.unix(_value).format("YYYY-MM-DD HH:mm:ss");
      //   }
      // } else {
      //   return "";
      // }
    },
    addOneDayToUNIX(value) {
      return value + 86400;
    },
    minusOneDayFromUNIX(value) {
      return value - 86400;
    },
    allowedDateFrom(dateFrom, dateTo) {
      if (!isNullOrEmpty(dateTo)) {
        if (this.formatYYYYMMDDToUnix(dateFrom) <= this.formatYYYYMMDDToUnix(dateTo)) {
          return dateFrom;
        }
      } else {
        return dateFrom;
      }
    },
    allowedDateTo(dateFrom, dateTo) {
      if (!isNullOrEmpty(dateFrom)) {
        if (this.formatYYYYMMDDToUnix(dateTo) >= this.formatYYYYMMDDToUnix(dateFrom)) {
          return dateTo;
        }
      } else {
        return dateTo;
      }
    },
  },
};
