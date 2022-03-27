import { API } from "@/services/helpers/api";
import { cloneDeep } from "lodash";
import { generateUUID } from "@/utils/uuidUtils";
const SCENARIO_SETTINGS_SKELETON = {
  scenarioId: "settings",
  activeScenarioId: "",
  envMapping: {
    production: "",
    sandbox: "",
  },
};
export const ScenarioApiName = "ScenarioAdminApi";

const GET_ALL_SCENARIOS = "/api/admin/scenarios/listAll";
export const GetAllScenarios = async (filter = {}) => {
  var errorFetching = false;

  var response = {};

  response = await API.get(ScenarioApiName, GET_ALL_SCENARIOS + '?' + new URLSearchParams(filter).toString(), {})
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorFetching = true;
        return error;
      });
  if (errorFetching) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }

  return response;
};
const GET_LIST_SCENARIOS = "/api/admin/scenarios";
export const GetListScenarios = async (filter = {}) => {
  var errorFetching = false;

  var response = {};

  response = await API.get(ScenarioApiName, GET_LIST_SCENARIOS + '?' + new URLSearchParams(filter).toString(), {})
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorFetching = true;
        return error;
      });
  if (errorFetching) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }

  return response;
};

const GET_SETTING_SCENARIOS = "/api/admin/scenarios/getSetting";
export const GetSettingScenarios = async () => {
  return API.get(ScenarioApiName, GET_SETTING_SCENARIOS, {});
};

const CREATE_SETTING_SCENARIOS = "/api/admin/scenario_settings";
export const CreateSettingScenarios = async (name) => {
  return API.post(ScenarioApiName, CREATE_SETTING_SCENARIOS, { name });
};

const DELETE_SCENARIOS = "/api/admin/scenarios/deleteScenario";
export const DeleteScenarios = async (payload) => {
  return API.post(ScenarioApiName, DELETE_SCENARIOS, { ids: payload })
};

const ACTIVE_SCENARIO_DATA = "/api/admin/scenarios/getSetting";
export const GetActiveScenarioData = async () => {
  return API.get(ScenarioApiName, ACTIVE_SCENARIO_DATA, {});
};

const UPDATE_SCENARIO_TABLE = "/scenario/api/db/scenario/putItem";
const UPDATE_ACTIVE_SCENARIO_TABLE = "/api/admin/scenarios/changeActive";
export const SetActiveScenarioData = async (scenarioName, scenarioVersion, scenarioData, environment) => {
  var errorUpdating = false;
  const response = await API.post(ScenarioApiName, UPDATE_ACTIVE_SCENARIO_TABLE, { id: scenarioName, type: environment })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};

