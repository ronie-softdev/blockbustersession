(function () {
  let slots = [];

  const $ = id => document.getElementById(id);

  const bannerImg = $("bannerImg");
  const bannerPlaceholder = $("bannerPlaceholder");
  const fSlot = $("f_slot");
  const slotAvailability = $("slotAvailability");
  const slotAvailabilityText = $("slotAvailabilityText");
  const bookingForm = $("bookingForm");

  function applyBanner(src) {
    if (!bannerImg || !bannerPlaceholder) return;

    if (src && String(src).trim() !== "") {
      bannerImg.onload = () => {
        bannerImg.style.display = "block";
        bannerPlaceholder.style.display = "none";
      };

      bannerImg.onerror = () => {
        bannerImg.removeAttribute("src");
        bannerImg.style.display = "none";
        bannerPlaceholder.style.display = "flex";
      };

      bannerImg.src = src;
    } else {
      bannerImg.removeAttribute("src");
      bannerImg.style.display = "none";
      bannerPlaceholder.style.display = "flex";
    }
  }

  async function loadPageContent() {
    try {
      const res = await fetch("../load_content.php?t=" + Date.now());
      const data = await res.json();

      applyBanner(data.banner_src || "");

      if (data.page_data) {
        try {
          const pageData = JSON.parse(data.page_data);

          Object.entries(pageData).forEach(([key, html]) => {
            const el = document.querySelector(`[data-key="${key}"]`);
            if (el) el.innerHTML = html;
          });
        } catch {
          const introText = $("introText");
          if (introText) introText.innerHTML = data.page_data;
        }
      }
    } catch (err) {
      console.error("Error loading page content:", err);
    }
  }

  function buildSlotText(slot) {
    const available = Number(slot.available ?? 0);

    return available > 0
      ? `${slot.label} — ${available} available`
      : `${slot.label} — FULL`;
  }

  function updateSlotAvailability() {
    if (!slotAvailability || !slotAvailabilityText) return;

    const openCount = slots.filter(s => Number(s.available) > 0).length;

    slotAvailabilityText.textContent =
      openCount > 0 ? `${openCount} available` : "No slots available";

    slotAvailability.style.opacity = openCount > 0 ? "1" : "0.6";
  }

  function renderDropdown() {
    if (!fSlot) return;

    fSlot.innerHTML = `<option value="">— Select a time slot —</option>`;

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

  async function loadSlotsFromDatabase() {
    try {
      const res = await fetch("../get_slots.php?t=" + Date.now());
      const data = await res.json();

      if (data.success === false) {
        alert(data.message || "Cannot load slots.");
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
    } catch (err) {
      console.error("Error loading slots:", err);
      alert("Cannot load slots from database.");
    }
  }

  async function submitBooking(e) {
    e.preventDefault();

    const v = {
      firstName: $("f_firstName")?.value.trim() || "",
      lastName: $("f_lastName")?.value.trim() || "",
      company: $("f_company")?.value.trim() || "",
      email: $("f_email")?.value.trim() || "",
      phone: $("f_phone")?.value.trim() || "",
      slot: fSlot?.value || "",
      topics: $("f_topics")?.value.trim() || ""
    };

    if (Object.values(v).some(value => !value)) {
      alert("Please fill in all required fields.");
      return;
    }

    const fd = new FormData();

    Object.entries(v).forEach(([key, value]) => {
      fd.append(key, value);
    });

    try {
      const res = await fetch("../submit_booking.php", {
        method: "POST",
        body: fd
      });

      const text = await res.text();
      console.log("PHP RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        alert("PHP returned invalid response. Please check Console.");
        return;
      }

      alert(data.message);

      if (data.success) {
        e.target.reset();
        await loadSlotsFromDatabase();
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Submit failed: " + err.message);
    }
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", submitBooking);
  }

  applyBanner("");
  loadPageContent();
  loadSlotsFromDatabase();
})();