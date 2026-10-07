// Progressive enhancement only: every page is complete and crawlable without this script.
(function () {
  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) btn.click();
    });
  }

  // Service filter chips
  var chips = document.querySelectorAll("[data-filter]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var g = chip.getAttribute("data-filter");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      document.querySelectorAll("[data-group]").forEach(function (el) {
        el.hidden = g !== "All" && el.getAttribute("data-group") !== g;
      });
    });
  });

  // Highlight today's opening hours
  var day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  document.querySelectorAll('tr[data-day="' + day + '"]').forEach(function (r) { r.classList.add("today"); });
})();
