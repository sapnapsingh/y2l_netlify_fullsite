document.addEventListener("DOMContentLoaded", function () {
  console.log("♟️ Chess Tournament Form (final unified)");

  const form = document.getElementById("tournament-registration-form");
  const loader = document.getElementById("submitting-overlay");

  const hasUscfRadios = document.querySelectorAll("input[name='hasUscf']");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");
  const uscfIdField = document.querySelector("input[name='uscfId']");
  const categorySelect = document.getElementById("chessCategory");

  // Current tournament categories & fees
  const CATEGORY_FEES = {
    "UnRated": 30,
    "U300": 30,
    "U600": 30,
    "U900": 30,
    "900+": 30
  };

  function getCategory() {
    // Prefer dropdown if present
    const fromSelect = categorySelect?.value || "";
    if (fromSelect) return fromSelect;
    // Fallback to legacy radios
    const checkedRadio = document.querySelector("input[name='chessLevel']:checked");
    return checkedRadio ? checkedRadio.value : "";
  }

  function categoryFee(value) {
    if (!value) return 0;
    if (Object.prototype.hasOwnProperty.call(CATEGORY_FEES, value)) return CATEGORY_FEES[value];
    // Fallback: if some value is chosen but not in map, default to 30 (current flat fee)
    return 30;
  }

  function toggleSections() {
    const selected = document.querySelector("input[name='hasUscf']:checked")?.value;
    if (selected === "yes") {
      uscfIdSection && (uscfIdSection.style.display = "block");
      uscfPurchaseSection && (uscfPurchaseSection.style.display = "none");
    } else if (selected === "no") {
      uscfIdSection && (uscfIdSection.style.display = "none");
      uscfPurchaseSection && (uscfPurchaseSection.style.display = "block");
    } else {
      uscfIdSection && (uscfIdSection.style.display = "none");
      uscfPurchaseSection && (uscfPurchaseSection.style.display = "none");
    }
    updateUscfIdRequired();
    calculateFee();
  }

  function updateUscfIdRequired() {
    const selected = document.querySelector("input[name='hasUscf']:checked")?.value;
    if (!uscfIdField) return;
    if (selected === "yes") {
      uscfIdField.required = true;
    } else {
      uscfIdField.required = false;
      // uscfIdField.value = "";
    }
  }

  function calculateFee() {
    const catVal = getCategory();
    const base = categoryFee(catVal);
    const uscfFee = purchaseUscfCheckbox?.checked ? 24 : 0;
    const total = base + uscfFee;

    const baseEl = document.getElementById("base-fee");
    const uscfEl = document.getElementById("uscf-fee");
    const totalEl = document.getElementById("total-fee");
    if (baseEl) baseEl.innerText = "$" + base;
    if (uscfEl) uscfEl.innerText = "$" + uscfFee;
    if (totalEl) totalEl.innerText = "$" + total;

    const hiddenBase = document.querySelector("input[name='baseFee']");
    const hiddenUscf = document.querySelector("input[name='uscfFee']");
    const hiddenFinal = document.querySelector("input[name='finalFee']");
    const hiddenCat = document.querySelector("input[name='chessLevelSession']");

    if (hiddenBase) hiddenBase.value = base;
    if (hiddenUscf) hiddenUscf.value = uscfFee;
    if (hiddenFinal) hiddenFinal.value = total;
    if (hiddenCat) hiddenCat.value = catVal;
  }

  // Wire events for BOTH select and radios
  if (categorySelect) {
    categorySelect.addEventListener("change", calculateFee);
  }
  document.querySelectorAll("input[name='chessLevel']").forEach(radio => {
    radio.addEventListener("change", calculateFee);
  });

  hasUscfRadios.forEach(radio => radio.addEventListener("change", toggleSections));
  if (purchaseUscfCheckbox) purchaseUscfCheckbox.addEventListener("change", calculateFee);

  function buildPayload() {
    const getVal = (name) => {
      const elChecked = document.querySelector(`[name='${name}']:checked`);
      const elAny = document.querySelector(`[name='${name}']`);
      const el = elChecked || elAny;
      return el ? (el.value || "").trim() : "";
    };
    const checked = (name) => document.querySelector(`[name='${name}']`)?.checked ? "Yes" : "No";

    const category = getCategory(); // <-- unified
    const data = {
      programType: "ChessTournament",
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      playerName: getVal("playerName"),
      studentName: getVal("playerName"),
      grade: getVal("grade"),
      school: getVal("school"),
      hasUscf: getVal("hasUscf"),
      uscfId: getVal("uscfId"),
      uscfRating: getVal("uscfRating"),
      purchaseUSCF: checked("purchaseUscfId"),
      dob: getVal("dob"),
      chessLevel: category, // for backward compatibility
      photo_consent: checked("photoConsent"),
      medical_release: checked("emergencyMedical"),
      cancellation_policy: checked("refundPolicy"),
      baseFee: parseInt(getVal("baseFee")) || 0,
      uscfFee: parseInt(getVal("uscfFee")) || 0,
      finalFee: parseInt(getVal("finalFee")) || 0
    };

    console.log("📦 Payload to submit:", JSON.stringify(data));
    return data;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const selected = document.querySelector("input[name='hasUscf']:checked")?.value;
    if (selected === "yes" && uscfIdField && !uscfIdField.value.trim()) {
      uscfIdField.focus();
      alert("Please enter your child's USCF ID.");
      if (loader) loader.style.display = "none";
      return false;
    }

    if (loader) loader.style.display = "block";

    const payload = buildPayload();

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(response => response.text())
    .then(result => {
      if (loader) loader.style.display = "none";
      console.log("✅ Server responded:", result);
      if (result.trim() === "Submitted and emailed successfully.") {
        sessionStorage.setItem("programType", "ChessTournament");
        sessionStorage.setItem("session", payload.chessLevel);
        const uscfParam = (payload.purchaseUSCF === "Yes") ? "&uscf=1" : "";
        window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.chessLevel)
          + "&fee=" + encodeURIComponent(payload.finalFee)
          + uscfParam;
      } else {
        alert("Submission error: " + result);
      }
    })
    .catch(error => {
      if (loader) loader.style.display = "none";
      alert("There was an error submitting the form. Please try again.");
    });
  });

  // initialize
  toggleSections();
  calculateFee();
});

// Keep separate USCF toggles and DOB required handling
document.addEventListener("DOMContentLoaded", function () {
  const hasUscfRadios = document.querySelectorAll("input[name='hasUscf']");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const dobField = document.querySelector("input[name='dob']");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");

  function toggleUSCFSections() {
    const selected = document.querySelector("input[name='hasUscf']:checked")?.value;
    if (selected === "yes") {
      uscfIdSection && (uscfIdSection.style.display = "block");
      uscfPurchaseSection && (uscfPurchaseSection.style.display = "none");
      if (dobField) dobField.required = false;
    } else if (selected === "no") {
      uscfIdSection && (uscfIdSection.style.display = "none");
      uscfPurchaseSection && (uscfPurchaseSection.style.display = "block");
      if (dobField) dobField.required = purchaseUscfCheckbox?.checked;
    }
  }

  hasUscfRadios.forEach(radio => {
    radio.addEventListener("change", toggleUSCFSections);
  });

  if (purchaseUscfCheckbox) {
    purchaseUscfCheckbox.addEventListener("change", () => {
      if (document.querySelector("input[name='hasUscf']:checked")?.value === "no") {
        if (dobField) dobField.required = purchaseUscfCheckbox.checked;
      }
    });
  }

  toggleUSCFSections(); // run once on load
});
