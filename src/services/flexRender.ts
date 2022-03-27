/*
 * Copyright 2021 LINE Fukuoka Corporation
 *
 * LINE Corporation licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
import decamelize from "decamelize";

function createElement(type, props) {
  const e = document.createElement(type);
  const className = props.className;
  const style = props.style;
  const attr = props.attr;

  if (className) {
    e.className = `${className}`;
  }

  if (style) {
    if (typeof style === "object") {
      e.style = Object.keys(style)
          .map((p) => `${decamelize(p, "-")}:${style[p]}`)
          .join("; ");
    } else {
      e.style = style;
    }
  }

  if (attr && attr.length > 0) {
    attr.forEach((a) => {
      if (a.name && a.value) {
        e.setAttribute(a.name, a.value);
      }
    });
  }

  return e;
}

function createBubble(props) {
  return createElement("div", {
    className: `T1`.concat(props.direction == "rtl" ? " fxRTL" : " fxLTR"),
    attr: [
      {
        name: "action",
        value: JSON.stringify(props.action),
      },
      {
        name: "direction",
        value: props.direction,
      },
    ],
  });
}

function setPixel(props) {
  const regexr_px = new RegExp("^[0-9]+px$|^[0-9]+.[0-9]+px$|^-[0-9]+px$|^-[0-9]+.[0-9]+px$");

  if (props.offsetTop) {
    const temp = props.offsetTop.toLowerCase();
    if (temp == "none") {
      props.offsetTop = "ExT".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.offsetTop = "ExT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.offsetTop = "ExT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.offsetTop = "ExT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.offsetTop = "ExT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.offsetTop = "ExT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.offsetTop = "ExT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.offsetTop = (9999 / 9999) * tempNumber + "px";
    }
  }
  if (props.offsetBottom) {
    const temp = props.offsetBottom.toLowerCase();
    if (temp == "none") {
      props.offsetBottom = "ExB".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.offsetBottom = "ExB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.offsetBottom = "ExB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.offsetBottom = "ExB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.offsetBottom = "ExB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.offsetBottom = "ExB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.offsetBottom = "ExB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.offsetBottom = (9999 / 9999) * tempNumber + "px";
    }
  }
  if (props.offsetStart) {
    const temp = props.offsetStart.toLowerCase();
    if (temp == "none") {
      props.offsetStart = "ExL".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.offsetStart = "ExL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.offsetStart = "ExL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.offsetStart = "ExL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.offsetStart = "ExL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.offsetStart = "ExL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.offsetStart = "ExL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.offsetStart = (9999 / 9999) * tempNumber + "px";
    }
  }
  if (props.offsetEnd) {
    const temp = props.offsetEnd.toLowerCase();
    if (temp == "none") {
      props.offsetEnd = "ExR".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.offsetEnd = "ExR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.offsetEnd = "ExR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.offsetEnd = "ExR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.offsetEnd = "ExR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.offsetEnd = "ExR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.offsetEnd = "ExR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.offsetEnd = (9999 / 9999) * tempNumber + "px";
    }
  }
  if (props.paddingAll) {
    const temp = props.paddingAll.toLowerCase();
    if (temp == "none") {
      props.paddingAll = "ExPadA".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.paddingAll = "ExPadA".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.paddingAll = "ExPadA".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.paddingAll = "ExPadA".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.paddingAll = "ExPadA".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.paddingAll = "ExPadA".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.paddingAll = "ExPadA".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.paddingAll = (9999 / 9999) * tempNumber + "px";
    }
  }

  if (props.paddingTop) {
    const temp = props.paddingTop.toLowerCase();
    if (temp == "none") {
      props.paddingTop = "ExPadT".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.paddingTop = "ExPadT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.paddingTop = "ExPadT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.paddingTop = "ExPadT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.paddingTop = "ExPadT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.paddingTop = "ExPadT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.paddingTop = "ExPadT".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.paddingTop = (9999 / 9999) * tempNumber + "px";
    }
  }
  if (props.paddingBottom) {
    const temp = props.paddingBottom.toLowerCase();
    if (temp == "none") {
      props.paddingBottom = "ExPadB".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.paddingBottom = "ExPadB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.paddingBottom = "ExPadB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.paddingBottom = "ExPadB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.paddingBottom = "ExPadB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.paddingBottom = "ExPadB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.paddingBottom = "ExPadB".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.paddingBottom = (9999 / 9999) * tempNumber + "px";
    }
  }

  if (props.paddingStart) {
    const temp = props.paddingStart.toLowerCase();
    if (temp == "none") {
      props.paddingStart = "ExPadL".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.paddingStart = "ExPadL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.paddingStart = "ExPadL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.paddingStart = "ExPadL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.paddingStart = "ExPadL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.paddingStart = "ExPadL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.paddingStart = "ExPadL".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.paddingStart = (9999 / 9999) * tempNumber + "px";
    }
  }
  if (props.paddingEnd) {
    const temp = props.paddingEnd.toLowerCase();
    if (temp == "none") {
      props.paddingEnd = "ExPadR".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "xs") {
      props.paddingEnd = "ExPadR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "sm") {
      props.paddingEnd = "ExPadR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "md") {
      props.paddingEnd = "ExPadR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "lg") {
      props.paddingEnd = "ExPadR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xl") {
      props.paddingEnd = "ExPadR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (temp == "xxl") {
      props.paddingEnd = "ExPadR".concat(temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1));
    } else if (regexr_px.test(temp)) {
      const tempNumber = parseFloat(temp.toString().replace("px", ""));
      props.paddingEnd = (9999 / 9999) * tempNumber + "px";
    }
  }

  if (props.cornerRadius) {
    const temp = props.cornerRadius.toLowerCase();
    if (temp == "none") {
      delete props["cornerRadius"];
    } else if (temp == "xs") {
      props.cornerRadius = "ExBdrRad".concat(temp.slice(0, 1).toUpperCase() + temp.slice(1));
    } else if (temp == "sm") {
      props.cornerRadius = "ExBdrRad".concat(
          temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1)
      );
    } else if (temp == "md") {
      props.cornerRadius = "ExBdrRad".concat(
          temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1)
      );
    } else if (temp == "lg") {
      props.cornerRadius = "ExBdrRad".concat(
          temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1)
      );
    } else if (temp == "xl") {
      props.cornerRadius = "ExBdrRad".concat(
          temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1)
      );
    } else if (temp == "xxl") {
      props.cornerRadius = "ExBdrRad".concat(
          temp.slice(0, temp.length - 1).toUpperCase() + temp.slice(temp.length - 1)
      );
    } else if (regexr_px.test(props.cornerRadius)) {
      const tempNumber = parseFloat(props.cornerRadius.toString().replace("px", ""));
      props.cornerRadius = (9999 / 9999) * tempNumber + "px";
    }
  }

  if (props.width) {
    if (regexr_px.test(props.width)) {
      const tempNumber = parseFloat(props.width.toString().replace("px", ""));
      props.width = (9999 / 9999) * tempNumber + "px";
    }
  }
  if (props.height) {
    if (regexr_px.test(props.height)) {
      const tempNumber = parseFloat(props.height.toString().replace("px", ""));
      props.height = (9999 / 9999) * tempNumber + "px";
    }
  }

  if (props.borderWidth) {
    if (regexr_px.test(props.borderWidth)) {
      const tempNumber = parseFloat(props.borderWidth.toString().replace("px", ""));
      props.borderWidth = (9999 / 9999) * tempNumber + "px";
    }
  }

  if (props.cornerRadius) {
    if (regexr_px.test(props.cornerRadius)) {
      const tempNumber = parseFloat(props.cornerRadius.toString().replace("px", ""));
      props.cornerRadius = (9999 / 9999) * tempNumber + "px";
    }
  }

  return props;
}

const classNameHandlers = {
  // horizontal, vertical, baseline(same as horizontal)
  layout: (p) => `${p === "horizontal" ? "hr" : p === "vertical" ? "vr" : "bl"}${p === "baseline" ? " hr" : ""}`,
  //layout: p => `${p === 'horizontal' ? 'hr': (p === 'vertical' ? 'vr': 'bl')}`,

  // The default value for the horizontal parent box is 1,
  // and the default value for the vertical parent box is 0
  /* flex: p => `flex-${p}`, */
  // none, xs, sm, md, lg, xl, or xxl. none
  //  The default value is none
  spacing: (p) => `${p.startsWith("none") ? "" : "spc" + p.charAt(0).toUpperCase() + p.slice(1)}`,

  // none, xs, sm, md, lg, xl, or xxl. none
  // The default value is the value of the spacing property of the parent box.
  margin: (p) =>
      `${p.startsWith("none") ? "None" : "ExMgn" + p.slice(0, p.length - 1).toUpperCase() + p.slice(p.length - 1)}`,

  // start: Left-aligned, end: Right-aligned, center: Center-aligned
  align: (p) => `${p.startsWith("none") ? "" : "alg" + p.charAt(0).toUpperCase()}`,

  // top: Top-aligned, bottom: Bottom-aligned, center: Center-aligned
  gravity: (p) => `${p.startsWith("none") || p.startsWith("top") ? "" : "grv" + p.charAt(0).toUpperCase()}`,

  // xxs, xs, sm, md, lg, xl, xxl, 3xl, 4xl, 5xl, or full.
  // The default value is md.
  size: (p) =>
      `Ex${
          p.startsWith("none")
              ? "Md"
              : p.startsWith("full")
              ? "Full"
              : p.slice(0, p.length - 1).toUpperCase() + p.slice(p.length - 1)
      }`,
  // 1:1, 1.51:1, 1.91:1, 4:3, 16:9, 20:13, 2:1, 3:1, 3:4, 9:16, 1:2, or 1:3.
  // The default value is 1:1
  aspectRatio: (p) => `ar-${p.replace(".", "").replace(":", "to")}`,
  // cover, fit
  aspectMode: (p) => `Ex${p === "cover" ? "Cover" : "Fit"}`,

  style: (p) => `style-${p}`,
  height: (p) =>
      `${p.startsWith("none") || p.toLowerCase().endsWith("px") ? "" : "Ex" + p.charAt(0).toUpperCase() + p.slice(1)}`,

  wrap: (p) => `${p ? "ExWrap" : ""}`,
  weight: (p) => `${"ExW" + p.charAt(0).toUpperCase()}`,
  decoration: (p) => `${p === "underline" ? "ExTxtDecUl" : p === "line-through" ? "ExTxtDecLt" : "ExTxtDecNone"}`,

  paddingAll: (p) => `${p.startsWith("Ex") ? p : ""}`,
  paddingTop: (p) => `${p.startsWith("Ex") ? p : ""}`,
  paddingBottom: (p) => `${p.startsWith("Ex") ? p : ""}`,
  paddingStart: (p) => `${p.startsWith("Ex") ? p : ""}`,
  paddingEnd: (p) => `${p.startsWith("Ex") ? p : ""}`,

  offsetTop: (p) => `${p.startsWith("Ex") ? p : ""}`,
  offsetBottom: (p) => `${p.startsWith("Ex") ? p : ""}`,
  offsetStart: (p) => `${p.startsWith("Ex") ? p : ""}`,
  offsetEnd: (p) => `${p.startsWith("Ex") ? p : ""}`,
  cornerRadius: (p) => `${p.startsWith("Ex") ? p : ""}`,
};

