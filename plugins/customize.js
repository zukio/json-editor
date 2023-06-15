// ============================================
// JSONファイル
// --------------------------------------------
const jsonFile = "../misc/test.json";
// ============================================
// カスタマイズパート
// --------------------------------------------
// 💬カスタマイズ方法がわからない場合は空 {} にしてください
// [プロパティ名]:{ initial:デフォルト値, selection:選択肢(略可), required:必須(略可) }
const fieldConfig = {
  "Int": {
    initial: -1, // デフォルト値(略可: 初期値="")
    label: "番号", // ラベル(略可: 初期値=key)
    required: true, // 必須かどうか(略可: 初期値=true)
  },
  "Float": {
    initial: "0.0", // floatの場合0.0を指定すると0になるので文字列で指定
    label: "小数",
    map: { min: 0, max: 1 }, // 数値の範囲(略可: 初期値=undefined)
  },
  "String": {
    initial: "",
    label: "テキスト",
    pattern: "https?://.+", // 正規表現(略可: 初期値=undefined)
    map: { min: 6, max: 10 }, // 文字数の範囲(略可: 初期値=undefined)
  },
  "Boolean": {
    initial: true,
    label: "二択",
  },
  "Selectbox": {
    initial: "None",
    label: "選択肢",
    selection: ["None", "select01", "select02", "select03"], // 選択肢(略可: 初期値=undefined)
  },
  "Object": {
    initial: {
      "Name": "",
      "Pass": "",
    },
    label: "入れ子",
  },
};

// 値が変更された時の表示オプション
// 条件が一致した場合、指定した項目を表示/非表示に切り替える例
const changeStyle = {
  "Boolean": {
    if: true,
    condition: "!=",
    targets: ["Object"],
    toggleclass: ["d-none"],
  },
};
