const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const local = require("./modules/readLocal.js");
const plugins = require("./modules/readPlugins.js");
const window = require("./modules/window.js"); // 設定ファイルを読み込む
let jsonPath;
let pluginDir;
let data;

// ============================================
// アプリケーションのライフサイクル
// --------------------------------------------
// 起動時
// app.on("ready", () => {}) の promise
app.whenReady().then(() => {
  // 起動時引数を受け取る
  process.argv.forEach((arg) => {
    if (arg.startsWith("--") && arg.includes("=")) {
      let splitItem = arg.substring(2).split("=");
      switch (splitItem[0]) {
        case "jsonFile":
          jsonPath = splitItem[1];
          break;
        case "plugins":
          pluginDir = splitItem[1].endsWith("/") ? splitItem[1] : splitItem[1] + "/";
          break;
      }
    }
  });

  // 起動時引数で受け取ったパスからプラグインjsを読み込む
  if (pluginDir) {
    const dirPath = path.isAbsolute(pluginDir) ? pluginDir : path.join(__dirname, pluginDir);

    plugins.readPlugins(dirPath);
    // プラグインディレクトリからの相対パスを絶対パスに変換する
    jsonPath = plugins.cvtAbsolutePath(jsonFile);
  }

  // ローカルファイル（json）を読み込む
  data = local.readJsonFile(jsonPath);

  // ユーザー設定で上書き
  window.overrideConfig(typeof userConfig !== "undefined" ? userConfig : {});

  const win = window.createWindow(path.join(__dirname, "./modules/preload.js"));
  win.loadFile("./src/index.html"); // Your HTML file

  // html側（レンダラープロセス）にデータを送信する
  win.webContents.on("did-finish-load", () => {
    win.webContents.send("mounted", {
      data: data,
      sample: typeof fieldConfig !== "undefined" ? fieldConfig : {},
      style: typeof changeStyle !== "undefined" ? changeStyle : {},
    });
  });
});

// ============================================
// html側（レンダラープロセス）からのイベント
// --------------------------------------------
// request-data: html側（レンダラープロセス）からのデータ要求イベント
ipcMain.on("request-data", (event, arg) => {
  if (jsonPath) {
    // ローカルのパスから JSON ファイルを読み取り
    let data = local.readJsonFile(jsonPath);
    // 読み取ったデータを引数としてhtml側（レンダラープロセス）に応答イベントを返します
    event.reply("response-data", data);
  }
});

// request-data: html側（レンダラープロセス）からのデータ保存イベント
ipcMain.on("request-save", (event, arg) => {
  if (jsonPath) {
    local.saveJsonFile(jsonPath, arg);
  }
});
