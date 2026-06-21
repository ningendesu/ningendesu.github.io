// --- 草紙（SOUSHI）専用：カスタムダイアログ安全装置（はい/いいえ版） ---
(function() {
  
  // 🎨 完全にオリジナルのダークモード確認画面を作成する関数
  function showCustomPrompt(title, message, placeholder, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 100000; display: flex; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; box-sizing: border-box;';

    const box = document.createElement('div');
    box.style.cssText = 'background: #252525; border: 1px solid #3d3d3d; width: 100%; max-width: 340px; border-radius: 8px; padding: 20px; box-sizing: border-box; color: #E3E3E3; box-shadow: 0 4px 20px rgba(0,0,0,0.5);';

    const tEl = document.createElement('div');
    tEl.innerHTML = title;
    tEl.style.cssText = 'font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #FFF;';
    
    const mEl = document.createElement('div');
    mEl.innerHTML = message.replace(/\n/g, '<br>');
    mEl.style.cssText = 'font-size: 14px; color: #B3B3B3; line-height: 1.5; margin-bottom: 16px;';

    box.appendChild(tEl);
    box.appendChild(mEl);

    let inputEl = null;
    if (placeholder !== null) {
      inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.placeholder = placeholder;
      inputEl.style.cssText = 'width: 100%; background: #111; border: 1px solid #444; border-radius: 4px; color: #fff; padding: 8px 10px; font-size: 14px; box-sizing: border-box; margin-bottom: 20px; outline: none;';
      box.appendChild(inputEl);
    }

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 12px;';

    // 🎯 キャンセルボタンを「いいえ」に変更
    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = 'いいえ';
    cancelBtn.style.cssText = 'background: none; border: none; color: #3966D6; font-size: 14px; font-weight: bold; cursor: pointer; padding: 8px 12px;';
    cancelBtn.onclick = () => overlay.remove();

    // 🎯 OKボタンを「はい」に変更
    const okBtn = document.createElement('button');
    okBtn.innerHTML = 'はい';
    okBtn.style.cssText = 'background: none; border: none; color: #3966D6; font-size: 14px; font-weight: bold; cursor: pointer; padding: 8px 12px;';
    okBtn.onclick = () => {
      const val = inputEl ? inputEl.value : true;
      overlay.remove();
      onConfirm(val);
    };

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(okBtn);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    if (inputEl) inputEl.focus();
  }

  // 1. 各種削除ボタンの横取り
  document.addEventListener('click', function(e) {
    const trashBtn = e.target.closest('.fa-trash, .delete-btn, [onClick*="delete"]');
    if (!trashBtn) return;

    e.preventDefault();
    e.stopPropagation();

    let title = "削除の確認";
    let targetName = "対象のデータ";

    const card = trashBtn.closest('.card, .list-item, li, div');
    if (card) {
      const titleEl = card.querySelector('.title, h3, h4, span');
      if (titleEl) targetName = titleEl.innerText.trim();
    }

    showCustomPrompt(
      `【${title}】`,
      `本当にこのデータを削除しますか？\n削除する場合は、確認のために題名（ ${targetName} ）を1文字も間違えずに入力してください。`,
      `${targetName}`,
      function(inputValue) {
        if (inputValue === targetName) {
          alert("削除が承認されました。");
        } else {
          alert("題名が一致しません。削除を中止しました。");
        }
      }
    );
  }, true);

// 2. 「データ保存」ボタンの完全な乗っ取り
  // アプリ側が使っている可能性のある関数名（saveData または save）を退避して上書き
  const originalSave = window.saveData || window.save;
  const customSaveHandler = function() {
    showCustomPrompt(
      "【データ保存の確認】",
      "現在のアプリデータをファイルとして保存（エクスポート）しますか？",
      null,
      function() {
        if (typeof originalSave === 'function') originalSave();
        else if (typeof window.exportToJSON === 'function') window.exportToJSON(); // 予備の保存関数
      }
    );
  };
  // 両方の可能性に対応して上書き
  window.saveData = customSaveHandler;
  window.save = customSaveHandler;
  window.saveDataCustom = customSaveHandler;

  // 3. 「データ読込」ボタンの完全な乗っ取り
  const originalLoad = window.loadData || window.load;
  const customLoadHandler = function() {
    showCustomPrompt(
      "【データ読込の確認】",
      "外部ファイルからデータを読み込みます。現在のデータが上書きされますが、本当によろしいですか？",
      null,
      function() {
        if (typeof originalLoad === 'function') originalLoad();
        else if (typeof window.importFromJSON === 'function') window.importFromJSON(); // 予備の読込関数
      }
    );
  };
  window.loadData = customLoadHandler;
  window.load = customLoadHandler;
  window.loadDataCustom = customLoadHandler;

})();
