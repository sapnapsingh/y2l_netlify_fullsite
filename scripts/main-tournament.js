// --- CONFIG: Just edit this array to add/remove categories ---
// value: what gets saved as 'chessLevel' and sent in your payload
// label: what shows in the dropdown
// fee: entry fee for that category (int)
const CATEGORIES = [
  { value: "UnRated", label: "UnRated", fee: 30 },
  { value: "U300",    label: "U300",    fee: 30 },
  { value: "U600",    label: "U600",    fee: 30 },
  { value: "U900",    label: "U900",    fee: 30 },
  { value: "900+",    label: "900+",    fee: 30 },
];

document.addEventListener("DOMContentLoaded", function () {
  console.log("♟️ Chess Tournament Form (auto categories)");

  const form = document.getElementById("tournament-registration-form");
  const loader = document.getElementById("submitting-overlay");

  const hasUscfRadios = document.querySelectorAll("input[name='hasUscf']");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");
  const uscfIdField = document.querySelector("input[name='uscfId']");

  const categorySelect = document.getElementById("chessCategory");

  // Build dropdown from CATEGORIES[]
  if (categorySelect) {
    // Remove any existing options after the first placeholder
    [...categorySelect.querySelectorAll("option:not([value=''])")].forEach(o => o.remove());
    CATEGORIES.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.value;
      opt.textContent = `${cat.label} – Entry Fee: $${cat.fee}`;
      categorySelect.appendChild(opt);
    });
  }

  function toggleSections() {
    const selected = document.querySelector("input[name='hasUscf']:checked")?.value;
    if (selected === "yes") {
      uscfIdSection.style.display = "block";
      uscfPurchaseSection.style.display = "none";
    } else if (selected === "no") {
      uscfIdSection.style.display = "none";
      uscfPurchaseSection.style.display = "block";
    } else {
      uscfIdSection.style.display = "none";
      uscfPurchaseSection.style.display = "none";
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
      uscfIdField.value = "";
    }
  }

  function categoryFee(value) {
    const found = CATEGORIES.find(c => c.value === value);
    return found ? found.fee : 0;
  }

  function calculateFee() {
    const catVal = categorySelect?.value || "";
    const base = categoryFee(catVal);
    const uscfFee = purchaseUscfCheckbox?.checked ? 24 : 0;
    const total = base + uscfFee;

    document.getElementById("base-fee").innerText = "$" + base;
    document.getElementById("uscf-fee").innerText = "$" + uscfFee;
    document.getElementById("total-fee").innerText = "$" + total;

    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='uscfFee']").value = uscfFee;
    document.querySelector("input[name='finalFee']").value = total;
    const catHidden = document.querySelector("input[name='chessLevelSession']");
    if (catHidden) catHidden.value = catVal;
  }

  if (categorySelect) categorySelect.addEventListener("change", calculateFee);
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
      chessLevel: getVal("chessCategory"), // for backward compatibility
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
        window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.chessLevel) + "&fee=" + encodeURIComponent(payload.finalFee);
      } else {
        alert("Submission error: " + result);
      }
    })
    .catch(error => {
      if (loader) loader.style.display = "none";
      alert("There was an error submitting the form. Please try again.");
    });
  });

  // init
  toggleSections();
  calculateFee();
});

// Keep separate USCF toggles (safe duplicate guard) and handle DOB required when purchasing USCF
document.addEventListener("DOMContentLoaded", function () {
  const hasUscfRadios = document.querySelectorAll("input[name='hasUscf']");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const dobField = document.querySelector("input[name='dob']");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");

  function toggleUSCFSections() {
    const selected = document.querySelector("input[name='hasUscf']:checked")?.value;
    if (selected === "yes") {
      uscfIdSection.style.display = "block";
      uscfPurchaseSection.style.display = "none";
      if (dobField) dobField.required = false;
    } else if (selected === "no") {
      uscfIdSection.style.display = "none";
      uscfPurchaseSection.style.display = "block";
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

  toggleUSCFSections();
});
