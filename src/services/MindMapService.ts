// @ts-ignore
import { cloneDeep } from "lodash";
import { isNullOrEmpty } from "@/utils/stringUtils";
import {
  TEMPLATE_TALK_IDS,
  SPECIAL_USER_ACTIONS,
  SVG_ICON_CONSTANTS,
} from "@/store/modules/scenarios/scenarios.constants";

import { GetSpecialScenarioReply } from "@/services/scenarios.service";
import store from "@/store";

//================================================================
//Global Params
//================================================================
let parsedBubbleActions = {};

let newMessageTemplate = {
  dataType: "__INITIAL__",
  nameLBD: "",
  params: {
    text: "",
  },
};

let dummyCompositeTemplate = {
  dataId: "DUMMY_COMPOSITE_",
  dataType: "compositeMessage",
  messages: [],
  nameLBD: "複合メッセージ",
  params: {
    specialScenarioTalk: "",
  },
  scenario: "",
};

const damageReportKnownCategoryIds = ["CATEGORY_NORMAL_BUTTON", "CATEGORY_PHONE_BUTTON"];

const damageReportKnownDataIds = [
  "CATEGORY_NORMAL",
  "CATEGORY_DETAILS_PARK_CAROUSEL",
  "CAMERA_DETAILED_PICTURE_CONFIRM",
  "CAMERA_ACTION",
  "CAMERA_ACTION_BUTTON",
  "STATUS_USER_COMMENT_RIVER",
  "STATUS_USER_COMMENT_PARK_PLAYGROUND",
  "STATUS_USER_COMMENT_PARK_LIGHTING",
  "STATUS_USER_COMMENT_PARK_BENCH",
  "STATUS_USER_COMMENT_PARK_WATER",
  "STATUS_USER_COMMENT_PARK_TREE",
  "STATUS_USER_COMMENT_PARK_OTHER",
  "STATUS_USER_COMMENT_RIVER",
  "STATUS_USER_COMMENT_RIVER_BUTTON",
  "STATUS_USER_COMMENT_PARK_PLAYGROUND_BUTTON",
  "STATUS_USER_COMMENT_PARK_LIGHTING_BUTTON",
  "STATUS_USER_COMMENT_PARK_BENCH_BUTTON",
  "STATUS_USER_COMMENT_PARK_WATER_BUTTON",
  "STATUS_USER_COMMENT_PARK_TREE_BUTTON",
  "STATUS_USER_COMMENT_PARK_OTHER_BUTTON",
  "REPORT_RESUME_CONFIRM",
];

