// --- 草紙（SOUSHI）専用 誤削除防止スクリプト（カスタム黒ダイアログ完全内蔵版） ---
(function() {
  // 元の削除関数を別の名前に退避させておく
  const originalDeleteBook = window.deleteBook;
  const originalDeleteChapter = window.deleteChapter;
  const originalDeleteProjectMemo = window.deleteProjectMemo;
  const originalDeleteGeneralMemo = window.deleteGeneralMemo;

  // 🎨 ① 通知（閉じるボタンだけ）用のオリジナル黒画面
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

  // 🎨 ② 文字入力（入力して確定）用のオリジナル黒画面
  function showCustomPrompt(title, message, placeholder, onConfirm, onCancel) {
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

    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.placeholder = placeholder;
    inputEl.style.cssText = 'width: 100%; background: #111; border: 1px solid #444; border-radius: 4px; color: #fff; padding: 8px 10px; font-size: 14px; box-sizing: border-box; margin-bottom: 20px; outline: none;';

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 12px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.innerHTML = 'キャンセル';
    cancelBtn.style.cssText = 'background: none; border: none; color: #3966D6; font-size: 14px; font-weight: bold; cursor: pointer; padding: 8px 12px;';
    cancelBtn.onclick = () => {
      overlay.remove();
      if (onCancel) onCancel();
    };

    const okBtn = document.createElement('button');
    okBtn.innerHTML = 'やるぅうぅぅ！！';
    okBtn.style.cssText = 'background: none; border: none; color: #3966D6; font-size: 14px; font-weight: bold; cursor: pointer; padding: 8px 12px;';
    okBtn.onclick = () => {
      const val = inputEl.value;
      overlay.remove();
      onConfirm(val);
    };

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(okBtn);
    box.appendChild(tEl);
    box.appendChild(mEl);
    box.appendChild(inputEl);
    box.appendChild(btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    inputEl.focus();
  }

  // 1. 作品（本）の削除ボタン乗っ取り
  window.deleteBook = function(id) {
    if (typeof state !== 'undefined' && state.books) {
      const book = state.books.find(x => x.id === id);
      const expectedTitle = (book && book.title) ? book.title : 'タイトル未設定';
      
      showCustomPrompt(
        "【作品削除の確認】",
        `本当にこの作品を削除しますか？\n削除する場合は、確認のために作品名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`,
        "作品名を入力...",
        function(userInput) {
          if (userInput !== expectedTitle) {
            showCustomAlert('通知', '作品名が一致しません。削除をキャンセルしました。');
            if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
            if (typeof render === 'function') render();
            return;
          }
          if (typeof originalDeleteBook === 'function') originalDeleteBook(id);
        },
        function() {
          if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
          if (typeof render === 'function') render();
        }
      );
    }
  };

  window.deleteBookDirect = function(id) {
    window.deleteBook(id);
    // 直接削除時は一覧に戻る動きを少し遅らせて同期を保つ
    setTimeout(() => {
      if (typeof currentView !== 'undefined') currentView = 'list';
      if (typeof render === 'function') render();
    }, 100);
  };

  // 2. 章の削除ボタン乗っ取り
  window.deleteChapter = function(id) {
    if (typeof state !== 'undefined' && state.books && typeof selectedBookId !== 'undefined') {
      const book = state.books.find(x => x.id === selectedBookId);
      const chapter = book ? book.chapters.find(x => x.id === id) : null;
      const expectedTitle = (chapter && chapter.title) ? chapter.title : '無題の章';
      
      showCustomPrompt(
        "【章削除の確認】",
        `本当にこの章を削除しますか？\n削除する場合は、確認のために章的題名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`,
        "章の題名を入力...",
        function(userInput) {
          if (userInput !== expectedTitle) {
            showCustomAlert('通知', '章の題名が一致しません。削除をキャンセルしました。');
            if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
            if (typeof render === 'function') render();
            return;
          }
          if (typeof originalDeleteChapter === 'function') originalDeleteChapter(id);
        },
        function() {
          if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
          if (typeof render === 'function') render();
        }
      );
    }
  };

  window.deleteChapterDirect = function(id) {
    window.deleteChapter(id);
    setTimeout(() => {
      if (typeof currentView !== 'undefined') currentView = 'book';
      if (typeof render === 'function') render();
    }, 100);
  };

  // 3. メモ削除の乗っ取り
  window.deleteProjectMemo = function(id) {
    if (typeof state !== 'undefined' && typeof selectedBookId !== 'undefined') {
      const book = state.books.find(x => x.id === selectedBookId);
      const memo = book ? book.memos.find(x => x.id === id) : null;
      const expectedTitle = (memo && memo.title) ? memo.title : '無題のメモ';

      showCustomPrompt(
        "【メモ削除の確認】",
        `本当にこのメモを削除しますか？\n削除する場合は、確認のためにメモの題名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`,
        "メモの題名を入力...",
        function(userInput) {
          if (userInput !== expectedTitle) {
            showCustomAlert('通知', 'メモの題名が一致しません。削除をキャンセルしました。');
            if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
            if (typeof render === 'function') render();
            return;
          }
          if (typeof originalDeleteProjectMemo === 'function') originalDeleteProjectMemo(id);
        },
        function() {
          if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
          if (typeof render === 'function') render();
        }
      );
    }
  };

  window.deleteGeneralMemo = function(id) {
    if (typeof state !== 'undefined') {
      const memo = state.memos.find(x => x.id === id);
      const expectedTitle = (memo && memo.title) ? memo.title : '無題のメモ';

      showCustomPrompt(
        "【メモ削除の確認】",
        `本当にこのメモを削除しますか？\n削除する場合は、確認のためにメモの題名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`,
        "メモの題名を入力...",
        function(userInput) {
          if (userInput !== expectedTitle) {
            showCustomAlert('通知', 'メモの題名が一致しません。削除をキャンセルしました。');
            if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
            if (typeof render === 'function') render();
            return;
          }
          if (typeof originalDeleteGeneralMemo === 'function') originalDeleteGeneralMemo(id);
        },
        function() {
          if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
          if (typeof render === 'function') render();
        }
      );
    }
  };

  // 詳細画面の「このメモを削除する」ボタン用
  window.deleteMemoDirect = function() {
    if (typeof selectedMemoId !== 'undefined' && typeof isEditingProjectMemo !== 'undefined') {
      const id = selectedMemoId;
      if (isEditingProjectMemo) {
        if (typeof state !== 'undefined' && typeof selectedBookId !== 'undefined') {
          const book = state.books.find(x => x.id === selectedBookId);
          const memo = book ? book.memos.find(x => x.id === id) : null;
          const expectedTitle = (memo && memo.title) ? memo.title : '無題のメモ';

          showCustomPrompt(
            "【メモ削除の確認】",
            `本当にこのメモを削除しますか？\n削除する場合は、確認のためにメモの題名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`,
            "メモの題名を入力...",
            function(userInput) {
              if (userInput !== expectedTitle) { showCustomAlert('通知', 'メモの題名が一致しません。削除をキャンセルしました。'); return; }
              if (typeof originalDeleteProjectMemo === 'function') originalDeleteProjectMemo(id);
              if (typeof currentView !== 'undefined') currentView = 'book';
              if (typeof render === 'function') render();
            }
          );
        }
      } else {
        if (typeof state !== 'undefined') {
          const memo = state.memos.find(x => x.id === id);
          const expectedTitle = (memo && memo.title) ? memo.title : '無題のメモ';

          showCustomPrompt(
            "【メモ削除の確認】",
            `本当にこのメモを削除しますか？\n削除する場合は、確認のためにメモの題名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`,
            "メモの題名を入力...",
            function(userInput) {
              if (userInput !== expectedTitle) { showCustomAlert('通知', 'メモの題名が一致しません。削除をキャンセルしました。'); return; }
              if (typeof originalDeleteGeneralMemo === 'function') originalDeleteGeneralMemo(id);
              if (typeof currentView !== 'undefined') currentView = 'list';
              if (typeof render === 'function') render();
            }
          );
        }
      }
    }
  };
})();
