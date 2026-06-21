// --- 草紙（SOUSHI）専用 バックアップ＆復元スクリプト ---
(function() {
  // アプリの保存用キー（ベースコードのSTORAGE_KEYと一致）
  const STORAGE_KEY = 'soushi-app-state';

  // 1. バックアップボタンを画面（執筆日記のカードの下）に自動注入する
  function injectBackupButtons() {
    // 執筆日記のカード（.sa-stats）を探す
    const statsCard = document.querySelector('.sa-stats');
    if (!statsCard) return;

    // すでにボタンが追加されている場合はスキップ
    if (document.getElementById('sa-backup-container')) return;

    // ボタン用のコンテナを作成
    const container = document.createElement('div');
    container.id = 'sa-backup-container';
    container.style.cssText = 'margin-top: 18px; padding-top: 14px; border-top: 1px dashed #EDE3C9; display: flex; gap: 10px;';

    // バックアップ（保存）ボタン
    const exportBtn = document.createElement('button');
    exportBtn.className = 'sa-nav-btn'; // 既存のスタイルを流用
    exportBtn.style.cssText = 'flex: 1; background: #FFFDF7; border: 1px solid #D9CBA6; border-radius: 4px; padding: 8px 0; color: #6B6048; font-weight: normal;';
    exportBtn.innerHTML = '📥 データを保存（保存）';
    exportBtn.onclick = exportData;

    // 復元（読み込み）ボタン
    const importBtn = document.createElement('button');
    importBtn.className = 'sa-nav-btn';
    importBtn.style.cssText = 'flex: 1; background: #FFFDF7; border: 1px solid #D9CBA6; border-radius: 4px; padding: 8px 0; color: #9B3A34; font-weight: normal;';
    importBtn.innerHTML = '📤 データを復元（読込）';
    importBtn.onclick = importData;

    container.appendChild(exportBtn);
    container.appendChild(importBtn);
    statsCard.appendChild(container);
  }

  // 2. データをファイルとしてダウンロードさせる処理
  function exportData() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData || rawData === '{"books":[],"memos":[],"dailyLog":{}}') {
      alert('保存する作品データがまだありません。');
      return;
    }

    const blob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // ファイル名に日付を付ける（例: soushi_backup_2026-06-20.json）
    const today = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soushi_backup_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('作品データをファイルとして保存しました！\nスマホの「ダウンロード」フォルダ等を確認してください。');
  }

  // 3. ファイルを読み込んでアプリに復元する処理
  function importData() {
    const confirmRestore = confirm('警告：ファイルからデータを復元すると、現在アプリ内にある文章はすべて上書き（消去）されます。よろしいですか？');
    if (!confirmRestore) return;

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
          // 最低限のデータ構造チェック
          if (json.books || json.memos) {
            localStorage.setItem(STORAGE_KEY, evt.target.result);
            alert('データの復元が完了しました！アプリを再起動します。');
            window.location.reload(); // 画面をリフレッシュして反映
          } else {
            alert('エラー：正しい「草紙」のバックアップファイルではありません。');
          }
        } catch (err) {
          alert('ファイルの読み込みに失敗しました。ファイルが破損している可能性があります。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // アプリの画面が更新されるたびに、ボタンが消えていたら自動で再注入する（監視システム）
  const observer = new MutationObserver(() => {
    // 作品一覧の画面（.sa-stats が存在する画面）の時だけ注入
    if (document.querySelector('.sa-stats')) {
      injectBackupButtons();
    }
  });

  // 画面の書き換えを監視開始
  observer.observe(document.body, { childList: true, subtree: true });
  
  // 初回起動時にも実行
  window.addEventListener('DOMContentLoaded', injectBackupButtons);
  // スクリプト読み込みが遅れた場合のために即時実行も試みる
  setTimeout(injectBackupButtons, 500);
})();