//================================================================
//Main function to logically generate the mind map
//================================================================
export async function generateMindMap(
  rootNode,
  mindMapGenerations,
  scenarioMindmapMessages,
  validTextMappings,
  overallTextMapping,
  scenarioTalks,
  talkName,
  scenarioName,
  allScenarioMessages
) {
  parsedBubbleActions = {};
  const indexOfLatestNodeInLatestGen = mindMapGenerations[mindMapGenerations.length - 1].length - 1;
  let uniqueIdCounterForMap =
    mindMapGenerations[mindMapGenerations.length - 1][indexOfLatestNodeInLatestGen].mindmapId + 1;
  //build the generation map with a found root node
  if (rootNode.value != "ユーザー") {
    let continueProcessing = true;
    do {
      const currentGen = mindMapGenerations[mindMapGenerations.length - 1];
      const nextGen = [];
      const asyncSimulateNodes = [];
      if (mindMapGenerations.length % 2 == 1) {
        //inside user action gen
        //Loop through each node in gen
        //If node is a type of message action, then look at textMapping for next bot message
        for (let currentGenLoopCounter = 0; currentGenLoopCounter < currentGen.length; currentGenLoopCounter++) {
          let node = currentGen[currentGenLoopCounter];
          let botMessage = undefined;
          let simulated = false;
          if (node.type == "message") {
            botMessage = scenarioMindmapMessages.find((obj) => {
              return obj.dataId === validTextMappings[node.value];
            });
          } else if (node.type == "postback") {
            node.generation = mindMapGenerations.length - 1;
            const extractResult = extractPostbackBotMessage(
              botMessage,
              scenarioMindmapMessages,
              node,
              talkName,
              asyncSimulateNodes,
              scenarioName,
              mindMapGenerations
            );
            simulated = extractResult.simulated;
            botMessage = extractResult.botMessage;
          } else if (node.type == "location_message" || node.type == "image_message") {
            simulated = true;
            asyncSimulateNodes.push(
              simulateResponse(node, scenarioName, talkName, mindMapGenerations, scenarioMindmapMessages, true)
            );
          }
          //A message in this talk was found mapped to this message
          if (botMessage != undefined) {
            //Check if the found bot message is an ancestor of current node
            let foundAncestor = false;
            let ancestor = null;
            let investigatingNode = node;
            if (mindMapGenerations.length > 1) {
              for (let x = mindMapGenerations.length - 2; x > 0; x--) {
                const parentNode = mindMapGenerations[x].find((obj) => {
                  return obj.mindmapId == investigatingNode.parentId;
                });
                if (parentNode.dataId == botMessage.dataId) {
                  foundAncestor = true;
                  ancestor = parentNode;
                  break;
                }
                investigatingNode = parentNode;
              }
            }

            if (foundAncestor && ancestor) {
              node["linkToAncestor"] = true;
              node["linkedNode"] = ancestor.mindmapId;
            } else {
              //Check if the found bot message has already been drawn on the map but not as an ancestor
              //check all generations and nextgen too
              let hasBeenDrawn = false;
              let drawnNode = null;
              for (let x = 0; x < mindMapGenerations.length; x++) {
                mindMapGenerations[x].some((tempNode) => {
                  if (tempNode.dataId === botMessage.dataId) {
                    hasBeenDrawn = true;
                    drawnNode = tempNode;
                    return true;
                  }
                });
                if (hasBeenDrawn) {
                  break;
                }
              }
              nextGen.some((tempNode) => {
                if (tempNode.dataId === botMessage.dataId) {
                  hasBeenDrawn = true;
                  drawnNode = tempNode;
                  return true;
                }
              });

              if (hasBeenDrawn) {
                node["linkInsideTree"] = true;
                node["linkedNode"] = drawnNode.mindmapId;
              } else {
                const botMessageToAdd = cloneDeep(botMessage);
                botMessageToAdd["mindmapId"] = uniqueIdCounterForMap;
                uniqueIdCounterForMap++;
                botMessageToAdd["parentId"] = node.mindmapId;
                nextGen.push(botMessageToAdd);
              }
            }
          } else if (node.type == "message" || node.type == "postback") {
            //postback message or text mapping might be part of another talk
            let foundMessage = false;
            if (node.type == "message") {
              const messageIdToSearchFor = overallTextMapping.textMapping[node.value];
              if (node.value in overallTextMapping.textMapping) {
                foundMessage = true;
                scenarioTalks.forEach((talk) => {
                  talk.params.messages.forEach((msg) => {
                    if (msg.messageId == messageIdToSearchFor) {
                      node["messageLinkToOtherTalk"] = true;
                      node["linkedTalk"] = talk.params.name;
                    }
                  });
                });
              }

              //Found a message through the text mapping but the message is not in a talk
              //Display the message in this talk
              if (foundMessage && !("linkedTalk" in node)) {
                const filteredBotMessage = allScenarioMessages.find((obj) => obj.dataId == messageIdToSearchFor);
                if (filteredBotMessage) {
                  const botMessageToAdd = cloneDeep(filteredBotMessage);
                  botMessageToAdd["mindmapId"] = uniqueIdCounterForMap;
                  uniqueIdCounterForMap++;
                  botMessageToAdd["parentId"] = node.mindmapId;
                  nextGen.push(botMessageToAdd);
                }
              }
            } else {
              //try to find message using data in postbackId
              //Then find the talkName of that message
              if (node.postbackId && node.postbackId != "") {
                scenarioTalks.some((talk) => {
                  if (talk.params.name != talkName) {
                    talk.params.messages.forEach((msg) => {
                      if (msg.sender == "BOT" && msg.messageId == node.postbackId) {
                        foundMessage = true;
                        node["messageLinkToOtherTalk"] = true;
                        node["linkedTalk"] = talk.params.name;
                      }
                    });
                  }
                  if (foundMessage) {
                    return true;
                  }
                });
              }

              //Could not find postback id message in talk
              //Get the message straight from the scenario message list
              if (!simulated && !foundMessage) {
                const filteredBotMessage = allScenarioMessages.find((obj) => obj.dataId == node.postbackId);
                if (filteredBotMessage) {
                  foundMessage = true;
                  const botMessageToAdd = cloneDeep(filteredBotMessage);
                  botMessageToAdd["mindmapId"] = uniqueIdCounterForMap;
                  uniqueIdCounterForMap++;
                  botMessageToAdd["parentId"] = node.mindmapId;
                  nextGen.push(botMessageToAdd);
                }
              }
            }
            if (!foundMessage) {
              //try to find this text or postback in the mind map
              //if found, then the mindmapId of the child should be saved into node's
              //'linkedNode' and 'linkInsideTree' should be set to true
              //if not found, then create a new message
              let foundSameActionWhileBuildingMap = false;
              //check current gen
              currentGen.some((sameGenTempNode) => {
                if (sameGenTempNode.mindmapId == node.mindmapId) {
                  //Short circuit to prevent this code from setting a link
                  //from message to the same message
                  return true;
                }

                if (
                  sameGenTempNode.type == node.type &&
                  ((sameGenTempNode.type == "message" && sameGenTempNode.value == node.value) ||
                    (sameGenTempNode.type == "postback" &&
                      sameGenTempNode.postbackId == node.postbackId &&
                      sameGenTempNode.postbackId != ""))
                ) {
                  foundSameActionWhileBuildingMap = true;
                  node["linkInsideTree"] = true;
                  const linkNode = nextGen.find((obj) => obj.parentId == sameGenTempNode.mindmapId);
                  if (linkNode) {
                    node["linkedNode"] = linkNode.mindmapId;
                  }
                }
              });

              if (!foundSameActionWhileBuildingMap) {
                //check prev gens
                let gotToCurrentNode = false;
                let tempGenerationCounter = 0;
                mindMapGenerations.some((gen) => {
                  //short circuit if checking the current generation being built
                  if (tempGenerationCounter == mindMapGenerations.length - 1) {
                    return true;
                  }
                  gen.some((internalNodeInGen) => {
                    //short circuit
                    if (internalNodeInGen.mindmapId == node.mindmapId) {
                      gotToCurrentNode = true;
                      return true;
                    }
                    if (
                      internalNodeInGen.type == node.type &&
                      ((internalNodeInGen.type == "message" && internalNodeInGen.value == node.value) ||
                        (internalNodeInGen.type == "postback" &&
                          internalNodeInGen.postbackId == node.postbackId &&
                          internalNodeInGen.postbackId != ""))
                    ) {
                      foundSameActionWhileBuildingMap = true;
                      node["linkInsideTree"] = true;
                      const linkNode = mindMapGenerations[tempGenerationCounter + 1].find(
                        (obj) => obj.parentId == internalNodeInGen.mindmapId
                      );
                      if (linkNode) {
                        node["linkedNode"] = linkNode.mindmapId;
                      }
                    }
                  });
                  if (gotToCurrentNode || foundSameActionWhileBuildingMap) {
                    return true;
                  }
                  tempGenerationCounter++;
                });
              }

              if (!foundSameActionWhileBuildingMap) {
                //If special talk name call the endpoint
                if (isTemplateTalk(scenarioName, talkName)) {
                  node._SPECIAL_TALK_TYPES_ = true;
                  if (!simulated) {
                    asyncSimulateNodes.push(
                      simulateResponse(node, scenarioName, talkName, mindMapGenerations, scenarioMindmapMessages, true)
                    );
                  }
                } else if (node.type !== "message" && isNullOrEmpty(node.postbackId)) {
                  const newTempBotMessage = cloneDeep(newMessageTemplate);
                  newTempBotMessage["mindmapId"] = uniqueIdCounterForMap;
                  uniqueIdCounterForMap++;
                  newTempBotMessage["parentId"] = node.mindmapId;
                  newTempBotMessage["newMessage"] = true;
                  nextGen.push(newTempBotMessage);
                }
              }
            }
          }
        }
      } else {
        //inside bot message gen
        //find actions in bot message
        currentGen.forEach((node) => {
          const userActions = searchMessageForUserActions(node, scenarioMindmapMessages);

          userActions.forEach((action, index) => {
            const tempNode = {
              mindmapId: uniqueIdCounterForMap,
              parentId: node.mindmapId,
              type: action.type,
              value: action.value,
              postbackId: action.postbackId || "",
              params: action.params,
              branchIndex: index,
            };
            if ("carouselIndex" in action) {
              tempNode["carouselKey"] = action.carouselKey;
              tempNode["carouselIndex"] = action.carouselIndex;
              tempNode["carouselName"] = action.carouselName;
              tempNode["firstActionOfCarouselGroup"] = action.firstActionOfCarouselGroup;
            }
            uniqueIdCounterForMap++;
            nextGen.push(tempNode);
          });
        });
      }

      // TODO: ここにsimulateResponseをまとめる
      const simulateResults = await Promise.all(asyncSimulateNodes);
      simulateResults.forEach((simulateResult) => {
        const { node, simulateMessages } = simulateResult;
        if (node._SPECIAL_TALK_TYPES_ || node.type == "location_message" || node.type == "image_message") {
          //try to find if the node has already been drawn
          let alreadyDrawnNode = null;
          let gotToSelf = false;
          for (
            let similatedCounterCheck = 0;
            similatedCounterCheck < mindMapGenerations.length;
            similatedCounterCheck++
          ) {
            mindMapGenerations[similatedCounterCheck].some((message) => {
              if (message.mindmapId == node.mindmapId) {
                gotToSelf = true;
                return true;
              }
              if (
                (node._SPECIAL_TALK_TYPES_ || message.type == "location_message" || message.type == "image_message") &&
                message.type == node.type
              ) {
                //get the children of message
                const childrenToFilter =
                  similatedCounterCheck == mindMapGenerations.length - 1
                    ? nextGen
                    : mindMapGenerations[similatedCounterCheck + 1];
                const simulatedChildrenOfDrawnMessage = childrenToFilter.filter(
                  (obj) => obj.parentId == message.mindmapId
                );

                let sameMessage = true;
                if (simulatedChildrenOfDrawnMessage.length == simulateMessages.length) {
                  for (let simulateCounter = 0; simulateCounter < simulateMessages.length; simulateCounter++) {
                    if (
                      simulatedChildrenOfDrawnMessage[simulateCounter].dataId !=
                      simulateMessages[simulateCounter].dataId
                    ) {
                      sameMessage = false;
                    }
                  }
                } else {
                  sameMessage = false;
                }
                if (sameMessage) {
                  //alreadyDrawnNode = message;
                  //alreadyDrawnNode = simulatedChildrenOfDrawnMessage[0]
                  alreadyDrawnNode =
                    simulatedChildrenOfDrawnMessage.length > 1 ? message : simulatedChildrenOfDrawnMessage[0];
                  return true;
                }
              }
            });
            if (alreadyDrawnNode != null || gotToSelf) {
              break;
            }
          }

          if (alreadyDrawnNode == null) {
            for (const message of simulateMessages) {
              message["mindmapId"] = uniqueIdCounterForMap;
              uniqueIdCounterForMap++;
              nextGen.push(message);
            }
          } else {
            node["linkInsideTree"] = true;
            node["linkedNode"] = alreadyDrawnNode.mindmapId;
          }
        }
      });

      if (nextGen.length == 0) {
        //end of tree
        continueProcessing = false;
      } else {
        mindMapGenerations.push(nextGen);
      }
    } while (continueProcessing);
  } else {
    //build the genration map without a real root node
  }
  mindMapGenerations.forEach((generation, index) => {
    generation.forEach((node) => {
      node.generation = index;
    });
  });

  return mindMapGenerations;
}

