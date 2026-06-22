(function () {
  const DEFAULT_HERO = {
    brandName: "VAP",
    brandTagline: "THE OUTSOURCING EXPERTS",
    titleLine1: "Blockbuster Sessions",
    titleLine2: "— EOFY Edition",
    dateText: "26 May 2026 | 1:00 PM – 4:00 PM AEST",
    bookLink: "Book a 30-minute session",
    hostName: "Brian Jones",
    hostTitle: "Founder and CEO of VAP",
    hostPhoto: "",
    descP1: "Join VA Platinum's Blockbuster Session - a quick, impactful 30-minute interaction with our team members.",
    descP2: "Per session is limited to one participant only. Participation will be on a first come, first served basis.",
    descP3: 'Please notify us at <b>least 72 hours</b> in advance if you cannot attend.<br><b>Unnotified no-shows may impact your eligibility for future sessions.</b>',
    topicsHint: "Kindly write topics and questions you would like to ask Brian Jones here:"
  };

  const HERO_KEY = "vap-hero-content";
  const SLOTS_KEY = "vap-time-slots";

  const DEFAULT_SLOTS = [
    { value: "26 May 2026, 1:00 PM AEST", limit: 1 },
    { value: "26 May 2026, 1:30 PM AEST", limit: 1 },
    { value: "26 May 2026, 2:00 PM AEST", limit: 1 },
    { value: "26 May 2026, 2:30 PM AEST", limit: 1 },
    { value: "26 May 2026, 3:00 PM AEST", limit: 1 },
    { value: "26 May 2026, 3:30 PM AEST", limit: 1 }
  ];

  let heroState = { ...DEFAULT_HERO };
  let slots = [];
  let entries = [];
  let isEditing = false;
  let autosaveTimer = null;

  const editableIds = [
    "brandName",
    "brandTagline",
    "titleLine1",
    "titleLine2",
    "dateText",
    "bookLink",
    "hostName",
    "hostTitle",
    "descP1",
    "descP2",
    "topicsHint"
  ];

  const statusEl = document.getElementById("saveStatus");
  const editBtn = document.getElementById("editPageBtn");
  const resetBtn = document.getElementById("resetBtn");
  const changePhotoBtn = document.getElementById("changePhotoBtn");
  const photoInput = document.getElementById("photoInput");
  const slotManager = document.getElementById("slotManager");
  const slotRows = document.getElementById("slotRows");
  const addSlotBtn = document.getElementById("addSlotBtn");
  const newSlotDate = document.getElementById("newSlotDate");
  const newSlotTime = document.getElementById("newSlotTime");
  const newSlotLimit = document.getElementById("newSlotLimit");
  const fSlotSelect = document.getElementById("fSlot");
  const form = document.getElementById("bookingForm");
  const formMsg = document.getElementById("formMsg");
  const entriesList = document.getElementById("entriesList");
  const saveAllBtn = document.getElementById("saveAllSlotsBtn");

  function flashStatus(message, isError = false) {
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.style.color = isError ? "#ff9aa3" : "#9fb0c9";

    setTimeout(() => {
      if (statusEl.textContent === message) {
        statusEl.textContent = "";
      }
    }, 2500);
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[match];
    });
  }

  async function storageGet(key) {
    const formData = new FormData();
    formData.append("action", "get");
    formData.append("key", key);

    const response = await fetch("storage.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    return data.value;
  }

  async function storageSet(key, value) {
    const formData = new FormData();
    formData.append("action", "set");
    formData.append("key", key);
    formData.append("value", value);

    const response = await fetch("storage.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    return data.success;
  }

  async function storageDelete(key) {
    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("key", key);

    const response = await fetch("storage.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    return data.success;
  }

  function renderHero() {
    editableIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = heroState[id] || "";
    });

    const descP3 = document.getElementById("descP3");
    if (descP3) descP3.innerHTML = heroState.descP3 || "";

    const hostPhotoWrap = document.getElementById("hostPhotoWrap");

    if (hostPhotoWrap) {
      if (heroState.hostPhoto) {
        hostPhotoWrap.innerHTML = `<img src="${heroState.hostPhoto}" alt="${escapeHtml(heroState.hostName)}">`;
      } else {
        hostPhotoWrap.innerHTML = `
          <div id="noPhotoState">
            <span class="ph-icon">👤</span>
            <span>No Photo</span>
          </div>
        `;
      }
    }
  }

  async function loadHero() {
    try {
      const raw = await storageGet(HERO_KEY);

      if (raw) {
        heroState = { ...DEFAULT_HERO, ...JSON.parse(raw) };
      }
    } catch (error) {
      heroState = { ...DEFAULT_HERO };
    }

    renderHero();
  }

  async function saveHero() {
    editableIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) heroState[id] = el.textContent.trim();
    });

    const descP3 = document.getElementById("descP3");
    if (descP3) heroState.descP3 = descP3.innerHTML;

    const ok = await storageSet(HERO_KEY, JSON.stringify(heroState));
    flashStatus(ok ? "Page changes saved" : "Could not save changes", !ok);
  }

  async function resetHero() {
    heroState = { ...DEFAULT_HERO };
    await storageDelete(HERO_KEY);
    renderHero();
    flashStatus("Reset to default");
  }

  function setEditing(on) {
    isEditing = on;

    if (editBtn) {
      editBtn.textContent = on ? "✓ Done Editing" : "✏ Edit Page";
      editBtn.classList.toggle("is-active", on);
    }

    if (changePhotoBtn) {
      changePhotoBtn.style.display = on ? "inline-block" : "none";
    }

    editableIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("contenteditable", on ? "true" : "false");
    });

    const descP3 = document.getElementById("descP3");
    if (descP3) descP3.setAttribute("contenteditable", on ? "true" : "false");

    if (slotManager) {
      slotManager.style.display = on ? "block" : "none";
    }
  }

  async function loadSlots() {
    try {
      const raw = await storageGet(SLOTS_KEY);

      if (raw) {
        // support legacy array-of-strings and new array-of-objects
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "string") {
          slots = parsed.map((s) => ({ value: s, limit: 1 }));
        } else {
          slots = parsed;
        }
      } else {
        slots = [...DEFAULT_SLOTS];
        await storageSet(SLOTS_KEY, JSON.stringify(slots));
      }
    } catch (error) {
      slots = [...DEFAULT_SLOTS];
    }

    renderSlots();
    populateSlotSelect();
  }

  async function saveSlots() {
    // show global saving toast
    const savingToast = showToast('Saving time slots...', { type: 'saving', persistent: true });
    const ok = await storageSet(SLOTS_KEY, JSON.stringify(slots));
    console.log('saveSlots', slots, ok);
    // remove saving toast and show result
    if (savingToast) savingToast.remove();
    if (ok) {
      showToast('Time slots saved', { type: 'success', duration: 1800 });
      flashStatus('Time slots saved');
    } else {
      showToast('Could not save time slots', { type: 'error', duration: 3000 });
      flashStatus('Could not save time slots', true);
    }

    return ok;
  }

  function showToast(message, opts = {}) {
    const { type = 'info', duration = 2200, persistent = false } = opts;
    const container = document.getElementById('toastContainer');
    if (!container) return null;

    const el = document.createElement('div');
    el.className = `toast ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;

    if (type === 'saving') {
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      el.appendChild(spinner);
    }

    const text = document.createElement('div');
    text.textContent = message;
    el.appendChild(text);

    container.appendChild(el);

    if (!persistent) {
      setTimeout(() => {
        el.remove();
      }, duration);
    }

    return el;
  }

  function populateSlotSelect() {
    if (!fSlotSelect) return;

    const currentValue = fSlotSelect.value;

    fSlotSelect.innerHTML = `<option value="">— Select a time slot —</option>`;

    slots.forEach((slot) => {
      const booked = entries.filter((e) => e.slot_datetime === slot.value).length;
      const available = Math.max(0, (slot.limit || 0) - booked);

      const option = document.createElement("option");
      option.value = slot.value;
      option.textContent = `${slot.value}${available > 0 ? ` — ${available} available` : ` — FULL`}`;
      if (available === 0) option.disabled = true;
      fSlotSelect.appendChild(option);
    });

    if (slots.some(s => s.value === currentValue)) {
      fSlotSelect.value = currentValue;
    }
  }

  function renderSlots() {
    if (!slotRows) return;

    if (!slots.length) {
      slotRows.innerHTML = `<div class="empty-state">No time slots yet. Add one below.</div>`;
      return;
    }

    slotRows.innerHTML = "";

    slots.forEach((slot, index) => {
      const row = document.createElement("div");
      row.className = "slot-row";
      row.dataset.index = index;

      // compute remaining and booked based on current entries
      const booked = entries.filter((e) => e.slot_datetime === slot.value).length;
      const remaining = Math.max(0, (slot.limit || 0) - booked);

      row.innerHTML = `
        <input type="text" value="${escapeHtml(slot.value)}" data-role="slot-text">
        <input type="number" min="1" value="${escapeHtml(slot.limit)}" data-role="slot-limit" style="width:80px;margin-left:8px;">
        <button type="button" class="icon-btn" data-action="save-slot">Save</button>
        <button type="button" class="icon-btn danger" data-action="delete-slot">Delete</button>
        <span class="booked-badge" aria-hidden="true">${booked} / ${slot.limit} booked</span>
        <span class="remaining-badge" aria-hidden="true">${remaining} left</span>
        <span class="saved-indicator" aria-hidden="true"><span class="check">✓</span>Saved</span>
      `;

      slotRows.appendChild(row);
    });
  }

  async function loadEntries() {
    try {
      const response = await fetch("get_bookings.php");
      const data = await response.json();

      entries = data.success ? data.bookings : [];
    } catch (error) {
      entries = [];
    }

    renderEntries();
    // update slot availability UI after entries load
    populateSlotSelect();
    // also refresh admin slot remaining counts
    if (slotManager && slotManager.style.display !== "none") {
      renderSlots();
    }
  }

  function renderEntries() {
    if (!entriesList) return;

    if (!entries.length) {
      entriesList.innerHTML = `<div class="empty-state">No submissions yet.</div>`;
      return;
    }

    entriesList.innerHTML = "";

    entries.forEach((entry) => {
      const card = document.createElement("div");
      card.className = "entry-card";

      card.innerHTML = `
        <div class="top-row">
          <div class="name">
            ${escapeHtml(entry.first_name)} ${escapeHtml(entry.last_name)} — ${escapeHtml(entry.company_name)}
          </div>
          <span class="slot-pill">${escapeHtml(entry.slot_datetime)}</span>
        </div>

        <div class="meta-line">
          ${escapeHtml(entry.email)} · ${escapeHtml(entry.phone)}
        </div>

        <div class="topics">
          ${escapeHtml(entry.topics)}
        </div>
      `;

      entriesList.appendChild(card);
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", async () => {
      if (isEditing) {
        setEditing(false);
        await saveHero();
        // ensure any slot edits are saved when leaving edit mode
        await saveSlots();
      } else {
        setEditing(true);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      if (confirm("Reset page content to default?")) {
        await resetHero();
      }
    });
  }

  if (changePhotoBtn && photoInput) {
    changePhotoBtn.addEventListener("click", () => {
      photoInput.click();
    });

    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = async () => {
        heroState.hostPhoto = reader.result;
        renderHero();
        await saveHero();
      };

      reader.readAsDataURL(file);
    });
  }

  if (slotRows) {
    slotRows.addEventListener("click", async (e) => {
      const button = e.target.closest("button");
      if (!button) return;

      const row = e.target.closest(".slot-row");
      if (!row) return;

      const index = Number(row.dataset.index);
      const action = button.dataset.action;

      if (action === "save-slot") {
        const input = row.querySelector('[data-role="slot-text"]');
        const limitInput = row.querySelector('[data-role="slot-limit"]');
        const value = input.value.trim();
        const limit = Number(limitInput.value) || 1;

        if (!value) return;

        slots[index] = { value, limit };
        renderSlots();
        populateSlotSelect();
        await saveSlots();
        showSavedIndicator(index);
      }

      if (action === "delete-slot") {
        if (!confirm("Remove this time slot?")) return;

        slots.splice(index, 1);
        renderSlots();
        populateSlotSelect();
        await saveSlots();
      }
    });

    // auto-save when inputs lose focus (so admin doesn't have to click Save)
    slotRows.addEventListener("blur", async (e) => {
      const input = e.target.closest("input");
      if (!input) return;

      const row = e.target.closest(".slot-row");
      if (!row) return;

      const index = Number(row.dataset.index);
      const textInput = row.querySelector('[data-role="slot-text"]');
      const limitInput = row.querySelector('[data-role="slot-limit"]');
      const value = textInput.value.trim();
      const limit = Number(limitInput.value) || 1;

      if (!value) return;

      slots[index] = { value, limit };
      await saveSlots();
      populateSlotSelect();
      showSavedIndicator(index);
    }, true);

    // live-update when admin types or changes limit so dropdown reflects changes immediately
    slotRows.addEventListener('input', (e) => {
      const input = e.target.closest('input');
      if (!input) return;

      const row = e.target.closest('.slot-row');
      if (!row) return;

      const index = Number(row.dataset.index);
      const textInput = row.querySelector('[data-role="slot-text"]');
      const limitInput = row.querySelector('[data-role="slot-limit"]');
      const value = textInput.value.trim();
      const limit = Number(limitInput.value) || 1;

      // update in-memory slots and remaining badge
      slots[index] = { value, limit };

      const remainingBadge = row.querySelector('.remaining-badge');
      const bookedBadge = row.querySelector('.booked-badge');
      const booked = entries.filter((entry) => entry.slot_datetime === value).length;
      const remaining = Math.max(0, (limit || 0) - booked);
      if (remainingBadge) remainingBadge.textContent = `${remaining} left`;
      if (bookedBadge) bookedBadge.textContent = `${booked} / ${limit} booked`;

      // update dropdown text immediately
      populateSlotSelect();

      // debounce auto-save after typing stops
      clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(async () => {
        const ok = await saveSlots();
        if (ok) showSavedIndicator(index);
      }, 900);
    });
  }

  function showSavedIndicator(index) {
    const row = slotRows.querySelector(`.slot-row[data-index="${index}"]`);
    if (!row) return;
    const indicator = row.querySelector('.saved-indicator');
    if (!indicator) return;
    indicator.classList.add('show');
    setTimeout(() => indicator.classList.remove('show'), 1400);
  }

  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', async () => {
      await saveSlots();
      populateSlotSelect();
      flashStatus('All slots saved');
      // show indicator for all rows briefly
      slots.forEach((_, i) => showSavedIndicator(i));
    });
  }

  function formatSlotLabel(dateStr, timeStr) {
    try {
      const d = new Date(`${dateStr}T${timeStr}`);
      if (isNaN(d)) return `${dateStr} ${timeStr}`;

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm} AEST`;
    } catch (e) {
      return `${dateStr} ${timeStr}`;
    }
  }

  if (addSlotBtn && newSlotDate && newSlotTime && newSlotLimit) {
    addSlotBtn.addEventListener("click", async () => {
      const dateVal = newSlotDate.value;
      const timeVal = newSlotTime.value;
      const limit = Number(newSlotLimit.value) || 1;

      if (!dateVal || !timeVal) return;

      const value = formatSlotLabel(dateVal, timeVal);

      slots.push({ value, limit });

      newSlotDate.value = "";
      newSlotTime.value = "";
      newSlotLimit.value = 1;

      renderSlots();
      populateSlotSelect();
      await saveSlots();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("first_name", document.getElementById("fFirst").value.trim());
      formData.append("last_name", document.getElementById("fLast").value.trim());
      formData.append("company_name", document.getElementById("fCompany").value.trim());
      formData.append("email", document.getElementById("fEmail").value.trim());
      formData.append("phone", document.getElementById("fPhone").value.trim());
      formData.append("slot_datetime", document.getElementById("fSlot").value);
      formData.append("topics", document.getElementById("fTopics").value.trim());

      try {
        const response = await fetch("save_booking.php", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          form.reset();

          if (formMsg) {
            formMsg.textContent = "✓ Thanks — your booking has been saved.";
            formMsg.classList.add("show");

            setTimeout(() => {
              formMsg.classList.remove("show");
            }, 3500);
          }

          await loadEntries();
        } else {
          alert(result.message || "Failed to save booking.");
        }
      } catch (error) {
        alert("Error saving booking. Check your PHP and database connection.");
      }
    });
  }

  async function init() {
    setEditing(false);
    await loadHero();
    await loadSlots();
    await loadEntries();
  }

  init();
})();