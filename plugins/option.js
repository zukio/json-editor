// ============================================
// option.js
// --------------------------------------------
// ウィンドウの設定
const userConfig = {
  windowConfig: {
    fullscreen: false,
    width: 800,
    height: 600,
    x: 0, // 画面の左端
    y: 0, // 画面の上端
    webPreferences: {
      devTools: true,
    },
    titleBarStyle: "visible", //"hidden",
    alwaysOnTop: true, // 最前面に表示
    frame: true,
  },
  ignoreMouseEvents: false,
};
