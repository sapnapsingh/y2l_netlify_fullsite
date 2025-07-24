document.addEventListener("DOMContentLoaded", function () {
  console.log("♟️ Chess Tournament Form initialized");

  const form = document.getElementById("tournament-registration-form");
  const loader = document.getElementById("submitting-overlay");

  const hasUscfRadios = document.querySelectorAll("input[name='hasUscf']");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");
  const uscfRatingField = document.querySelector("input[name='uscfRating']");

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
    const rating = parseInt(uscfRatingField?.value || "0");

    if (!isNaN(rating) && rating > 0) {
      if (rating <= 400) base = 25;
      else if (rating <= 800) base = 30;
      else base = 35;
    }

    const total = base + uscfFee;

    document.getElementById("base-fee").innerText = "$" + base;
    document.getElementById("uscf-fee").innerText = "$" + uscfFee;
    document.getElementById("total-fee").innerText = "$" + total;

    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='uscfFee']").value = uscfFee;
    document.querySelector("input[name='finalFee']").value = total;
  }

  hasUscfRadios.forEach(radio => radio.addEventListener("change", toggleSections));
  if (purchaseUscfCheckbox) purchaseUscfCheckbox.addEventListener("change", calculateFee);
  if (uscfRatingField) uscfRatingField.addEventListener("input", calculateFee);

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
        sessionStorage.setItem("fee", payload.finalFee);
        window.location.href = "/payment-options.html";
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