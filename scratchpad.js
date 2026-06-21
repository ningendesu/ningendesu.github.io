// --- 草紙（SOUSHI）専用：ごちゃごちゃ書き書き（テンテンテンメニュー集約版） ---
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

    // --- 🔍 ページ内検索バー（初期状態は非表示） ---
    const searchBar = document.createElement('div');
    searchBar.id = 'sa-scratch-search-bar';
    searchBar.style.cssText = 'background: #1A1A1A; padding: 8px 12px; display: none; align-items: center; gap: 8px; border-bottom: 1px solid #2D2D2D;';
    
    const searchInput = document.createElement('input');
    searchInput.placeholder = '文字を探す…';
    searchInput.style.cssText = 'flex: 1; background: #262626; border: none; border-radius: 4px; color: #fff; padding: 6px 10px; font-size: 14px; outline: none;';
    
    const mushroomBtn = document.createElement('button');
    mushroomBtn.innerHTML = '🍄';
    mushroomBtn.style.cssText = 'background: #262626; border: none; border-radius: 4px; padding: 6px 8px; cursor: pointer; font-size: 14px;';
    
    const starBtn = document.createElement('button');
    starBtn.innerHTML = '⭐';
    starBtn.style.cssText = 'background: #262626; border: none; border-radius: 4px; padding: 6px 8px; cursor: pointer; font-size: 14px;';

    const searchCount = document.createElement('span');
    searchCount.style.cssText = 'font-size: 12px; color: #888; min-width: 40px; text-align: center;';

    searchBar.appendChild(searchInput);
    searchBar.appendChild(mushroomBtn);
    searchBar.appendChild(starBtn);
    searchBar.appendChild(searchCount);
    overlay.appendChild(searchBar);

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

    const penBtn = document.createElement('button');
    penBtn.innerHTML = '🖊️';
    penBtn.style.cssText = 'position: absolute; bottom: 24px; right: 24px; width: 56px; height: 56px; background: #1A54CE; border: none; border-radius: 16px; color: white; font-size: 22px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 10;';
    
    penBtn.onclick = () => {
      textarea.readOnly = false;
      textarea.focus();
      penBtn.style.display = 'none';
    };
    
    mainWrapper.appendChild(penBtn);
    overlay.appendChild(mainWrapper);

    // 文字数確認
    function checkWordCount() {
      const fullText = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = fullText.substring(start, end);

      let message = `【全体の文字数】\n${fullText.length} 文字`;
      if (selectedText.length > 0) {
        message += `\n\n【選択範囲の文字数】\n${selectedText.length} 文字`;
      }
      alert(message);
    }

    // 検索ロジック
    let lastQuery = '';
    let searchIndex = 0;
    let matchPositions = [];

    function doSearch(query) {
      if (!query) {
        searchCount.innerHTML = '';
        return;
      }
      const text = textarea.value;
      if (query !== lastQuery) {
        lastQuery = query;
        matchPositions = [];
        let pos = text.indexOf(query);
        while (pos !== -1) {
          matchPositions.push(pos);
          pos = text.indexOf(query, pos + 1);
        }
        searchIndex = 0;
      }
      if (matchPositions.length === 0) {
        searchCount.innerHTML = '0/0';
        return;
      }
      searchCount.innerHTML = `${searchIndex + 1}/${matchPositions.length}`;
      const targetPos = matchPositions[searchIndex];
      textarea.focus();
      textarea.setSelectionRange(targetPos, targetPos + query.length);
      searchIndex = (searchIndex + 1) % matchPositions.length;
    }

    searchInput.oninput = () => { lastQuery = ''; doSearch(searchInput.value); };
    searchInput.onkeydown = (e) => { if(e.key === 'Enter') doSearch(searchInput.value); };
    mushroomBtn.onclick = () => { searchInput.value = '🍄'; lastQuery = ''; doSearch('🍄'); };
    starBtn.onclick = () => { searchInput.value = '⭐'; lastQuery = ''; doSearch('⭐'); };

    // --- 📋 テンテンテン：3つのメニューに集約 ---
    menuBtn.onclick = () => {
      const oldMenu = document.getElementById('sa-scratch-dropdown');
      if (oldMenu) { oldMenu.remove(); return; }

      const menuBox = document.createElement('div');
      menuBox.id = 'sa-scratch-dropdown';
      menuBox.style.cssText = 'position: absolute; top: 50px; right: 10px; background: #252525; border: 1px solid #3d3d3d; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; flex-direction: column; z-index: 10000;';

      const btnCount = document.createElement('button');
      btnCount.innerHTML = '📊 文字数確認';
      btnCount.style.cssText = 'background: none; border: none; color: #fff; padding: 12px 16px; font-size: 14px; text-align: left; cursor: pointer; white-space: nowrap;';
      btnCount.onclick = () => { menuBox.remove(); checkWordCount(); };

      const btnInfo = document.createElement('button');
      btnInfo.innerHTML = '🗂️ 情報追加（メモなど）';
      btnInfo.style.cssText = 'background: none; border: none; color: #fff; padding: 12px 16px; font-size: 14px; text-align: left; border-top: 1px solid #3d3d3d; cursor: pointer; white-space: nowrap;';
      btnInfo.onclick = () => { menuBox.remove(); toggleTopPanel(); };

      // 🎯 追加：❸ ページ内検索ボタン
      const btnSearch = document.createElement('button');
      btnSearch.innerHTML = '🔍 ページ内検索';
      btnSearch.style.cssText = 'background: none; border: none; color: #fff; padding: 12px 16px; font-size: 14px; text-align: left; border-top: 1px solid #3d3d3d; cursor: pointer; white-space: nowrap;';
      btnSearch.onclick = () => {
        menuBox.remove();
        if (searchBar.style.display === 'flex') {
          searchBar.style.display = 'none';
        } else {
          searchBar.style.display = 'flex';
          searchInput.focus();
        }
      };

      menuBox.appendChild(btnCount);
      menuBox.appendChild(btnInfo);
      menuBox.appendChild(btnSearch);
      overlay.appendChild(menuBox);
    };

    function toggleTopPanel() {
      if (topPanel.style.display === 'block') { topPanel.style.display = 'none'; return; }
      topPanel.innerHTML = '';
      
      const titleLabel = document.createElement('div');
      titleLabel.innerHTML = '📋 題名を長押しして【題名＋本文】を先頭に貼り付け';
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
          if (textarea.readOnly) return;
          pressTimer = setTimeout(() => {
            const textToInsert = contentText || '';
            textarea.value = `【${titleText}】\n${textToInsert}\n\n` + textarea.value;
            localStorage.setItem(SCRATCH_PREFIX + selectedBookId, textarea.value);
            docSub.innerHTML = '題名と本文を挿入しました';
            setTimeout(() => { docSub.innerHTML = 'すべての変更を保存しました'; }, 800);
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
    }

    textarea.oninput = () => {
      localStorage.setItem(SCRATCH_PREFIX + selectedBookId, textarea.value);
      docSub.innerHTML = '変更を保存中…';
      setTimeout(() => { docSub.innerHTML = 'すべての変更を保存しました'; }, 600);
    };

    fileInput.onchange = (e) => {
      if (textarea.readOnly) { alert('編集モードにしてから画像を追加してください。'); return; }
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

    undoBtn.onclick = redoBtn.onclick = () => {
      docSub.innerHTML = '矢印機能は現在見た目のみです';
      setTimeout(() => { docSub.innerHTML = 'すべての変更を保存しました'; }, 1000);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target !== menuBtn) {
        const menuBox = document.getElementById('sa-scratch-dropdown');
        if (menuBox) menuBox.remove();
      }
    });

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