export const SetScenarioData = async (scenarioData) => {
  var errorUpdating = false;
  const response = await API.post(ScenarioApiName, UPDATE_SCENARIO_TABLE, {
    body: scenarioData,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};
const UPDATE_ACTIVE_SCENARIO_SPECIAL_TALK = '/api/admin/scenarios/update-special-talks'
export const SetActiveDamageReportScenarioData = async (scenarioData) => {
  var errorUpdating = false;
  const response = await API.post(ScenarioApiName, UPDATE_ACTIVE_SCENARIO_SPECIAL_TALK, scenarioData)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};

const CREATE_DAMAGE_REPORT_MESSAGES = "/api/admin/scenario-talks/addDamageReport";
const CREATE_BOUSAI_MESSAGES = "/api/admin/scenario-talks/addBosaiFlow";
const CREATE_BOUSAI_SEARCH_MESSAGES = "/api/admin/scenario-talks/addBosaiSearchFlow";
const CREATE_BOUSAI_RAIN_TYPHOON_MESSAGES = "/api/admin/scenario-talks/addBosaiRainTyphoonFlow";
const CREATE_BOUSAI_EARTHQUAKE_MESSAGES = "/api/admin/scenario-talks/addBosaiEarthquakeFlow";
export const CreateSpecialScenarioTalk = async (scenarioId, versionId, specialTalkName) => {
  var errorFetching = false;
  var endPointToCall = null;
  switch (specialTalkName) {
    case "損傷報告":
      endPointToCall = CREATE_DAMAGE_REPORT_MESSAGES;
      break;
    case "防災":
      endPointToCall = CREATE_BOUSAI_MESSAGES;
      break;
    case "防災検索":
      endPointToCall = CREATE_BOUSAI_SEARCH_MESSAGES;
      break;
    case "防災（大雨・台風）":
      endPointToCall = CREATE_BOUSAI_RAIN_TYPHOON_MESSAGES;
      break;
    case "防災（地震）":
      endPointToCall = CREATE_BOUSAI_EARTHQUAKE_MESSAGES;
      break;
  }
  if (endPointToCall == null) {
    throw new Error("Special talk not supported through this method.");
  }

  const response = await API.post(ScenarioApiName, endPointToCall, {
      scenario: scenarioId,
      version: versionId,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorFetching = true;
        return error;
      });
  if (errorFetching) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};

const QUERY_SCENARIO_DATA = "/api/admin/scenario-messages";
export const GetAllScenarioMessages = async (scenarioId, versionId) => {
  var fetchBody = {
    scenarioId: versionId
  };
  return await API.get(ScenarioApiName, QUERY_SCENARIO_DATA + '?' + new URLSearchParams(fetchBody), {fetchBody});
};

const QUERY_SCENARIO_TALK_LIST = "/api/admin/scenario-talks";
export const GetScenarioTalkList = async (param) => {
  return await API.get(ScenarioApiName, QUERY_SCENARIO_TALK_LIST, {params: param});
};
export const SaveScenarioTalk = async (payload) => {
  return await API.post(ScenarioApiName, QUERY_SCENARIO_TALK_LIST, payload);
};

export const deleteTalkByIds = async (payload) => {
  return await API.del(ScenarioApiName, QUERY_SCENARIO_TALK_LIST + '/' + payload.versionId, {params: {ids: payload.talkIds}});
}

const QUERY_SCENARIO_TEXTMAP_LIST = "/api/admin/scenario-textmap";
export const GetScenarioTextMapping = async (scenarioId) => {
  return await API.get(ScenarioApiName, QUERY_SCENARIO_TEXTMAP_LIST + '/' + scenarioId, {});
};

const QUERY_SCENARIO_DATA_TYPE = "/api/admin/scenario-textmap/data-type";
export const GetScenarioDataByDataType = async (scenarioId, versionId, dataType) => {
  var fetchBody = {
    dataType: dataType,
    scenarioId: scenarioId
  };
  var errorFetching = false;

  const response = await API.get(ScenarioApiName, QUERY_SCENARIO_DATA_TYPE + '/' + versionId + '?' + new URLSearchParams(fetchBody), fetchBody)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorFetching = true;
        return error;
      });
  if (errorFetching) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};

const UPDATE_SCENARIO_DATA_TABLE = "/api/admin/scenario-text-mapping";
const UPDATE_SCENARIO_DATA_TABLE_TEXT = "/api/admin/scenario-messages";
export const UpdateTextMapping = async (dataId, newTexts, textMapping, payload) => {
  var updateObject = cloneDeep(textMapping);

  Object.keys(updateObject["textMapping"]).forEach((key) => {
    if (updateObject["textMapping"][key] === dataId) {
      delete updateObject["textMapping"][key];
    }
  });
  updateObject['startMessage'] = ''
  newTexts.forEach((text) => {
    updateObject["textMapping"][text] = dataId;
  });
  for (const index in updateObject["textMapping"]) {
    if (updateObject["textMapping"][index] === dataId) {
      if (updateObject['startMessage'] === '') {
        updateObject['startMessage'] = index
      }
    }
  }
  updateObject['talkId'] = payload.talkId

  var updateBody = updateObject;
  var errorUpdating = false;

  const response = await API.put(ScenarioApiName, UPDATE_SCENARIO_DATA_TABLE + '/' + updateBody.dataId, updateBody)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return updateObject;
};

export const CreateEmptyTextMapping = async (scenario) => {
  // Create an empty text mapping for the given full scenario identifier
  let errorUpdating = false;

  let emptyMapping = {
    dataId: 'textMapping',
    dataType: 'textMapping',
    scenario: scenario,
    textMapping: {}
  }
  const response = await API.put(ScenarioApiName, UPDATE_SCENARIO_DATA_TABLE_TEXT + '/' + scenario, emptyMapping)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
}

