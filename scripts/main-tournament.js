document.addEventListener("DOMContentLoaded", function () {
  console.log("♟️ Chess Tournament Form initialized");

  const form = document.getElementById("tournament-registration-form");
  const loader = document.getElementById("submitting-overlay");

  const hasUscfRadios = document.querySelectorAll("input[name='hasUscf']");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");

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
    calculateFee();
  }

  function calculateFee() {
    let base = 0;
    let uscfFee = purchaseUscfCheckbox?.checked ? 24 : 0;
    const level = document.querySelector("input[name='chessLevel']:checked")?.value || "";

    if (level === "Beginner") base = 25;
    else if (level === "Intermediate") base = 30;
    else if (level === "Advanced") base = 35;

    const total = base + uscfFee;

    document.getElementById("base-fee").innerText = "$" + base;
    document.getElementById("uscf-fee").innerText = "$" + uscfFee;
    document.getElementById("total-fee").innerText = "$" + total;

    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='uscfFee']").value = uscfFee;
    document.querySelector("input[name='finalFee']").value = total;
    document.querySelector("input[name='chessLevelSession']").value = level;
  }

  document.querySelectorAll("input[name='chessLevel']").forEach(radio =>
    radio.addEventListener("change", calculateFee)
  );
  hasUscfRadios.forEach(radio => radio.addEventListener("change", toggleSections));
  if (purchaseUscfCheckbox) purchaseUscfCheckbox.addEventListener("change", calculateFee);

  function buildPayload() {
    const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";
    const checked = (name) => document.querySelector(`[name='${name}']`)?.checked ? "Yes" : "No";

    return {
      programType: "Chess Tournament",
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      playerName: getVal("playerName"),
      grade: getVal("grade"),
      school: getVal("school"),
      hasUscf: getVal("hasUscf"),
      uscfId: getVal("uscfId"),
      uscfRating: getVal("uscfRating"),
      purchaseUscfId: checked("purchaseUscfId"),
      dob: getVal("dob"),
      chessLevel: getVal("chessLevel"),
      baseFee: parseInt(getVal("baseFee")) || 0,
      uscfFee: parseInt(getVal("uscfFee")) || 0,
      finalFee: parseInt(getVal("finalFee")) || 0
    };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
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
      if (result.trim() === "Submitted and emailed successfully.") {
        sessionStorage.setItem("programType", "Chess Tournament");
        sessionStorage.setItem("session", payload.chessLevel);
        window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.chessLevel);
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