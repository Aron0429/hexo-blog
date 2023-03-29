document.addEventListener("page:loaded", () => {
  NexT.utils
    .loadComments(CONFIG.waline.el)
    .then(() =>
      NexT.utils.getScript(CONFIG.waline.libUrl, { condition: window.Waline })
    )
    .then(() =>
      Waline.init(
        Object.assign({}, CONFIG.waline, {
          el: document.querySelector(CONFIG.waline.el),
        })
      )
    );
});
