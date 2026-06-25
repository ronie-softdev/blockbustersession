(function () {
  let slots = [];
  let registrations = [];
  let editMode = false;
  let bannerSrc = "";

  const $ = id => document.getElementById(id);
  const editables = () => document.querySelectorAll("[data-key]");

  const bannerImg = $("bannerImg");
  const bannerPlaceholder = $("bannerPlaceholder");
  const bannerOverlay = $("bannerOverlay");
  const bannerFileInput = $("bannerFileInput");
  const editBtn = $("editBtn");
  const editBtnText = $("editBtnText");
  const fSlot = $("f_slot");
  const slotAvailability = $("slotAvailability");
  const slotAvailabilityText = $("slotAvailabilityText");
  const slotList = $("slotList");
  const newSlotInput = $("newSlotInput");
  const newSlotDate = $("newSlotDate");
  const newSlotTime = $("newSlotTime");
  const newSlotCapacity = $("newSlotCapacity");
  const introText = $("introText");

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s ?? "";
    return d.innerHTML;
  }

  function setEditable(on) {
    editables().forEach(el => {
      el.setAttribute("contenteditable", on ? "true" : "false");
    });
  }

  function applyBanner(src) {
    if (!bannerImg || !bannerPlaceholder) return;

    if (src && String(src).trim() !== "") {
      bannerImg.src = src;
      bannerImg.style.display = "block";
      bannerPlaceholder.style.display = "none";
    } else {
      bannerImg.removeAttribute("src");
      bannerImg.style.display = "none";
      bannerPlaceholder.style.display = "flex";
    }
  }

  async function loadSessions() {
    try {
      const res = await fetch("get_sessions.php?t=" + Date.now());
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to load sessions.");
        return;
      }

      const current = data.sessions.find(s => Number(s.is_current) === 1);
      const archived = data.sessions.filter(s => s.status === "archived");

      const currentTitle = $("currentSessionTitle");
      const archivedList = $("archivedSessionList");

      if (current && currentTitle) {
        currentTitle.textContent = current.title;
      }

      if (archivedList) {
        archivedList.innerHTML = "";

        if (!archived.length) {
          archivedList.textContent = "No archived sessions yet.";
        } else {
          archived.forEach(session => {
            const item = document.createElement("div");
            item.className = "session-history-item";

            item.innerHTML = `
              <div class="session-history-left">
                <div class="session-history-title">${esc(session.title)}</div>
                <div class="session-history-meta">
                  Status: ${esc(session.status)} · Booking: ${esc(session.booking_status)}
                </div>
              </div>
            `;

            archivedList.appendChild(item);
          });
        }
      }
    } catch (err) {
      console.error("Load sessions error:", err);
      alert("Cannot load sessions.");
    }
  }

  async function loadPageContent() {
    try {
      const res = await fetch("load_content.php?t=" + Date.now());
      const data = await res.json();

      bannerSrc = data.banner_src || "";
      applyBanner(bannerSrc);

      if (!data.page_data || String(data.page_data).trim() === "") return;

      try {
        const pageData = JSON.parse(data.page_data);

        Object.entries(pageData).forEach(([key, html]) => {
          const el = document.querySelector(`[data-key="${key}"]`);
          if (el) el.innerHTML = html;
        });
      } catch (e) {
        console.warn("page_data is not JSON. Text load skipped.");
      }
    } catch (err) {
      console.error("Error loading page content:", err);
    }
  }

  async function savePageContent() {
    const pageData = {};

    editables().forEach(el => {
      const key = el.dataset.key;
      if (key) pageData[key] = el.innerHTML;
    });

    const fd = new FormData();
    fd.append("bannerSrc", bannerSrc || "");
    fd.append("pageData", JSON.stringify(pageData));

    const res = await fetch("save_content.php", {
      method: "POST",
      body: fd
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to save page content.");
    }

    return data;
  }

  function updateToolbarState() {
    document.querySelectorAll(".editor-btn[data-command]").forEach(btn => {
      const cmd = btn.dataset.command;

      if (["bold", "italic", "underline"].includes(cmd)) {
        try {
          btn.classList.toggle("active", document.queryCommandState(cmd));
        } catch (_) {}
      }
    });
  }

  if (introText) {
    introText.addEventListener("keyup", updateToolbarState);
    introText.addEventListener("mouseup", updateToolbarState);
  }

  document.addEventListener("selectionchange", () => {
    if (editMode) updateToolbarState();
  });

  document.querySelectorAll(".editor-btn").forEach(btn => {
    btn.addEventListener("mousedown", e => e.preventDefault());

    btn.addEventListener("click", () => {
      if (!editMode || !introText) return;

      const command = btn.dataset.command;
      if (!command) return;

      introText.focus();

      if (command === "createLink") {
        const url = prompt("Enter URL, include https://:");
        if (url && url.trim()) {
          document.execCommand("createLink", false, url.trim());
        }
      } else {
        document.execCommand(command, false, null);
      }

      updateToolbarState();
      introText.focus();
    });
  });

  if (bannerOverlay && bannerFileInput) {
    bannerOverlay.addEventListener("click", () => {
      if (editMode) bannerFileInput.click();
    });

    bannerFileInput.addEventListener("change", () => {
      const file = bannerFileInput.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please upload image file only.");
        return;
      }

      const reader = new FileReader();

      reader.onload = e => {
        bannerSrc = e.target.result;
        applyBanner(bannerSrc);
      };

      reader.readAsDataURL(file);
    });
  }

  function buildSlotText(slot) {
    const available = Number(slot.available ?? (slot.capacity - slot.booked));
    return available > 0
      ? `${slot.label} — ${available} available`
      : `${slot.label} — FULL`;
  }

  function updateSlotAvailability() {
    const openCount = slots.filter(s => Number(s.available) > 0).length;

    if (!slotAvailability || !slotAvailabilityText) return;

    slotAvailabilityText.textContent =
      openCount > 0 ? `${openCount} available` : "No slots available";

    slotAvailability.style.opacity = openCount > 0 ? "1" : "0.6";
  }

  function renderDropdown() {
    if (!fSlot) return;

    fSlot.innerHTML = '<option value="">— Select a time slot —</option>';

    slots.forEach(slot => {
      if (Number(slot.available) <= 0) return;

      const option = document.createElement("option");
      option.value = slot.label;
      option.textContent = buildSlotText(slot);
      fSlot.appendChild(option);
    });

    updateSlotAvailability();
  }

  function renderSlotEditor() {
    if (!slotList) return;

    slotList.innerHTML = "";

    slots.forEach(slot => {
      const booked = Number(slot.booked || 0);
      const capacity = Number(slot.capacity || 1);
      const available = Math.max(capacity - booked, 0);

      const row = document.createElement("div");
      row.className = "slot-row";

      row.innerHTML = `
        <div class="slot-row-main">
          <input class="slot-row-text" type="text" value="${esc(slot.label)}">
          <div class="slot-row-subtext">${booked} / ${capacity} booked</div>
        </div>

        <div class="slot-row-controls">
          <input class="slot-row-capacity" type="number" min="1" value="${capacity}">
          <button class="slot-row-save" type="button">Save</button>
          <button class="slot-del-btn" type="button">Delete</button>
          <span class="slot-left-badge">${available} left</span>
        </div>
      `;

      const labelInput = row.querySelector(".slot-row-text");
      const capacityInput = row.querySelector(".slot-row-capacity");
      const saveBtn = row.querySelector(".slot-row-save");
      const delBtn = row.querySelector(".slot-del-btn");

      saveBtn.addEventListener("click", async () => {
        const newLabel = labelInput.value.trim();
        const newCapacity = Math.max(1, Number(capacityInput.value));

        if (!newLabel) {
          alert("Slot label is required.");
          return;
        }

        const fd = new FormData();
        fd.append("id", slot.id);
        fd.append("label", newLabel);
        fd.append("capacity", newCapacity);

        try {
          const res = await fetch("update_slot.php", {
            method: "POST",
            body: fd
          });

          const data = await res.json();
          alert(data.message);

          if (data.success) {
            await loadSlotsFromDatabase();
            await loadBookingsFromDatabase();
          }
        } catch (err) {
          console.error("Update slot error:", err);
          alert("Failed to update slot.");
        }
      });

      delBtn.addEventListener("click", async () => {
        if (booked > 0) {
          alert("Cannot delete this slot because it already has bookings.");
          return;
        }

        if (!confirm("Delete this slot?")) return;

        const fd = new FormData();
        fd.append("id", slot.id);

        try {
          const res = await fetch("delete_slot.php", {
            method: "POST",
            body: fd
          });

          const data = await res.json();
          alert(data.message);

          if (data.success) {
            await loadSlotsFromDatabase();
          }
        } catch (err) {
          console.error("Delete slot error:", err);
          alert("Failed to delete slot.");
        }
      });

      slotList.appendChild(row);
    });
  }

  async function loadSlotsFromDatabase() {
    try {
      const res = await fetch("get_slots.php?t=" + Date.now());
      const data = await res.json();

      if (data.success === false) {
        alert(data.message);
        return;
      }

      slots = data.map(slot => ({
        id: Number(slot.id),
        label: slot.label,
        capacity: Number(slot.capacity),
        booked: Number(slot.booked),
        available: Number(slot.available)
      }));

      renderDropdown();
      renderSlotEditor();
    } catch (err) {
      console.error("Error loading slots:", err);
      alert("Cannot load slots from database.");
    }
  }

  function renderRegs() {
    const list = $("regList");
    const empty = $("regEmpty");

    if (!list || !empty) return;

    list.innerHTML = "";

    if (!registrations.length) {
      list.appendChild(empty);
      return;
    }

    registrations.forEach(r => {
      const d = document.createElement("div");
      d.className = "reg-item";

      d.innerHTML = `
        <div class="reg-header">
          <span class="reg-name">${esc(r.firstName)} ${esc(r.lastName)} — ${esc(r.company)}</span>
          <span class="reg-slot">${esc(r.slot)}</span>
        </div>
        <div class="reg-meta">${esc(r.email)} · ${esc(r.phone)}</div>
        <div class="reg-topics">${esc(r.topics)}</div>
      `;

      list.appendChild(d);
    });
  }

  async function loadBookingsFromDatabase() {
    try {
      const res = await fetch("get_bookings.php?t=" + Date.now());
      const data = await res.json();

      if (data.success === false) {
        alert(data.message);
        return;
      }

      registrations = data.map(b => ({
        firstName: b.first_name,
        lastName: b.last_name,
        company: b.company_name ?? b.company,
        email: b.email,
        phone: b.phone,
        slot: b.slot_datetime ?? b.slot_label,
        topics: b.topics
      }));

      renderRegs();
    } catch (err) {
      console.error("Error loading bookings:", err);
      alert("Cannot load bookings from database.");
    }
  }

  function createSlotLabel(dateStr, timeStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);

    const start = new Date(year, month - 1, day, hour, minute);
    const end = new Date(start.getTime() + 30 * 60000);

    const dateText = start.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const timeText = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const endText = end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    return `${dateText} · ${timeText} – ${endText} AEST`;
  }

  if ($("addSlotBtn")) {
    $("addSlotBtn").addEventListener("click", async () => {
      const dateVal = newSlotDate.value;
      const timeVal = newSlotTime.value;
      const customText = newSlotInput.value.trim();

      const slotLabel =
        dateVal && timeVal ? createSlotLabel(dateVal, timeVal) : customText;

      if (!slotLabel) {
        alert("Please select date and time or enter a custom slot label.");
        return;
      }

      const capacity = Math.max(1, Number(newSlotCapacity.value) || 1);

      const fd = new FormData();
      fd.append("label", slotLabel);
      fd.append("capacity", capacity);

      try {
        const res = await fetch("add_slot.php", {
          method: "POST",
          body: fd
        });

        const data = await res.json();
        alert(data.message);

        if (data.success) {
          newSlotInput.value = "";
          newSlotDate.value = "";
          newSlotTime.value = "";
          newSlotCapacity.value = "1";

          await loadSlotsFromDatabase();
        }
      } catch (err) {
        console.error("Add slot error:", err);
        alert("Failed to add slot.");
      }
    });
  }

  if ($("createSessionBtn")) {
    $("createSessionBtn").addEventListener("click", async () => {
      const title = prompt("Enter new session title:");

      if (!title || !title.trim()) return;

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("banner", "");
      fd.append("description", "");

      try {
        const res = await fetch("create_session.php", {
          method: "POST",
          body: fd
        });

        const data = await res.json();
        alert(data.message);

        if (data.success) {
          await loadSessions();
          await loadPageContent();
          await loadSlotsFromDatabase();
          await loadBookingsFromDatabase();
        }
      } catch (err) {
        console.error("Create session error:", err);
        alert("Failed to create session.");
      }
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", async () => {
      if (!editMode) {
        editMode = true;

        editBtn.classList.add("saving");
        editBtnText.textContent = "Save Changes";
        document.body.classList.add("edit-mode");
        setEditable(true);
        renderSlotEditor();

        return;
      }

      try {
        await savePageContent();
        alert("Changes saved successfully!");
      } catch (err) {
        console.error("Save content error:", err);
        alert("Failed to save changes.");
        return;
      }

      editMode = false;

      editBtn.classList.remove("saving");
      editBtnText.textContent = "Edit Page";
      document.body.classList.remove("edit-mode");
      setEditable(false);

      document.querySelectorAll(".editor-btn").forEach(b => {
        b.classList.remove("active");
      });
    });
  }

  if ($("resetBtn")) {
    $("resetBtn").addEventListener("click", () => {
      alert("Reset is disabled while connected to database.");
    });
  }

  if ($("regToggleBtn")) {
    const regToggleBtn = $("regToggleBtn");
    const regContainer = $("regContainer");

    regToggleBtn.addEventListener("click", () => {
      regContainer.classList.toggle("collapsed");
      regToggleBtn.classList.toggle("collapsed");
    });
  }

  if ($("bookingForm")) {
    $("bookingForm").addEventListener("submit", async e => {
      e.preventDefault();

      const v = {
        firstName: $("f_firstName").value.trim(),
        lastName: $("f_lastName").value.trim(),
        company: $("f_company").value.trim(),
        email: $("f_email").value.trim(),
        phone: $("f_phone").value.trim(),
        slot: fSlot ? fSlot.value : "",
        topics: $("f_topics").value.trim()
      };

      if (Object.values(v).some(x => !x)) {
        alert("Please fill in all required fields.");
        return;
      }

      const fd = new FormData();

      Object.entries(v).forEach(([k, val]) => {
        fd.append(k, val);
      });

      try {
        const res = await fetch("submit_booking.php", {
          method: "POST",
          body: fd
        });

        const data = await res.json();
        alert(data.message);

        if (data.success) {
          e.target.reset();

          await loadSlotsFromDatabase();
          await loadBookingsFromDatabase();
        }
      } catch (err) {
        console.error("Submit error:", err);
        alert("Submit failed. Check your PHP/XAMPP connection.");
      }
    });
  }

  setEditable(false);
  applyBanner("");

  loadSessions();
  loadPageContent();
  loadSlotsFromDatabase();
  loadBookingsFromDatabase();

})();