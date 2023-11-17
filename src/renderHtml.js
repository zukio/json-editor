// Json keyをlabelに、valueをinputに置き換える
function translate(id, key, value = null) {
  // fieldConfig が宣言されていれば
  if (defineSample && typeof translateWithSample === "function") {
    // fieldConfig に倣って翻訳
    return translateWithSample(id, key, value);
  } else {
    // key だけ渡された（value がない）場合は key を翻訳したラベルを返す
    const needLabel = (value ?? null) == null;
    if (needLabel) return key;
    // value がある場合は 入力フォームを返す
    return createInput(id, value);
  }
}

// --------------------------------------------
// Json(Array) をHTML(dl)で表示する
function setElem(coverage, from = 0) {
  // 非同期の処理のため、forEachの代わりにfor...ofループを使用
  for (let i = 0; i < coverage.length; i++) {
    const index = i + from;
    const object = coverage[i];

    // 区切り線
    const parent_dt = document.createElement("dt");
    parent_dt.className = "border-top pt-1 float-start";
    parent_dt.innerHTML = `<span id="del-${index}" class="del material-symbols-outlined">delete</span>`;
    parent.appendChild(parent_dt);
    // Unit
    const parent_dd = document.createElement("dd");
    parent_dd.className = "border-top p-1 m-0";

    const form = document.createElement("form");
    form.name = `form-${index}`;
    form.className = "needs-validation";

    // ネストされたJSONオブジェクトを処理
    form.appendChild(createHtmlFromNestedObject(object, index));

    parent_dd.appendChild(form);
    parent.appendChild(parent_dd);
  }
  return parent;
}

// ネストされたJSONオブジェクトを処理
function createHtmlFromNestedObject(object, index, path = []) {
  const dl = document.createElement("dl");
  dl.className = "row m-0 p-0";

  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      // 生成されるHTML要素のidは parentKey-nestedKey-indexになります
      const newPath = [...path, key];
      const pathString = newPath.join("-");
      const parentKey = path.length ? path[0] : key;
      // 見出し
      const dt = document.createElement("dt");
      dt.id = `${pathString}-${index}`;

      // 配列のIndex（数字のみ）を見出しから除外
      if (parseInt(key).toString().length != key.length) {
        dt.style = "border-top: 1px solid #fff;";
        dt.textContent = translate(dt.id, key) ?? key; // 翻訳
        dt.className = "col-3 pt-1 bg-light";
      } else {
        dt.className = "d-none";
      }
      dl.appendChild(dt);
      // 内容
      const dd = document.createElement("dd");
      dd.id = `${pathString}-${index}-value`;
      // 配列のIndex（数字のみ）を見出しから除外
      if (parseInt(key).toString().length != key.length) {
        dd.className = "col-9 pt-1";
      } else {
        dd.className = "col-12 pt-1";
      }

      // // ネストされたJSONオブジェクト
      if (typeof object[key] === "object") {
        // 再帰的に処理
        dd.appendChild(createHtmlFromNestedObject(object[key], index, newPath));
      } else {
        const element = translate(dt.id, parentKey, object[key]); // 翻訳
        // HTML要素を返す
        if (element.outerHTML) {
          dd.innerHTML = element.outerHTML;
        } else {
          const textNode = document.createTextNode(element);
          dd.appendChild(textNode);
        }
      }
      dl.appendChild(dd);
    }
  }
  return dl;
}
// --------------------------------------------
// Helper

// 値の型が Number である場合に true を返します。
function isNumber(input) {
  // 1. Number() 関数は、オブジェクト引数を数値に変換します。
  // 2. isNaN() は、値が NaN「数値ではない」かどうかを判断します。
  return input !== "" && !isNaN(Number(input));
}

// 数値が float であるかどうかを判断するための関数
function isFloat(n) {
  // 1. Number(n) === n は、引数が数値型であるかどうかを確認するために使用されます。
  // 2. n % 1 !== 0 は、数値が整数かどうかを確認するために使用されます。
  return Number(n) === n && n % 1 !== 0;
}

function getType(input) {
  if (typeof input !== "string" && typeof input !== "number") return typeof input;
  if (typeof input == "string" && !isNumber(input)) return "string";

  // Number型である場合
  if (typeof input === "number") {
    return isFloat(input) ? "float" : "int";
  }
  // String型であるが、内容が数値である場合
  const numberString = input.toString();
  return numberString.includes(".") ? "float" : "int";
}

// --------------------------------------------
// Json(Value) をHTML(Form)に変換
function createInput(id, value) {
  const input = document.createElement("input");
  input.setAttribute("name", id);
  return input;
}

function createTextInput(id, value, role) {
  const inputText = createInput(id, value);
  inputText.setAttribute("value", value);
  inputText.setAttribute("type", "text");
  inputText.className = "w-100";
  if (role["pattern"]) inputText.setAttribute("pattern", role["pattern"]);
  const length = role["map"];
  if (length) {
    if (length.min) inputText.setAttribute("minlength", length.min);
    if (length.max) inputText.setAttribute("maxlength", length.max);
  }
  return inputText;
}

function createNumberInput(id, value, role) {
  const inputNumber = createInput(id, value);
  inputNumber.setAttribute("type", "number");
  inputNumber.className = "d-inline";

  // 入れ子の場合は、子の値を参照する
  let initial = role["initial"];
  if (typeof initial === "object") {
    const splits = id.split("-");
    if (splits.length < 2) return null;
    initial = role["initial"][splits[splits.length - 2]];
  }
  initial = initial === 0 ? value : initial;
  const type = getType(initial);

  if (type !== "int" && type !== "float") {
    return createTextInput(id, value, role);
  }
  if (type == "float") {
    inputNumber.setAttribute("step", 0.01); // float
  } else {
    inputNumber.setAttribute("step", 1); // int
  }
  const map = role["map"];
  if (map) {
    if (map.min != undefined) inputNumber.setAttribute("min", map.min);
    if (map.max != undefined) inputNumber.setAttribute("max", map.max);
  }
  inputNumber.setAttribute("value", Number(value));
  return inputNumber;
}

function createCheck(id, value) {
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.setAttribute("name", id);
  if (value) input.setAttribute("checked", "checked");
  return input;
}

function createRadio(id, value) {
  const div = document.createElement("div");
  div.className = "btn-group";
  div.setAttribute("role", "group");
  div.setAttribute("aria-label", "Basic radio toggle button group");
  div.innerHTML = `
  <input type="radio" class="btn-check" name="${id}" id="${id}-on" autocomplete="off" value="${true}" ${
    value ? "checked" : ""
  }>
  <label class="btn btn-outline-primary" for="${id}-on">する</label>
  <input type="radio" class="btn-check" name="${id}" id="${id}-off" autocomplete="off" value="${false}" ${
    !value ? "checked" : ""
  }>
  <label class="btn btn-outline-primary" for="${id}-off">しない</label>`;
  return div;
}

function createDoropdown(id, value, array) {
  const select = document.createElement("select");
  select.setAttribute("name", id);
  select.innerHTML = `<option selected>Open this select menu</option>`;
  array.forEach((element) => {
    const option = document.createElement("option");
    option.setAttribute("value", element);
    option.textContent = element;
    if (element === value) option.setAttribute("selected", "selected");
    select.appendChild(option);
  });
  return select;
}
