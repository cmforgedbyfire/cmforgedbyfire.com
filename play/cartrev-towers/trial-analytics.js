(function () {
  "use strict";

  var started = false;
  var armedButton = null;

  function readyToStart(button) {
    if (!button || button.disabled) return false;
    return /^start wave \d+/i.test(button.getAttribute("aria-label") || "");
  }

  function recordStart() {
    if (started) return;
    var analytics = window.ForgedAnalytics;
    if (!analytics || typeof analytics.trackProductAction !== "function") return;
    started = true;
    analytics.trackProductAction("cartrev-towers:browser-trial-started");
  }

  document.addEventListener("pointerdown", function (event) {
    var button = event.target.closest && event.target.closest(".start-wave");
    armedButton = readyToStart(button) ? button : null;
  }, { capture: true, passive: true });

  document.addEventListener("pointerup", function (event) {
    if (armedButton && (event.target === armedButton || armedButton.contains(event.target))) recordStart();
    armedButton = null;
  }, { capture: true, passive: true });

  document.addEventListener("pointercancel", function () { armedButton = null; }, { capture: true, passive: true });

  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest(".start-wave");
    if (readyToStart(button)) recordStart();
  }, { capture: true });
})();