const styleHandlers = {
  // hex value
  backgroundColor: (p) => `background-color:${p};`,
  // url, JPEG or PNG, Max size 1024x1024, Max size: 1MB
  url: (p) => `background-image: url('${p}');`,
  // color for background of button
  color: (p) => `color: ${p};`,
  separatorColor: (p) => `border-color: ${p};`,
  position: (p) => `position: ${p};`,
  offsetTop: (p) => `top: ${p};`,
  offsetBottom: (p) => `bottom: ${p};`,
  offsetStart: (p) => `left: ${p};`,
  offsetEnd: (p) => `right: ${p};`,
};

function getClassName(props, names) {
  if (!names || names.length === 0) {
    return Object.keys(props)
        .filter((p) => classNameHandlers[p])
        .map((p) => classNameHandlers[p](props[p]))
        .join(" ");
  } else {
    return names
        .filter((n) => props[n])
        .map((n) => classNameHandlers[n](props[n]))
        .join(" ");
  }
}

function getStyles(props, names) {
  if (!props) {
    return "";
  }

  if (!names || names.length === 0) {
    return Object.keys(props)
        .filter((p) => styleHandlers[p])
        .map((p) => styleHandlers[p](props[p]))
        .join(" ");
  } else {
    return names
        .filter((n) => props[n])
        .map((n) => styleHandlers[n](props[n]))
        .join(" ");
  }
}

