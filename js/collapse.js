(function () {
  var editorToggle = document.getElementById("editor-toggle");
  var editor = document.getElementById("editor");

  editorToggle.addEventListener("click", function (event) {
    event.preventDefault();

    if (hasClass(editor, "visible")) {
      removeClass(editor, "visible");
    } else {
      addClass(editor, "visible");
    }
  });

  /**
   *
   *
   * @param {*} el
   * @param {*} className
   * @return {*}
   */
  hasClass = (el, name) => el.matches('.' + name) ? 1 : 0;
  
  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else if (!hasClass(el, className)) {
      el.className += " " + className;
    }
  }

  function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);
    else if (hasClass(el, className)) {
      var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
      el.className = el.className.replace(reg, " ");
    }
  }
})();
