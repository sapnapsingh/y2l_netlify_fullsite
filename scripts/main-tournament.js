document.addEventListener("DOMContentLoaded", function () {
  console.log("♟️ Chess Tournament Form initialized");

  const hasUscfRadios = document.getElementsByName("hasUscf");
  const uscfIdSection = document.getElementById("uscf-id-section");
  const uscfPurchaseSection = document.getElementById("uscf-purchase-section");
  const purchaseUscfCheckbox = document.querySelector("input[name='purchaseUscfId']");

  function updateUscfSections() {
    const selected = Array.from(hasUscfRadios).find(r => r.checked)?.value;
    if (selected === "yes") {
      uscfIdSection.style.display = "block";
      uscfPurchaseSection.style.display = "none";
      document.querySelector("input[name='uscfId']").required = true;
    } else if (selected === "no") {
      uscfIdSection.style.display = "none";
      uscfPurchaseSection.style.display = "block";
      document.querySelector("input[name='uscfId']").required = false;
    }
  }

  hasUscfRadios.forEach(r => r.addEventListener("change", updateUscfSections));
  updateUscfSections();

  const form = document.getElementById("tournament-registration-form");

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
    document.querySelector("input[name='chessLevelSession']").value = level;
  }

  form.addEventListener("change", calculateFee);
  calculateFee();

  form.addEventListener("submit", async function (e) {
    document.getElementById("submitting-overlay").style.display = "block";

    const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";
    const checked = (name) => document.querySelector(`[name='${name}']`)?.checked ? "Yes" : "No";

    const hasUscf = getVal("hasUscf");
    const uscfId = getVal("uscfId");
    const uscfRating = getVal("uscfRating");
    const purchaseUSCF = checked("purchaseUscfId");
    const uscfIdFinal = (hasUscf === "yes") ? uscfId : "Not Available";

    const payload = {
      programType: "ChessTournament",
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      playerName: getVal("playerName"),
      studentName: getVal("playerName"),
      grade: getVal("grade"),
      school: getVal("school"),
      hasUscf: hasUscf,
      uscfId: uscfIdFinal,
      uscfRating: uscfRating,
      purchaseUSCF: purchaseUSCF,
      dob: getVal("dob"),
      chessLevel: getVal("chessLevel"),
      baseFee: parseInt(getVal("baseFee")) || 0,
      uscfFee: parseInt(getVal("uscfFee")) || 0,
      finalFee: parseInt(getVal("finalFee")) || 0
    };

    console.log("📦 Payload to submit:", JSON.stringify(payload));

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.text();
      console.log("✅ Server responded:", result);
      window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.chessLevel) + "&fee=" + encodeURIComponent(payload.finalFee);
    } catch (error) {
      document.getElementById("submitting-overlay").style.display = "none";
      document.getElementById("form-error-msg").innerText = "Error submitting form. Please try again.";
      document.getElementById("form-error-msg").style.display = "block";
      console.error("❌ Submission failed:", error);
    }
  });
});