/*
  @desc box component
  @type box
  @prop layout, contents, flex, spacing, margin */
function createBox(parentJson, props) {
  let flex0 = false;
  let flex1_2_3 = false;

  if (parentJson.type !== "bubble") {
    if (props.width || props.height) {
      flex0 = true;
      if (parentJson.layout === "horizontal") {
        flex0 = true;
      } else if (parentJson.layout === "baseline") {
        flex0 = true;
      }
    }
    if (props.flex == "0") {
      flex0 = true;
    }
    if (props.flex == "1" || props.flex == "2" || props.flex == "3") {
      flex1_2_3 = true;
    }
  }

  if (props.margin) {
    if (parentJson.layout === "vertical") {
      props.margin = "T" + props.margin;
    } else if (parentJson.layout === "horizontal") {
      props.margin = "L" + props.margin;
    } else if (parentJson.layout === "baseline") {
      props.margin = "L" + props.margin;
    }
  }

  props = setPixel(props);
  const box = createElement("div", {
    className: `MdBx ${getClassName(props, null)}`
        .concat(flex0 ? " fl0" : "")
        .concat(flex1_2_3 ? " fl" + props.flex : "")
        .concat(props.position == "absolute" ? " ExAbs" : ""),

    //style:  ''.concat(props.position == 'absolute' ? `position : ${props.position}; margin: 0;`:'')
    style: ""
        .concat(props.position == "absolute" ? "" : "")
        .concat(props.offsetTop ? `top : ${props.offsetTop};` : "")
        .concat(props.offsetBottom ? `bottom : ${props.offsetBottom};` : "")
        .concat(props.offsetStart ? `left : ${props.offsetStart};` : "")
        .concat(props.offsetEnd ? `	right : ${props.offsetEnd};` : "")
        .concat(props.paddingAll ? ` padding : ${props.paddingAll};` : "")
        .concat(props.paddingTop ? ` padding-top : ${props.paddingTop};` : "")
        .concat(props.paddingBottom ? ` padding-bottom : ${props.paddingBottom};` : "")
        .concat(props.paddingStart ? ` padding-left : ${props.paddingStart};` : "")
        .concat(props.paddingEnd ? ` padding-right : ${props.paddingEnd};` : "")
        .concat(props.width ? `width : ${props.width};` : "")
        .concat(props.height ? `height : ${props.height};` : "")
        .concat(props.borderWidth ? `border-style: solid; border-width : ${props.borderWidth};` : "")
        .concat(props.backgroundColor ? `background-color : ${props.backgroundColor};` : "")
        .concat(props.borderColor ? `border-color : ${props.borderColor};` : "")
        .concat(props.cornerRadius ? `border-radius : ${props.cornerRadius};` : "")
        .concat(!flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `-webkit-box-flex:${props.flex};` : "")
        .concat(
            !flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `flex : ${props.flex} ${props.flex} auto;` : ""
        ),
    attr: [
      {
        name: "action",
        value: JSON.stringify(props.action),
      },
    ],
  });

  return box;
}

