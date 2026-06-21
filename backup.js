// --- にゃたし草子専用 拡張スクリプト（バックアップ＆ナイトモード） ---
(function() {
  const STORAGE_KEY = 'soushi-app-state';
  const NIGHT_MODE_KEY = 'soushi-night-mode';

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

  // スタイルシートをページに適用する処理
  let styleEl = document.getElementById('sa-night-mode-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl = document.createElement('style');
    styleEl.id = 'sa-night-mode-styles';
    document.head.appendChild(styleEl);
  }

  // ナイトモードのON/OFFを切り替える関数
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

  // ボタンの文字を現在の状態に合わせる関数
  function updateNightButtonText() {
    const nightBtn = document.getElementById('sa-night-toggle-btn');
    if (!nightBtn) return;
    const isNight = localStorage.getItem(NIGHT_MODE_KEY) === 'true';
    nightBtn.innerHTML = isNight ? '🌙 ナイトモード 開始' : ' ナイトモード　なしにして';
  }

  // 初期状態の読み込み
  if (localStorage.getItem(NIGHT_MODE_KEY) === 'true') {
    styleEl.innerHTML = nightStyles;
  }

  // ボタンを画面に注入する処理
  function injectButtons() {
    const statsCard = document.querySelector('.sa-stats');
    if (!statsCard) return;

    // 既にコンテナがあれば中身をチェック、なければ作る
    let container = document.getElementById('sa-backup-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'sa-backup-container';
      container.style.cssText = 'margin-top: 18px; padding-top: 14px; border-top: 1px dashed #EDE3C9; display: flex; flex-direction: column; gap: 10px;';
      statsCard.appendChild(container);
    }

    // バックアップ用ボタン行
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

    // ナイトモード切り替えボタン
    if (!document.getElementById('sa-night-toggle-btn')) {
      const nightBtn = document.createElement('button');
      nightBtn.id = 'sa-night-toggle-btn';
      nightBtn.className = 'sa-nav-btn';
      nightBtn.style.cssText = 'width: 100%; background: rgba(255,255,255,0.05); border: 1px solid currentColor; border-radius: 4px; padding: 8px 0; font-weight: normal; font-size: 11px; cursor: pointer;';
      nightBtn.onclick = toggleNightMode;
      container.appendChild(nightBtn);
      updateNightButtonText();
    }
    
    // ナイトモード時は区切り線の色を調整
    const isNight = localStorage.getItem(NIGHT_MODE_KEY) === 'true';
    container.style.borderTopColor = isNight ? '#4A4035' : '#EDE3C9';
  }

  // データ保存・復元処理
  function exportData() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData || rawData === '{"books":[],"memos":[],"dailyLog":{}}') {
      alert('保存する作品データがまだありません。');
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
    alert('作品データを保存しみゃした！');
  }

  function importData() {
    if (!confirm('警告：データを復元すると現在の文章はすべて上書きされます。いいの？(<⁠・⁠∀⁠・⁠^)')) return;
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
            alert('復元が完了しました！');
            window.location.reload();
          } else {
            alert('エラー：正しいバックアップファイルではありません。');
          }
        } catch (err) { alert('ファイルの読み込みに失敗しました。'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // 画面の書き換えを監視してボタンを自動再配置
  const observer = new MutationObserver(() => {
    if (document.querySelector('.sa-stats')) {
      injectButtons();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', injectButtons);
  setTimeout(injectButtons, 500);
})();
