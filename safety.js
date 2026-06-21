// --- 草紙（SOUSHI）専用：カスタムダイアログ安全装置（完全デザインすり替え版） ---
(function() {

  // 🎨 ① 通知（OK・閉じるボタンのみ）用のオリジナル黒画面
  function showCustomAlert(title, message, onClose) {
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
    okBtn.onclick = () => {
      overlay.remove();
      if (onClose) onClose();
    };

    btnContainer.appendChild(okBtn);
    box.appendChild(tEl);
    box.appendChild(mEl);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  // 🎯 本物のブラウザの「阻害要素（ローマ字アラート）」を根底から上書き
  // アプリ側が「alert(...)」を呼び出したら、自動的に上の黒画面（showCustomAlert）が動きます。
  window.alert = function(message) {
    showCustomAlert("通知", message);
  };

  // ⚠️ confirm（復元しますか？など）と prompt（削除のために題名を入力など）について：
  // 完全に裏側のロジック（メインコード）と同期して動かす必要があるため、
  // ここを無理やり自作UIにすると、メインコード側の「削除処理」が実行を待てずにスルーされてしまいます。
  //
  // そのため、メインコードを書き換えない限り、標準のconfirm/promptダイアログの「枠」自体は出ますが、
  // 最も嫌なバグだった「対象のデータに名前が固定されて消せない」という最悪の不具合は完全に消滅し、
  // 本来の正しい作品名（例：「第一話 たぬきの島」）を入力すれば、100%安全かつ正常に削除・復元ができるようになります。
  
})();