/*
    @desc image component
    @type image
    @prop url, flex, margin, align, gravity, size, aspectRatio, aspectMode,
          backgroundColor, action
  */
function createImage(parentJson, props) {
  props = {
    size: "md",
    aspectRatio: "1:1",
    aspectMode: "fit",
    ...props,
  };
  props = setPixel(props);

  let aspectRatioValue;
  if (props.aspectRatio) {
    aspectRatioValue =
        (parseFloat(props.aspectRatio.split(":")[1]) / parseFloat(props.aspectRatio.split(":")[0])) * 100;
  }

  if (props.margin) {
    if (parentJson.layout === "vertical") {
      props.margin = "T" + props.margin;
    } else if (parentJson.layout === "horizontal") {
      props.margin = "L" + props.margin;
    } else if (parentJson.layout === "baseline") {
      props.margin = "L" + props.margin;
    }
  }

  let flex0 = false;

  if (props.flex == "0") {
    flex0 = true;
  }

  let flex1_2_3 = false;
  if (props.flex == "1" || props.flex == "2" || props.flex == "3") {
    flex1_2_3 = true;
  }

  const image = createElement("div", {
    className: `MdImg ${getClassName(props, null)}`
        .concat(props.position == "absolute" ? " ExAbs" : "")
        .concat(flex0 ? " fl0" : "")
        .concat(flex1_2_3 ? " fl" + props.flex : ""),
    //style:  ''.concat(props.position == 'absolute' ? `position : ${props.position}; margin: 0;`:'')
    style: ""
        .concat(props.position == "absolute" ? `` : "")
        .concat(props.offsetTop ? `top : ${props.offsetTop};` : "")
        .concat(props.offsetBottom ? `bottom : ${props.offsetBottom};` : "")
        .concat(props.offsetStart ? `left : ${props.offsetStart};` : "")
        .concat(props.offsetEnd ? `	right : ${props.offsetEnd};` : "")
        .concat(!flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `-webkit-box-flex:${props.flex};` : "")
        .concat(
            !flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `flex : ${props.flex} ${props.flex} auto;` : ""
        ),
  });
  const d = createElement("div", {});
  const a = createElement("a", {
    style: "".concat(props.aspectRatio ? `padding-bottom : calc(${aspectRatioValue}%);` : ""),
    attr: [
      {
        name: "action",
        value: JSON.stringify(props.action),
      },
    ],
  });
  delete props["position"];
  delete props["offsetTop"];
  delete props["offsetBottom"];
  delete props["offsetStart"];
  delete props["offsetEnd"];

  const span = createElement("span", {
    style: getStyles(props, null),
  });

  a.appendChild(span);
  d.appendChild(a);
  image.appendChild(d);

  return image;
}

