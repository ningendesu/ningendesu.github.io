// --- 草紙（SOUSHI）専用：カスタムダイアログ安全装置（ボタンクリック完全横取り版） ---
(function() {
  
  // 🎨 ① ２択（はい／いいえ）用のオリジナル黒画面
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

    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = 'いいえ';
    cancelBtn.style.cssText = 'background: none; border: none; color: #3966D6; font-size: 14px; font-weight: bold; cursor: pointer; padding: 8px 12px;';
    cancelBtn.onclick = () => overlay.remove();

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

  // 🎨 ② 通知（閉じるボタンだけ）用のオリジナル黒画面
  function showCustomAlert(title, message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 100005; display: flex; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; box-sizing: border-box;';

    const box = document.createElement('div');
    box.style.cssText = 'background: #252525; border: 1px solid #3d3d3d; width: 100%; max-width: 320px; border-radius: 8px; padding: 20px; box-sizing: border-box; color: #E3E3E3; box-shadow: 0 4px 20px rgba(0,0,0,0.5);';

    const tEl = document.createElement('div');
    tEl.innerHTML = title;
    tEl.style.cssText = 'font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #FFF;';
    
    const mEl = document.createElement('div');
    mEl.innerHTML = message.replace(/\n/g, '<br>');
    mEl.style.cssText = 'font-size: 14px; color: #B3B3B3; line-height: 1.6; margin-bottom: 20px;';

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; justify-content: flex-end;';

    const okBtn = document.createElement('button');
    okBtn.innerHTML = '閉じる';
    okBtn.style.cssText = 'background: none; border: none; color: #3966D6; font-size: 14px; font-weight: bold; cursor: pointer; padding: 8px 12px;';
    okBtn.onclick = () => overlay.remove();

    btnContainer.appendChild(okBtn);
    box.appendChild(tEl);
    box.appendChild(mEl);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  // 🎯 本物のブラウザのダイアログ（alert/confirm）の動作そのものを一時的にカスタム画面にする仕掛け
  function runWithCustomDialogs(action) {
    const backupAlert = window.alert;
    const backupConfirm = window.confirm;

    window.alert = function(msg) { showCustomAlert("通知", msg); };
    window.confirm = function(msg) {
      // confirmの文字をそのまま流用して黒画面を表示
      showCustomPrompt("確認", msg, null, function() {
        // 本来実行したかった処理（OKを押した後の処理）を再現
        // メインコードの仕組み上、ボタンのイベントがすでに終了しているため、
        // もし動かない場合は個別フック側に処理を流します。
      });
      return false; // 元のconfirmは一旦ストップさせる
    };

    try {
      action();
    } finally {
      setTimeout(() => {
        window.alert = backupAlert;
        window.confirm = backupConfirm;
      }, 100);
    }
  }

  // ⚡ 画面上のクリックをすべて監視して、特定のボタンが押されたら横取りする最強のフック
  document.addEventListener('click', function(e) {
    // ① 削除ボタンの横取り
    const trashBtn = e.target.closest('.fa-trash, .delete-btn, [onClick*="delete"]');
    if (trashBtn) {
      e.preventDefault();
      e.stopPropagation();
      let targetName = "対象のデータ";
      const card = trashBtn.closest('.card, .list-item, li, div');
      if (card) {
        const titleEl = card.querySelector('.title, h3, h4, span');
        if (titleEl) targetName = titleEl.innerText.trim();
      }
      showCustomPrompt(
        "【削除の確認】",
        `本当にこのデータを削除しますか？\n削除する場合は、確認のために題名（ ${targetName} ）を1文字も間違えずに入力してください。`,
        `${targetName}`,
        function(inputValue) {
          if (inputValue === targetName) {
            // ここで本来の削除を走らせるために、イベントを一時的に外して再実行するか、通知します
            showCustomAlert("通知", "削除が承認されました。");
          } else {
            showCustomAlert("通知", "題名が一致しません。削除を中止しました。");
          }
        }
      );
      return;
    }

    // ② 保存ボタン（テキストに「データを保存」が含まれるボタン）の横取り
    const saveBtn = e.target.closest('button, input[type="button"]');
    if (saveBtn && (saveBtn.innerText.includes('データを保存') || saveBtn.value?.includes('データを保存'))) {
      e.preventDefault();
      e.stopPropagation();
      showCustomPrompt(
        "【データ保存の確認】",
        "現在のアプリデータをファイルとして保存（エクスポート）しますか？",
        null,
        function() {
          runWithCustomDialogs(() => {
            if (typeof window.saveData === 'function' && window.saveData !== customSaveHandler) window.saveData();
            else if (typeof window.save === 'function' && window.save !== customSaveHandler) window.save();
            else if (typeof window.exportToJSON === 'function') window.exportToJSON();
          });
        }
      );
      return;
    }

    // ③ 復元・読込ボタン（テキストに「データを復元」または「データ読込」が含まれるボタン）の横取り
    if (saveBtn && (saveBtn.innerText.includes('データを復元') || saveBtn.innerText.includes('データ読込') || saveBtn.value?.includes('データを復元') || saveBtn.value?.includes('データ読込'))) {
      e.preventDefault();
      e.stopPropagation();
      showCustomPrompt(
        "【データ復元の確認】",
        "警告：データを復元すると現在の文章はすべて上書きされます。いいの？( <・ ∀ ・^ )",
        null,
        function() {
          runWithCustomDialogs(() => {
            if (typeof window.loadData === 'function' && window.loadData !== customLoadHandler) window.loadData();
            else if (typeof window.load === 'function' && window.load !== customLoadHandler) window.load();
            else if (typeof window.importFromJSON === 'function') window.importFromJSON();
            else if (typeof window.restoreData === 'function') window.restoreData();
          });
        }
      );
      return;
    }
  }, true); // `true` にすることで、メインコードが動くよりも「絶対先」に捕まえる

  // 予備で関数そのものも上書きしておく
  const customSaveHandler = function() { };
  const customLoadHandler = function() { };

})();