export const AddCompositeMessage = async (data) => {
  var dataToUpload = cloneDeep(data);
  var errorUpdating = false;
  const response = await API.post(ScenarioApiName, UPDATE_SCENARIO_DATA_TABLE_TEXT , dataToUpload)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }

  return response;
};

const SET_DEFAULT_RICH_MENU = "/scenario/api/richMenu/setActiveRichMenu";
export const SetDefaultScenarioRichMenu = async (id, env) => {
  let errorUpdating = false;
  const response = await API.post(ScenarioApiName, SET_DEFAULT_RICH_MENU, {
    body: {
      richMenuId: id,
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });

  return response;
};

const DELETE_SCENARIO_DATA_ELEMENT = "/api/admin/scenario-messages";
export const DeleteScenarioDetailMessage = async (dataId, scenario) => {
  var errorUpdating = false;
  const response = await API.del(ScenarioApiName, DELETE_SCENARIO_DATA_ELEMENT + '/' + dataId, {})
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }

  return response;
};

export const UpdateScenarioDataMessage = async (data) => {
  var dataToUpload = cloneDeep(data);
  if (dataToUpload["userInput"]) {
    delete dataToUpload["userInput"];
  }
  if (dataToUpload["previewType"]) {
    delete dataToUpload["previewType"];
  }
  if (dataToUpload["previewValue"]) {
    delete dataToUpload["previewValue"];
  }

  var updateBody = dataToUpload;
  var errorUpdating = false;
  const response = await API.put(ScenarioApiName, UPDATE_SCENARIO_DATA_TABLE_TEXT + '/' + updateBody.id, updateBody)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }

  return response;
};

const ReadFileAsync = async (file) => {
  if (typeof file === "string" && file.startsWith("data:")) {
    const innerResp = await fetch(file);
    return innerResp.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
};

function resizeImage(base64Image, targetWidth) {
  return new Promise((resolve) => {
    const type = base64Image
        .replace(/^data:/, "")
        .split(";")
        .shift();
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const originalSize = {
        width: img.width,
        height: img.height,
      };
      const targetSize = {
        width: targetWidth,
        height: Math.ceil((targetWidth / img.width) * img.height),
      };
      canvas.width = targetSize.width;
      canvas.height = targetSize.height;
      ctx.drawImage(img, 0, 0, originalSize.width, originalSize.height, 0, 0, targetSize.width, targetSize.height);
      const result = canvas.toDataURL(type);
      console.log("image resized:", originalSize, "->", targetSize);
      resolve(result);
    };
    img.src = base64Image;
  });
}

export const UploadImagemapImageToS3 = async(base64Image) => {
  const sizes = [240, 300, 460, 700, 1040];
  let generatedUUID = generateUUID();
  let s3Response;
  for (const size of sizes) {
    const resizedImage = await resizeImage(base64Image, size);
    s3Response = await UploadImageToS3(resizedImage, generatedUUID + "/" + String(size), "resources");
  }
  const baseUrl = "https://" + s3Response["cloudFrontDist"] + "/resources/" + generatedUUID;
  return { baseUrl, generatedUUID };
}

