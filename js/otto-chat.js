(function () {
  const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname) || window.location.protocol === "file:";
  const defaultEndpoint = isLocalPreview ? "http://127.0.0.1:8790" : "https://api.cmforgedbyfire.com/otto";
  const apiBase = (window.OTTO_API_URL || localStorage.getItem("OTTO_API_URL") || defaultEndpoint).replace(/\/$/, "");
  const sessionKey = "otto_session_id";
  let sessionId = localStorage.getItem(sessionKey);

  if (!sessionId) {
    sessionId = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(sessionKey, sessionId);
  }

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

  transcript.push({ role: "otto", text: starterMessage, sources: [], timestamp: new Date().toISOString() });

  function setStatus(text, mode) {
    if (!status) return;
    status.textContent = text;
    status.dataset.state = mode || "idle";
  }

  function addMessage(role, text, sources) {
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
    transcript.push({ role, text, sources: sources || [], timestamp: new Date().toISOString() });
  }

  function resetMessages() {
    messages.replaceChildren();
    transcript.length = 0;
    addMessage("otto", starterMessage);
  }

  function openPanel() {
    panel.classList.add("open");
    launchers.forEach((button) => button.setAttribute("aria-expanded", "true"));
    input.focus();
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
    sessionId = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(sessionKey, sessionId);
    resetMessages();
    setStatus("New chat ready", "ready");
    closeActionMenu();
    input.focus();
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
    input.focus();
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
      addMessage("otto", data.reply || "I did not get a response.", data.sources || []);
      setStatus(`Online via ${data.model || "OTTO"}`, "ready");
    } catch (error) {
      addMessage(
        "otto",
        "I cannot reach OTTO right now. The public chat backend may not be running yet."
      );
      setStatus("Backend offline", "offline");
    } finally {
      input.disabled = false;
      input.focus();
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