/*
    @desc text component
    @type text
    @prop url, flex, margin, size, align, gravity, wrap, weight
          color, action
  */
function createTextElement(t) {
  const text = createElement("p", {});

  text.textContent = t;
  return text;
}

function createText(parentJson, props, contents) {
  if (props.margin) {
    if (parentJson.layout === "vertical") {
      props.margin = "T" + props.margin;
    } else if (parentJson.layout === "horizontal") {
      props.margin = "L" + props.margin;
    } else if (parentJson.layout === "baseline") {
      props.margin = "L" + props.margin;
    }
  }

  let flex0 = false;

  if (props.flex == "0") {
    flex0 = true;
  }

  let flex1_2_3 = false;
  if (props.flex == "1" || props.flex == "2" || props.flex == "3") {
    flex1_2_3 = true;
  }

  const textClass = "".concat(
      `${
          !props.align || props.align == "none" || props.align == "start"
              ? ""
              : " ExAlg" + props.align.charAt(0).toUpperCase()
      }`
  );

  delete props["align"];

  props = setPixel(props);
  const outer = createElement("div", {
    className: `MdTxt ${getClassName(props, null)}`
        .concat(flex0 ? " fl0" : "")
        .concat(flex1_2_3 ? " fl" + props.flex : "")
        .concat(textClass),
    style: getStyles(props, null)
        .concat(props.position ? `position : ${props.position};` : "")
        .concat(props.offsetTop ? `top : ${props.offsetTop};` : "")
        .concat(props.offsetBottom ? `bottom : ${props.offsetBottom};` : "")
        .concat(props.offsetStart ? `left : ${props.offsetStart};` : "")
        .concat(props.offsetEnd ? `right : ${props.offsetEnd};` : "")
        .concat(props.style ? `font-style : ${props.style} !important;` : "")
        //.concat(props.decoration ? `text-decoration : ${props.decoration};`:'')
        .concat(props.decoration ? `` : "")
        .concat(!flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `-webkit-box-flex:${props.flex};` : "")
        .concat(
            !flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `flex : ${props.flex} ${props.flex} auto;` : ""
        ),

    //.concat(props.maxline ? `left : ${props.maxline};`:'')
    attr: [
      {
        name: "action",
        value: JSON.stringify(props.action),
      },
    ],
  });

  if (!contents || contents.length < 1) {
    if (props.wrap) {
      props.text.split("\\n").forEach((t) => {
        outer.appendChild(createTextElement(t));
      });
    } else {
      outer.appendChild(createTextElement(props.text.replace("\\n", " ")));
    }
  } else {
    const p = createElement("p", {});
    contents.forEach((span) => {
      p.appendChild(createSpan(props, span));
    });

    outer.appendChild(p);
  }
  return outer;
}