function extractPostbackBotMessage(
  botMessage,
  scenarioMindmapMessages,
  node,
  talkName,
  asyncSimulateNodes,
  scenarioName,
  mindMapGenerations
) {
  const { generation, parentId, postbackId } = node;
  let simulated = false;
  botMessage = scenarioMindmapMessages.find((obj) => {
    return obj.dataId === postbackId;
  });
  if (!botMessage && isDamageReportTalk(scenarioName, talkName)) {
    node._SPECIAL_TALK_TYPES_ = true;
    let override = null;
    if (
      postbackId &&
      !postbackId.includes("sub_category_msg_id") &&
      !postbackId.includes("user_comment_msg_id") &&
      !isUuidV4(postbackId)
    ) {
      let targetId = parentId;
      for (let gen = generation - 1; gen >= 0; gen--) {
        const parentBotMessage = findMessage(mindMapGenerations, targetId, gen);
        if (parentBotMessage) {
          targetId = parentBotMessage.parentId;
          if (damageReportKnownDataIds.includes(parentBotMessage.dataId)) {
            break;
          }
          if (damageReportKnownCategoryIds.includes(parentBotMessage.dataId)) {
            override = parentBotMessage.dataId;
            break;
          }
        }
      }
    }
    asyncSimulateNodes.push(
      simulateResponse(node, scenarioName, talkName, mindMapGenerations, scenarioMindmapMessages, true, override)
    );
    simulated = true;
  }
  return { botMessage, simulated };
}

function isUuidV4(str) {
  return str.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
}

function isTemplateTalk(scenarioName, talkName) {
  const talk = store.state.scenarios.scenarioTalks.find(elem =>
  elem.scenario === scenarioName && elem.params && elem.params.name === talkName
  );
  return TEMPLATE_TALK_IDS.includes(talk.dataId);
}

function isDamageReportTalk(scenarioName, talkName) {
  const talk = store.state.scenarios.scenarioTalks.find(elem =>
    elem.scenario === scenarioName && elem.params && elem.params.name === talkName
  );
  return talk && talk.dataId === "DAMAGE_REPORT_TALK";
}

export function findMessage(mindMapGenerations, mindmapId, generation = undefined) {
  let source;
  if (generation) {
    source = mindMapGenerations[generation];
  } else {
    source = mindMapGenerations.flat();
  }
  return (source || []).find((obj) => {
    return obj.mindmapId === mindmapId;
  });
}

async function simulateResponse(
  node,
  scenarioName,
  talkName,
  mindMapGenerations,
  scenarioMindmapMessages,
  zip = false,
  override = null
) {
  const simulateReplies = [];
  const payload = {
    eventType: node.type,
    scenario: scenarioName,
    talkName: talkName,
  };
  if (mindMapGenerations.length - 2 >= 0) {
    const lastMessage = mindMapGenerations[mindMapGenerations.length - 2].find((obj) => obj.mindmapId == node.parentId);

    payload["lastMessageId"] = lastMessage.dataId;
    if (override) {
      payload["lastMessageId"] = override;
    }
  }
  if (node.type == "message") {
    //Append text_ because backend is different from front end...
    payload.eventType = "text_" + payload.eventType;
    payload["data"] = node.value;
  }
  if (node.type == "postback") {
    payload["data"] = node.postbackId;
  }

  let listOfPossibleBotMessages = null;

  /*
   * Look at the responses saved into state and see if they have already been called
   * If cached response found, use that instead of calling backend again
   */
  if (talkName in store.state.scenarios.scenarioMindmap.cachedSpecialTalkFlow) {
    for (let index = 0; index < store.state.scenarios.scenarioMindmap.cachedSpecialTalkFlow[talkName].length; index++) {
      const cachedPayload = store.state.scenarios.scenarioMindmap.cachedSpecialTalkFlow[talkName][index];
      let samePayload = true;
      Object.keys(payload).forEach((key) => {
        if (payload[key] != cachedPayload[key]) {
          samePayload = false;
        }
      });
      if (samePayload) {
        listOfPossibleBotMessages = cachedPayload.response;
        break;
      }
    }
    if (listOfPossibleBotMessages == null) {
      listOfPossibleBotMessages = await GetSpecialScenarioReply(payload);
      payload["response"] = listOfPossibleBotMessages;
      const responsesToSave = cloneDeep(store.state.scenarios.scenarioMindmap.cachedSpecialTalkFlow[talkName]);
      responsesToSave.push(payload);
      store.commit("SET_SCENARIO_MINDMAP_SPECIAL_TALK", {
        listName: "cachedSpecialTalkFlow",
        talkName: talkName,
        value: responsesToSave,
      });
    }
  } else {
    listOfPossibleBotMessages = await GetSpecialScenarioReply(payload);
    payload["response"] = listOfPossibleBotMessages;
    store.commit("SET_SCENARIO_MINDMAP_SPECIAL_TALK", {
      listName: "cachedSpecialTalkFlow",
      talkName: talkName,
      value: [payload],
    });
  }

  //Go through this list of replies from backend and make bot messages
  for (const possibleMessage of listOfPossibleBotMessages) {
    if (Array.isArray(possibleMessage)) {
      const tempComposite = cloneDeep(dummyCompositeTemplate);
      tempComposite.dataId = tempComposite["dataId"] + possibleMessage[0].dataId;
      tempComposite.scenario = scenarioName;
      tempComposite.params.specialScenarioTalk = talkName;
      for (const internalMessage of possibleMessage) {
        tempComposite["messages"].push(internalMessage.dataId);
        if (internalMessage.dataId.startsWith("DUMMY_")) {
          const alreadySaved = scenarioMindmapMessages
            .map((obj) => {
              return obj.dataId;
            })
            .includes(internalMessage.dataId);
          if (!alreadySaved) {
            scenarioMindmapMessages.push(internalMessage);
          }
        }
      }
      tempComposite["parentId"] = node.mindmapId;
      simulateReplies.push(tempComposite);
    } else {
      const newSpecialFlowMessage = cloneDeep(possibleMessage);
      newSpecialFlowMessage["parentId"] = node.mindmapId;
      simulateReplies.push(newSpecialFlowMessage);
    }
  }

  if (zip) {
    return {
      node,
      simulateMessages: simulateReplies,
    };
  }
  return simulateReplies;
}

//================================================================
//Main algorithm helper functions
//================================================================
// noinspection JSUnfilteredForInLoop
export function filterOutUnnecessaryTextMappings(validTextMappings, scenarioMindmapMessages) {
  let temp = {};
  // noinspection JSUnfilteredForInLoop
  for (const userText in validTextMappings) {
    // noinspection JSUnfilteredForInLoop
    const idOfBotMessage = validTextMappings[userText];
    const result = scenarioMindmapMessages.find((obj) => {
      return obj.dataId === idOfBotMessage;
    });
    if (result != undefined) {
      // noinspection JSUnfilteredForInLoop
      temp[userText] = idOfBotMessage;
    }
  }
  return cloneDeep(temp);
}

export function findTheRootNode(validTextMappings, scenarioMindmapMessages, scenarioTalks, talkName, userMessages) {
  //For each user text mapping, check all of the talk messages
  let rootNodeCandidates = Object.keys(validTextMappings);
  //If a message in the talk contains this text mapping, then it is not the root node
  for (const userText in validTextMappings) {
    scenarioMindmapMessages.forEach((botMessage) => {
      //Go through all of the bot messages and search for this specific user text input
      // noinspection JSUnfilteredForInLoop
      const textMappingFoundInMessage = searchMessageForUserInput(botMessage, userText, scenarioMindmapMessages);
      if (textMappingFoundInMessage) {
        //remove from rootNodeCandidates
        rootNodeCandidates = rootNodeCandidates.filter((e) => e !== userText);
      }
    });
  }

  //If a botmessage contains a postback for another message,
  //remove the textmapping that exists for the another message as it is not the root either
  scenarioMindmapMessages.forEach((botMessage) => {
    const postbackMessagesFound =
      searchMessageForPostbackText(botMessage, validTextMappings, scenarioMindmapMessages) || [];
    postbackMessagesFound.forEach((text) => {
      rootNodeCandidates = rootNodeCandidates.filter((e) => e !== text);
    });
  });

  if (rootNodeCandidates.length == 1) {
    return {
      mindmapId: 0,
      type: "message",
      value: rootNodeCandidates[0],
    };
  } else if (rootNodeCandidates.length == 0) {
    //No root node found, probably a talk that loops back to the root
    //Try to get root node from talk
    //If can't find then make fake root node
    const tempNode = attemptToFindRootNodeInTalk(scenarioTalks, talkName);
    if (tempNode != null) {
      return {
        mindmapId: 0,
        type: "message",
        value: userMessages.params[tempNode.messageId] ? userMessages.params[tempNode.messageId].params.text : '',
      };
    } else {
      //Maybe this should be an error
      return {
        mindmapId: 0,
        type: "message",
        value: "ユーザー",
      };
    }
  } else {
    //multiple root nodes found, uuuuhhhh idk what to do honestly
    //Except for if the talk itself loops back to the front which it can then it all gets messed up
    //I'm not a magician, how is the code supposed to understand that
    //what if there are multiple root nodes????????? :/ TRASH SEPARATION TRIGGERED
    console.error("multiple root node detected:", rootNodeCandidates);
    return { errorMessage: "開始メッセージが複数設定されています。マップ表示のサポート対象外です。" };
  }
}

