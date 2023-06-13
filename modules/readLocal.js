const fs = require("fs");
const path = require("path");

/// JSONファイルを読み込む
/// @param filePath:string // 書き込むファイルのパス。絶対パスか、実行中のスクリプトからの相対パス
function readJsonFile(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);

  // ファイルが存在するかチェック
  if (fs.existsSync(filePath)) {
    // ファイルが存在する場合、設定を読み込む
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    try {
      const data = JSON.parse(fileContent);
      //console.log(data);
      return data;
    } catch (err) {
      console.log("Error parsing JSON string:", err);
      return null;
    }
  }
  return null;
}

/// JSONファイルを保存
/// @param filePath:string // 書き込むファイルのパス。絶対パスか、実行中のスクリプトからの相対パス
/// @param data:object // JSON形式の文字列に変換するためのJavaScriptオブジェクト
function saveJsonFile(filePath, data) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
  try {
    const jsonString = JSON.stringify(data, null, 2); // Convert the JavaScript object to a JSON string
    fs.writeFileSync(absolutePath, jsonString, "utf-8");
    console.log(`Successfully wrote to ${filePath}`);
  } catch (err) {
    console.log("Error writing to JSON file:", err);
  }
}

module.exports = {
  readJsonFile: readJsonFile,
  saveJsonFile: saveJsonFile,
};
