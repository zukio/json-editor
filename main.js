const { app, ipcMain } = require("electron");
const { dialog } = require("electron");
const path = require("path");
const local = require("./modules/readLocal.js");
const plugins = require("./modules/readPlugins.js");
const window = require("./modules/window.js"); // 設定ファイルを読み込む
let jsonPath;
let pluginDir;
let data;
let mainWindow;

// このElectron アプリのシングルインスタンスロックを要求
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // もし他のインスタンスが既に実行中なら、このインスタンスを終了
  app.quit();
} else {
  // ============================================
  // 二つ目のインスタンスが起動しようとした時の処理
  // --------------------------------------------
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      // 既に開いているウィンドウをフォーカスする
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      // 既存のウィンドウがない（閉じられている）場合
      // createWindow();
      app.quit();
    }
  });

  // ============================================
  // アプリケーションのライフサイクル
  // --------------------------------------------
  // 起動時
  // app.on("ready", () => {}) の promise
  app.whenReady().then(() => {
    try {
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
        if (typeof jsonFile !== "undefined") jsonPath = plugins.cvtAbsolutePath(jsonFile);
      }

      // ローカルファイル（json）を読み込む
      data = local.readJsonFile(jsonPath);
      if (!data) {
        throw new Error("Failed to read file");
      }

      // ユーザー設定で上書き
      window.overrideConfig(typeof userConfig !== "undefined" ? userConfig : {});

      mainWindow = window.createWindow(path.join(__dirname, "./modules/preload.js"));
      mainWindow.loadFile("./src/index.html"); // Your HTML file

      // html側（レンダラープロセス）にデータを送信する
      mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("mounted", {
          data: data,
          sample: typeof fieldConfig !== "undefined" ? fieldConfig : {},
          style: typeof changeStyle !== "undefined" ? changeStyle : {},
        });
      });
    } catch (error) {
      console.error("Startup Error:", error);

      // Notify the user
      dialog.showErrorBox(
        "Startup Error",
        "An error occurred during application startup. Please check the configuration and try again."
      );

      // Graceful shutdown
      app.quit();
    }
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
      try {
        const result = local.saveJsonFile(jsonPath, arg);
        if (!result) {
          throw new Error("Failed to save file");
        }
        dialog
          .showMessageBox({
            title: "Save File",
            message: "Save File Success!",
            detail: "Save File Success!",
            type: "info",
            buttons: ["OK"],
          })
          .then((response) => {
            if (response.response === 0) {
              app.quit();
            }
          });
      } catch (err) {
        dialog.showErrorBox(
          "File Error",
          "An error occurred during write json File. Please check the configuration and try again."
        );
        app.quit();
      }
    }
  });
}