function attemptToFindRootNodeInTalk(scenarioTalks, talkName) {
  let root = null;

  const talkValue = scenarioTalks.find((obj) => {
    return obj.params.name === talkName;
  });

  if (talkValue) {
    let prevMessage = null;
    talkValue.params.messages.some((message) => {
      if (message.sender === "BOT" && prevMessage && prevMessage.sender === "USER") {
        root = prevMessage;
        return true;
      }
      prevMessage = message;
    });
  }

  return root;
}

export function getCollapsedMindmapForDrawing(mindMapGenerations) {
  const tempResult = [];
  let genCounter = 0;
  mindMapGenerations.some((gen) => {
    let tempGen = [];
    if (genCounter == 0) {
      tempGen = gen;
    } else {
      let previousGen = mindMapGenerations[genCounter - 1];
      gen.forEach((node) => {
        let parentNode = previousGen.find((obj) => obj.mindmapId == node.parentId);
        if (parentNode && (!("expandNode" in parentNode) || parentNode.expandNode)) {
          tempGen.push(node);
        }
      });
    }
    if (tempGen.length == 0) {
      return true;
    } else {
      tempResult.push(tempGen);
    }
    genCounter++;
  });

  return cloneDeep(tempResult);
}

//================================================================
//Create SVG Display items
//Ignore the errors that the value has to be a string here
//setAttributeNS requires a Number
//================================================================
const mindMapDisplayValues = {
  svgNS: "http://www.w3.org/2000/svg",
  startingX: 10,
  startingY: 10,
  nodeWidth: 200,
  nodeHeight: 40,
  nodeRadius: 10,
  xSpacingPixels: 40,
  ySpacingPixels: 60,
  nodeIconOffset: 7.5,
  genColors: ["#EBFCEB", "white"],
  newMessageFill: "yellow",
  genStrokeColors: ["#5FB04D", "#F2F2F2"],
  newMessageStroke: "gold",
  carouselBackgroundColor: "lightgray",
  carouselBackgroundStrokeColor: "darkgray",
  lineColor: "#CCCCCC",
  textColor: ["#51AD3F", "#555555"],
  compositeTextColor: "white",
  compositeColor: "#74DE74",
  textStyle: "Verdana",
  lineWidth: 1.5,
  textSize: 12,
  iconWrapCircleSize: 18,
};

export function createSVGNode(elem, genCounter, mindMapGenerations, parentElem = null) {
  const userMessageGen = genCounter % 2 == 0;
  const nodeGroup = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  nodeGroup.setAttribute("id", "node." + elem.mindmapId);

  const classes = ["node"];
  if (userMessageGen) {
    classes.push("user");
  } else {
    classes.push("bot");
    nodeGroup.setAttribute("filter", "url(#botnode)");
  }
  nodeGroup.setAttribute("class", classes.join(" "));

  const result = findNumberOfLeafNodes(elem, genCounter, mindMapGenerations);
  const totalHeightNeededForNode = result * (mindMapDisplayValues.nodeHeight + mindMapDisplayValues.ySpacingPixels);
  let yDisplacement;
  //Get the y displacement of the nodes
  if (genCounter == 0) {
    //The root node will always be in the middle.
    yDisplacement = totalHeightNeededForNode / 2 - mindMapDisplayValues.nodeHeight / 2;
  } else {
    //Check for siblings
    const siblings = mindMapGenerations[genCounter].filter((obj) => obj.parentId == elem.parentId);
    //If the elem is the only child of the parent, draw on the same y displacement as the parent
    if (siblings.length == 1) {
      yDisplacement = parentElem.children[0].y.baseVal.value;
    } else {
      //If there are siblings, have to divide them equally in space
      //Get several values needed from the 'weights' of the children nodes for each sibling
      const siblingWeights = [];
      let totalWeightOfSiblings = 0;
      let totalWeightOfPrevious = 0;
      let weightOfCurrentNode = 0;

      siblings.forEach((node) => {
        const nodeWeight = findNumberOfLeafNodes(node, genCounter, mindMapGenerations);
        siblingWeights.push(nodeWeight);
        totalWeightOfSiblings += nodeWeight;
        if (node.mindmapId == elem.mindmapId) {
          weightOfCurrentNode = nodeWeight;
        } else if (weightOfCurrentNode == 0) {
          totalWeightOfPrevious += nodeWeight;
        }
      });

      //get the max y and min y displacement of the parent node
      const centerY = parentElem.children[0].y.baseVal.value + mindMapDisplayValues.nodeHeight / 2;
      const parentMaxY =
        centerY + (totalWeightOfSiblings * (mindMapDisplayValues.nodeHeight + mindMapDisplayValues.ySpacingPixels)) / 2;
      const parentMinY =
        centerY - (totalWeightOfSiblings * (mindMapDisplayValues.nodeHeight + mindMapDisplayValues.ySpacingPixels)) / 2;

      const tempDisplacementY =
        totalWeightOfPrevious * (mindMapDisplayValues.nodeHeight + mindMapDisplayValues.ySpacingPixels) + parentMinY;

      const newNodeRange = ((parentMaxY - parentMinY) / totalWeightOfSiblings) * weightOfCurrentNode;

      yDisplacement = newNodeRange / 2 - mindMapDisplayValues.nodeHeight / 2 + tempDisplacementY;
    }
  }

  //Create the overarching node element (the green or white bubble)
  const node = document.createElementNS(mindMapDisplayValues.svgNS, "rect");

  node.setAttributeNS(
    null,
    "x",
    String(
      mindMapDisplayValues.startingX +
        (mindMapDisplayValues.nodeWidth + mindMapDisplayValues.xSpacingPixels) * genCounter
    )
  );
  node.setAttributeNS(null, "y", String(yDisplacement));
  node.setAttributeNS(null, "rx", String(mindMapDisplayValues.nodeRadius));
  node.setAttributeNS(null, "ry", String(mindMapDisplayValues.nodeRadius));
  node.setAttributeNS(null, "width", String(mindMapDisplayValues.nodeWidth));
  node.setAttributeNS(null, "height", String(mindMapDisplayValues.nodeHeight));
  if (elem.dataType === "__INITIAL__") {
    node.setAttributeNS(null, "fill", mindMapDisplayValues.newMessageFill);
    node.setAttributeNS(null, "stroke", mindMapDisplayValues.newMessageStroke);
  } else {
    node.setAttributeNS(null, "fill", mindMapDisplayValues.genColors[genCounter % 2]);
    node.setAttributeNS(null, "stroke", mindMapDisplayValues.genStrokeColors[genCounter % 2]);
  }
  node.setAttributeNS(null, "stroke-width", String(mindMapDisplayValues.lineWidth));

  //Create the main text content of the node
  const nodeText = document.createElementNS(mindMapDisplayValues.svgNS, "text");
  nodeText.setAttributeNS(
    null,
    "x",
    String(
      mindMapDisplayValues.startingX +
        (mindMapDisplayValues.nodeWidth + mindMapDisplayValues.xSpacingPixels) * genCounter +
        mindMapDisplayValues.nodeWidth / 5
    )
  );
  nodeText.setAttributeNS(
    null,
    "y",
    String(yDisplacement + mindMapDisplayValues.nodeHeight / 2 + mindMapDisplayValues.nodeHeight / 8)
  );
  nodeText.setAttributeNS(null, "fill", mindMapDisplayValues.textColor[genCounter % 2]);
  nodeText.setAttributeNS(null, "font-family", mindMapDisplayValues.textStyle);
  nodeText.setAttributeNS(null, "font-size", String(mindMapDisplayValues.textSize));

  //Create the icon of the node
  const icon = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  const iconX =
    mindMapDisplayValues.startingX +
    (mindMapDisplayValues.nodeWidth + mindMapDisplayValues.xSpacingPixels) * genCounter +
    mindMapDisplayValues.nodeHeight / 4;
  const iconY = yDisplacement + mindMapDisplayValues.nodeIconOffset;
  icon.setAttribute("transform", "translate(" + iconX + ", " + iconY + ")");
  icon.setAttribute("fill", mindMapDisplayValues.textColor[genCounter % 2]);

  //Determine the actual text and icon to display on the noce
  let type;
  if (userMessageGen) {
    nodeText.textContent = elem.value;
    type = elem.type;
  } else {
    nodeText.textContent = "nameLBD" in elem && (elem["nameLBD"] != "" && elem["nameLBD"] != null) ? elem.nameLBD : "新規メッセージ";
    type = elem.dataType;
  }
  icon.setAttribute("iconType", type);
  icon.innerHTML = SVG_ICON_CONSTANTS[type].replace(
    /fill=".*?"/g,
    `fill="${mindMapDisplayValues.textColor[genCounter % 2]}"`
  );
  if (nodeText.textContent.length > 10) {
    nodeText.textContent = nodeText.textContent.substring(0, 9) + "...";
  }

  nodeGroup.appendChild(node);
  nodeGroup.appendChild(icon);
  nodeGroup.appendChild(nodeText);

  //Create the number display for composite message
  if ("dataType" in elem && elem.dataType == "compositeMessage") {
    const numberOfMessagesToDisplay = elem.messages.length;

    const countText = document.createElementNS(mindMapDisplayValues.svgNS, "text");
    countText.setAttributeNS(
      null,
      "x",
      String(
        mindMapDisplayValues.startingX +
          (mindMapDisplayValues.nodeWidth + mindMapDisplayValues.xSpacingPixels) * genCounter +
          (mindMapDisplayValues.nodeWidth / 5) * 4
      )
    );
    countText.setAttributeNS(
      null,
      "y",
      String(yDisplacement + mindMapDisplayValues.nodeHeight / 2 + mindMapDisplayValues.nodeHeight / 8)
    );
    countText.setAttributeNS(null, "fill", mindMapDisplayValues.compositeTextColor);
    countText.setAttributeNS(null, "font-family", mindMapDisplayValues.textStyle);
    countText.setAttributeNS(null, "font-size", String(mindMapDisplayValues.textSize));
    countText.textContent = numberOfMessagesToDisplay;

    const countCircle = document.createElementNS(mindMapDisplayValues.svgNS, "circle");
    countCircle.setAttributeNS(
      null,
      "cx",
      String(
        mindMapDisplayValues.startingX +
          (mindMapDisplayValues.nodeWidth + mindMapDisplayValues.xSpacingPixels) * genCounter +
          (mindMapDisplayValues.nodeWidth / 5) * 4 +
          mindMapDisplayValues.nodeWidth / 40
      )
    );
    countCircle.setAttributeNS(
      null,
      "cy",
      String(
        yDisplacement +
          mindMapDisplayValues.nodeHeight / 2 +
          mindMapDisplayValues.nodeHeight / 8 -
          mindMapDisplayValues.nodeHeight / 8
      )
    );
    countCircle.setAttributeNS(null, "r", String(mindMapDisplayValues.nodeHeight / 3));
    countCircle.setAttributeNS(null, "fill", mindMapDisplayValues.compositeColor);

    nodeGroup.appendChild(countCircle);
    nodeGroup.appendChild(countText);
  }

  return nodeGroup;
}

