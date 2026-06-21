// --- 草紙（SOUSHI）専用 誤削除防止スクリプト ---
(function() {
  // 元の削除関数を別の名前に退避させておく
  const originalDeleteBook = window.deleteBook;
  const originalDeleteChapter = window.deleteChapter;
  const originalDeleteProjectMemo = window.deleteProjectMemo;
  const originalDeleteGeneralMemo = window.deleteGeneralMemo;

  // 1. 作品（本）の削除ボタンが押された時の動きを乗っ取る
  window.deleteBook = function(id) {
    if (typeof state !== 'undefined' && state.books) {
      const book = state.books.find(x => x.id === id);
      const expectedTitle = (book && book.title) ? book.title : 'タイトル未設定';
      
      const userInput = prompt(`【作品削除の確認】\n本当にこの作品を削除しますか？\n削除する場合は、確認のために作品名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`);
      
      if (userInput !== expectedTitle) {
        alert('作品名が一致しません。削除をキャンセルしました。');
        if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
        if (typeof render === 'function') render();
        return;
      }
    }
    // 名前が完全に一致した場合だけ、元の削除処理を実行する
    if (typeof originalDeleteBook === 'function') originalDeleteBook(id);
  };

  // 詳細画面の「この作品を削除する」ボタン用
  window.deleteBookDirect = function(id) {
    window.deleteBook(id);
    if (typeof currentView !== 'undefined') currentView = 'list';
    if (typeof render === 'function') render();
  };

  // 2. 章の削除ボタンが乗っ取り
  window.deleteChapter = function(id) {
    if (typeof state !== 'undefined' && state.books && typeof selectedBookId !== 'undefined') {
      const book = state.books.find(x => x.id === selectedBookId);
      const chapter = book ? book.chapters.find(x => x.id === id) : null;
      const expectedTitle = (chapter && chapter.title) ? chapter.title : '無題の章';
      
      const userInput = prompt(`【章削除の確認】\n本当にこの章を削除しますか？\n削除する場合は、確認のために章の題名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`);
      
      if (userInput !== expectedTitle) {
        alert('章の題名が一致しません。削除をキャンセルしました。');
        if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
        if (typeof render === 'function') render();
        return;
      }
    }
    if (typeof originalDeleteChapter === 'function') originalDeleteChapter(id);
  };

  window.deleteChapterDirect = function(id) {
    window.deleteChapter(id);
    if (typeof currentView !== 'undefined') currentView = 'book';
    if (typeof render === 'function') render();
  };

  // 3. メモ（作品メモ・全体メモ）の削除チェック共通処理
  function checkMemoTitleMatches(id, isProject) {
    if (typeof state !== 'undefined') {
      let memo = null;
      if (isProject && typeof selectedBookId !== 'undefined') {
        const book = state.books.find(x => x.id === selectedBookId);
        memo = book ? book.memos.find(x => x.id === id) : null;
      } else {
        memo = state.memos.find(x => x.id === id);
      }
      const expectedTitle = (memo && memo.title) ? memo.title : '無題のメモ';
      
      const userInput = prompt(`【メモ削除の確認】\n本当にこのメモを削除しますか？\n削除する場合は、確認のためにメモの題名（ ${expectedTitle} ）を1文字も間違えずに入力してください。`);
      
      return userInput === expectedTitle;
    }
    return true;
  }

  window.deleteProjectMemo = function(id) {
    if (!checkMemoTitleMatches(id, true)) {
      alert('メモの題名が一致しません。削除をキャンセルしました。');
      if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
      if (typeof render === 'function') render();
      return;
    }
    if (typeof originalDeleteProjectMemo === 'function') originalDeleteProjectMemo(id);
  };

  window.deleteGeneralMemo = function(id) {
    if (!checkMemoTitleMatches(id, false)) {
      alert('メモの題名が一致しません。削除をキャンセルしました。');
      if (typeof armedDeleteId !== 'undefined') armedDeleteId = null;
      if (typeof render === 'function') render();
      return;
    }
    if (typeof originalDeleteGeneralMemo === 'function') originalDeleteGeneralMemo(id);
  };

  // 詳細画面の「このメモを削除する」ボタン用
  window.deleteMemoDirect = function() {
    if (typeof selectedMemoId !== 'undefined' && typeof isEditingProjectMemo !== 'undefined') {
      const id = selectedMemoId;
      if (isEditingProjectMemo) {
        if (!checkMemoTitleMatches(id, true)) { alert('メモの題名が一致しません。削除をキャンセルしました。'); return; }
        if (typeof originalDeleteProjectMemo === 'function') originalDeleteProjectMemo(id);
        if (typeof currentView !== 'undefined') currentView = 'book';
      } else {
        if (!checkMemoTitleMatches(id, false)) { alert('メモの題名が一致しません。削除をキャンセルしました。'); return; }
        if (typeof originalDeleteGeneralMemo === 'function') originalDeleteGeneralMemo(id);
        if (typeof currentView !== 'undefined') currentView = 'list';
      }
      if (typeof render === 'function') render();
    }
  };
})();
