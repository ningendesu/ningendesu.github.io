// --- 草紙（SOUSHI）専用：ごちゃごちゃ書き書き（ペンボタンモード切り替え版） ---
(function() {
  const SCRATCH_PREFIX = 'soushi-scratch-';

  function injectScratchButton() {
    const targetCard = document.querySelector('.sa-target-card');
    if (!targetCard || document.getElementById('sa-scratch-trigger')) return;

    const launchBtn = document.createElement('button');
    launchBtn.id = 'sa-scratch-trigger';
    launchBtn.style.cssText = 'width: 100%; margin-top: 15px; padding: 14px; background: #2B2620; color: #FFF8EC; border: 1px solid #C7B98F; border-radius: 4px; font-size: 14px; font-weight: bold; cursor: pointer; letter-spacing: 0.05em;';
    launchBtn.innerHTML = '📝 ごちゃごちゃ書き書きを開く';
    
    launchBtn.onclick = openScratchpad;
    targetCard.parentNode.insertBefore(launchBtn, targetCard.nextSibling);
  }

  function openScratchpad() {
    if (typeof selectedBookId === 'undefined' || !selectedBookId) return;
    const currentBook = state.books.find(x => x.id === selectedBookId);
    const bookTitle = currentBook ? currentBook.title || 'タイトル未設定' : '';

    const oldOverlay = document.getElementById('sa-scratch-overlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'sa-scratch-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #111111; z-index: 9999; display: flex; flex-direction: column; color: #E3E3E3; font-family: Roboto, Arial, sans-serif;';

    // --- 上部ヘッダー ---
    const header = document.createElement('div');
    header.style.cssText = 'height: 56px; background: #1A1A1A; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1px solid #2D2D2D; box-sizing: border-box;';
    
    const leftGroup = document.createElement('div');
    leftGroup.style.cssText = 'display: flex; align-items: center; gap: 14px;';
    
    const checkBtn = document.createElement('button');
    checkBtn.innerHTML = '✓';
    checkBtn.style.cssText = 'background: #3966D6; border: none; color: #111111; width: 32px; height: 32px; border-radius: 50%; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;';
    checkBtn.onclick = () => overlay.remove();

    const titleInfo = document.createElement('div');
    const docTitle = document.createElement('div');
    docTitle.innerHTML = bookTitle;
    docTitle.style.cssText = 'font-size: 16px; font-weight: normal; color: #FFF;';
    const docSub = document.createElement('div');
    docSub.innerHTML = 'すべての変更を保存しました';
    docSub.style.cssText = 'font-size: 11px; color: #888; margin-top: 2px;';
    titleInfo.appendChild(docTitle);
    titleInfo.appendChild(docSub);
    
    leftGroup.appendChild(checkBtn);
    leftGroup.appendChild(titleInfo);

    const rightGroup = document.createElement('div');
    rightGroup.style.cssText = 'display: flex; align-items: center; gap: 20px; color: #C4C7C5;';
    
    const undoBtn = document.createElement('span'); undoBtn.innerHTML = '↩'; undoBtn.style.cssText = 'font-size: 20px; cursor: pointer;';
    const redoBtn = document.createElement('span'); redoBtn.innerHTML = '↪'; redoBtn.style.cssText = 'font-size: 20px; cursor: pointer;';
    
    const plusBtn = document.createElement('span'); 
    plusBtn.innerHTML = '＋'; 
    plusBtn.style.cssText = 'font-size: 22px; cursor: pointer; font-weight: bold;';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    plusBtn.appendChild(fileInput);
    plusBtn.onclick = (e) => { if(e.target === plusBtn) fileInput.click(); };

    const menuBtn = document.createElement('span'); 
    menuBtn.innerHTML = '⋮'; 
    menuBtn.style.cssText = 'font-size: 22px; cursor: pointer; font-weight: bold; padding: 0 4px;';

    rightGroup.appendChild(undoBtn);
    rightGroup.appendChild(redoBtn);
    rightGroup.appendChild(plusBtn);
    rightGroup.appendChild(menuBtn);

    header.appendChild(leftGroup);
    header.appendChild(rightGroup);
    overlay.appendChild(header);

    // --- エリア全体のラッパー ---
    const mainWrapper = document.createElement('div');
    mainWrapper.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative;';

    const topPanel = document.createElement('div');
    topPanel.id = 'sa-scratch-top-panel';
    topPanel.style.cssText = 'height: 45%; background: #1A1A1A; border-bottom: 2px solid #2D2D2D; display: none; overflow-y: auto; padding: 14px; box-sizing: border-box;';
    
    const editorContainer = document.createElement('div');
    editorContainer.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow-y: auto;';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'ごちゃごちゃ書き書き…';
    textarea.style.cssText = 'flex: 1; background: #111111; color: #E3E3E3; border: none; padding: 20px; font-size: 16px; resize: none; outline: none; line-height: 1.8; font-family: sans-serif;';
    
    // 🎯 初期状態は「読み取り専用（閲覧モード）」にしておく
    textarea.readOnly = true;

    const savedContent = localStorage.getItem(SCRATCH_PREFIX + selectedBookId) || '';
    textarea.value = savedContent;

    const imageGallery = document.createElement('div');
    imageGallery.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 20px; background: #111111;';
    
    const imgStorageKey = SCRATCH_PREFIX + 'imgs-' + selectedBookId;
    let savedImages = JSON.parse(localStorage.getItem(imgStorageKey) || '[]');
    
    function renderImages() {
      imageGallery.innerHTML = '';
      savedImages.forEach((src, idx) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden; background: #222;';
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = 'width:100%; height:100%; object-fit:cover;';
        
        const del = document.createElement('button');
        del.innerHTML = '×';
        del.style.cssText = 'position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;';
        del.onclick = () => {
          savedImages.splice(idx, 1);
          localStorage.setItem(imgStorageKey, JSON.stringify(savedImages));
          renderImages();
        };
        wrap.appendChild(img);
        wrap.appendChild(del);
        imageGallery.appendChild(wrap);
      });
    }
    renderImages();

    editorContainer.appendChild(textarea);
    editorContainer.appendChild(imageGallery);

    mainWrapper.appendChild(topPanel);
    mainWrapper.appendChild(editorContainer);

    // 🎯 📸 スクショ通りの「右下の青い筆（ペン）ボタン」を完全再現
    const penBtn = document.createElement('button');
    penBtn.innerHTML = '🖊️'; // 筆・ペンマーク
    penBtn.style.cssText = 'position: absolute; bottom: 24px; right: 24px; width: 56px; height: 56px; background: #1A54CE; border: none; border-radius: 16px; color: white; font-size: 22px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; transition: all 0.2s;';
    
    penBtn.onclick = () => {
      // 読み取り専用を解除して、編集モードにする
      textarea.readOnly = false;
      textarea.focus(); // 自動でカーソルを当ててキーボードを立ち上げる
      penBtn.style.display = 'none'; // 編集に入ったらペンボタンは隠す（チェックを押すとまた閲覧に戻る）
    };
    
    mainWrapper.appendChild(penBtn);
    overlay.appendChild(mainWrapper);

    // 自動保存
    textarea.oninput = () => {
      localStorage.setItem(SCRATCH_PREFIX + selectedBookId, textarea.value);
      docSub.innerHTML = '変更を保存中…';
      setTimeout(() => { docSub.innerHTML = 'すべての変更を保存しました'; }, 600);
    };

    // 画像追加（※編集モードの時だけ有効に）
    fileInput.onchange = (e) => {
      if (textarea.readOnly) {
        alert('編集モード（右下のペンボタン）をオンにしてから画像を追加してください。');
        return;
      }
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        savedImages.push(evt.target.result);
        localStorage.setItem(imgStorageKey, JSON.stringify(savedImages));
        renderImages();
      };
      reader.readAsDataURL(file);
    };

    // テンテンテン（上半分トグル）
    menuBtn.onclick = () => {
      if (topPanel.style.display === 'block') {
        topPanel.style.display = 'none';
        return;
      }

      topPanel.innerHTML = '';
      
      const titleLabel = document.createElement('div');
      titleLabel.innerHTML = '📋 題名を長押しして【その本文（中身）】を先頭に貼り付け';
      titleLabel.style.cssText = 'font-size: 12px; color: #888; margin-bottom: 12px; font-weight: bold;';
      topPanel.appendChild(titleLabel);

      const listContainer = document.createElement('div');
      listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

      function makeItemElement(titleText, contentText, typeLabel, color) {
        const item = document.createElement('div');
        item.style.cssText = `padding: 10px; background: #262626; border-radius: 4px; border-left: 4px solid ${color}; cursor: pointer; user-select: none; -webkit-user-select: none; display: flex; justify-content: space-between; align-items: center;`;
        
        const snippet = contentText ? contentText.substring(0, 10).replace(/\n/g, ' ') + '...' : '空っぽのデータ';
        item.innerHTML = `<div><div style="font-size:14px; color:#fff;">${escapeHtml(titleText)}</div><div style="font-size:11px; color:#666; margin-top:2px;">${escapeHtml(snippet)}</div></div><span style="font-size:10px; color:#888;">${typeLabel}</span>`;

        let pressTimer;
        const startPress = () => {
          if (textarea.readOnly) return; // 閲覧モード時は長押し挿入も無効化して安全に
          pressTimer = setTimeout(() => {
            const textToInsert = contentText || '';
            if (textToInsert) {
              textarea.value = textToInsert + "\n\n" + textarea.value;
              localStorage.setItem(SCRATCH_PREFIX + selectedBookId, textarea.value);
              docSub.innerHTML = '本文を挿入しました';
              setTimeout(() => { docSub.innerHTML = 'すべての変更を保存しました'; }, 800);
            }
            item.style.background = '#3966D6';
            setTimeout(() => { item.style.background = '#262626'; }, 200);
          }, 600);
        };
        const cancelPress = () => clearTimeout(pressTimer);

        item.addEventListener('touchstart', startPress);
        item.addEventListener('touchend', cancelPress);
        item.addEventListener('mousedown', startPress);
        item.addEventListener('mouseup', cancelPress);
        item.addEventListener('mouseleave', cancelPress);

        return item;
      }

      if (currentBook) {
        (currentBook.memos || []).forEach(m => {
          listContainer.appendChild(makeItemElement(m.title || '無題のメモ', m.content || '', '作品メモ', '#B8923D'));
        });
        (currentBook.chapters || []).forEach(c => {
          listContainer.appendChild(makeItemElement(c.title || '無題の章', c.content || '', '章', '#9B3A34'));
        });
      }
      (state.memos || []).forEach(m => {
        listContainer.appendChild(makeItemElement(m.title || '無題のメモ', m.content || '', '全体メモ', '#A69988'));
      });

      topPanel.appendChild(listContainer);
      topPanel.style.display = 'block';
    };

    undoBtn.onclick = redoBtn.onclick = () => {
      docSub.innerHTML = '矢印機能は現在見た目のみです';
      setTimeout(() => { docSub.innerHTML = 'すべての変更を保存しました'; }, 1000);
    };

    document.body.appendChild(overlay);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector('.sa-target-card')) injectScratchButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', injectScratchButton);
  setTimeout(injectScratchButton, 500);
})();
