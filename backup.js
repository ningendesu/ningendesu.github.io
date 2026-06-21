// --- にゃたし草子専用 拡張スクリプト（バックアップ＆ナイトモード・カスタム黒ダイアログ完全内蔵版） ---
(function() {
  const STORAGE_KEY = 'soushi-app-state';
  const NIGHT_MODE_KEY = 'soushi-night-mode';

  // 🎨 ① 通知（閉じるボタンだけ）用のオリジナル黒画面
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

  // 🎨 ② ２択（はい／いいえ）用のオリジナル黒画面
  function showCustomPrompt(title, message, onConfirm) {
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
      overlay.remove();
      onConfirm();
    };

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(okBtn);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  // ナイトモード用の暗い色（スタイル）を定義
  const nightStyles = `
    body, .sa-root, .sa-frame { background: #1E1A15 !important; color: #E0D7CD !important; }
    .sa-header, .sa-nav { background: rgba(30,26,21,0.94) !important; border-color: #4A4035 !important; color: #E0D7CD !important; }
    .sa-stats, .sa-target-card, .sa-memo-card { background: #26211B !important; border-color: #4A4035 !important; color: #E0D7CD !important; }
    .sa-stats-title, .sa-sub-tabs, .sa-editor-footer { border-color: #4A4035 !important; color: #E0D7CD !important; }
    .sa-stats-col + .sa-stats-col { border-left-color: #4A4035 !important; }
    .sa-cover { background: repeating-linear-gradient(135deg, #2b251f 0 2px, #362e26 2px 4px) !important; box-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px #4a4035 inset !important; }
    .sa-cover-title { color: #E0D7CD !important; }
    .sa-title-input-full { border-color: #4A4035 !important; color: #E0D7CD !important; }
    .sa-title-input-full:focus { border-bottom-color: #B8923D !important; }
    .sa-target-input { background: #1E1A15 !important; border-color: #4A4035 !important; color: #E0D7CD !important; }
    .sa-progress-track { background: #4A4035 !important; }
    .sa-editor-area { color: #E0D7CD !important; }
    .sa-chapter-row { border-color: #3A3229 !important; }
    .sa-add-btn { border-color: #4A4035 !important; color: #A69988 !important; }
    .sa-nav-btn { color: #8A7E70 !important; }
    .sa-nav-btn.active { color: #B8923D !important; }
    .sa-stats-label, .sa-book-sub, .sa-chapter-count, .sa-memo-snippet, .sa-field-label, .sa-editor-footer span { color: #A69988 !important; }
    ::placeholder { color: #6A5F53 !important; }
  `;

  let styleEl = document.getElementById('sa-night-mode-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'sa-night-mode-styles';
    document.head.appendChild(styleEl);
  }

  function toggleNightMode() {
    const isNight = localStorage.getItem(NIGHT_MODE_KEY) === 'true';
    if (!isNight) {
      styleEl.innerHTML = nightStyles;
      localStorage.setItem(NIGHT_MODE_KEY, 'true');
    } else {
      styleEl.innerHTML = '';
      localStorage.setItem(NIGHT_MODE_KEY, 'false');
    }
    updateNightButtonText();
  }

  function updateNightButtonText() {
    const nightBtn = document.getElementById('sa-night-toggle-btn');
    if (!nightBtn) return;
    const isNight = localStorage.getItem(NIGHT_MODE_KEY) === 'true';
    nightBtn.innerHTML = isNight ? '(⁠ ⁠/⁠^⁠ω⁠^⁠)⁠/⁠♪⁠♪ナイトモード なしにして' : '(⁠｢⁠`⁠･⁠ω⁠･⁠)⁠｢ナイトモード 開始';
  }

  if (localStorage.getItem(NIGHT_MODE_KEY) === 'true') {
    styleEl.innerHTML = nightStyles;
  }

  function injectButtons() {
    const statsCard = document.querySelector('.sa-stats');
    if (!statsCard) return;

    let container = document.getElementById('sa-backup-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'sa-backup-container';
      container.style.cssText = 'margin-top: 18px; padding-top: 14px; border-top: 1px dashed #EDE3C9; display: flex; flex-direction: column; gap: 10px;';
      statsCard.appendChild(container);
    }

    if (!document.getElementById('sa-file-row')) {
      const fileRow = document.createElement('div');
      fileRow.id = 'sa-file-row';
      fileRow.style.cssText = 'display: flex; gap: 10px;';

      const exportBtn = document.createElement('button');
      exportBtn.className = 'sa-nav-btn';
      exportBtn.style.cssText = 'flex: 1; background: rgba(255,255,255,0.05); border: 1px solid currentColor; border-radius: 4px; padding: 8px 0; font-weight: normal; font-size: 11px; cursor: pointer;';
      exportBtn.innerHTML = '<⁠(⁠￣⁠︶⁠￣⁠)⁠> データを保存';
      exportBtn.onclick = exportData;

      const importBtn = document.createElement('button');
      importBtn.className = 'sa-nav-btn';
      importBtn.style.cssText = 'flex: 1; background: rgba(255,255,255,0.05); border: 1px solid currentColor; border-radius: 4px; padding: 8px 0; font-weight: normal; font-size: 11px; cursor: pointer;';
      importBtn.innerHTML = 'ฅ⁠^⁠•⁠ﻌ⁠•⁠^⁠ฅ データを復元';
      importBtn.onclick = importData;

      fileRow.appendChild(exportBtn);
      fileRow.appendChild(importBtn);
      container.appendChild(fileRow);
    }

    if (!document.getElementById('sa-night-toggle-btn')) {
      const nightBtn = document.createElement('button');
      nightBtn.id = 'sa-night-toggle-btn';
      nightBtn.className = 'sa-nav-btn';
      nightBtn.style.cssText = 'width: 100%; background: rgba(255,255,255,0.05); border: 1px solid currentColor; border-radius: 4px; padding: 8px 0; font-weight: normal; font-size: 11px; cursor: pointer;';
      nightBtn.onclick = toggleNightMode;
      container.appendChild(nightBtn);
      updateNightButtonText();
    }
    
    const isNight = localStorage.getItem(NIGHT_MODE_KEY) === 'true';
    container.style.borderTopColor = isNight ? '#4A4035' : '#EDE3C9';
  }

  // 🎯 修正ポイント：オリジナルの黒ダイアログに差し替え
  function exportData() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData || rawData === '{"books":[],"memos":[],"dailyLog":{}}') {
      showCustomAlert('通知', '保存する作品データがまだありません。');
      return;
    }
    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soushi_backup_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 黒画面で完了通知を出す
    showCustomAlert('📊 通知', '作品データを保存しみゃした！');
  }

  // 🎯 修正ポイント：オリジナルの黒画面（はい/いいえ）に差し替え
  function importData() {
    showCustomPrompt(
      '⚠️ データ復元の確認',
      '警告：データを復元すると現在の文章はすべて上書きされます。いいの？(<⁠・⁠∀⁠・⁠^)',
      function() {
        // 「はい」が押されたときだけ実行される処理
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(evt) {
            try {
              const json = JSON.parse(evt.target.result);
              if (json.books || json.memos) {
                localStorage.setItem(STORAGE_KEY, evt.target.result);
                showCustomAlert('📊 通知', '復元が完了しました！', function() {
                  window.location.reload();
                });
              } else {
                showCustomAlert('通知', 'エラー：正しいバックアップファイルではありません。');
              }
            } catch (err) { 
              showCustomAlert('通知', 'ファイルの読み込みに失敗しました。'); 
            }
          };
          reader.readAsText(file);
        };
        input.click();
      }
    );
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector('.sa-stats')) {
      injectButtons();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', injectButtons);
  setTimeout(injectButtons, 500);
})();
