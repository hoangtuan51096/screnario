export const DAMAGE_REPORT_FLOW = `
graph TD
richmenu[リッチメニュー] --> |"損傷報告-OK"|REPORT_MODE_BUTTON(報告モードボタン)
richmenu[リッチメニュー] --> |"損傷報告-FAIL"|DISABLED_DAMAGE_REPORT_MODE([損傷報告無効テキスト])
linkStyle 1 interpolate basis color: red


REPORT_MODE_BUTTON --> |LINEでこのまま通報|CATEGORY_NORMAL_BUTTON(ノーマルカテゴリボタン)
REPORT_MODE_BUTTON --> |"緊急・電話で通報"|CATEGORY_PHONE_BUTTON(電話カテゴリボタン)
CATEGORY_PHONE_BUTTON --> |河川|CATEGORY_PHONE_RIVER_TEXT[[河川電話テキストカテゴリ]]
CATEGORY_PHONE_BUTTON --> |公園|CATEGORY_PHONE_PARK_TEXT[[公園電話テキストカテゴリ]]

CATEGORY_NORMAL_BUTTON --> |河川|CAMERA_ACTION_BUTTON(カメラアクションボタン)
CATEGORY_NORMAL_BUTTON --> |公園|CATEGORY_DETAILS_PARK_CAROUSEL(公園詳細カテゴリカルーセル)


CAMERA_ACTION_BUTTON --> |カメラで撮影する|CAMERA_ACTION_BUTTON1(https://line.me/R/nv/camera/)
CAMERA_ACTION_BUTTON --> |カメラロールから選択|CAMERA_ACTION_BUTTON2(https://line.me/R/nv/cameraRoll/single)

CAMERA_ACTION_BUTTON1 --> CAMERA_PICTURE_CONFIRM(カメラ写真確認)
CAMERA_ACTION_BUTTON2 --> CAMERA_PICTURE_CONFIRM(カメラ写真確認)


CAMERA_PICTURE_CONFIRM --> |はい|STATUS_USER_COMMENT_RIVER_BUTTON(ユーザ状態河川コメントボタン)
CAMERA_PICTURE_CONFIRM --> |いいえ|CAMERA_ACTION_BUTTON(カメラアクションボタン)


STATUS_USER_COMMENT_RIVER_BUTTON(ユーザ状態河川コメントボタン) --> |破損|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_RIVER_BUTTON(ユーザ状態河川コメントボタン) --> |木や草が茂っている|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_RIVER_BUTTON(ユーザ状態河川コメントボタン) --> |油.泡が浮いている|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_RIVER_BUTTON(ユーザ状態河川コメントボタン) --> |その他 自由記入|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)


STATUS_USER_COMMENT_CONFIRM --> |はい|LOCATION_PICKER_BUTTON(位置ピッカーボタン)
STATUS_USER_COMMENT_CONFIRM --> |いいえ|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)

LOCATION_PICKER_BUTTON --> |位置情報を送信する|LOCATION_PICKER_BUTTON1(https://line.me/R/nv/location)
LOCATION_PICKER_BUTTON1 --> LOCATION_CONFIRM(位置確認)

LOCATION_CONFIRM(位置確認) --> |はい|CAMERA_ACTION_DETAILED_PICTURE_BUTTON(カメラアクション詳しく写真ボタン)
LOCATION_CONFIRM(位置確認) --> |いいえ|LOCATION_PICKER_BUTTON(位置ピッカーボタン)

CAMERA_ACTION_DETAILED_PICTURE_BUTTON --> |カメラで撮影する|CAMERA_DETAILED_PICTURE_PICK1(https://line.me/R/nv/camera/)
CAMERA_ACTION_DETAILED_PICTURE_BUTTON --> |カメラロールから選択|CAMERA_DETAILED_PICTURE_PICK2(https://line.me/R/nv/cameraRoll/single)
CAMERA_ACTION_DETAILED_PICTURE_BUTTON --> |スキップする|REPORT_RESUME_CONFIRM{報告情報助かり確認}

CAMERA_DETAILED_PICTURE_PICK1 --> CAMERA_DETAILED_PICTURE_CONFIRM(カメラ詳しく写真確認)
CAMERA_DETAILED_PICTURE_PICK2 --> CAMERA_DETAILED_PICTURE_CONFIRM(カメラ詳しく写真確認)



CAMERA_DETAILED_PICTURE_CONFIRM --> |はい|REPORT_RESUME_CONFIRM{報告情報助かり確認}
CAMERA_DETAILED_PICTURE_CONFIRM --> |いいえ|CAMERA_ACTION_DETAILED_PICTURE_BUTTON(カメラアクション詳しく写真ボタン)

REPORT_RESUME_CONFIRM --> |送る|END_REPORT_MODE_COMPOSITE_MESSAGE(損傷報告の複合メッセージ)
END_REPORT_MODE_COMPOSITE_MESSAGE　--> MAIL_SENT_STAMP(メール送ったスタンプ)
MAIL_SENT_STAMP --> MAIL_SENT_THANKS[[メール送った感謝]]

REPORT_RESUME_CONFIRM --> |やめる|STOP([やめる])


STATUS_USER_COMMENT_FREEFORM_INPUT --> STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)




CATEGORY_DETAILS_PARK_CAROUSEL --> |遊具|CAMERA_ACTION_BUTTON_PARK(カメラアクションボタン)
CATEGORY_DETAILS_PARK_CAROUSEL --> |照明灯|CAMERA_ACTION_BUTTON_PARK(カメラアクションボタン)
CATEGORY_DETAILS_PARK_CAROUSEL --> |"ベンチなど 休憩施設"|CAMERA_ACTION_BUTTON_PARK(カメラアクションボタン)
CATEGORY_DETAILS_PARK_CAROUSEL --> |"水回り（水道，トイレなど）"|CAMERA_ACTION_BUTTON_PARK(カメラアクションボタン)
CATEGORY_DETAILS_PARK_CAROUSEL --> |樹木|CAMERA_ACTION_BUTTON_PARK(カメラアクションボタン)
CATEGORY_DETAILS_PARK_CAROUSEL --> |その他|CAMERA_ACTION_BUTTON_PARK(カメラアクションボタン)


CAMERA_ACTION_BUTTON_PARK --> |カメラで撮影する|CAMERA_ACTION_BUTTON_PARK1(https://line.me/R/nv/camera/)
CAMERA_ACTION_BUTTON_PARK --> |カメラロールから選択|CAMERA_ACTION_BUTTON_PARK2(https://line.me/R/nv/cameraRoll/single)

CAMERA_ACTION_BUTTON_PARK1 --> CAMERA_PICTURE_CONFIRM_PARK(カメラ写真確認)
CAMERA_ACTION_BUTTON_PARK2 --> CAMERA_PICTURE_CONFIRM_PARK(カメラ写真確認)


CAMERA_PICTURE_CONFIRM_PARK --> |はい:遊具|STATUS_USER_COMMENT_PARK_PLAYGROUND_BUTTON(ユーザ状態遊具コメントボタン)
CAMERA_PICTURE_CONFIRM_PARK --> |はい:照明灯|STATUS_USER_COMMENT_PARK_LIGHTING_BUTTON(ユーザ状態照明灯コメントボタン)
CAMERA_PICTURE_CONFIRM_PARK --> |"はい:ベンチなど 休憩施設"|STATUS_USER_COMMENT_PARK_BENCH_BUTTON(ユーザ状態ベンチコメントボタン)
CAMERA_PICTURE_CONFIRM_PARK --> |"はい:水回り（水道，トイレなど）"|STATUS_USER_COMMENT_PARK_WATER_BUTTON(ユーザ状態水回りコメントボタン)
CAMERA_PICTURE_CONFIRM_PARK --> |はい:樹木|STATUS_USER_COMMENT_PARK_TREE_BUTTON(ユーザ状態樹木コメントボタン)
CAMERA_PICTURE_CONFIRM_PARK --> |はい:その他|STATUS_USER_COMMENT_PARK_OTHER_BUTTON(ユーザ状態その他コメントボタン)
CAMERA_PICTURE_CONFIRM_PARK --> |いいえ|CAMERA_ACTION_BUTTON_PARK(カメラアクションボタン)

STATUS_USER_COMMENT_PARK_PLAYGROUND_BUTTON --> |破損|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_PLAYGROUND_BUTTON --> |その他 自由記入|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)

STATUS_USER_COMMENT_PARK_LIGHTING_BUTTON --> |不点灯|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_LIGHTING_BUTTON --> |破損|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_LIGHTING_BUTTON --> |その他 自由記入|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)

STATUS_USER_COMMENT_PARK_BENCH_BUTTON --> |破損|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_BENCH_BUTTON --> |その他 自由記入|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)

STATUS_USER_COMMENT_PARK_WATER_BUTTON --> |水漏れ|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_WATER_BUTTON --> |水が出ない.流れない|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_WATER_BUTTON --> |破損|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_WATER_BUTTON --> |その他 自由記入|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)

STATUS_USER_COMMENT_PARK_TREE_BUTTON --> |その他 枝折れ|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_TREE_BUTTON --> |倒木|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_TREE_BUTTON --> |害虫発生|STATUS_USER_COMMENT_CONFIRM(ユーザ状態コメント確認)
STATUS_USER_COMMENT_PARK_TREE_BUTTON --> |その他 自由記入|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)


STATUS_USER_COMMENT_PARK_OTHER_BUTTON --> |"その他 自由記入"|STATUS_USER_COMMENT_FREEFORM_INPUT(ユーザ状態自由コメント案内テキスト)

click REPORT_MODE_BUTTON mermaidClick
click DISABLED_DAMAGE_REPORT_MODE mermaidClick
click CATEGORY_PHONE_BUTTON mermaidClick
click CATEGORY_NORMAL_BUTTON mermaidClick
click CATEGORY_PHONE_RIVER_TEXT mermaidClick
click CATEGORY_PHONE_PARK_TEXT mermaidClick
click CATEGORY_DETAILS_PARK_CAROUSEL mermaidClick
click CAMERA_ACTION_BUTTON mermaidClick
click CAMERA_PICTURE_CONFIRM mermaidClick
click STATUS_USER_COMMENT_RIVER_BUTTON mermaidClick
click STATUS_USER_COMMENT_PARK_PLAYGROUND_BUTTON mermaidClick
click STATUS_USER_COMMENT_PARK_LIGHTING_BUTTON mermaidClick
click STATUS_USER_COMMENT_PARK_BENCH_BUTTON mermaidClick
click STATUS_USER_COMMENT_PARK_WATER_BUTTON mermaidClick
click STATUS_USER_COMMENT_PARK_TREE_BUTTON mermaidClick
click STATUS_USER_COMMENT_CONFIRM mermaidClick
click STATUS_USER_COMMENT_FREEFORM_INPUT mermaidClick
click LOCATION_PICKER_BUTTON mermaidClick
click LOCATION_CONFIRM mermaidClick
click CAMERA_ACTION_DETAILED_PICTURE_BUTTON mermaidClick
click CAMERA_DETAILED_PICTURE_CONFIRM mermaidClick
click REPORT_RESUME_CONFIRM mermaidClick
click END_REPORT_MODE_COMPOSITE_MESSAGE mermaidClick
click CAMERA_PICTURE_CONFIRM_PARK mermaidClick

style richmenu fill:#00FFFF,stroke:#333,stroke-width:4px
style DISABLED_DAMAGE_REPORT_MODE fill:#f9f,stroke:#333,stroke-width:4px
style CATEGORY_PHONE_RIVER_TEXT fill:#f9f,stroke:#333,stroke-width:4px
style CATEGORY_PHONE_PARK_TEXT fill:#f9f,stroke:#333,stroke-width:4px
style CAMERA_ACTION_BUTTON fill:#DAF7A6,stroke:#333,stroke-width:4px
style CAMERA_ACTION_BUTTON_PARK fill:#DAF7A6,stroke:#333,stroke-width:4px
style CAMERA_PICTURE_CONFIRM fill:#FFC300,stroke:#333,stroke-width:4px
style CAMERA_PICTURE_CONFIRM_PARK fill:#FFC300,stroke:#333,stroke-width:4px
style STATUS_USER_COMMENT_CONFIRM fill:#FFC300,stroke:#333,stroke-width:4px
style LOCATION_PICKER_BUTTON fill:#DAF7A6,stroke:#333,stroke-width:4px
style STATUS_USER_COMMENT_FREEFORM_INPUT fill:#DAF7A6,stroke:#333,stroke-width:4px
style LOCATION_CONFIRM fill:#FFC300,stroke:#333,stroke-width:4px
style CAMERA_ACTION_DETAILED_PICTURE_BUTTON fill:#DAF7A6,stroke:#333,stroke-width:4px
style CAMERA_DETAILED_PICTURE_CONFIRM fill:#FFC300,stroke:#333,stroke-width:4px
style REPORT_RESUME_CONFIRM fill:#FFC300,stroke:#333,stroke-width:4px
style STOP fill:#f9f,stroke:#333,stroke-width:4px
style MAIL_SENT_THANKS fill:#f9f,stroke:#333,stroke-width:4px

linkStyle default interpolate basis color: #008000
`;

export const RICH_MENU_WIDTH = 2500;
export const RICH_MENU_HEIGHT_LARGE = 1686;
export const RICH_MENU_HEIGHT_SHORT = 843;