const GET_PRESIGNED_URL = "/api/admin/scenario/api/presignedURL";
const CLOUDFRONT_DIST = process.env.VUE_APP_SCENARIO_CLOUDFRONT_DOMAIN_NAME;
export const UploadImageToS3 = async (fileData, url, folname) => {
  var errorGettingPresignedURL = false;

  let contentType = fileData.type;
  if (typeof fileData === "string" && fileData.startsWith("data:")) {
    contentType = fileData
        .replace(/^data:/, "")
        .split(";")
        .shift();
  }

  const presignedUrlResponse = await API.get(ScenarioApiName, GET_PRESIGNED_URL, {
    queryStringParameters: {
      folderName: folname,
      objectName: url,
      contentType: contentType,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
        errorGettingPresignedURL = true;
        return error;
      });
  if (errorGettingPresignedURL) {
    throw presignedUrlResponse;
  }
  if (presignedUrlResponse.result === "ERROR") {
    throw new Error(presignedUrlResponse.exception);
  }

  return presignedUrlResponse;
};

const IMPORT_UPLOADED_FILE = "/scenario/api/importLBD";
export const UploadFile = async (fileData, scenarioVersion, setAsActive) => {
  var errorGettingPresignedURL = false;
  const presignedUrlResponse = await API.get(ScenarioApiName, GET_PRESIGNED_URL, {
    queryStringParameters: {
      objectName: fileData.name,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorGettingPresignedURL = true;
        return error;
      });
  if (errorGettingPresignedURL) {
    throw presignedUrlResponse;
  }
  if (presignedUrlResponse.result === "ERROR") {
    throw new Error(presignedUrlResponse.exception);
  }
  return presignedUrlResponse;
};

const EXPORT_DOWNLOADED_FILE = "/scenario/api/exportLBD";
export const DownloadFile = async (scenario, environment) => {
  var exportBody = {
    scenario: scenario,
    environment: environment,
  };
  var errorExporting = false;
  const exportResponse = await API.post(ScenarioApiName, EXPORT_DOWNLOADED_FILE, {
    body: exportBody,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorExporting = true;
        return error;
      });
  if (errorExporting) {
    throw exportResponse;
  }
  if (exportResponse.result === "ERROR") {
    throw new Error(exportResponse.exception);
  }
  return exportResponse;
};
export const GetAllUnfilteredScenarioMessages = async (scenarioId, versionId) => {
  var fetchBody = {
    scenario: scenarioId + "#" + versionId,
  };

  var items_fetched = [];

  var errorFetching = false;

  var response = {};
  do {
    if ("lastEvaluatedKey" in response) {
      fetchBody["lastEvaluatedKey"] = response.lastEvaluatedKey;
    }
    response = await API.post(ScenarioApiName, QUERY_SCENARIO_DATA, {
      body: fetchBody,
    })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          errorFetching = true;
          return error;
        });
    if (errorFetching) {
      throw response;
    }
    if (response.result === "ERROR") {
      throw new Error(response.error_message);
    }

    response.items.forEach((item) => {
      items_fetched.push(item);
    });
  } while ("lastEvaluatedKey" in response);

  response.items = items_fetched;

  return response;
};

const BATCH_WRITE_ITEM_ENDPOINT = "/api/admin/scenario-textmap/save-text-mapping";
export const BatchWriteItem = async (putItems, deleteItems) => {
  var bodyBatchWriteItem = {
    putItems: putItems,
    deleteItems: deleteItems,
  };

  var errorBatchWriteItem = false;
  const response = await API.post(ScenarioApiName, BATCH_WRITE_ITEM_ENDPOINT, bodyBatchWriteItem)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorBatchWriteItem = true;
        return error;
      });
  if (errorBatchWriteItem) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};

const UPDATE_SCENARIO_ENDPOINT = "/api/admin/scenarios";
export const RemoveVersionFromScenario = async (scenarioName, versionName) => {
  var body = {
    scenarioId: scenarioName,
    updateExpression: "remove versions.#v",
    expressionNames: {
      "#v": versionName,
    },
  };

  var errorRemoveVersionFromScenario = false;
  const response = await API.get(ScenarioApiName, UPDATE_SCENARIO_ENDPOINT, {
    body: body,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorRemoveVersionFromScenario = true;
        return error;
      });
  if (errorRemoveVersionFromScenario) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};
export const AddVersionToScenario = async (scenarioName, versionName, displayVersionName, category = 117, companyName = "Company Name") => {
  let errorAddVersionToScenario = false;
  const response = await API.post(ScenarioApiName, UPDATE_SCENARIO_ENDPOINT, {
    displayVersionName
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorAddVersionToScenario = true;
        return error;
      });
  if (errorAddVersionToScenario) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};
export const UpdateVersionDisplayName = async (scenarioName, versionName, originalVersion, displayVersionName) => {
  var body = {
    displayVersionName,
    id: versionName
  };

  var errorUpdateVersionDisplayName = false;
  const response = await API.put(ScenarioApiName, UPDATE_SCENARIO_ENDPOINT + '/' + versionName, body)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdateVersionDisplayName = true;
        return error;
      });
  if (errorUpdateVersionDisplayName) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }
  return response;
};