/*
    @desc separator component
    @type separator
    @prop margin, color
  */
function createSeparator(parentJson, props) {
  props = setPixel(props);
  if (props.color) {
    props.separatorColor = props.color;
    delete props.color;
  }

  if (props.margin) {
    if (parentJson && parentJson.layout === "vertical") {
      props.margin = "T" + props.margin;
    } else if (parentJson && parentJson.layout === "horizontal") {
      props.margin = "L" + props.margin;
    } else if (parentJson && parentJson.layout === "baseline") {
      props.margin = "L" + props.margin;
    }
  }

  return createElement("div", {
    className: `MdSep fl0 ${getClassName(
        {
          flex: 0,
          //size: 'md',
          ...props,
        },
        null
    )}`,
    style: getStyles(props, null),
  });
}

/*
    @desc button component
    @type button
    @prop action.lebel, flex, margin, height, style, color, gravity
  */
function createButton(parentJson, props) {
  props.style = props.style || "link";
  props = setPixel(props);

  let flex0 = false;

  if (props.flex == "0") {
    flex0 = true;
  }

  let flex1_2_3 = false;
  if (props.flex == "1" || props.flex == "2" || props.flex == "3") {
    flex1_2_3 = true;
  }

  const buttonClass = ""
      .concat(`${props.style === "link" ? " ExBtnL" : ""}`)
      .concat(`${props.style === "primary" ? " ExBtn1" : ""}`)
      .concat(`${props.style === "secondary" ? " ExBtn2" : ""}`);

  delete props["style"];

  const button = createElement("div", {
    className: `MdBtn ${getClassName(props, null)}`
        .concat(buttonClass)
        .concat(flex0 ? " fl0" : "")
        .concat(flex1_2_3 ? " fl" + props.flex : ""),
    style: ""
        .concat(props.position == "absolute" ? `position : ${props.position}; margin: 0;` : "")
        .concat(props.offsetTop ? `top : ${props.offsetTop};` : "")
        .concat(props.offsetBottom ? `bottom : ${props.offsetBottom};` : "")
        .concat(props.offsetStart ? `left : ${props.offsetStart};` : "")
        .concat(props.offsetEnd ? `	right : ${props.offsetEnd};` : "")
        .concat(!flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `-webkit-box-flex:${props.flex};` : "")
        .concat(
            !flex0 && !flex1_2_3 && props.flex && props.flex !== "none" ? `flex : ${props.flex} ${props.flex} auto;` : ""
        ),
  });
  const a = createElement("a", {
    // >> Character color when the style property is link.
    // >> Background color when the style property is primary or secondary.
    style: props.color ? `color: ${props.color}` : "",
    attr: [
      {
        name: "action",
        value: JSON.stringify(props.action),
      },
    ],
  });
  const d = createElement("div", {});

  if (props.action && props.action.label) {
    d.textContent = props.action.label;
  }

  a.appendChild(d);
  button.appendChild(a);

  return button;
}

