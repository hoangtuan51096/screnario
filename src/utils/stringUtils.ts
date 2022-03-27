import MaskData from "maskdata";

export const convertAuthErrorMessages = (error) => {
  const code = error.code ? error.code : undefined;
  var message = undefined;
  var status = error.status ? error.status : undefined;

  switch (code) {
    case "NotAuthorizedException":
    case "InvalidParameterException":
      if (error.message.includes("disabled")) {
        message = "アカウントが無効化されています。";
      } else {
        message = "ユーザ名またはパスワードが間違っているか登録されていません。";
      }
      break;
    case "InvalidPasswordException":
      message = "認証コードが間違っているか、パスワードポリシーを満たしていません。";
      break;
    case "CodeMismatchException":
      message = "認証コードが正しくありません。";
      break;
    case "LimitExceededException":
      message =
        "アカウント入力回数の上限を超えたため、ご利用いただけません。しばらく経ってからもう一度お試しください。";
      break;
    case "PasswordResetRequiredException":
      message = "パスワードはリセットされました。";
      break;
    default:
      message = "不明なエラーが発生しました。";
      break;
  }
  switch (status) {
    case 422:
    case 400:
      message = error.data.error_msg;
      break;
    default:
      message = "不明なエラーが発生しました。";
      break;
  }

  return message;
};

export const isNullOrEmpty = (str) => {
  if (Number.isInteger(str)) {
    str = str.toString();
  }
  return str === null || str === undefined || str.trim() === "";
};

export const convertGroupNames = (name) => {
  switch (name) {
    case "admins":
      return "アドミン";
    case "members":
      return "メンバー";
    case "guests":
      return "ゲスト";
    case "operators":
      return "オペレーター";
  }
};

export const trim = (str)=> {
  if (str === null || str === undefined) {
    return str;
  }
  return str.replace(/^[\s　\uFEFF\xA0]+|[\s　\uFEFF\xA0]+$/g, "");
};

export const makeMask = (str) => {
  const options = {
    maskWith: "x",
    maxMaskedCharacters: str.length,
    unmaskedStartCharacters: 4,
  };

  return MaskData.maskPassword(str, options);
};

export const convertSecretKeyToJapanese = (key) => {
  let secretKeyList = {
    LINEMESSAGING_CHANNEL_ACCESS_TOKEN: "チャネルアクセストークン",
    LINEMESSAGING_CHANNEL_ID: "チャネルID",
    LINEMESSAGING_CHANNEL_SECRET: "チャネルシークレット",
    SB_LINEMESSAGING_CHANNEL_ACCESS_TOKEN: "チャネルアクセストークン",
    SB_LINEMESSAGING_CHANNEL_ID: "チャネルID",
    SB_LINEMESSAGING_CHANNEL_SECRET: "チャネルシークレット",
    EMAIL_CHATBOT_DAMAGE_REPORT1: "損傷報告先メールアドレス1 (EMAIL_CHATBOT_DAMAGE_REPORT1)",
    EMAIL_CHATBOT_DAMAGE_REPORT2: "損傷報告先メールアドレス2 (EMAIL_CHATBOT_DAMAGE_REPORT2)",
    EMAIL_CHATBOT_DAMAGE_REPORT3: "損傷報告先メールアドレス3 (EMAIL_CHATBOT_DAMAGE_REPORT3)",
    EMAIL_CHATBOT_DAMAGE_REPORT4: "損傷報告先メールアドレス4 (EMAIL_CHATBOT_DAMAGE_REPORT4)",
    SES_EMAIL_DOMAIN: "損傷報告送信メールドメイン (SES_EMAIL_DOMAIN)",
    CHATBOT_TRASH_SEPARATION_FUZZY_SEARCH: "ゴミ分別のあいまい検索",
    SB_CHATBOT_TRASH_SEPARATION_FUZZY_SEARCH: "ゴミ分別のあいまい検索"
  };
  return secretKeyList[key] || key;
};

export const copyTextToClipboard = (document, id) => {
  var copied = document.getElementById(id);
  copied.select();
  copied.setSelectionRange(0, 99999);

  document.execCommand("copy");
  return true;
};