const CREATE_SCENARIO_ENDPOINT = "/api/admin/scenarios";
export const CreateScenario = async (scenarioName, versionName, displayVersionName, category = 117, companyName = "Company Name") => {
  let errorAddVersionToScenario = false;
  const response = await API.post(ScenarioApiName, CREATE_SCENARIO_ENDPOINT, {
    displayVersionName
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorAddVersionToScenario = true;
        return error;
      });
  if (errorAddVersionToScenario) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }

  return response;
};

const DELETE_SCENARIO_ENDPOINT = "/scenario/api/db/scenario/deleteItem";
export const DeleteScenarioVersion = async (scenarioName, settingsData) => {
  //probably safe to delete data from the active here
  var dataToSave = cloneDeep(settingsData);
  dataToSave.activeScenarioId = "";
  dataToSave.envMapping = {
    production: "",
    sandbox: "",
  };
  var errorUpdating = false;
  const response = await API.post(ScenarioApiName, UPDATE_SCENARIO_TABLE, {
    body: dataToSave,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorUpdating = true;
        return error;
      });
  if (errorUpdating) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.error_message);
  }

  return API.del(ScenarioApiName, DELETE_SCENARIO_ENDPOINT, {
    queryStringParameters: {
      scenarioId: scenarioName,
    },
  });
};

//method used for importing CSV file for trashdisposal scenario
const IMPORT_CSV_FILE = "/api/admin/scenario-talks/importTrashSpreadsheet";
export const UploadCSV = async (fileData, scenarioVersion) => {
  var errorReadingFile = false;
  const blob = await ReadFileAsync(fileData)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorReadingFile = true;
        return error;
      });
  if (errorReadingFile) {
    throw blob;
  }

  const FormData = require("form-data");

  const formData = new FormData();
  formData.append("file", fileData);
  formData.append("scenario_id", scenarioVersion);
  API.setFormData();
  var errorImporting = false;
  const importResponse = await API.post(ScenarioApiName, IMPORT_CSV_FILE, formData)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorImporting = true;
        return error;
      });
  if (errorImporting) {
    throw importResponse;
  }
  if (importResponse.result === "ERROR") {
    throw new Error(importResponse.exception);
  }
  return importResponse;
};

//method used for importing CSV file of zipcodes to restrict user
const IMPORT_LOCATION_CSV_FILE = "/api/admin/scenario-messages/importZipcodes";
export const UploadLocationCSV = async (fileData, scenarioVersion) => {
  var errorReadingFile = false;
  const blob = await ReadFileAsync(fileData)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorReadingFile = true;
        return error;
      });
  if (errorReadingFile) {
    throw blob;
  }

  const FormData = require("form-data");

  const formData = new FormData();
  formData.append("file", fileData);
  formData.append("scenario_id", scenarioVersion);
  API.setFormData();
  var errorImporting = false;
  const importResponse = await API.post(ScenarioApiName, IMPORT_LOCATION_CSV_FILE, formData)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorImporting = true;
        return error;
      });
  if (errorImporting) {
    throw importResponse;
  }
  if (importResponse.result === "ERROR") {
    throw new Error(importResponse.exception);
  }
  return importResponse;
};

