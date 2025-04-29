// ============================================
// plugins/option.js
// --------------------------------------------
// JsonEditor の編集ウィンドウの設定
const userConfig = {
  windowConfig: {
    fullscreen: false,
    width: 800,
    height: 600,
    x: 0, // 画面の左端
    y: 0, // 画面の上端
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
    },
    minimizable: false,
    titleBarStyle: "visible",
    alwaysOnTop: true, // 最前面に表示
    frame: true,
    show: false,
  },
  ignoreMouseEvents: false,
};