function findNumberOfLeafNodes(elem, genCounter, mindMapGenerations) {
  if (genCounter == mindMapGenerations.length - 1) {
    return 1;
  } else {
    let childrenGen = mindMapGenerations[genCounter + 1];
    childrenGen = childrenGen.filter((obj) => obj.parentId == elem.mindmapId);
    if (childrenGen.length == 0) {
      return 1;
    } else {
      let totalLeafs = 0;
      childrenGen.forEach((node) => {
        totalLeafs += findNumberOfLeafNodes(node, genCounter + 1, mindMapGenerations);
      });
      return totalLeafs;
    }
  }
}

export function drawSVGConnection(childElement, parentElement, parentNode, childNode) {
  let x1 = parentElement.x.baseVal.value + mindMapDisplayValues.nodeWidth;
  if ("expandNode" in parentNode) {
    //Allow space for the expand/collapsing circle in the child node
    x1 += mindMapDisplayValues.xSpacingPixels / 4;
  }
  const y1 = parentElement.y.baseVal.value + mindMapDisplayValues.nodeHeight / 2;

  const x2 = childElement.x.baseVal.value;
  const y2 = childElement.y.baseVal.value + mindMapDisplayValues.nodeHeight / 2;

  const line = document.createElementNS(mindMapDisplayValues.svgNS, "path");

  const midX = x1 + (x2 - x1) / 2;
  const midY = y1 + (y2 - y1) / 2;

  line.setAttributeNS(
    null,
    "d",
    "M " +
      x1 +
      " " +
      y1 +
      " C " +
      midX +
      " " +
      y1 +
      ", " +
      midX +
      " " +
      y1 +
      ", " +
      midX +
      " " +
      midY +
      " S " +
      midX +
      " " +
      y2 +
      ", " +
      x2 +
      " " +
      y2
  );
  line.setAttributeNS(null, "stroke", mindMapDisplayValues.lineColor);
  line.setAttributeNS(null, "stroke-width", String(mindMapDisplayValues.lineWidth));
  line.setAttributeNS(null, "fill", "transparent");

  return line;
}

export function drawBackGroundForCarouselGroup(elem, genCounter, mindMapGenerations, firstNode) {
  const allCarouselColumnActions = Array.from(
    document.querySelectorAll(`.node[data-parentId="${elem.parentId}"][data-carouselIndex="${elem.carouselIndex}"][data-carouselKey="${elem.carouselKey}"]`)
  );

  const lastActionInColumnIndex = allCarouselColumnActions.map((node) => node.attributes.getNamedItem("data-mindmapId").value).reduce((max, x, y, arr) => x > arr[max] ? y : max, 0);
  const lastNode = allCarouselColumnActions[lastActionInColumnIndex];

  const firstNodeOfUserAction = firstNode.children[0];
  const lastNodeOfUserAction = lastNode ? lastNode.children[0] : firstNode.children[0];

  const nodeGroup = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  nodeGroup.setAttribute("id", "background." + elem.mindmapId);

  //Create the main text content of the node
  const nodeText = document.createElementNS(mindMapDisplayValues.svgNS, "text");
  nodeText.setAttributeNS(null, "x", firstNodeOfUserAction.x.baseVal.value);
  nodeText.setAttributeNS(
    null,
    "y",
    String(firstNodeOfUserAction.y.baseVal.value - mindMapDisplayValues.nodeHeight / 4)
  );
  nodeText.setAttributeNS(null, "fill", mindMapDisplayValues.textColor[1]);
  nodeText.setAttributeNS(null, "font-family", mindMapDisplayValues.textStyle);
  nodeText.setAttributeNS(null, "font-size", String(mindMapDisplayValues.textSize));
  nodeText.textContent = elem.carouselName;
  if (nodeText.textContent.length > 10) {
    nodeText.textContent = nodeText.textContent.substring(0, 9) + "...";
  }

  const background = document.createElementNS(mindMapDisplayValues.svgNS, "rect");
  background.setAttributeNS(
    null,
    "x",
    String(firstNodeOfUserAction.x.baseVal.value - mindMapDisplayValues.xSpacingPixels / 4)
  );
  background.setAttributeNS(
    null,
    "y",
    String(firstNodeOfUserAction.y.baseVal.value - mindMapDisplayValues.ySpacingPixels / 2)
  );
  background.setAttributeNS(null, "rx", String(mindMapDisplayValues.nodeRadius));
  background.setAttributeNS(null, "ry", String(mindMapDisplayValues.nodeRadius));
  background.setAttributeNS(
    null,
    "width",
    String(mindMapDisplayValues.nodeWidth + mindMapDisplayValues.xSpacingPixels / 2)
  );
  background.setAttributeNS(
    null,
    "height",
    String(
      (lastNodeOfUserAction).y.baseVal.value +
        mindMapDisplayValues.nodeHeight -
        firstNodeOfUserAction.y.baseVal.value +
        mindMapDisplayValues.ySpacingPixels * 0.66
    )
  );
  background.setAttributeNS(null, "fill", mindMapDisplayValues.carouselBackgroundColor);
  background.setAttributeNS(null, "stroke", mindMapDisplayValues.carouselBackgroundStrokeColor);
  background.setAttributeNS(null, "stroke-width", String(mindMapDisplayValues.lineWidth));

  nodeGroup.appendChild(background);
  nodeGroup.appendChild(nodeText);

  return nodeGroup;
}