//method for deleting the trash scenario data
const TRASH_END_POINT = "/scenario/api/deleteTrashScenario";
export const DeleteTrashScenario = async (scenarioId, versionId) => {
  var importBody = {
    scenario: scenarioId.concat("#").concat(versionId),
  };
  await API.post(ScenarioApiName, TRASH_END_POINT, {
    body: importBody,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
};

//method for downloading CSV file
const CSV_DOWNLOAD_ENDPOINT = "/scenario/api/exportTrashSpreadsheet";
export const DownloadCSVFile = async (scenario) => {
  var exportBody = {
    scenario: scenario,
  };
  var errorExporting = false;
  const exportResponse = await API.post(ScenarioApiName, CSV_DOWNLOAD_ENDPOINT, {
    body: exportBody,
  })
      .then((response) => {
        //console.log(response);
        return response;
      })
      .catch((error) => {
        errorExporting = true;
        return error;
      });
  if (errorExporting) {
    throw exportResponse;
  }
  if (exportResponse.result === "ERROR") {
    throw new Error(exportResponse.exception);
  }
  return exportResponse;
};

const RICH_MENU_CREATE_ENDPOINT = "/scenario/api/richMenu/createRichMenu";
export const CreateRichMenu = async (richMenuBody, env = null) => {
  var errorCreating = false;
  const createResponse = await API.post(ScenarioApiName, RICH_MENU_CREATE_ENDPOINT, {
    body: {
      richMenu: richMenuBody,
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorCreating = true;
        return error;
      });
  if (errorCreating) {
    throw createResponse;
  }
  if (createResponse.result === "ERROR") {
    throw new Error(createResponse.error_message);
  }
  return createResponse;
};

const COPY_RICH_MENU_IMAGE = "/scenario/api/richMenu/copyRichMenuImage";
export const CopyRichMenuImage = async (imageCopyPayload) => {
  var errorCopying = false;
  const copyResponse = await API.post(ScenarioApiName, COPY_RICH_MENU_IMAGE, {
    body: imageCopyPayload,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorCopying = true;
        return error;
      });
  if (errorCopying) {
    throw copyResponse;
  }
  if (copyResponse.result === "ERROR") {
    throw new Error(copyResponse.error_message);
  }
  return copyResponse;
};

const GET_ALL_RICH_MENUS = "/scenario/api/richMenu/getAllRichMenus";
export const FetchAllRichMenus = async () => {
  const response = await API.get(ScenarioApiName, GET_ALL_RICH_MENUS, {})
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });

  return response;
};

const GET_ALL_RICH_MENUS_ALIAS_LIST = "/scenario/api/richMenu/getRichMenuAliasList";
export const FetchAllRichMenusAliasList = async (id, env) => {
  const response = await API.get(ScenarioApiName, GET_ALL_RICH_MENUS_ALIAS_LIST, {queryStringParameters: {
      richMenuId: id,
      environment: env,
    },})
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });
  return response;
};

