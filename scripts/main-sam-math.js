document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 SAM Singapore Math form initialized");

  // Level/fee matrix (matching your actual levels)
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

  const form = document.getElementById("sam-math-enrollment-form");
  const loader = document.getElementById("submitting-overlay");

  if (!form) {
    console.error("❌ sam-math-enrollment-form not found!");
    return;
  }

  function getVal(name) {
    return document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  }

  // --- FEE CALCULATION ---
  function calculateAndDisplayFee() {
    const session = document.querySelector("input[name='samSession']:checked")?.value || "";
    const samLevel = getVal("samLevel");
    if (!session || !samLevel) {
      updateFeeSummary(0, "");
      return;
    }
    const base = lookupFee(samLevel, session);
    // Calculate savings compared to monthly
    let saveMsg = "";
    if (session !== "Monthly") {
      const months = getMonthCount(session);
      const monthlyFee = lookupFee(samLevel, "Monthly") * months;
      const savings = monthlyFee - base;
      if (savings > 0) {
        saveMsg = `You save $${savings} compared to monthly pricing!`;
      }
    }
    updateFeeSummary(base, saveMsg, session);
    // Store values for logging even if not visible
    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='discountValue']").value = ""; // no discount field shown
    document.querySelector("input[name='finalFee']").value = base;
  }

  function updateFeeSummary(total, saveMsg, session) {
    // Only show total
    const totalFeeSpan = document.getElementById("total-fee");
    if (totalFeeSpan) totalFeeSpan.innerText = total ? "$" + total : "$0";
    // Hide discount and final fee lines
    const discountLine = document.getElementById("discount-line");
    const finalLine = document.getElementById("final-fee-line");
    if (discountLine) discountLine.style.display = "none";
    if (finalLine) finalLine.style.display = "none";
    // Show/hide savings message
    let saveMsgDiv = document.getElementById("fee-save-msg");
    if (!saveMsgDiv) {
      saveMsgDiv = document.createElement("div");
      saveMsgDiv.id = "fee-save-msg";
      saveMsgDiv.style.fontWeight = "bold";
      saveMsgDiv.style.color = "#2a7ae2";
      document.querySelector(".fee-summary-box").appendChild(saveMsgDiv);
    }
    saveMsgDiv.innerText = saveMsg || "";

    // Show/hide installment info
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

  // Listen to both session selection and level field
  document.querySelectorAll("input[name='samSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });
  const samLevelInput = document.querySelector("[name='samLevel']");
  if (samLevelInput) samLevelInput.addEventListener("change", calculateAndDisplayFee);

  // ----------- BUILD PAYLOAD AS BEFORE -----------
  function buildPayload() {
    const session = document.querySelector("input[name='samSession']:checked")?.value || "";
    const sessionDetails = {
      "Monthly":    { sessionLabel: "Monthly",    sessionLength: "1 month" },
      "Quarterly":  { sessionLabel: "Quarterly",  sessionLength: "3 months" },
      "6 Months":   { sessionLabel: "6 Months",   sessionLength: "6 months" },
      "1 Year":     { sessionLabel: "1 Year",     sessionLength: "12 months" }
    };
    const details = sessionDetails[session] || { sessionLabel: "", sessionLength: "" };
    const base = parseInt(document.querySelector("input[name='baseFee']").value) || 0;
    // discount and finalFee still logged for future use, but not displayed
    const discount = "";
    const finalFee = base;

    const data = {
      programType: "SAM Singapore Math",
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      billingAddress: getVal("billingAddress"),
      student_1_name: getVal("student1Name"),
      grade_1: getVal("grade1"),
      school_1: getVal("school1"),
      nationality: getVal("nationality"),
      dob: getVal("dob"),
      samLevel: getVal("samLevel"),
      emergency_name: getVal("emergencyContactName"),
      emergency_phone: getVal("emergencyContactPhone"),
      medical_conditions: getVal("medicalInfo"),
      medications: getVal("medications"),
      photo_consent: document.querySelector('[name="photoConsent"]')?.checked ? "Yes" : "No",
      cancellation_policy: document.querySelector('[name="refundPolicy"]')?.checked ? "Yes" : "No",
      medical_release: document.querySelector('[name="emergencyMedical"]')?.checked ? "Yes" : "No",
      emergency_contact_info: document.querySelector('[name="emergencyContact"]')?.checked ? "Yes" : "No",
      samSession: session,
      sessionLabel: details.sessionLabel,
      sessionLength: details.sessionLength,
      preferredSlot: getVal("preferredSlot"),
      baseFee: base,
      discountValue: discount,
      finalFee: finalFee
    };

    console.log("📦 Payload to submit:", data);
    return data;
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
      console.log("✅ Server responded:", result);

      if (result.trim() === "Submitted and emailed successfully.") {
        sessionStorage.setItem("programType", "SAM Singapore Math");
        sessionStorage.setItem("samLevel", payload.samLevel);      // e.g. "2"
        sessionStorage.setItem("samSession", payload.samSession);  // e.g. "monthly"
        window.top.location.href = "/payment-options-sam.html?level=" + encodeURIComponent(payload.samLevel) + "&session=" + encodeURIComponent(payload.samSession);
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
});
