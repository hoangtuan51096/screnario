import { BOT_ITEM_TYPES } from "./scenarios.constants";
import { cloneDeep } from "lodash";

let flatTreeScenarios = [];

let ID = 0;
export default {
  diagramChartSource: (state) => {
    let _data = [
      {
        id: "talk",
        text: "トーク",
        edgeType: "round",
        link: [],
        next: [],
      },
    ];
    let _scenarioMessages = cloneDeep(state.scenarioMessages);
    let _richMenu = _scenarioMessages.find((obj) => obj.dataType === "richmenu");

    if (_richMenu) {
      _data.push({
        id: "richmenu",
        text: "リッチメニュー",
        edgeType: "round",
        link: [],
        next: [],
      });

      let _actionCount = _richMenu.params.actionCount;
      for (let actionIndex = 0; actionIndex < _actionCount; actionIndex++) {
        let _area = _richMenu.params[`area.${actionIndex}`];

        _data.push({
          id: `area.${actionIndex}`,
          text: _area.text,
          link: [],
          next: [],
        });
        _data[1].link.push(`-- "${_area.text}" -->`);
        _data[1].next.push(`area.${actionIndex}`);
      }
    }

    const _scenarioTalks = cloneDeep(state.scenarioTalks);
    _scenarioTalks.forEach((talk) => {
      _data.push({
        id: talk.dataId,
        text: talk.params.name,
        link: [],
        next: [],
      });
      _data[0].link.push(`-->`);
      _data[0].next.push(talk.dataId);
    });

    return _data;
  },

  diagramChartSourceByTalk: (state) => (selectedTalk) => {
    let _scenarioMessages = cloneDeep(state.scenarioMessages);
    let _scenarioTalkSelected = state.scenarioTalks.find((obj) => obj.params.name === selectedTalk);
    let _scenarioTalkMsgBot = _scenarioTalkSelected.params.messages
        .filter((obj) => obj.sender === "BOT")
        .map((obj) => obj.messageId);

    let _scenarioTalkMsgUse = _scenarioTalkSelected.params.messages
        .filter((obj) => obj.sender === "USER")
        .map((obj) => obj.messageId);

    //define nodes from messages

    let _data = _scenarioMessages
        .filter((obj) => _scenarioTalkMsgBot.includes(obj.dataId))
        .map((msg) => {
          let _text = "";
          switch (msg.dataType) {
            case "text":
              _text = msg.params.text;
              break;
            case "compositeMessage":
              _text = BOT_ITEM_TYPES.compositeMessage.text;
              break;
            case "richmenu":
              _text = msg.params._name;
              break;
            default:
              _text = msg.nameLBD;
              break;
          }

          return {
            id: msg.dataId,
            text: formatLongText(_text),
            link: [],
            next: [],
            edgeType: "round",
            editable: true,
          };
        });

    var valuesToRemove = ["BOSAI_BACK_TO_NORMAL_MODE"];
    _data
        .filter((obj) => obj.id !== "USER_TEXT")
        .forEach((obj) => {
          let _textMapping = Object.keys(state.scenarioTextmap.textMapping).find(
              (key) => state.scenarioTextmap.textMapping[key] === obj.id
          );
          if (_textMapping) {
            _data[0].link.push(`-- "${_textMapping}" -->`);
            _data[0].next.push(obj.id);
          }
          //bosai special last template
          if (obj.id === "BOSAI_SHELTER_SEARCH_RESULT") {
            obj.link.push("-->");
            obj.next.push("BOSAI_SHELTER_TEMPLATE");
          }
          if (obj.id === "BOSAI_SHELTER_TEMPLATE") {
            obj.edgeType = "subroutine";
            obj.style = "fill:#f9f,stroke:#333,stroke-width:4px";
          }
          if (obj.id === "BOSAI_DISASTER_SELECT") {
            obj.edgeType = "default";
            obj.style = "fill:#00FFFF,stroke:#333,stroke-width:4px";
          }
          //define links between nodes by recurrent
          let _node = _scenarioMessages.find((msg) => msg.dataId === obj.id);

          if (_node) {
            flatTreeScenarios.length = [];

            crawlerScenarios(_node, _scenarioMessages, state.scenarioTextmap);

            //update links of each node
            flatTreeScenarios.forEach((element) => {
              let _parentNode = _data.find((obj) => obj.id === element.parentId);
              let _link = `-- "${element.link}" -->`;
              if (!_parentNode.link.includes(_link) || element.link === " ") _parentNode.link.push(_link);
              if (!_parentNode.next.includes(element.id)) _parentNode.next.push(element.id);
              let _childNode = _data.find((obj) => obj.id === element.id || (element.uri && element.uri === obj.uri));
              if (!_childNode) {
                if (element.id === "SHELTER_INFORMATION") {
                  _data.push({
                    id: element.id,
                    text: element.name,
                    link: [`-- "指定距離以内に有" -->`, `-- "指定距離以内に無" -->`],
                    next: ["BOSAI_SHELTER_SEARCH_RESULT", "BOSAI_SHELTER_NOT_FOUND"],
                    linkStyle: "branch",
                    style: "fill:#FFC300,stroke:#333,stroke-width:4px",
                    edgeType: "rhombus",
                    editable: true,
                    uri: element.uri,
                  });
                } else {
                  _data.push({
                    id: element.id,
                    text: element.name,
                    link: [],
                    next: [],
                    editable: true,
                    edgeType: element.edgeType ? element.edgeType : "round",
                    style: element.style,
                    uri: element.uri,
                  });
                }
              }
            });
          }
        });
    _data = _data.filter((item) => !valuesToRemove.includes(item.id));
    return _data;
  },
};

