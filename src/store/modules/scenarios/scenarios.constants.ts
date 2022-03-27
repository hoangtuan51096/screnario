// @ts-nocheck
import { generateUUID } from "@/utils/uuidUtils";
import iconCalendar from "!!raw-loader!@/assets/mindmap/icon-calendar.svg";
import iconFile from "!!raw-loader!@/assets/mindmap/icon-file.svg";
import iconFlexBubble from "!!raw-loader!@/assets/mindmap/icon-flex_bubble.svg";
import iconFlexCarousel from "!!raw-loader!@/assets/mindmap/icon-flex_carousel.svg";
import iconFlexReplay from "!!raw-loader!@/assets/mindmap/icon-flex_replay.svg";
import iconImagemap from "!!raw-loader!@/assets/mindmap/icon-imagemap.svg";
import iconMap from "!!raw-loader!@/assets/mindmap/icon-map.svg";
import iconMessage from "!!raw-loader!@/assets/mindmap/icon-message.svg";
import iconMovie from "!!raw-loader!@/assets/mindmap/icon-movie.svg";
import iconNone from "!!raw-loader!@/assets/mindmap/icon-none.svg";
import iconPicture from "!!raw-loader!@/assets/mindmap/icon-picture.svg";
import iconPostback from "!!raw-loader!@/assets/mindmap/icon-postback.svg";
import iconStamp from "!!raw-loader!@/assets/mindmap/icon-stamp.svg";
import iconTemplateButton from "!!raw-loader!@/assets/mindmap/icon-template_button.svg";
import iconTemplateCarousel from "!!raw-loader!@/assets/mindmap/icon-template_carousel.svg";
import iconTemplateCheck from "!!raw-loader!@/assets/mindmap/icon-template_check.svg";
import iconTemplateImageCarousel from "!!raw-loader!@/assets/mindmap/icon-template_image_carousel.svg";
import iconText from "!!raw-loader!@/assets/mindmap/icon-text.svg";
import iconUrl from "!!raw-loader!@/assets/mindmap/icon-url.svg";
import iconUserText from "!!raw-loader!@/assets/mindmap/icon-usertext.svg";
import iconVoice from "!!raw-loader!@/assets/mindmap/icon-voice.svg";
import iconRelation from "!!raw-loader!@/assets/mindmap/icon-relation.svg";
import iconCompositeMessage from "!!raw-loader!@/assets/mindmap/icon-composite_message.svg";
import iconMoveToAnotherTalk from "!!raw-loader!@/assets/mindmap/icon-move_talks.svg";

export const SVG_ICON_CONSTANTS = {
  __INITIAL__: iconNone,
  message: iconMessage,
  uri: iconUrl,
  postback: iconPostback,
  richmenuswitch: iconRelation,
  datetimepicker: iconCalendar,
  undefined: iconNone,
  text: iconText,
  image: iconPicture,
  video: iconMovie,
  audio: iconVoice,
  file: iconFile,
  sticker: iconStamp,
  location: iconMap,
  carousel: iconTemplateCarousel,
  confirm: iconTemplateCheck,
  bubbleFlex: iconFlexBubble,
  carouselFlex: iconFlexCarousel,
  imagemap: iconImagemap,
  buttons: iconTemplateButton,
  compositeMessage: iconCompositeMessage,
  messageLinkToOtherTalk: iconMoveToAnotherTalk,
  linkToAncestor: iconUrl,
  linkInsideTree: iconUrl,
  location_message: iconMap,
  image_message: iconPicture,
};

export const SCENARIO_ENV_TYPES = {
  production: {
    value: "production",
    text: "本番",
    icon: "mdi-cellphone-text",
    color: "primary",
    btn_color: "warning",
  },
  sandbox: {
    value: "sandbox",
    text: "サンドボックス",
    icon: "mdi-codepen",
    color: "grey",
    btn_color: "primary",
  },
};

export const SPECIAL_USER_ACTIONS = {
  "https://line.me/R/nv/location": "location_message",
  "https://line.me/R/nv/camera/": "image_message",
  "https://line.me/R/nv/cameraRoll/single": "image_message",
};

//These are values to show in the トークを利用する modal
export const SPECIAL_TALK_TYPES = ["損傷報告", "ゴミ分別", "防災", "防災検索", "防災（大雨・台風）", "防災（地震）"];

//These are only for special talks that can be activated/inactivated
export const SPECIAL_TALK_TYPES_MAPPING = {
  損傷報告: "damageReport",
};

export const TEMPLATE_TALKS = [
  {
    displayName: "損傷報告",
    talkId: "DAMAGE_REPORT_TALK"
  },
  {
    displayName: "ゴミ分別",
    talkId: "TRASH_SEPARATION_TALK"
  },
  {
    displayName: "防災",
    talkId: "BOSAI_FLOW_TALK"
  },
  {
    displayName: "防災検索",
    talkId: "BOSAI_FLOW_SEARCH_TALK"
  },
  {
    displayName: "防災（大雨・台風）",
    talkId: "BOSAI_RAIN_TYPHOON_TALK"
  },
  {
    displayName: "防災（地震）",
    talkId: "BOSAI_EARTHQUAKE_TALK"
  },
]

