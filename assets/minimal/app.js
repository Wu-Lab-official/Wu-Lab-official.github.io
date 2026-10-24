(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "关闭" : "菜单";
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "菜单";
      }
    });
  }

  var rows = Array.prototype.slice.call(
    document.querySelectorAll(".pub-table tbody tr")
  );

  if (!rows.length) {
    return;
  }

  var yearButtons = Array.prototype.slice.call(
    document.querySelectorAll(".filter[data-filter='year']")
  );
  var tagSelect = document.querySelector("#tag-filter");
  var search = document.querySelector("#search");
  var count = document.querySelector("#result-count");
  var empty = document.querySelector("#empty");
  var state = { year: "all", tag: "all", q: "" };

  function applyFilters() {
    var visible = 0;

    rows.forEach(function (row) {
      var tags = (row.getAttribute("data-tags") || "").split(/\s+/);
      var text = (row.textContent || "").toLowerCase();
      var okYear = state.year === "all" || row.getAttribute("data-year") === state.year;
      var okTag = state.tag === "all" || tags.indexOf(state.tag) !== -1;
      var okSearch = !state.q || text.indexOf(state.q) !== -1;
      var show = okYear && okTag && okSearch;

      row.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = visible + " 篇";
    }
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  yearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      state.year = button.getAttribute("data-value");
      yearButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilters();
    });
  });

  if (tagSelect) {
    tagSelect.addEventListener("change", function () {
      state.tag = tagSelect.value;
      applyFilters();
    });
  }

  if (search) {
    search.addEventListener("input", function () {
      state.q = search.value.trim().toLowerCase();
      applyFilters();
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
      return;
    }
    fallback();

    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch (error) {
        /* clipboard unavailable */
      }
      document.body.removeChild(area);
    }
  }

  document.querySelectorAll(".cite").forEach(function (button) {
    button.addEventListener("click", function () {
      var row = button.closest("tr");
      if (!row) {
        return;
      }

      var year = row.querySelector(".col-year").textContent.trim();
      var authors = row.querySelector(".col-authors").textContent.trim().replace(/\.$/, "");
      var title = row.querySelector(".col-title .title").textContent.trim();
      var journal = row.querySelector(".col-journal").textContent.trim();
      var pages = row.querySelector(".col-pages").textContent.trim();
      var citation = authors + ". " + title + ". " + journal + ", " + year + ", " + pages + ".";

      copyText(citation);
      var previous = button.textContent;
      button.textContent = "已复制";
      window.setTimeout(function () {
        button.textContent = previous;
      }, 1200);
    });
  });
})();
