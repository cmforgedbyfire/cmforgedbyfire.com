(function () {
  const host = window.location.hostname;
  const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(host) || window.location.protocol === "file:";
  const defaultEndpoint = isLocalPreview ? "http://127.0.0.1:7793" : "https://api.cmforgedbyfire.com/otto";
  if (!isLocalPreview) {
    localStorage.removeItem("OTTO_API_URL");
  }
  const endpointOverride = isLocalPreview ? (window.OTTO_API_URL || localStorage.getItem("OTTO_API_URL")) : "";
  const apiBase = (endpointOverride || defaultEndpoint).replace(/\/$/, "");
  const sessionKey = "otto_session_id";
  const transcriptKey = "otto_transcript";
  const isCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  let sessionId = sessionStorage.getItem(sessionKey);

  if (!sessionId) {
    sessionId = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(sessionKey, sessionId);
  }

  function ensureWidget() {
    if (!document.querySelector("[data-otto-panel]")) {
      document.body.insertAdjacentHTML(
        "beforeend",
        `<aside class="otto-chat-panel" data-otto-panel aria-label="OTTO chat">
          <div class="otto-chat-head">
            <div class="otto-chat-title">
              <img src="assets/logos/otto.png" alt="" />
              <div>
                <strong>OTTO</strong>
                <span data-otto-status>Checking backend...</span>
              </div>
            </div>
            <button class="otto-chat-close" type="button" data-otto-close aria-label="Close OTTO chat">×</button>
          </div>
          <div class="otto-chat-messages" data-otto-messages></div>
          <form class="otto-chat-form" data-otto-form>
            <div class="otto-chat-actions">
              <button class="otto-chat-plus" type="button" data-otto-actions aria-label="Open chat actions" aria-expanded="false">+</button>
              <div class="otto-action-menu" data-otto-action-menu hidden>
                <button type="button" data-otto-new-chat>New chat</button>
                <button type="button" data-otto-export-chat>Export chat</button>
              </div>
            </div>
            <input data-otto-input type="text" maxlength="1200" autocomplete="off" placeholder="Ask OTTO..." />
            <button class="otto-chat-send" type="submit" aria-label="Send message">Send</button>
          </form>
        </aside>`
      );
    }

    if (!document.querySelector(".otto-chat-launcher[data-otto-launcher]")) {
      document.body.insertAdjacentHTML(
        "beforeend",
        `<button class="otto-chat-launcher" type="button" data-otto-launcher aria-label="Open OTTO chat" aria-expanded="false">
          <img src="assets/logos/otto.png" alt="" />
          <span>OTTO</span>
        </button>`
      );
    }
  }

  ensureWidget();

  const messages = document.querySelector("[data-otto-messages]");
  const form = document.querySelector("[data-otto-form]");
  const input = document.querySelector("[data-otto-input]");
  const status = document.querySelector("[data-otto-status]");
  const launchers = Array.from(document.querySelectorAll("[data-otto-launcher]"));
  const panel = document.querySelector("[data-otto-panel]");
  const closeBtn = document.querySelector("[data-otto-close]");
  const actionsBtn = document.querySelector("[data-otto-actions]");
  const actionMenu = document.querySelector("[data-otto-action-menu]");
  const newChatBtn = document.querySelector("[data-otto-new-chat]");
  const exportChatBtn = document.querySelector("[data-otto-export-chat]");
  const starterMessage = "Ask me about the Forged By Fire knowledge base, tools, learning tracks, or practical project direction.";
  const transcript = [];

  if (!messages || !form || !input || !launchers.length || !panel) {
    return;
  }

  function setStatus(text, mode) {
    if (!status) return;
    status.textContent = text;
    status.dataset.state = mode || "idle";
  }

  function saveTranscript() {
    sessionStorage.setItem(transcriptKey, JSON.stringify(transcript));
  }

  function renderMessage(role, text, sources) {
    const item = document.createElement("div");
    item.className = `otto-message otto-message-${role}`;

    const label = document.createElement("span");
    label.className = "otto-message-label";
    label.textContent = role === "user" ? "You" : "OTTO";

    const body = document.createElement("p");
    body.textContent = text;

    item.append(label, body);

    if (sources && sources.length) {
      const sourceLine = document.createElement("small");
      sourceLine.textContent = `Sources: ${sources.slice(0, 3).join(", ")}`;
      item.appendChild(sourceLine);
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(role, text, sources) {
    renderMessage(role, text, sources);
    transcript.push({ role, text, sources: sources || [], timestamp: new Date().toISOString() });
    saveTranscript();
  }

  function loadTranscript() {
    const saved = sessionStorage.getItem(transcriptKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          transcript.splice(0, transcript.length, ...parsed);
          messages.replaceChildren();
          transcript.forEach((item) => renderMessage(item.role, item.text, item.sources || []));
          return;
        }
      } catch (error) {
        sessionStorage.removeItem(transcriptKey);
      }
    }
    addMessage("otto", starterMessage);
  }

  function resetMessages() {
    messages.replaceChildren();
    transcript.length = 0;
    sessionStorage.removeItem(transcriptKey);
    sessionId = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(sessionKey, sessionId);
    addMessage("otto", starterMessage);
  }

  function openPanel() {
    panel.classList.add("open");
    launchers.forEach((button) => button.setAttribute("aria-expanded", "true"));
    if (!isCoarsePointer) {
      input.focus();
    }
  }

  function clearLocalChatSession() {
    sessionStorage.removeItem(transcriptKey);
    sessionStorage.removeItem(sessionKey);
  }

  function closePanel() {
    panel.classList.remove("open");
    launchers.forEach((button) => button.setAttribute("aria-expanded", "false"));
    closeActionMenu();
    launchers[0].focus();
  }

  function closeActionMenu() {
    if (!actionsBtn || !actionMenu) return;
    actionMenu.hidden = true;
    actionsBtn.setAttribute("aria-expanded", "false");
  }

  function toggleActionMenu() {
    if (!actionsBtn || !actionMenu) return;
    const shouldOpen = actionMenu.hidden;
    actionMenu.hidden = !shouldOpen;
    actionsBtn.setAttribute("aria-expanded", String(shouldOpen));
  }

  function startNewChat() {
    resetMessages();
    setStatus("New chat ready", "ready");
    closeActionMenu();
    if (!isCoarsePointer) {
      input.focus();
    }
  }

  function exportTranscript() {
    const payload = {
      session_id: sessionId,
      exported_at: new Date().toISOString(),
      messages: transcript,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `otto-chat-${sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    closeActionMenu();
    if (!isCoarsePointer) {
      input.focus();
    }
  }

  launchers.forEach((launcher) => {
    launcher.addEventListener("click", () => {
      if (panel.classList.contains("open")) {
        closePanel();
      } else {
        openPanel();
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closePanel);
  }

  if (actionsBtn) {
    actionsBtn.addEventListener("click", toggleActionMenu);
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", startNewChat);
  }

  if (exportChatBtn) {
    exportChatBtn.addEventListener("click", exportTranscript);
  }

  document.addEventListener("click", (event) => {
    if (!actionMenu || actionMenu.hidden) return;
    if (event.target === actionsBtn || actionMenu.contains(event.target)) return;
    closeActionMenu();
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    const target = (link.getAttribute("target") || "").toLowerCase();
    if (target && target !== "_self") return;
    try {
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) {
        clearLocalChatSession();
      }
    } catch (error) {
      return;
    }
  });

  loadTranscript();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    input.disabled = true;
    addMessage("user", text);
    setStatus("OTTO is thinking...", "busy");

    try {
      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      addMessage("otto", data.reply || "I did not get a response.", [...(data.sources || []), ...(data.web_sources || [])]);
      setStatus(`Online via ${data.model || "OTTO"}`, "ready");
    } catch (error) {
      addMessage(
        "otto",
        `I cannot reach OTTO right now. ${error.message || "The public chat backend may not be running yet."}`
      );
      setStatus("Backend offline", "offline");
    } finally {
      input.disabled = false;
      if (!isCoarsePointer) {
        input.focus();
      }
    }
  });

  fetch(`${apiBase}/health`, { method: "GET" })
    .then((response) => {
      if (!response.ok) throw new Error("offline");
      return response.json();
    })
    .then((data) => setStatus(`Online via ${data.model || "OTTO"}`, "ready"))
    .catch(() => setStatus("Preview mode - backend offline", "offline"));
})();