export const BOT_ITEM_TYPES = {
  text: {
    text: "文字メッセージ",
    icon: "mdi-format-size",
  },
  image: {
    text: "画像メッセージ",
    image: "originalContentUrl",
  },
  video: {
    text: "動画メッセージ",
    icon: "mdi-play-box",
  },
  audio: {
    text: "音声メッセージ",
    icon: "mdi-volume-high",
  },
  file: {
    text: "ファイルメッセージ",
    icon: "mdi-file-multiple",
  },
  sticker: {
    text: "スタンプメッセージ",
    icon: "mdi-emoticon-happy",
  },
  location: {
    text: "位置情報メッセージ",
    icon: "mdi-map-marker",
  },
  carousel: {
    text: "カルーセル型テンプレートメッセージ",
    icon: "mdi-view-carousel-outline",
  },
  confirm: {
    text: "確認型テンプレートメッセージ",
    icon: "mdi-check",
  },
  richmenu: {
    text: "リッチメニュー",
    icon: "mdi-format-list-bulleted",
  },
  bubbleFlex: {
    text: "フレックスメッセージ",
    icon: "mdi-view-dashboard-outline",
  },
  carouselFlex: {
    text: "カルーセルメッセージ",
    icon: "mdi-view-carousel-outline",
  },
  webapp: {
    text: "WEBアプリ",
    icon: "mdi-xml",
  },
  imagemap: {
    text: "イメージマップメッセージ",
    image: "baseUrl",
    icon: "mdi-view-grid-outline",
  },
  buttons: {
    text: "ボタン型テンプレートメッセージ",
    icon: "mdi-gesture-tap-button",
  },
  pie: {
    text: "ProtoPieメッセージ",
    icon: "mdi-decagram",
  },
  compositeMessage: {
    text: "複合メッセージ",
    icon: "mdi-message-plus-outline",
  },
  jsonTemplate: {
    text: "JSON形式",
    icon: "mdi-code-json",
  },
};

export const SCENARIO_LANG_TYPES = {
  en: {
    value: "en",
    text: "英語",
  },
  ja: {
    value: "ja",
    text: "日本語",
  },
  ko: {
    value: "ko",
    text: "韓国語",
  },
  pt: {
    value: "pt",
    text: "ポルトガル語",
  },
  ru: {
    value: "ru",
    text: "ロシア語",
  },
  es: {
    value: "es",
    text: "スペイン語",
  },
};

//Default Rich Menus
export const NORMAL_RICH_MENU_PARAM = {
  production: "defaultProduction",
  sandbox: "defaultSandbox",
};

export const BOSAI_RICH_MENU_PARAM = {
  production: "bosaiProduction",
  sandbox: "bosaiSandbox",
};

//Rich Menu actions
export const RICH_MENU_ACTIONS = {
  message: "テキスト",
  uri: "リンク",
  postback: "ポストバック",
  richmenuswitch: "リッチメニュー切り替え",
};

//Template Talk ids
export const TEMPLATE_TALK_IDS = [
  "DAMAGE_REPORT_TALK",
  "TRASH_SEPARATION_TALK",
  "BOSAI_FLOW_TALK",
  "BOSAI_FLOW_SEARCH_TALK",
  "BOSAI_RAIN_TYPHOON_TALK",
  "BOSAI_EARTHQUAKE_TALK"
]

//Message Ids for Talk Templates that allow actions to be changed freely
export const ALLOW_FREE_ACTION_CHANGE = [
  "RAIN_TYPHOON_EXPLANATION",
]

export const SCENARIO_SEARCH_ATTRIBUTE_OPTIONS = [
  { text: "シナリオバージョン", value: "name" },
  { text: "本番ステータス", value: "production" },
  { text: "サンドボックスステータス", value: "sandbox" }
];

export const SCENARIO_SEARCH_PRODUCTION_OPTIONS = [
  { text: "適用中", value: "0" },
  { text: "未適用", value: "1" }
];

export const SCENARIO_SEARCH_SANDBOX_OPTIONS = [
  { text: "適用中", value: "0" },
  { text: "未適用", value: "1" }
];

export const SCENARIO_SETTING_SEARCH_ATTRIBUTE_OPTIONS = [
  { text: "メッセージ名", value: "name" },
  { text: "ユーザー入力", value: "user_input" },
  { text: "テキスト", value: "text" },
  { text: "種別", value: "type" }
];

export const SCENARIO_SETTING_SEARCH_TYPE_OPTIONS = [
  { text: "文字メッセージ", value: "text" },
  { text: "イメージマップメッセージ", value: "imagemap" },
  { text: "ボタン型テンプレートメッセージ", value: "buttons" },
  { text: "カルーセル型テンプレートメッセージ", value: "carousel" },
  { text: "確認型テンプレートメッセージ", value: "confirm" },
  { text: "フレックスメッセージ", value: "bubbleFlex" },
  { text: "複合メッセージ", value: "compositeMessage" },
];