//recurrent, get tree data of scenarios
const crawlerScenarios = (parentObj, scenarioMessages, scenarioTextmap) => {
  let { params } = parentObj;
  if (parentObj) {
    //handle richmenu: リッチメニュー
    if (parentObj.dataType === "richmenu") {
      //loop area in richmenu
      for (let areaIndex = 0; areaIndex < params.actionCount; areaIndex++) {
        //handle action
        let _areaObj = params[`area.${areaIndex}`];
        switch (_areaObj.type) {
          case "message":
            //handle special case
            if (_areaObj.text === "損傷報告") {
              let _reportNode = scenarioMessages.find((obj) => obj.dataId === "REPORT_MODE_BUTTON");
              flatTreeScenarios.push({
                id: _reportNode.dataId,
                name: formatLongText(_reportNode.nameLBD),
                parentId: parentObj.dataId,
                link: _areaObj.text,
              });
              crawlerScenarios(_reportNode, scenarioMessages, scenarioTextmap);
            }
            break;
          default:
            break;
        }
      }
    }

    //handle buttons: ボタン型テンプレート
    if (parentObj.dataType === "buttons") {
      for (let actionIndex = 0; actionIndex < params.actionCount; actionIndex++) {
        let _actionObj = params[`actions.${actionIndex}`];

        switch (_actionObj.type) {
          case "postback":
            //handle postback case
            let _postbackNode = scenarioMessages.find((obj) => obj.dataId === _actionObj.data);
            if (_postbackNode) {
              flatTreeScenarios.push({
                id: _postbackNode.dataId,
                name: formatLongText(_postbackNode.nameLBD),
                parentId: parentObj.dataId,
                link: _actionObj.text,
              });
              crawlerScenarios(_postbackNode, scenarioMessages, scenarioTextmap);
            } else {
              flatTreeScenarios.push({
                id: ID,
                name: _actionObj.data,
                parentId: parentObj.dataId,
                link: _actionObj.text,
              });
              ID++;
            }
            break;
          case "uri":
            //handle uri case
            flatTreeScenarios.push({
              id: ID,
              name: formatLongText(_actionObj.uri),
              parentId: parentObj.dataId,
              link: _actionObj.label,
              uri: _actionObj.uri,
            });
            ID++;
            break;
          case "message":
            _handleMessageText(_actionObj, parentObj, params, scenarioMessages, scenarioTextmap);
            break;

          default:
            console.log(_actionObj.type);
            break;
        }
      }
    }

    //handle text: テキスト
    if (parentObj.dataType === "text") {
      let _textMappingId = scenarioTextmap.textMapping[params.text];

      if (_textMappingId) {
        let _mappingNode = scenarioMessages.find((obj) => obj.dataId === _textMappingId);

        flatTreeScenarios.push({
          id: _mappingNode.dataId,
          name: formatLongText(_mappingNode.nameLBD),
          parentId: parentObj.dataId,
          link: '',
        });
        crawlerScenarios(_mappingNode, scenarioMessages, scenarioTextmap);
      }
    }

    //handle text: テキスト
    if (parentObj.dataType === "imagemap") {
      for (let actionIndex = 0; actionIndex < params.actionCount; actionIndex++) {
        let _actionObj = params[`action.${actionIndex}`];
        switch (_actionObj.type) {
          case "message":
            _handleMessageText(_actionObj, parentObj, params[`title.${colIndex}`], scenarioMessages, scenarioTextmap);
            break;
          case "uri":
            //handle uri case
            flatTreeScenarios.push({
              id: ID,
              name: formatLongText(_actionObj.uri),
              parentId: parentObj.dataId,
              link: " ",
              uri: _actionObj.uri,
            });
            ID++;

            break;
          default:
            break;
        }
      }
    }

    //handle carousel: カルーセル
    if (parentObj.dataType === "carousel") {
      for (var colIndex = 0; colIndex < params.columnCount; colIndex++) {
        for (let actionIndex = 0; actionIndex < params.actionCount; actionIndex++) {
          const _actionObj = params[`action.${colIndex}.${actionIndex}`];

          switch (_actionObj.type) {
            case "message":
              _handleMessageText(_actionObj, parentObj, params[`title.${colIndex}`], scenarioMessages, scenarioTextmap);
              break;
            case "uri":
              //handle uri case
              flatTreeScenarios.push({
                id: ID,
                name: formatLongText(_actionObj.uri),
                parentId: parentObj.dataId,
                link: " ",
                uri: _actionObj.uri,
                style: "font-size: 8px",
              });
              ID++;

              break;
            default:
              break;
          }
        }
      }
    }

    //handle confirm: 確認テンプレート
    if (parentObj.dataType === "confirm") {
      let actionList = ["actionLeft", "actionRight"];
      for (let actionIndex = 0; actionIndex < 2; actionIndex++) {
        let _actionObj = params[actionList[actionIndex]];

        switch (_actionObj.type) {
          case "postback":
            //handle postback case
            let _postbackNode = scenarioMessages.find((obj) => obj.dataId === _actionObj.data);
            if (params.specialScenarioTalk !== "防災") {
              if (_postbackNode) {
                flatTreeScenarios.push({
                  id: _postbackNode.dataId,
                  name: formatLongText(_postbackNode.nameLBD),
                  parentId: parentObj.dataId,
                  link: _actionObj.text,
                });
                crawlerScenarios(_postbackNode, scenarioMessages, scenarioTextmap);
              } else {
                flatTreeScenarios.push({
                  id: ID,
                  name: _actionObj.data,
                  parentId: parentObj.dataId,
                  link: _actionObj.text,
                });
                ID++;
              }
            } else {
              flatTreeScenarios.push({
                id: _actionObj.data,
                name: "案内終了の説明",
                parentId: parentObj.dataId,
                link: _actionObj.text,
                edgeType: "stadium",
                style: "fill:#f9f,stroke:#333,stroke-width:4px",
              });
            }
            break;
          case "uri":
            //handle uri case
            if (params.specialScenarioTalk !== "防災") {
              flatTreeScenarios.push({
                id: ID,
                name: formatLongText(_actionObj.uri),
                parentId: parentObj.dataId,
                link: _actionObj.label,
                uri: _actionObj.uri,
              });
              ID++;
            } else {
              flatTreeScenarios.push({
                id: "SHELTER_INFORMATION",
                name: "避難所の案内",
                // name: formatLongText(_actionObj.uri),
                parentId: parentObj.dataId,
                link: _actionObj.label,
                // uri: _actionObj.uri,
              });
            }
            break;
          case "message":
            _handleMessageText(_actionObj, parentObj, params, scenarioMessages, scenarioTextmap);
            break;

          default:
            console.log(_actionObj.type);
            break;
        }
      }
    }
  }
};