const DELETE_RICH_MENU_ENDPOINT = "/scenario/api/richMenu/deleteRichMenu";
export const DeleteRichMenu = async (idToDelete, env) => {
  var errorDeleting = false;
  const response = await API.del(ScenarioApiName, DELETE_RICH_MENU_ENDPOINT, {
    body: {
      richMenuId: idToDelete,
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorDeleting = true;
        return error;
      });
  if (errorDeleting) {
    throw response;
  }
  if (response.result === "ERROR") {
    throw new Error(response.exception);
  }
  return response;
};

const GET_DEFAULT_RICHMENU = "/scenario/api/richMenu/getDefaultRichMenu";
export const GetActiveRichMenu = async (env) => {
  const response = await API.get(ScenarioApiName, GET_DEFAULT_RICHMENU, {
    queryStringParameters: {
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });

  return response;
};

const GET_RICH_MENU_BY_ID = "/scenario/api/richMenu/getRichMenuById";
export const GetRichMenuById = async (id, env) => {
  const response = await API.get(ScenarioApiName, GET_RICH_MENU_BY_ID, {
    queryStringParameters: {
      richMenuId: id,
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });

  return response;
};

const LOAD_RICH_MENU_IMAGE = "/scenario/api/richMenu/downloadRichMenuImage";
export const LoadRichMenuImage = async (id, env) => {
  await API.get(ScenarioApiName, LOAD_RICH_MENU_IMAGE, {
    queryStringParameters: {
      richMenuId: id,
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });
};

const SET_RICH_MENU_IMAGE = "/scenario/api/richMenu/setRichMenuImage";
export const SetRichMenuImage = async (id, env, key) => {
  const imgResponse = await API.post(ScenarioApiName, SET_RICH_MENU_IMAGE, {
    body: {
      richMenuId: id,
      environment: env,
      imageKey: key,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });
  return imgResponse;
};

const CREATE_RICH_MENU_ALIAS = "/scenario/api/richMenu/createRichMenuAlias";
export const CreateRichMenuAlias = async (id, oldId, aliasId=null, env) => {
  const aliasResponse = await API.post(ScenarioApiName, CREATE_RICH_MENU_ALIAS, {
    body: {
      richMenuId: id,
      oldRichMenuId: oldId,
      richMenuAliasId: aliasId,
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });
  return aliasResponse;
};

const SET_ACTIVE_RM_ENDPOINT = "/scenario/api/richMenu/setActiveRichMenu";
export const SetActiveRichMenu = async (id, env) => {
  const activeResponse = await API.post(ScenarioApiName, SET_ACTIVE_RM_ENDPOINT, {
    body: {
      richMenuId: id,
      environment: env,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw new Error(error);
      });
  return activeResponse;
};

const BOSAI_MODE_PRODUCTION = "/chatbot/bosaiMode";
const BOSAI_MODE_SANDBOX = "/chatbot_sandbox/bosaiMode";
export const SetBosaiModeForEnv = async (environment, activeSetting, talkId) => {
  var API_TO_CALL = environment == "production" ? BOSAI_MODE_PRODUCTION : BOSAI_MODE_SANDBOX;
  var errorBosai = false;
  const bosaiResponse = await API.post(ScenarioApiName, API_TO_CALL, {
    body: {
      activate: activeSetting,
      selectedTalkId: talkId,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        errorBosai = true;
        return error;
      });
  if (errorBosai) {
    throw bosaiResponse;
  }
  if (bosaiResponse.result === "ERROR") {
    throw new Error(bosaiResponse.message);
  }
  return bosaiResponse;
};

const GET_ZIPCODE_ENDPOINT = "/api/admin/get-zipcode";
export const fetchZipCodes = async (scenario) => {
  var requestBody = {
    scenario: scenario,
  };
  const response = await API.post(ScenarioApiName, GET_ZIPCODE_ENDPOINT, requestBody)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  return response;
};

const DELETE_ZIPCODE_ENDPOINT = "/api/admin/deleteZipcodes";
export const deleteZipCodes = async (scenario) => {
  var requestBody = {
    scenario: scenario,
  };
  const response = await API.post(ScenarioApiName, DELETE_ZIPCODE_ENDPOINT, requestBody)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  return response;
};
const EXPORT_ZIPCODE_ENDPOINT = "/api/admin/exportZipcodesCSV";
export const downloadZipCSV = async (scenario) => {
  var exportBody = {
    scenario: scenario,
  };
  var errorExporting = false;
  const exportResponse = await API.post(ScenarioApiName, EXPORT_ZIPCODE_ENDPOINT, exportBody)
      .then((response) => {
        //console.log(response);
        return response;
      })
      .catch((error) => {
        errorExporting = true;
        return error;
      });
  if (errorExporting) {
    throw exportResponse;
  }
  if (exportResponse.result === "ERROR") {
    throw new Error(exportResponse.exception);
  }
  return exportResponse;
};

const SPECIAL_SCENARIO_SIMULATE_RESPONSE = "/chatbot_sandbox/simulateResponse";
export const GetSpecialScenarioReply = async (payload) => {
  const response = await API.post(ScenarioApiName, SPECIAL_SCENARIO_SIMULATE_RESPONSE, {
    body: payload,
  })
      .then((response) => {
        return response.messages;
      })
      .catch((error) => {
        return error;
      });

  return response;
};

const FLOW_START_EVENT = "/chatbot_sandbox/flowStartEvent";
export const GetSpecialScenarioRootNode = async (payload) => {
  const response = await API.post(ScenarioApiName, FLOW_START_EVENT, {
    body: payload,
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });

  return response;
};

const UPDATE_TALK_NAME = "/api/admin/scenario-talks/updateTalkName";
export const UpdateScenarioTalkName = async (scenarioId, versionId, talkDataId, newTalkName) => {
  const response = await API.post(ScenarioApiName, UPDATE_TALK_NAME, {
      scenarioId: scenarioId,
      versionId: versionId,
      talkDataId: talkDataId,
      newTalkName: newTalkName
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw error;
      });

  return response;
}

const AGGREGATE_TALK_LOG = "/scenario/api/aggregate";
export const AggregateTalkLog = async (fromdate, todate, user) => {
  const response = await API.post(ScenarioApiName, AGGREGATE_TALK_LOG, {
    body: {
      fromdate: fromdate,
      todate: todate,
      user: user,
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  console.log(response);
  if (response.result === "ERROR") {
    throw new Error(response.message);
  }
  return response;
};

const FETCH_TALK_LOG_LISTS = "/scenario/api/talkLogLists";
export const FetchTalkLogLists = async () => {
  const response = await API.get(ScenarioApiName, FETCH_TALK_LOG_LISTS, {
    body: {
    },
  })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  if (response.result === "ERROR") {
    throw new Error(response.message);
  }
  return response;
};