export function drawIconForNode(nodeGroup, iconType) {
  const nodeElement = nodeGroup.children[0];
  const group = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  group.setAttributeNS(null, "pointer-events", "bounding-box");
  group.setAttribute("style", "cursor:pointer;");

  const icon = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  const iconX = nodeElement.x.baseVal.value;
  const iconXoffset =
    mindMapDisplayValues.nodeWidth + (mindMapDisplayValues.nodeHeight / 5 + mindMapDisplayValues.nodeHeight / 2) * -1;
  const iconY = nodeElement.y.baseVal.value + mindMapDisplayValues.nodeHeight / 5;
  icon.setAttribute("transform", "translate(" + (iconX + iconXoffset) + ", " + iconY + ")");
  icon.setAttribute("iconType", iconType);
  icon.innerHTML = SVG_ICON_CONSTANTS[iconType];
  group.appendChild(icon);

  return group;
}

export function drawIconForLinkedNode(nodeGroup, iconType, hasToggleButton) {
  const nodeElement = nodeGroup.children[0];
  const group = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  group.setAttributeNS(null, "pointer-events", "bounding-box");
  group.setAttribute("style", "cursor:pointer;");
  group.setAttribute("transform", `translate(${1},${1})`);

  const icon = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  const yOffset = mindMapDisplayValues.nodeHeight / 2 - mindMapDisplayValues.iconWrapCircleSize / 2;
  let xOffset =
    mindMapDisplayValues.nodeWidth - mindMapDisplayValues.nodeHeight / 2 - mindMapDisplayValues.iconWrapCircleSize / 2;
  if (hasToggleButton) {
    xOffset =
      mindMapDisplayValues.nodeWidth - mindMapDisplayValues.nodeHeight / 2 - mindMapDisplayValues.iconWrapCircleSize;
  }
  const iconX = nodeElement.x.baseVal.value + xOffset;
  const iconY = nodeElement.y.baseVal.value + yOffset;
  icon.setAttribute("transform", `translate(${iconX},${iconY})`);
  icon.setAttribute("iconType", iconType);
  icon.innerHTML = SVG_ICON_CONSTANTS[iconType];
  if (icon.children.length > 0) {
    icon.children[0].setAttribute("width", String(mindMapDisplayValues.iconWrapCircleSize));
    icon.children[0].setAttribute("height", String(mindMapDisplayValues.iconWrapCircleSize));
  }
  group.appendChild(icon);

  const wrapper = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  const rect = generateCircleElement();
  rect.setAttributeNS(null, "x", String(iconX));
  rect.setAttributeNS(null, "y", String(iconY));
  rect.setAttributeNS(null, "fill", mindMapDisplayValues.genColors[1]);
  rect.setAttributeNS(null, "stroke", mindMapDisplayValues.genStrokeColors[1]);
  wrapper.appendChild(rect);
  wrapper.appendChild(group);

  return wrapper;
}

function generateCircleElement() {
  const rect = document.createElementNS(mindMapDisplayValues.svgNS, "rect");
  rect.setAttributeNS(null, "rx", String(mindMapDisplayValues.nodeRadius));
  rect.setAttributeNS(null, "ry", String(mindMapDisplayValues.nodeRadius));
  rect.setAttributeNS(null, "width", String(mindMapDisplayValues.nodeHeight / 2));
  rect.setAttributeNS(null, "height", String(mindMapDisplayValues.nodeHeight / 2));
  rect.setAttributeNS(null, "stroke-width", String(mindMapDisplayValues.lineWidth));
  return rect;
}

export function drawExpandElement(nodeGroup, elem, genCounter) {
  const nodeElement = nodeGroup.children[0];
  const group = document.createElementNS(mindMapDisplayValues.svgNS, "g");
  group.setAttributeNS(null, "pointer-events", "bounding-box");
  group.setAttribute("style", "cursor:pointer;");
  if (genCounter % 2 == 1) {
    group.setAttribute("filter", "url(#botnode)");
  }

  const rect = generateCircleElement();
  const rectX = nodeElement.x.baseVal.value + nodeElement.width.baseVal.value - mindMapDisplayValues.xSpacingPixels / 4;
  const rectY = nodeElement.y.baseVal.value + mindMapDisplayValues.nodeHeight / 4;
  rect.setAttributeNS(null, "x", String(rectX));
  rect.setAttributeNS(null, "y", String(rectY));
  rect.setAttributeNS(null, "fill", mindMapDisplayValues.genColors[genCounter % 2]);
  rect.setAttributeNS(null, "stroke", mindMapDisplayValues.genStrokeColors[genCounter % 2]);

  const nodeText = document.createElementNS(mindMapDisplayValues.svgNS, "text");
  nodeText.setAttributeNS(
    null,
    "x",
    String(nodeElement.x.baseVal.value + nodeElement.width.baseVal.value - mindMapDisplayValues.nodeHeight / 8)
  );
  nodeText.setAttributeNS(null, "y", String(nodeElement.y.baseVal.value + mindMapDisplayValues.nodeHeight * 0.62));
  nodeText.setAttributeNS(null, "fill", mindMapDisplayValues.textColor[1]);
  nodeText.setAttribute("style", "font-size: 12px;");
  if (elem.expandNode) {
    nodeText.textContent = "ー";
  } else {
    nodeText.textContent = "＋";
  }

  group.appendChild(rect);
  group.appendChild(nodeText);

  return group;
}

//================================================================
//Helper functions to find user text mappings
//for bot messages triggered by postback
//================================================================
export function searchMessageForPostbackText(botMessage, validTextMappings, scenarioMessages) {
  switch (botMessage.dataType) {
    case "buttons":
      return searchButtonMessageForPostbackText(botMessage, validTextMappings);
    case "carousel":
      return searchCarouselMessageForPostbackText(botMessage, validTextMappings);
    case "confirm":
      return searchConfirmMessageForPostbackText(botMessage, validTextMappings);
    case "imagemap":
      return searchImageMapMessageForPostbackText(botMessage, validTextMappings);
    case "compositeMessage":
      return searchCompositeMessageForPostbackText(botMessage, validTextMappings, store.state.scenarios.scenarioMessages);
    case "bubbleFlex":
      return searchBubbleFlexMessageForPostbackText(botMessage, validTextMappings);
    case "carouselFlex":
      return searchCarouselFlexMessageForPostbackText(botMessage, validTextMappings, store.state.scenarios.scenarioMessages);
    default:
      return [];
  }
}

function searchCarouselFlexMessageForPostbackText(msg, validTextMappings, scenarioMessages) {
  const postbackResults = [];
  msg.params.bubbleParam.forEach((msgId) => {
    const result = scenarioMessages.find((obj) => obj.dataId == msgId);
    if (result) {
      const postbackTextsFound = searchMessageForPostbackText(result, validTextMappings, scenarioMessages);
      postbackTextsFound.forEach((text) => {
        postbackResults.push(text);
      });
    }
  });
  return postbackResults;
}

function searchCompositeMessageForPostbackText(msg, validTextMappings, scenarioMessages) {
  const postbackResults = [];
  msg.messages.forEach((msgId) => {
    const result = scenarioMessages.find((obj) => obj.dataId == msgId);
    if (result) {
      const postbackTextsFound = searchMessageForPostbackText(result, validTextMappings, scenarioMessages);
      postbackTextsFound.forEach((text) => {
        postbackResults.push(text);
      });
    }
  });
  return postbackResults;
}

function searchBubbleFlexMessageForPostbackText(msg, validTextMappings) {
  const postbackTexts = [];

  const actions = parseBubbleFlexForActions(msg.dataId, msg.params);
  actions.forEach((action) => {
    if (action.type == "postback") {
      Object.keys(validTextMappings).forEach((key) => {
        if (validTextMappings[key] === action.data) {
          postbackTexts.push(key);
        }
      });
    }
  });

  return postbackTexts;
}

function searchButtonMessageForPostbackText(msg, validTextMappings) {
  const actionCount = msg.params.actionCount;
  const postbackTexts = [];
  for (let x = 0; x < actionCount; x++) {
    const actionToCheck = msg.params["actions." + x];
    if (actionToCheck.type == "postback") {
      Object.keys(validTextMappings).forEach((key) => {
        if (validTextMappings[key] === actionToCheck.data) {
          postbackTexts.push(key);
        }
      });
    }
  }
  return postbackTexts;
}

