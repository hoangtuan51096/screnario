export default {
  computed: {
    primaryColor() {
      if (typeof this.$vuetify.theme.themes.light.primary === "string") {
        return this.$vuetify.theme.themes.light.primary;
      } else {
        return this.$vuetify.theme.themes.light.primary.base;
      }
    },
    bgPrimary() {
      return `background: ${this.primaryColor}`;
    },
    primaryRgbA() {
      return this.hexToRgbA(this.primaryColor);
    },
  },
  methods: {
    hexToRgbA(hex, opacity = 0.45) {
      var c;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split("");
        if (c.length == 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = "0x" + c.join("");
        return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + "," + opacity + ")";
      }
      throw new Error("Bad Hex");
    },
  },
};
