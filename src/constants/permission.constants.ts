export const TABS_AND_SUBPAGES_RELATIONS = {
  // home
  ApplicantsPage: [],

  // distribution
  SegmentDeliveryPage: [
    "ConditionDetail",
    "DistributionDetail",
    "DistributionCreatePage",
    "DistributionEditPage",
    "DistributionCopyPage",
    "RemindDelivaryDetail",
    "RemindDeliveryCreatePage",
  ],

  // form
  FormCreatePage: ["FormCreateNewPage", "FormDetailPage"],

  // system settings
  CommonSettings: [
    "AwsSettings",
    "LineSettings",
    "EmailSettings",
  ],

  // user settings
  User: ["UserSettings", "UserDetail", "Team", "Group", "GroupDetail", "Policy"],

  // scenario
  ScenarioSettingsPage: ["ScenarioSettingsDetailPage"],

  // calendar
  CalendarPage: ["CategorySettings", "CalendarSettings"],

  // bosai
  BosaiSettingsPage: [],

  // statistics
  LogsPage: [],
};

export const ACCESS_TAB_PERMISSION = {
  // home
  ApplicantsPage: ["admins", "members", "guests", "operators"],

  // distribution
  SegmentDeliveryPage: ["admins", "members", "guests"],
  ConditionDetail: ["admins", "members", "guests"],
  DistributionDetail: ["admins", "members", "guests"],
  DistributionCreatePage: ["admins", "members", "guests"],
  DistributionEditPage: ["admins", "members", "guests"],
  DistributionCopyPage: ["admins", "members", "guests"],
  RemindDelivaryDetail: ["admins", "members", "guests"],
  RemindDeliveryCreatePage: ["admins", "members", "guests"],

  // form
  FormCreatePage: ["admins", "members", "guests"],
  FormCreateNewPage: ["admins", "members", "guests"],
  FormDetailPage: ["admins", "members", "guests"],

  // system settings
  CommonSettings: ["administrators"],
  AwsSettings: ["administrators"],
  LineSettings: ["administrators"],
  EmailSettings: ["administrators"],
  SystemLogs: ["administrators"],

  // user settings
  UserSettings: ["admins", "members", "guests"],
  User: ["admins", "members", "guests"],
  UserDetail: ["admins", "members", "guests"],
  Team: ["admins", "members", "guests"],
  Group: ["admins", "members", "guests"],
  GroupDetail: ["admins", "members", "guests"],
  Policy: ["admins", "members", "guests"],

  // scenario
  ScenarioSettingsPage: ["admins", "members", "guests"],
  ScenarioVersionSettingsPage: ["admins", "members", "guests"],
  ScenarioSettingsDetailPage: ["admins", "members", "guests"],
  ScenarioMindmapPage: ["admins", "members", "guests"],

  // calendar
  CalendarPage: ["admins", "members", "guests", "operators"],
  CategorySettings: [],
  CalendarSettings: ["admins"],

  // bosai
  BosaiSettingsPage: ["admins", "members", "guests"],

  // statistics
  LogsPage: ["admins", "members", "guests"],
  StatisticsPage: ["admins", "members", "guests"],
};

