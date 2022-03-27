import {ROLE_ADMIN} from "@/constants/permission.constants";

export default {
  methods: {
    showActionPermissionError() {
      this.$snackbar.show({
        text: "アクション権限がありません",
        type: "error",
      });
    },
    hideButtonPermissionStyle() {
      return "visibility: hidden";
    },
    displayNoneButtonPermissionStyle() {
      return "display: none";
    },
    hasActionPermission(action, item) {
      if (action === 'click' && item === 'backendRequest') {
        let user = JSON.parse(localStorage.getItem('user_data'))
        return true
      }
      return this.$ability.can(action, item);
    },
    permission_buttonClass(item) {
      return "";
    },
    /*
    hasDisplayButtonPermission(item) {
      console.log("(this.$ability.cannot('displayButton', bad)", 'bad', (this.$ability.cannot('displayButton', 'bad')))
      console.log("(this.$ability.cannot('displayButton', item)", item, (this.$ability.cannot('displayButton', item)))
      return !(this.$ability.cannot('displayButton', item));
    },
    */
  },
};
