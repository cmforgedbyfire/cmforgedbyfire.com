(function () {
  "use strict";

  var API_ROOT = "https://api.cmforgedbyfire.com/website-analytics";
  var EXCLUSION_KEY = "fbf_analytics_excluded";
  var SITE_HOSTS = ["cmforgedbyfire.com", "www.cmforgedbyfire.com"];
  var scrollSent = {};
  var startedAt = Date.now();
  var hiddenAt = 0;
  var hiddenTime = 0;
  var engagementSent = false;

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (_error) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_error) { /* Privacy mode may block storage. */ }
  }

  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (_error) { /* Privacy mode may block storage. */ }
  }

  function applyPrivacyChoice() {
    var parameters = new URLSearchParams(window.location.search);
    var choice = parameters.get("analytics");
    if (choice !== "off" && choice !== "on") return;
    if (choice === "off") storageSet(EXCLUSION_KEY, "1");
    else storageRemove(EXCLUSION_KEY);
    parameters.delete("analytics");
    var query = parameters.toString();
    var clean = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
    window.history.replaceState(null, "", clean);
  }

  applyPrivacyChoice();
  var excluded = storageGet(EXCLUSION_KEY) === "1";

  function eventId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    var random = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    return (Date.now().toString(36) + random).slice(0, 32);
  }

  function browserName() {
    var agent = navigator.userAgent;
    if (/SamsungBrowser/i.test(agent)) return "samsung";
    if (/Edg\//i.test(agent)) return "edge";
    if (/OPR\//i.test(agent)) return "opera";
    if (/Firefox\//i.test(agent)) return "firefox";
    if (/Chrome\//i.test(agent)) return "chrome";
    if (/Safari\//i.test(agent)) return "safari";
    return "other";
  }

  function operatingSystem() {
    var agent = navigator.userAgent;
    if (/Windows/i.test(agent)) return "windows";
    if (/Android/i.test(agent)) return "android";
    if (/iPhone|iPad|iPod/i.test(agent)) return "ios";
    if (/Mac OS X|Macintosh/i.test(agent)) return "macos";
    if (/CrOS/i.test(agent)) return "chromeos";
    if (/Linux/i.test(agent)) return "linux";
    return "other";
  }

  function deviceType() {
    var agent = navigator.userAgent;
    if (/iPad|Tablet/i.test(agent) || (/Android/i.test(agent) && !/Mobile/i.test(agent))) return "tablet";
    if (/Mobile|iPhone|iPod|Android/i.test(agent)) return "mobile";
    return "desktop";
  }

  function referrerHost() {
    if (!document.referrer) return "direct";
    try { return new URL(document.referrer).hostname.toLowerCase(); }
    catch (_error) { return "other"; }
  }

  function campaignValue(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  var context = {
    page: window.location.pathname || "/",
    referrer: referrerHost(),
    source: campaignValue("utm_source"),
    medium: campaignValue("utm_medium"),
    campaign: campaignValue("utm_campaign"),
    device: deviceType(),
    browser: browserName(),
    os: operatingSystem()
  };

  function send(eventName, details, finalDelivery) {
    if (excluded) return;
    var payload = Object.assign({}, context, details || {}, {
      event: eventName,
      eventId: eventId()
    });
    var body = JSON.stringify(payload);
    if (finalDelivery && navigator.sendBeacon) {
      try {
        if (navigator.sendBeacon(API_ROOT + "/event", new Blob([body], { type: "text/plain;charset=UTF-8" }))) return;
      } catch (_error) { /* Use fetch fallback. */ }
    }
    try {
      fetch(API_ROOT + "/event", {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        keepalive: Boolean(finalDelivery),
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: body
      }).catch(function () { /* Analytics must never interfere with the site. */ });
    } catch (_error) { /* Older browsers may not support keepalive. */ }
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64);
  }

  function productFromLink(link, destination) {
    var card = link.closest("article, .panel, .hero, section");
    var heading = card && card.querySelector("h1, h2, h3, h4");
    var headingSlug = heading ? slug(heading.textContent) : "";
    var known = [
      "master-generator", "card-vault", "creative-qr", "latter-day-lens",
      "creative-pdf", "creative-image-tools", "cartrev-towers", "humans",
      "otto", "vent", "trev", "coach", "pc-purifier", "forge-audio-studio",
      "the-forge", "ship-studio"
    ];
    for (var index = 0; index < known.length; index += 1) {
      if (headingSlug.indexOf(known[index]) !== -1) return known[index];
    }
    var file = destination.pathname.split("/").filter(Boolean).pop() || "home";
    return slug(file.replace(/\.html$/i, "")) || "site";
  }

  function storeName(destination) {
    var host = destination.hostname.toLowerCase();
    if (host === "apps.microsoft.com") return "microsoft-store";
    if (host === "play.google.com") return "google-play";
    if (host === "apps.apple.com") return "apple-app-store";
    return "";
  }

  function linkEvent(event) {
    var link = event.target.closest("a[href]");
    if (!link || link.href.indexOf("mailto:") === 0 || link.href.indexOf("tel:") === 0) return;
    var destination;
    try { destination = new URL(link.href, window.location.href); }
    catch (_error) { return; }
    if (destination.searchParams.get("analytics") === "off") {
      storageSet(EXCLUSION_KEY, "1");
      excluded = true;
      return;
    }
    if (destination.searchParams.get("analytics") === "on") {
      storageRemove(EXCLUSION_KEY);
      excluded = false;
      return;
    }
    var store = storeName(destination);
    var product = productFromLink(link, destination);
    if (store) {
      send("store_click", { target: product + ":" + store });
      return;
    }
    if (/\.(exe|msi|msix|appx|zip|apk|pdf)$/i.test(destination.pathname)) {
      send("download_click", { target: product });
      return;
    }
    if (SITE_HOSTS.indexOf(destination.hostname.toLowerCase()) === -1 && destination.protocol.indexOf("http") === 0) {
      send("outbound_click", { target: slug(destination.hostname) });
      return;
    }
    if (destination.pathname !== window.location.pathname && product !== "site") {
      send("product_click", { target: product });
    }
  }

  function engagementBucket(milliseconds) {
    var seconds = milliseconds / 1000;
    if (seconds < 10) return "under-10s";
    if (seconds < 30) return "10-30s";
    if (seconds < 60) return "30-60s";
    if (seconds < 180) return "1-3m";
    return "3m-plus";
  }

  function sendEngagement() {
    if (engagementSent) return;
    engagementSent = true;
    var activeTime = Math.max(0, Date.now() - startedAt - hiddenTime);
    send("engagement", { engagement: engagementBucket(activeTime) }, true);
  }

  function installCounter() {
    var footer = document.querySelector(".footer-inner");
    if (!footer || document.querySelector(".visitor-counter")) return;
    fetch(API_ROOT + "/summary", { mode: "cors", credentials: "omit" })
      .then(function (response) { if (!response.ok) throw new Error("counter unavailable"); return response.json(); })
      .then(function (summary) {
        var counter = document.createElement("p");
        counter.className = "visitor-counter";
        counter.setAttribute("aria-label", "Anonymous site visit counter");
        var total = Number(summary.visits) || 0;
        counter.textContent = new Intl.NumberFormat().format(total) + (total === 1 ? " visit" : " visits") + " to the Forge";
        footer.insertBefore(counter, footer.firstChild);
      })
      .catch(function () { /* A failed counter should not leave an empty badge. */ });
  }

  document.addEventListener("click", linkEvent, { capture: true });

  var ownReferrer = SITE_HOSTS.indexOf(context.referrer) !== -1;
  send("page_view");
  if (!ownReferrer) send("visit");
  if (/404/i.test(document.title) || /\/404(?:\.html)?$/i.test(context.page)) send("not_found");

  function sendBlogView() {
    if (context.page.indexOf("dev-blog") !== -1 && window.location.hash.length > 1) {
      send("blog_view", { target: slug(window.location.hash.slice(1)) });
    }
  }
  sendBlogView();
  window.addEventListener("hashchange", sendBlogView);

  window.addEventListener("scroll", function () {
    var documentHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var percent = Math.min(100, Math.round((window.scrollY / documentHeight) * 100));
    [25, 50, 75, 100].forEach(function (depth) {
      if (percent >= depth && !scrollSent[depth]) {
        scrollSent[depth] = true;
        send("scroll_depth", { depth: depth });
      }
    });
  }, { passive: true });

  window.addEventListener("error", function () { send("js_error", { target: "script-error" }); });
  window.addEventListener("unhandledrejection", function () { send("js_error", { target: "promise-rejection" }); });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") hiddenAt = Date.now();
    else if (hiddenAt) { hiddenTime += Date.now() - hiddenAt; hiddenAt = 0; }
  });
  window.addEventListener("pagehide", sendEngagement);

  function reportPageLoad() {
    window.setTimeout(function () {
      var navigation = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (navigation && Number.isFinite(navigation.loadEventEnd)) {
        send("performance", { metric: "load", value: Math.round(navigation.loadEventEnd) });
      }
    }, 0);
  }
  if (document.readyState === "complete") reportPageLoad();
  else window.addEventListener("load", reportPageLoad, { once: true });

  if (window.PerformanceObserver) {
    try {
      var lcp = 0;
      var lcpObserver = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        if (entries.length) lcp = entries[entries.length - 1].startTime;
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      window.addEventListener("pagehide", function () {
        if (lcp) send("performance", { metric: "lcp", value: Math.round(lcp) }, true);
      });
    } catch (_error) { /* Metric is not supported in this browser. */ }

    try {
      var cls = 0;
      var clsObserver = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) { if (!entry.hadRecentInput) cls += entry.value; });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
      window.addEventListener("pagehide", function () {
        send("performance", { metric: "cls", value: Math.round(cls * 1000) / 1000 }, true);
      });
    } catch (_error) { /* Metric is not supported in this browser. */ }
  }

  installCounter();
})();
