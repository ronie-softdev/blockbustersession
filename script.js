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

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s ?? "";
    return d.innerHTML;
  }

  function buildSlotText(slot) {
    const available = Number(slot.available ?? (slot.capacity - slot.booked));
    return available > 0
      ? `${slot.label} — ${available} available`
      : `${slot.label} — FULL`;
  }

  function updateSlotAvailability() {
    const openCount = slots.filter(slot => Number(slot.available) > 0).length;

    if (!slotAvailability || !slotAvailabilityText) return;

    slotAvailabilityText.textContent =
      openCount > 0 ? `${openCount} available` : "No slots available";

    slotAvailability.style.opacity = openCount > 0 ? "1" : "0.6";
  }

  function renderDropdown() {
    if (!fSlot) return;

    fSlot.innerHTML = '<option value="">— Select a time slot —</option>';

    slots.forEach(slot => {
      const available = Number(slot.available);

      if (available <= 0) return;

      const option = document.createElement("option");
      option.value = slot.label;
      option.textContent = buildSlotText(slot);
      fSlot.appendChild(option);
    });

    updateSlotAvailability();
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

  async function loadSlotsFromDatabase() {
    try {
      const res = await fetch("get_slots.php");
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
    } catch (error) {
      console.error("Error loading slots:", error);
      alert("Cannot load slots from database.");
    }
  }

  async function loadBookingsFromDatabase() {
    try {
      const res = await fetch("get_bookings.php");
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
    } catch (error) {
      console.error("Error loading bookings:", error);
      alert("Cannot load bookings from database.");
    }
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
        } catch (error) {
          console.error("Update slot error:", error);
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
        } catch (error) {
          console.error("Delete slot error:", error);
          alert("Failed to delete slot.");
        }
      });

      slotList.appendChild(row);
    });
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

      let slotLabel = "";

      if (dateVal && timeVal) {
        slotLabel = createSlotLabel(dateVal, timeVal);
      } else if (customText) {
        slotLabel = customText;
      }

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
      } catch (error) {
        console.error("Add slot error:", error);
        alert("Failed to add slot.");
      }
    });
  }

  function setEditable(on) {
    editables().forEach(el => {
      el.setAttribute("contenteditable", on ? "true" : "false");
    });
  }

  function applyBanner(src) {
    if (!bannerImg || !bannerPlaceholder) return;

    if (src) {
      bannerImg.src = src;
      bannerImg.style.display = "block";
      bannerPlaceholder.style.display = "none";
    } else {
      bannerImg.style.display = "none";
      bannerPlaceholder.style.display = "flex";
    }
  }

  if (bannerOverlay && bannerFileInput) {
    bannerOverlay.addEventListener("click", () => {
      if (editMode) bannerFileInput.click();
    });

    bannerFileInput.addEventListener("change", () => {
      const file = bannerFileInput.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = e => {
        bannerSrc = e.target.result;
        applyBanner(bannerSrc);
      };

      reader.readAsDataURL(file);
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", () => {
      editMode = !editMode;

      if (editMode) {
        editBtn.classList.add("saving");
        editBtnText.textContent = "Save Changes";
        document.body.classList.add("edit-mode");
        setEditable(true);
        renderSlotEditor();
      } else {
        editBtn.classList.remove("saving");
        editBtnText.textContent = "Edit Page";
        document.body.classList.remove("edit-mode");
        setEditable(false);
      }
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
        slot: fSlot.value,
        topics: $("f_topics").value.trim()
      };

      if (Object.values(v).some(x => !x)) {
        alert("Please fill in all required fields.");
        return;
      }

      const fd = new FormData();
      fd.append("firstName", v.firstName);
      fd.append("lastName", v.lastName);
      fd.append("company", v.company);
      fd.append("email", v.email);
      fd.append("phone", v.phone);
      fd.append("slot", v.slot);
      fd.append("topics", v.topics);

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
      } catch (error) {
        console.error("Submit error:", error);
        alert("Submit failed. Check your PHP/XAMPP connection.");
      }
    });
  }

  setEditable(false);
  applyBanner("");
  loadSlotsFromDatabase();
  loadBookingsFromDatabase();
})();