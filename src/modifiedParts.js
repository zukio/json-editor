// --------------------------------------------
// プラグインによって改造可能な部分

function translateWithSample(id, key, value = null) {
  // key だけ渡された（value がない）場合は key を翻訳したラベルを返す
  const needLabel = (value ?? null) == null;
  // fieldConfig と key が一致するものがあるか
  const role = fieldConfig[key];
  // ラベル
  if (needLabel) {
    if (role) return role["label"];
    return key;
  }
  // value がある場合は HTML要素（input）を返す
  if (!role) return createInput(id, value);

  if (Object.hasOwnProperty.call(role, "selection")) {
    // 選択肢がある場合はドロップダウンリストを作成
    return createDoropdown(id, value, role.selection);
  }

  switch (typeof value) {
    case "boolean":
      return createRadio(id, value);
    case "number":
      return createNumberInput(id, value, role);
    case "string":
      // 数値に変換可能なら数値入力
      if (isNumber(role["initial"])) {
        return createNumberInput(id, value, role);
      }
      return createTextInput(id, value, role);
    case "object":
    default:
      return createInput(id, value);
  }
}

// 値が変更されたら
function onChangeValue(i, key, value) {
  if (defineSample != null) {
    const defineChangeStyle =
      typeof changeStyle !== "undefined" && changeStyle !== null && Object.keys(changeStyle).length > 0;
    if (defineChangeStyle) {
      // changeStyleオブジェクトをイテレートする
      for (let combo in changeStyle) {
        //if (!changeStyle.hasOwnProperty(key)) continue;
        if (combo !== key) continue;

        const rule = changeStyle[key];

        rule.targets.forEach((target) => {
          // keyに対応するHTML要素を取得
          const inputElement = document.getElementById(`${target}-${i}`);
          const inputElementValue = document.getElementById(`${target}-${i}-value`);
          // 条件が一致した場合、指定した項目を表示/非表示に切り替える
          const bool = rule.condition === "==" ? value === rule.if : value !== rule.if;
          if (bool) {
            inputElement.classList.add(rule.toggleclass);
            inputElementValue.classList.add(rule.toggleclass);
          } else {
            inputElement.classList.remove(rule.toggleclass);
            inputElementValue.classList.remove(rule.toggleclass);
          }
        });
      }
    }
  }
}
