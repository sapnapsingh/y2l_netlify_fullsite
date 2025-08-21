document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 SAE English form initialized");

  // === Fees identical to SAM ===
  const FEE_TABLE = [
    {
      levels: ["0A", "0B", "0C", "1"],
      monthly: 200,
      quarterly: 575,
      sixmo: 1125,
      yearly: 1750,
    },
    {
      levels: ["2", "3", "4"],
      monthly: 220,
      quarterly: 635,
      sixmo: 1245,
      yearly: 1940,
    },
    {
      levels: ["5", "6"],
      monthly: 235,
      quarterly: 680,
      sixmo: 1335,
      yearly: 2083,
    }
  ];

  function lookupFee(levelRaw, session) {
    const level = (levelRaw || "").toUpperCase().replace(/\s/g, "");
    let found = FEE_TABLE[0];
    for (const group of FEE_TABLE) {
      if (group.levels.includes(level)) {
        found = group;
        break;
      }
    }
    if (session === "Monthly") return found.monthly;
    if (session === "Quarterly") return found.quarterly;
    if (session === "6 Months") return found.sixmo;
    if (session === "1 Year") return found.yearly;
    return 0;
  }

  function getMonthCount(session) {
    if (session === "Monthly") return 1;
    if (session === "Quarterly") return 3;
    if (session === "6 Months") return 6;
    if (session === "1 Year") return 12;
    return 1;
  }

  const form = document.getElementById("sae-enrollment-form");
  const loader = document.getElementById("submitting-overlay");

  if (!form) {
    console.error("❌ sae-enrollment-form not found!");
    return;
  }

  function getVal(name) {
    return document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  }

  // --- FEE CALCULATION ---
  function calculateAndDisplayFee() {
    const session = document.querySelector("input[name='saeSession']:checked")?.value || "";
    const saeLevel = getVal("saeLevel");
    const isNew = document.getElementById("isNewStudent").checked ? "yes" : "no";
    if (!session || !saeLevel) {
      updateFeeSummary(0, "", 0, session);
      return;
    }
    const base = lookupFee(saeLevel, session);
    let registrationFee = (isNew === "yes") ? 50 : 0;

    // Calculate savings vs monthly
    let saveMsg = "";
    if (session !== "Monthly") {
      const months = getMonthCount(session);
      const monthlyFee = lookupFee(saeLevel, "Monthly") * months;
      const savings = monthlyFee - base;
      if (savings > 0) {
        saveMsg = `You save $${savings} compared to monthly pricing!`;
      }
    }
    updateFeeSummary(base, saveMsg, registrationFee, session);

    // Save for backend (hidden fields)
    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='registrationFee']").value = registrationFee;
    document.querySelector("input[name='discountValue']").value = ""; // not shown
    document.querySelector("input[name='finalFee']").value = base + registrationFee;
  }

  function updateFeeSummary(tuition, saveMsg, registrationFee, session) {
    // Tuition
    const totalFeeSpan = document.getElementById("total-fee");
    if (totalFeeSpan) totalFeeSpan.innerText = tuition ? "$" + tuition : "$0";
    // Registration Fee
    const regLine = document.getElementById("registration-fee-line");
    const regSpan = document.getElementById("registration-fee");
    if (regLine && regSpan) {
      if (registrationFee && registrationFee > 0) {
        regLine.style.display = "";
        regSpan.innerText = "$" + registrationFee;
      } else {
        regLine.style.display = "none";
        regSpan.innerText = "$0";
      }
    }
    // Always hide discount/final lines (kept for future)
    const discountLine = document.getElementById("discount-line");
    const finalLine = document.getElementById("final-fee-line");
    if (discountLine) discountLine.style.display = "none";
    if (finalLine) finalLine.style.display = "none";

    // Savings message
    let saveMsgDiv = document.getElementById("fee-save-msg");
    if (!saveMsgDiv) {
      saveMsgDiv = document.createElement("div");
      saveMsgDiv.id = "fee-save-msg";
      saveMsgDiv.style.fontWeight = "bold";
      saveMsgDiv.style.color = "#2a7ae2";
      document.querySelector(".fee-summary-box").appendChild(saveMsgDiv);
    }
    saveMsgDiv.innerText = saveMsg || "";

    // Installment note (same as SAM)
    let installmentDiv = document.getElementById("installment-info");
    if (installmentDiv) {
      if (session === "6 Months") {
        installmentDiv.innerText = "Note: The fee for a 6-month session is payable in 2 installments.";
      } else if (session === "1 Year") {
        installmentDiv.innerText = "Note: The fee for a 1-year session is payable in 3 installments.";
      } else {
        installmentDiv.innerText = "";
      }
    }
  }

  // Listeners
  document.querySelectorAll("input[name='saeSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });
  const saeLevelInput = document.querySelector("[name='saeLevel']");
  if (saeLevelInput) saeLevelInput.addEventListener("change", calculateAndDisplayFee);
  const newChk = document.getElementById("isNewStudent");
  if (newChk) newChk.addEventListener("change", calculateAndDisplayFee);

  // ----------- BUILD PAYLOAD -----------
  function buildPayload() {
    const sessionRaw = document.querySelector("input[name='saeSession']:checked")?.value || "";
    const session = sessionRaw.trim().toLowerCase();
    const sessionDetails = {
      "monthly":    { sessionLabel: "Monthly",    sessionLength: "1 month" },
      "quarterly":  { sessionLabel: "Quarterly",  sessionLength: "3 months" },
      "6 months":   { sessionLabel: "6 Months",   sessionLength: "6 months" },
      "1 year":     { sessionLabel: "1 Year",     sessionLength: "12 months" }
    };
    const details = sessionDetails[session] || { sessionLabel: "", sessionLength: "" };
    const base = parseInt(document.querySelector("input[name='baseFee']").value) || 0;
    const registrationFee = parseInt(document.querySelector("input[name='registrationFee']").value) || 0;
    const discount = "";
    const finalFee = base + registrationFee;

    const isNew = document.getElementById("isNewStudent").checked ? "yes" : "no";

    const data = {
      programType: "SAE – Seriously Active English",
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      billingAddress: getVal("billingAddress"),
      student_1_name: getVal("student1Name"),
      grade_1: getVal("grade1"),
      school_1: getVal("school1"),
      nationality: getVal("nationality"),
      dob: getVal("dob"),
      saeLevel: getVal("saeLevel"),
      emergency_name: getVal("emergencyContactName"),
      emergency_phone: getVal("emergencyContactPhone"),
      medical_conditions: getVal("medicalInfo"),
      medications: getVal("medications"),
      photo_consent: document.querySelector('[name="photoConsent"]')?.checked ? "Yes" : "No",
      cancellation_policy: document.querySelector('[name="refundPolicy"]')?.checked ? "Yes" : "No",
      medical_release: document.querySelector('[name="emergencyMedical"]')?.checked ? "Yes" : "No",
      emergency_contact_info: document.querySelector('[name="emergencyContact"]')?.checked ? "Yes" : "No",
      saeSession: sessionRaw,               // keep original case label for sheet readability
      sessionLabel: details.sessionLabel,
      sessionLength: details.sessionLength,
      preferredSlot: getVal("preferredSlot"),
      baseFee: base,
      registrationFee: registrationFee,
      discountValue: discount,
      finalFee: finalFee,
      isNewStudent: isNew
    };

    console.log("📦 SAE payload:", data);
    return data;
  }

  // Submit
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
      console.log("✅ Server responded:", result);

      if (result.trim() === "Submitted and emailed successfully.") {
        // Same behavior as SAM (redirect to confirmation page)
        window.top.location.href = "https://y2lacademy.com/summer-confirmation";
      } else {
        alert("Submission error: " + result);
      }
    })
    .catch(error => {
      console.error("Submission failed:", error);
      if (loader) loader.style.display = "none";
      alert("There was an error submitting the form. Please try again.");
    });
  });

  // Initialize fee summary on load
  calculateAndDisplayFee();
});