function searchCarouselMessageForPostbackText(msg, validTextMappings) {
  const columnCount = msg.params.columnCount;
  const actionCount = msg.params.actionCount;
  const postbackTexts = [];
  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < actionCount; y++) {
      const actionToCheck = msg.params["action." + x + "." + y];
      if (actionToCheck.type == "postback") {
        Object.keys(validTextMappings).forEach((key) => {
          if (validTextMappings[key] === actionToCheck.data) {
            postbackTexts.push(key);
          }
        });
      }
    }
  }
  return postbackTexts;
}

function searchConfirmMessageForPostbackText(msg, validTextMappings) {
  const postbackTexts = [];
  if (msg.params.actionLeft.type == "postback") {
    Object.keys(validTextMappings).forEach((key) => {
      if (validTextMappings[key] === msg.params.actionLeft.data) {
        postbackTexts.push(key);
      }
    });
  }
  if (msg.params.actionRight.type == "postback") {
    Object.keys(validTextMappings).forEach((key) => {
      if (validTextMappings[key] === msg.params.actionRight.data) {
        postbackTexts.push(key);
      }
    });
  }
  return postbackTexts;
}

function searchImageMapMessageForPostbackText(msg, validTextMappings) {
  const actionCount = msg.params.actionCount;
  const postbackTexts = [];
  for (let x = 0; x < actionCount; x++) {
    const actionToCheck = msg.params["action." + x];
    if (actionToCheck.type == "postback") {
      Object.keys(validTextMappings).forEach((key) => {
        if (validTextMappings[key] === msg.params.actionRight.data) {
          postbackTexts.push(key);
        }
      });
    }
  }
  return postbackTexts;
}

//================================================================
//Helper functions to find user text mappings in bot messages
//================================================================
export function searchMessageForUserInput(botMessage, userText, scenarioMindmapMessages) {
  switch (botMessage.dataType) {
    case "buttons":
      return searchButtonMessageForUserInput(botMessage, userText);
    case "carousel":
      return searchCarouselMessageForUserInput(botMessage, userText);
    case "confirm":
      return searchConfirmMessageForUserInput(botMessage, userText);
    case "imagemap":
      return searchImageMapMessageForUserInput(botMessage, userText);
    case "compositeMessage":
      return searchCompositeMessageForUserInput(botMessage, userText, store.state.scenarios.scenarioMessages);
    case "bubbleFlex":
      return searchBubbleFlexMessageForUserInput(botMessage, userText);
    case "carouselFlex":
      return searchCarouselFlexMessageForUserInput(botMessage, userText, store.state.scenarios.scenarioMessages);
    default:
      return false;
  }
}

function searchCarouselFlexMessageForUserInput(msg, txt, scenarioMessages) {
  let txtMappingFoundInBotMessage = false;
  msg.params.bubbleParam.forEach((msgId) => {
    const result = scenarioMessages.find((obj) => obj.dataId == msgId);
    if (result) {
      const userTextFound = searchMessageForUserInput(result, txt, scenarioMessages);
      txtMappingFoundInBotMessage = txtMappingFoundInBotMessage || userTextFound;
    }
  });
  return txtMappingFoundInBotMessage;
}

function searchCompositeMessageForUserInput(msg, txt, scenarioMessages) {
  let txtMappingFoundInBotMessage = false;
  msg.messages.forEach((msgId) => {
    const result = scenarioMessages.find((obj) => obj.dataId == msgId);
    if (result) {
      const userTextFound = searchMessageForUserInput(result, txt, scenarioMessages);
      txtMappingFoundInBotMessage = txtMappingFoundInBotMessage || userTextFound;
    }
  });
  return txtMappingFoundInBotMessage;
}

function searchBubbleFlexMessageForUserInput(msg, txt) {
  let txtMappingFoundInBotMessage = false;

  const actions = parseBubbleFlexForActions(msg.dataId, msg.params);
  actions.forEach((action) => {
    if (action.type == "message" && action.text == txt) {
      txtMappingFoundInBotMessage = true;
    }
  });

  return txtMappingFoundInBotMessage;
}

function searchButtonMessageForUserInput(msg, txt) {
  const actionCount = msg.params.actionCount;
  let txtMappingFoundInBotMessage = false;
  for (let x = 0; x < actionCount; x++) {
    const actionToCheck = msg.params["actions." + x];
    if (actionToCheck.type == "message" && actionToCheck.text == txt) {
      txtMappingFoundInBotMessage = true;
      break;
    }
  }
  return txtMappingFoundInBotMessage;
}

function searchCarouselMessageForUserInput(msg, txt) {
  const columnCount = msg.params.columnCount;
  const actionCount = msg.params.actionCount;
  let txtMappingFoundInBotMessage = false;
  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < actionCount; y++) {
      const actionToCheck = msg.params["action." + x + "." + y];
      if (actionToCheck.type == "message" && actionToCheck.text == txt) {
        txtMappingFoundInBotMessage = true;
        break;
      }
    }
    if (txtMappingFoundInBotMessage) {
      break;
    }
  }
  return txtMappingFoundInBotMessage;
}

function searchConfirmMessageForUserInput(msg, txt) {
  if (msg.params.actionLeft.type == "message" && msg.params.actionLeft.text == txt) {
    return true;
  }
  if (msg.params.actionRight.type == "message" && msg.params.actionRight.text == txt) {
    return true;
  }
  return false;
}

function searchImageMapMessageForUserInput(msg, txt) {
  const actionCount = msg.params.actionCount;
  let txtMappingFoundInBotMessage = false;
  for (let x = 0; x < actionCount; x++) {
    const actionToCheck = msg.params["action." + x];
    if (actionToCheck.type == "message" && actionToCheck.text == txt) {
      txtMappingFoundInBotMessage = true;
      break;
    }
  }
  return txtMappingFoundInBotMessage;
}

//================================================================
//Helper function to generate user action nodes
//================================================================
function getNodeItemFromMessageAction(msgAction) {
  //append here to add user message generation nodes
  let item = {
    type: "undefined",
    value: "サポートされてない",
    params: undefined,
    postbackId: undefined,
  };
  switch (msgAction.type) {
    case "message":
      item = {
        type: msgAction.type,
        value: msgAction.text,
        params: msgAction,
        postbackId: undefined,
      };
      break;
    case "uri":
      //To-Do: add checks for location_message and image_message
      item = {
        type: msgAction.type,
        value: msgAction.label ? msgAction.label : "URI",
        params: msgAction,
        postbackId: undefined,
      };
      if (msgAction.uri in SPECIAL_USER_ACTIONS) {
        item.type = SPECIAL_USER_ACTIONS[msgAction.uri];
      }
      break;
    case "datetimepicker":
      let initialDateTime = null;
      if (msgAction.initial) {
        const tempArray = msgAction.initial.split("T");
        initialDateTime = tempArray[0].replace(/-/g, "/");
      }
      item = {
        type: msgAction.type,
        value: initialDateTime ? initialDateTime : "日付アクション",
        params: msgAction,
        postbackId: undefined,
      };
      break;
    case "postback":
      item = {
        type: msgAction.type,
        value: msgAction.label ? msgAction.label : "ポストバック",
        postbackId: msgAction.data,
        params: msgAction,
      };
      break;
    default:
      break;
  }
  return item;
}

//================================================================
//Functions to get user action nodes from line messages
//================================================================
function searchMessageForUserActions(node, scenarioMindmapMessages) {
  let userActions = [];
  switch (node.dataType) {
    case "buttons":
      userActions = searchButtonMessageForUserActions(node);
      break;
    case "carousel":
      userActions = searchCarouselMessageForUserActions(node);
      break;
    case "confirm":
      userActions = searchConfirmMessageForUserActions(node);
      break;
    case "imagemap":
      userActions = searchImageMapMessageForUserActions(node);
      break;
    case "compositeMessage":
      userActions = searchCompositeMessageForUserActions(node, store.state.scenarios.scenarioMessages);
      break;
    case "bubbleFlex":
      userActions = searchBubbleMessageForUserActions(node);
      break;
    case "carouselFlex":
      userActions = searchCarouselFlexMessageForUserActions(node, store.state.scenarios.scenarioMessages);
      break;
  }
  return userActions;
}

