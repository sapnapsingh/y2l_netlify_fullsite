
// ✅ main-tournament.js – FINAL FIXED VERSION for Chess Tournament

document.addEventListener("DOMContentLoaded", function () {
  console.log("♟️ Chess Tournament Form initialized");

  const form = document.getElementById("tournament-registration-form");
  const purchaseUscfCheckbox = document.querySelector("[name='purchaseUscfId']");
  const uscfIdInput = document.querySelector("[name='uscfId']");
  const dobInput = document.querySelector("[name='dob']");
  const hasUscfRadios = document.getElementsByName("hasUscf");
  const chessLevelRadios = document.querySelectorAll("input[name='chessLevel']");

  function buildPayload() {
    const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";
    const checked = (name) => document.querySelector(`[name='${name}']`)?.checked ? "Yes" : "No";
    let hasUscf = getVal("hasUscf");
    if (purchaseUscfCheckbox.checked) {
      hasUscf = "No";
    }

    let level = "";
    for (const radio of chessLevelRadios) {
      if (radio.checked) {
        level = radio.value;
        break;
      }
    }

    const data = {
      programType: "ChessTournament",
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      playerName: getVal("playerName"),
      studentName: getVal("playerName"),
      grade: getVal("grade"),
      school: getVal("school"),
      hasUscf,
      uscfId: getVal("uscfId"),
      uscfRating: getVal("uscfRating"),
      purchaseUSCF: checked("purchaseUscfId"),
      dob: getVal("dob"),
      chessLevel: level,
      baseFee: parseInt(getVal("baseFee")) || 0,
      uscfFee: parseInt(getVal("uscfFee")) || 0,
      finalFee: parseInt(getVal("finalFee")) || 0
    };

    console.log("📦 Payload to submit:", JSON.stringify(data));
    return data;
  }

  // Require DOB if purchasing USCF ID
  function toggleDobRequirement() {
    if (purchaseUscfCheckbox.checked) {
      dobInput.required = true;
    } else {
      dobInput.required = false;
    }
  }

  purchaseUscfCheckbox.addEventListener("change", toggleDobRequirement);
  toggleDobRequirement();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const payload = buildPayload();

    try {
      const res = await fetch("/.netlify/functions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log("✅ Server responded:", result.message);
      window.location.href = "/payment-options.html";
    } catch (err) {
      console.error("❌ Submission failed:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});