const _handleMessageText = (_actionObj, parentObj, link, scenarioMessages, scenarioTextmap) => {
  //handle postback case
  let _textMappingId = scenarioTextmap.textMapping[_actionObj.text];

  if (_textMappingId) {
    let _mappingNode = scenarioMessages.find((obj) => obj.dataId === _textMappingId);

    flatTreeScenarios.push({
      id: _mappingNode.dataId,
      name: formatLongText(_mappingNode.nameLBD),
      parentId: parentObj.dataId,
      link: _actionObj.text,
    });
    crawlerScenarios(_mappingNode, scenarioMessages, scenarioTextmap);
  } else {
    flatTreeScenarios.push({
      id: ID,
      name: formatLongText(_actionObj.data),
      parentId: parentObj.dataId,
      link: link,
    });
    ID++;
  }
};

const MAX_LENGTH_ONE_ROW = 50;
const formatLongText = (text) => {
  if (text && text.length > MAX_LENGTH_ONE_ROW) {
    let _text = "";
    for (let i = 0; i < Math.ceil(text.length / MAX_LENGTH_ONE_ROW); i++) {
      _text += text.slice(i * MAX_LENGTH_ONE_ROW, MAX_LENGTH_ONE_ROW * (i + 1)) + ` <br/> `;
    }
    return _text;
  } else {
    return text;
  }
};