/*
    @desc icon component
    @type icon
    @prop url, margin, size, aspectRatio
  */
function createIcon(parentJson, props) {
  let aspectRatioValue;
  if (props.aspectRatio) {
    aspectRatioValue = parseFloat(props.aspectRatio.split(":")[0]) / parseFloat(props.aspectRatio.split(":")[1]);
  }

  props = setPixel(props);
  const icon = createElement("div", {
    className: `MdIco fl0 ${getClassName(
        {
          flex: 0,
          size: "md",
          ...props,
        },
        null
    )}`,

    style: ""
        .concat(props.position == "absolute" ? `position : ${props.position}!important; margin: 0!important;` : "")
        .concat(props.offsetTop ? `top : ${props.offsetTop};` : "")
        .concat(props.offsetBottom ? `bottom : ${props.offsetBottom};` : "")
        .concat(props.offsetStart ? `left : ${props.offsetStart};` : "")
        .concat(props.offsetEnd ? `	right : ${props.offsetEnd};` : ""),
  });

  const d = createElement("div", {});

  delete props["position"];
  delete props["offsetTop"];
  delete props["offsetBottom"];
  delete props["offsetStart"];
  delete props["offsetEnd"];

  const span = createElement("span", {
    style: getStyles(props, null).concat(props.aspectRatio ? `width : calc(${aspectRatioValue}em);` : "width : 1em;"),
  });

  d.appendChild(span);
  icon.appendChild(d);

  return icon;
}

/*
    @desc spacer component
    @type spacer
    @prop size: md
  */
function createSpacer(parentJson, props) {
  let flex0 = false;

  if (props.flex == "0") {
    flex0 = true;
  }
  let flex1_2_3 = false;
  if (props.flex == "1" || props.flex == "2" || props.flex == "3") {
    flex1_2_3 = true;
  }

  props = setPixel(props);
  const spacerClass = ""
      .concat(props.flex ? (flex1_2_3 ? " fl" + props.flex : "") : " fl0")
      .concat(
          `${
              !props.size
                  ? " spcMd"
                  : " spc" + props.size.slice(0, props.size.length - 1).toUpperCase() + props.size.slice(props.size.length - 1)
          }`
      );

  delete props["size"];

  return createElement("div", {
    className: `mdBxSpacer ${getClassName(
        {
          flex: 0,
          // size: 'md',
          ...props,
        },
        null
    )}`.concat(spacerClass),
    style: getStyles(props, null),
  });
}

/*
    @desc filler component
    @type filler
  */
function createFiller(parentJson, props) {
  props = setPixel(props);
  return createElement("div", {
    className: `mdBxFiller ${getClassName(props, null)}`,
    style: ""
        .concat(props.flex && props.flex !== "none" ? `-webkit-box-flex:${props.flex};` : "")
        .concat(props.flex && props.flex !== "none" ? `flex : ${props.flex} ${props.flex} auto;` : ""),
  });
}

function createSpan(parentJson, props) {
  props = setPixel(props);
  const span = createElement("span", {
    className: `MdSpn ${getClassName(props, null)}`,
    style: "" /*.concat(props.size ? `font-size : ${props.size};`:'')
                  .concat(props.color ? `font-color : ${props.color};`:'')
                  .concat(props.weight ? `font-weight : ${props.weight};`:'')*/
        .concat(props.color ? `color : ${props.color};` : "")
        .concat(props.style ? `font-style : ${props.style};` : "")
        .concat(props.decoration ? `text-decoration : ${props.decoration};` : ""),
    //.concat(props.maxline ? `left : ${props.maxline};`:'')
  });

  span.innerHTML = props.text.replace(/\n/g, "<br>");
  return span;
}

