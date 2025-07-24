document.addEventListener("DOMContentLoaded", function () {
  console.log("📋 Chess Tournament Registration loaded");

  const form = document.getElementById("tournamentForm");
  const loader = document.getElementById("submitting-overlay");

  if (!form) {
    console.error("❌ Form not found!");
    return;
  }

  // Fee calculation logic
  function calculateAndDisplayFee() {
    const ratingCategory = document.querySelector("input[name='ratingCategory']:checked")?.value || "";
    const wantsToPurchase = document.getElementById("purchaseUscf")?.checked || false;

    let base = 0;
    if (ratingCategory === "Under 400") base = 25;
    else if (ratingCategory === "401–800") base = 30;
    else if (ratingCategory === "800+") base = 35;

    const uscfFee = wantsToPurchase ? 20 : 0;
    const finalFee = base + uscfFee;

    // Update summary UI
    document.getElementById("base-fee").innerText = "$" + base;
    document.getElementById("uscf-fee").innerText = "$" + uscfFee;
    document.getElementById("final-fee").innerText = "$" + finalFee;

    // Set form fields
    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='uscfFee']").value = uscfFee;
    document.querySelector("input[name='finalFee']").value = finalFee;
  }

  // Trigger fee calc on changes
  document.querySelectorAll("input[name='ratingCategory']").forEach(radio =>
    radio.addEventListener("change", calculateAndDisplayFee)
  );
  document.getElementById("purchaseUscf")?.addEventListener("change", calculateAndDisplayFee);

  // Build payload
  function buildPayload() {
    const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";

    const ratingCategory = document.querySelector("input[name='ratingCategory']:checked")?.value || "";
    const hasUscf = document.querySelector("input[name='hasUscf'][value='yes']")?.checked;
    const wantsToPurchase = document.getElementById("purchaseUscf")?.checked;

    const baseFee = parseInt(getVal("baseFee")) || 0;
    const uscfFee = parseInt(getVal("uscfFee")) || 0;
    const finalFee = parseInt(getVal("finalFee")) || 0;

    const data = {
      programType: "ChessTournament",
      timestamp: new Date().toISOString(),
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      studentName: getVal("studentName"),
      dob: wantsToPurchase ? getVal("dob") : "",
      grade: getVal("grade"),
      school: getVal("school"),
      ratingCategory: ratingCategory,
      hasUscfId: hasUscf ? "Yes" : "No",
      uscfId: hasUscf ? getVal("uscfId") : "",
      purchaseUSCF: wantsToPurchase ? "Yes" : "No",
      baseFee,
      uscfFee,
      finalFee
    };

    console.log("📦 Payload ready:", data);
    return data;
  }

  // Submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (loader) loader.style.display = "block";

    const payload = buildPayload();

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.text())
      .then(result => {
        console.log("✅ Submission result:", result);
        if (loader) loader.style.display = "none";

        if (result.trim() === "Submitted and emailed successfully.") {
          window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.ratingCategory);
        } else {
          alert("Submission failed: " + result);
        }
      })
      .catch(err => {
        console.error("❌ Submission error:", err);
        if (loader) loader.style.display = "none";
        alert("There was an error submitting the form. Please try again.");
      });
  });
});