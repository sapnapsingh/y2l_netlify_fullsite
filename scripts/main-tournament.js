document.addEventListener("DOMContentLoaded", function () {
  console.log("♟️ Chess Tournament Form initialized");

  const form = document.getElementById("tournament-registration-form");
  const loader = document.getElementById("submitting-overlay");

  const hasUscfRadios = document.querySelectorAll("input[name='hasUscf']");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");
  const uscfIdField = document.querySelector("input[name='uscfId']");

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

  // ---- Add USCF ID required logic here ----
  function updateUscfIdRequired() {
    const selected = document.querySelector("input[name='hasUscf']:checked")?.value;
    if (!uscfIdField) return;
    if (selected === "yes") {
      uscfIdField.required = true;
    } else {
      uscfIdField.required = false;
      uscfIdField.value = ""; // Optionally clear when not required
    }
  }

  function calculateFee() {
    let base = 0;
    let uscfFee = purchaseUscfCheckbox?.checked ? 24 : 0;
    const level = document.querySelector("input[name='chessLevel']:checked")?.value || "";

    if (level === "Under 400") base = 25;
    else if (level === "400 - 800") base = 30;
    else if (level === "Above 800") base = 35;

    const total = base + uscfFee;

    document.getElementById("base-fee").innerText = "$" + base;
    document.getElementById("uscf-fee").innerText = "$" + uscfFee;
    document.getElementById("total-fee").innerText = "$" + total;

    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='uscfFee']").value = uscfFee;
    document.querySelector("input[name='finalFee']").value = total;
  }

  document.querySelectorAll("input[name='chessLevel']").forEach(radio =>
    radio.addEventListener("change", calculateFee)
  );
  hasUscfRadios.forEach(radio => radio.addEventListener("change", toggleSections));
  if (purchaseUscfCheckbox) purchaseUscfCheckbox.addEventListener("change", calculateFee);

  function buildPayload() {
    const getVal = (name) => {
      const el = document.querySelector(`[name='${name}']:checked`) || document.querySelector(`[name='${name}']`);
      return el ? el.value.trim() : "";
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
      chessLevel: getVal("chessLevel"),
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

    // ---- USCF ID must be filled if required ----
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
});

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
      dobField.required = false;
    } else if (selected === "no") {
      uscfIdSection.style.display = "none";
      uscfPurchaseSection.style.display = "block";
      dobField.required = purchaseUscfCheckbox?.checked;
    }
  }

  hasUscfRadios.forEach(radio => {
    radio.addEventListener("change", toggleUSCFSections);
  });

  if (purchaseUscfCheckbox) {
    purchaseUscfCheckbox.addEventListener("change", () => {
      if (document.querySelector("input[name='hasUscf']:checked")?.value === "no") {
        dobField.required = purchaseUscfCheckbox.checked;
      }
    });
  }

  toggleUSCFSections(); // run once on load
});