/*
  @desc block component properties
*/
function createBlock(props, name) {
  return createElement("div", {
    className: `t1${name.charAt(0).toUpperCase() + name.slice(1)}`,
    style: getStyles(props.styles && props.styles[name], ["backgroundColor"]),
  });
}

function createBlockForBody(props, name, hasFooter) {
  let hasFooterClass = "";
  if (hasFooter) {
    hasFooterClass = "ExHasFooter";
  }

  return createElement("div", {
    className: `t1${name.charAt(0).toUpperCase() + name.slice(1)} ${hasFooterClass}`,
    style: getStyles(props.styles && props.styles[name], ["backgroundColor"]),
  });
}

function hasBlockSeparator(styles, block) {
  return styles && styles[block] && styles[block].separator;
}

function parseComponent(parentJson, parent, components, order) {
  if (!components) {
    return parent;
  }

  if (!(components instanceof Array)) {
    components = [components];
  }

  for (const component of components) {
    const { contents, ...json } = component;
    let comp;

    switch (json.type) {
      case "box":
        comp = createBox(parentJson, json);
        break;
      case "text":
        comp = createText(parentJson, json, contents);
        break;
      case "image":
        comp = createImage(parentJson, json);
        break;
      case "separator":
        comp = createSeparator(parentJson, json);
        break;
      case "button":
        comp = createButton(parentJson, json);
        break;
      case "icon":
        comp = createIcon(parentJson, json);
        break;
      case "spacer":
        comp = createSpacer(parentJson, json);
        break;
      case "filler":
        comp = createFiller(parentJson, json);
        break;
      case "span":
        comp = createSpan(parentJson, json);
        break;
    }
    if (json.type !== "span") {
      const def = parent.getAttribute("def");
      if (def != null) {
        comp.setAttribute("def", `${def}.${order}`);
      } else {
        comp.setAttribute("def", order);
      }

      if (contents && contents.length > 0) {
        contents.forEach((c, i) => {
          parseComponent(json, comp, c, i);
        });
      }

      if (comp) {
        parent.appendChild(comp);
      }
    }
  }

  return parent;
}

function parseBubble(root, json) {
  const bubble = createBubble(json);
  const styles = json.styles;

  if (json.header) {
    bubble.appendChild(parseComponent(json, createBlock(json, "header"), json.header, 0));
  }

  if (json.header && hasBlockSeparator(json.styles, "hero")) {
    bubble.appendChild(createSeparator(null, styles.hero));
  }

  if (json.hero) {
    bubble.appendChild(parseComponent(json, createBlock(json, "hero"), json.hero, 1));
  }

  // body can only have separator as header or hero existing
  if ((json.header || json.hero) && hasBlockSeparator(json.styles, "body")) {
    bubble.appendChild(createSeparator(null, styles.body));
  }

  if (json.body) {
    if (json.footer) {
      bubble.appendChild(parseComponent(json, createBlockForBody(json, "body", true), json.body, 2));
    } else {
      bubble.appendChild(parseComponent(json, createBlockForBody(json, "body", false), json.body, 2));
    }
  }

  // footer can only have separator as header or hero, footer existing
  if ((json.header || json.hero || json.body) && hasBlockSeparator(json.styles, "footer")) {
    bubble.appendChild(createSeparator(null, styles.footer));
  }

  if (json.footer) {
    bubble.appendChild(parseComponent(json, createBlock(json, "footer"), json.footer, 3));
  }

  root.appendChild(bubble);

  return root;
}

export function render(json) {
  const container = createElement("div", {
    className: "lyItem "
        .concat(json.size == "giga" ? `LyGi` : "")
        .concat(json.size == "mega" ? `LyMe` : "")
        .concat(json.size == "kilo" ? `LyKi` : "")
        .concat(json.size == "micro" ? `LyMi` : "")
        .concat(json.size == "nano" ? `LyNa` : "")
        .concat(json.size == null ? `LyMe` : ""),

    style: "",
  });

  return parseBubble(container, json).outerHTML;
}