function searchCarouselFlexMessageForUserActions(msg, scenarioMessages) {
  const userActionsFound = [];
  let bubbleIndex = 0;
  msg.params.bubbleParam.forEach((msgId) => {
    const result = scenarioMessages.find((obj) => obj.dataId == msgId);
    if (result) {
      const userActions = searchMessageForUserActions(result, scenarioMessages);
      let actionCount = 0;
      userActions.forEach((action) => {
        action["carouselIndex"] = bubbleIndex;
        action["carouselKey"] = msg.dataId;
        action["carouselName"] = "nameLBD" in result ? result.nameLBD : "バブルフレックス";
        action["firstActionOfCarouselGroup"] = actionCount == 0;
        userActionsFound.push(action);
        actionCount++;
      });
    }
    bubbleIndex++;
  });

  return userActionsFound;
}

function searchBubbleMessageForUserActions(msg) {
  const actionsInBubble = parseBubbleFlexForActions(msg.dataId, msg.params);
  const mappedActions = [];

  actionsInBubble.forEach((action) => {
    mappedActions.push(getNodeItemFromMessageAction(action));
  });

  return mappedActions;
}

function searchCompositeMessageForUserActions(msg, scenarioMessages) {
  const userActionsFound = [];
  msg.messages.forEach((msgId) => {
    const result = scenarioMessages.find((obj) => obj.dataId == msgId);
    if (result) {
      const userActions = searchMessageForUserActions(result, scenarioMessages);
      userActions.forEach((action) => {
        userActionsFound.push(action);
      });
    }
  });
  return userActionsFound;
}

function searchButtonMessageForUserActions(msg) {
  const actionCount = msg.params.actionCount;
  const actionsFound = [];
  for (let x = 0; x < actionCount; x++) {
    const actionToCheck = msg.params["actions." + x];
    actionsFound.push(getNodeItemFromMessageAction(actionToCheck));
  }
  return actionsFound;
}

function searchCarouselMessageForUserActions(msg) {
  const columnCount = msg.params.columnCount;
  const actionCount = msg.params.actionCount;
  const actionsFound = [];
  for (let x = 0; x < columnCount; x++) {
    for (let y = 0; y < actionCount; y++) {
      const actionToCheck = msg.params["action." + x + "." + y];
      const tempAction = getNodeItemFromMessageAction(actionToCheck);
      //Saving extra values for drawing carousel
      tempAction["carouselKey"] = msg.dataId;
      tempAction["carouselIndex"] = x;
      tempAction["carouselName"] = msg.params["useTitle"] ? msg.params["title." + x] : "カルーセル列" + (x + 1);
      const tempResult = actionsFound.filter((obj) => obj.carouselIndex == x);
      tempAction["firstActionOfCarouselGroup"] = tempResult.length == 0;

      actionsFound.push(tempAction);
    }
  }
  return actionsFound;
}

function searchConfirmMessageForUserActions(msg) {
  const actionsFound = [];
  actionsFound.push(getNodeItemFromMessageAction(msg.params.actionLeft));
  actionsFound.push(getNodeItemFromMessageAction(msg.params.actionRight));
  return actionsFound;
}

function searchImageMapMessageForUserActions(msg) {
  const actionCount = msg.params.actionCount;
  const actionsFound = [];
  for (let x = 0; x < actionCount; x++) {
    const actionToCheck = msg.params["action." + x];
    actionsFound.push(getNodeItemFromMessageAction(actionToCheck));
  }
  return actionsFound;
}

//================================================================
//Helper functions to parse actions from bubbleFlex Messages
//================================================================
function actionNotDisabled(action) {
  return !("disabled" in action) || !action.disabled;
}

function actionIsEmptyPostback(action) {
  return action.type == "postback" && isNullOrEmpty(action.data);
}

function actionIsPostbackAndDataIs(action, data) {
  return action.type === "postback" && action.data === data;
}

function getActionsFromComponent(component) {
  const actionsFound = [];
  switch (component.type) {
    case "text":
    case "button":
    case "image":
      if ("action" in component && actionNotDisabled(component.action)) {
        actionsFound.push(component.action);
      }
      break;
    case "box":
      if ("action" in component && actionNotDisabled(component.action)) {
        actionsFound.push(component.action);
      }
      if ("contents" in component) {
        component.contents.forEach((subComponent) => {
          const subActionsFound = getActionsFromComponent(subComponent);
          subActionsFound.forEach((action) => {
            actionsFound.push(action);
          });
        });
      }
      break;
    default:
      break;
  }

  return actionsFound;
}

function parseBubbleFlexForActions(dataId, bubbleParams) {
  //Return 'cached' bubble actions
  if (dataId in parsedBubbleActions) {
    return parsedBubbleActions[dataId];
  }

  const actionsFound = [];
  if ("action" in bubbleParams && actionNotDisabled(bubbleParams.action)) {
    actionsFound.push(bubbleParams.action);
  }

  if ("header" in bubbleParams) {
    const bubbleHeader = bubbleParams.header;
    if ("action" in bubbleHeader && actionNotDisabled(bubbleHeader.action)) {
      actionsFound.push(bubbleHeader.action);
    }
    if ("contents" in bubbleHeader) {
      bubbleHeader.contents.forEach((component) => {
        const componentActions = getActionsFromComponent(component);
        componentActions.forEach((action) => {
          actionsFound.push(action);
        });
      });
    }
  }

  if ("body" in bubbleParams) {
    const bubbleBody = bubbleParams.body;
    if ("action" in bubbleBody && actionNotDisabled(bubbleBody.action)) {
      actionsFound.push(bubbleBody.action);
    }
    if ("contents" in bubbleBody) {
      bubbleBody.contents.forEach((component) => {
        const componentActions = getActionsFromComponent(component);
        componentActions.forEach((action) => {
          actionsFound.push(action);
        });
      });
    }
  }

  if ("hero" in bubbleParams) {
    const bubbleHero = bubbleParams.hero;
    if ("action" in bubbleHero && actionNotDisabled(bubbleHero.action)) {
      actionsFound.push(bubbleHero.action);
    }
  }

  if ("footer" in bubbleParams) {
    const bubbleFooter = bubbleParams.footer;
    if ("action" in bubbleFooter && actionNotDisabled(bubbleFooter.action)) {
      actionsFound.push(bubbleFooter.action);
    }
    if ("contents" in bubbleFooter) {
      bubbleFooter.contents.forEach((component) => {
        const componentActions = getActionsFromComponent(component);
        componentActions.forEach((action) => {
          actionsFound.push(action);
        });
      });
    }
  }

  parsedBubbleActions[dataId] = actionsFound;

  return actionsFound;
}

export function addElementToBubbleFlexPostbackActions(bubbleParams, elementName="_shouldSetDataId", valueToAdd=true) {
  const actions = parseBubbleFlexForActions(null, bubbleParams);
  for(const action of actions) {
    if (actionIsEmptyPostback(action)) {
      action[elementName] = valueToAdd;
    }
  }
  return bubbleParams;
}

export function replaceFirstIncompletePostbackActionInBubble(bubbleParams, dataToAdd) {
  const actions = parseBubbleFlexForActions(null, bubbleParams);
  for (const action of actions) {
    if (action._shouldSetDataId) {
      delete action._shouldSetDataId;
      action["data"] = dataToAdd;
      break;
    }
  }
  return;
}

export function deletePostbackActionFromBubbleFlexParams(bubbleParams, elemToDelete) {
  const dataIdToDelete = elemToDelete.dataId;
  const actions = parseBubbleFlexForActions(null, bubbleParams);
  for (const action of actions) {
    if (actionIsPostbackAndDataIs(action, dataIdToDelete)) {
      delete action.data;
      action._shouldSetDataId = true;
    }
  }
}

export const LINKED_NODE_DELETE_ERROR = "elements contains linked node";

export function deleteElements(mindmapMessages, rootElem, processedElemIds = []) {
  if (!rootElem || processedElemIds.includes(rootElem.mindmapId) || rootElem.mindmapId === 0) {
    return [];
  }

  if (rootElem.linkedNode) {
    return new Error(LINKED_NODE_DELETE_ERROR);
  }

  processedElemIds.push(rootElem.mindmapId);
  const targets = [rootElem];

  const childMessages = mindmapMessages.filter((message) => message.parentId === rootElem.mindmapId);
  if (childMessages) {
    for (const message of childMessages) {
      const childTargets = deleteElements(mindmapMessages, message, processedElemIds);
      if (childTargets instanceof Error) {
        return childTargets;
      }
      if (Array.isArray(childTargets)) {
        targets.push(...childTargets);
      }
    }
  }

  return targets;
}