export const HIDE_BUTTON_PERMISSION = {
  // home
  Applicants_ContentFragment_ImportCSVAppending: ["members", "guests"],
  Applicants_ContentFragment_ExportCSV: ["guests", "operators"],
  Applicants_ContentFragment_DeleteSelected: ["members", "guests", "operators"],
  Applicants_SearchFragment_ExportCSVAsync: ["guests", "operators"],
  Applicants_DataModal_Unicast: ["guests"],
  Applicants_DataModal_Save: ["guests"],
  Applicants_MemberDataModal_ResetId: ["guests"],
  Applicants_NewSurveyModal_Save: ["guests"],
  Applicants_ContentFragment_MultipleUnicast: ["guests"],
  Applicants_DataModal_History_Download: ["guests"],

  // distribution
  SegmentDelivery_DistributionCreation_SaveDraft: ["guests", "operators"],
  SegmentDelivery_DistributionCreation_TestBroadcast: ["guests", "operators"],
  SegmentDelivery_DistributionCreation_SendDistribution: ["guests", "operators"],
  SegmentDelivery_DistributionDetail_ResendDistribution: ["guests", "operators"],
  SegmentDelivery_DistributionDetail_DeleteDistribution: ["members", "guests", "operators"],
  SegmentDelivery_DataModal_Save: ["guests", "operators"],
  SegmentDelivery_ConditionDetail_Clear: ["guests", "operators"],
  SegmentDelivery_ConditionDetail_Save: ["guests", "operators"],

  // form
  FormEditor_EndOfSurveyMessageModal_Save: ["members", "guests", "operators"],
  FormEditor_DeliveryMessageSettingModal_Save: ["members", "guests", "operators"],
  FormEditor_TeamSelectDialog_updateTeamSetting: ["guests"],
  FormCreation_CreatedFormListItem_EnableStatus: ["members", "guests"],
  FormCreation_CreatedFormListItem_DisableStatus: ["members", "guests"],
  FormCreation_CreatedFormListItem_Delete: ["members", "guests"],

  // scenario -settings
  ScenarioSettings_ScenarioEnvironmentCard_Activate: ["members", "guests", "operators"],
  ScenarioSettings_ScenarioEnvironmentCard_Import: ["guests"],
  ScenarioSettings_ScenarioEnvironmentCard_Delete: ["members", "guests", "operators"],
  ScenarioSettings_VersionImportModal_SetAsActive: ["members", "guests", "operators"],
  Components_BotDesigner_ItemProperties_Save: ["guests", "operators"],
  Components_BotDesigner_ItemProperties_Delete: ["guests", "operators"],
  // scenario -rich menu
  ScenarioSettings_RichMenuCreateModal_Save: ["guests", "operators"], // old
  ScenarioSettings_RichMenuDesigner_Save: ["guests", "operators"],
  ScenarioSettings_RichMenuManageTable_SetDefault: ["members", "guests", "operators"],
  ScenarioSettings_RichMenuManageTable_SetBosai: ["members", "guests", "operators"],
  ScenarioSettings_RichMenuManageTable_Delete: ["members", "guests", "operators"],

  // calendar
  Calendar_SearchFragment_CsvRegistration: ["guests", "operators"],
  Calendar_ImportCsvContent_SelectCsvFile: ["guests", "operators"],
  Calendar_ImportCsvContent_RegisterCsvFile: ["guests", "operators"],
  Calendar_Index_CalendarSettings: ["guests", "operators", "members"],
  Calendar_Member_ExportCSV: ["guests"],
  Calendar_Member_DeleteSurveyResult: ["members", "guests", "operators"],

  // bosai
  Components_RichMenuDisplay_Activate: ["members", "guests", "operators"],
  // bosai-shisetsu
  BosaiSettings_ShelterList_StatusEdit: ["guests", "operators"],
  BosaiSettings_ShelterList_ImportShelters: ["guests", "operators"],
  BosaiSettings_ShelterList_OperationStatus: ["guests", "operators"],
  BosaiSettings_ShelterTable_DeleteAllShelters: ["guests", "operators"],
  BosaiSettings_ShelterTable_DeleteSelectedShelters: ["guests", "operators"],
  BosaiSettings_ShelterImportContent_ImportFile: ["guests", "operators"],

  // system settings
  AdminSettings_CommonSettings_Update: ["members", "guests", "operators"],
  AdminSettings_AwsSettings_UpdateMessagingAPISettingsPro: ["members", "guests", "operators"],
  AdminSettings_AwsSettings_UpdateMessagingAPISettingsSB: ["members", "guests", "operators"],
  AdminSettings_AwsSettings_UpdateDamageReportSettings: ["members", "guests", "operators"],
  AdminSettings_EmailSettings_Update: ["members", "guests", "operators"],
  AdminSettings_Search_SystemLogs: ["members", "guests", "operators"],

  // user settings
  UserSettings_AddUserDialog_Save: ["members", "guests", "operators"],
  UserSettings_UserDetail_ResetPassword: ["members", "guests", "operators"],
  UserSettings_UserDetail_DisableAccount: ["members", "guests", "operators"],
  UserSettings_UserDetail_DeleteUser: ["members", "guests", "operators"],
  UserSettings_UserDetail_RemoveTeam: ["members", "guests", "operators"],
  UserSettings_UserDetail_RemoveAccessLevel: ["members", "guests", "operators"],
  UserSettings_Policy_Save: ["members", "guests", "operators"],
};

export const DISABLE_BUTTON_PERMISSION = {
  FormCreation_FormBlankCard_To: ["members", "guests", "operators"],
  FormCreation_FormTemplate_Click: ["members", "guests", "operators"],
  FormCreation_FormTemplate_Keypress: ["members", "guests", "operators"],

  ScenarioSettings_CreateVersion_Click: ["guests"],
  ScenarioSettings_DeleteVersion_Click: ["guests"],
  ScenarioSettings_EnableVersion_Click: ["guests"],
  ScenarioSettings_ImportVersion_Click: ["guests"],
  ScenarioSettings_ExportVersion_Click: ["guests"],
  ScenarioSettings_CreateTalk_Click: ["guests"],
  ScenarioSettings_DeleteTalk_Click: ["guests"],
  ScenarioSettings_ChangeTalkName_Click: ["guests"],
  ScenarioSettings_CreateTemplate_Click: ["guests"],
  ScenarioSettings_DeleteTemplate_Click: ["guests"],
  ScenarioSettings_EnableTemplate_Click: ["guests"],
  ScenarioSettings_CreateCompositeMessage_Click: ["guests"],
  ScenarioSettings_DeleteMessage_Click: ["guests"],
  ScenarioSettings_ImportZipCodeCsv_Click: ["guests"],
  ScenarioSettings_EditUserMessage_Readonly: ["guests"],
  ScenarioSettings_SaveUserMessage_Click: ["guests"],
  ScenarioSettings_ApplyMapAction_Click: ["guests"],
  ScenarioSettings_SaveMap_Click: ["guests"],
  ScenarioSettings_DeleteNode_Click: ["guests"],
};

// weakest to strongest
export const PERMISSION_POWER_LEVEL = ["guests", "operators", "members", "admins"];

export const ROLE_ADMIN = 1;
export const ROLE_MEMBER = 2;
export const USER_TYPE_ADMIN = 1;
export const USER_TYPE_STORE = 2;

//survey list
export const SURVEY_ENABLE_STATUS = 1;
export const SURVEY_DISABLE_STATUS = 2;
