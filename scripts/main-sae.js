document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 SAE English form initialized");

  // ---- Fee table (identical to SAM) ----
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

  function getVal(name) {
    const el = document.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : "";
  }

  // ---- Fee summary update ----
  function updateFeeSummary(tuition, saveMsg, registrationFee, session) {
    const totalFeeSpan = document.getElementById("total-fee");
    if (totalFeeSpan) totalFeeSpan.innerText = tuition ? "$" + tuition : "$0";

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

    const discountLine = document.getElementById("discount-line");
    const finalLine = document.getElementById("final-fee-line");
    if (discountLine) discountLine.style.display = "none";
    if (finalLine) finalLine.style.display = "none";

    let saveMsgDiv = document.getElementById("fee-save-msg");
    if (!saveMsgDiv) {
      saveMsgDiv = document.createElement("div");
      saveMsgDiv.id = "fee-save-msg";
      saveMsgDiv.style.fontWeight = "bold";
      saveMsgDiv.style.color = "#2a7ae2";
      const box = document.querySelector(".fee-summary-box");
      if (box) box.appendChild(saveMsgDiv);
    }
    saveMsgDiv.innerText = saveMsg || "";

    const installmentDiv = document.getElementById("installment-info");
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

  // ---- Calculate and display fee ----
  function calculateAndDisplayFee() {
    const session = document.querySelector("input[name='saeSession']:checked")?.value || "";
    const level = getVal("saeLevel");
    const isNew = document.getElementById("isNewStudent").checked ? "yes" : "no";
    if (!session || !level) {
      updateFeeSummary(0, "", 0, session);
      return;
    }
    const base = lookupFee(level, session);
    const registrationFee = (isNew === "yes") ? 50 : 0;

    // Savings message compared to monthly
    let saveMsg = "";
    if (session === "Quarterly" || session === "6 Months" || session === "1 Year") {
      const monthly = lookupFee(level, "Monthly");
      const months = (session === "Quarterly") ? 3 : (session === "6 Months") ? 6 : 12;
      const monthlyTotal = monthly * months;
      const chosenTotal = base;
      const diff = monthlyTotal - chosenTotal;
      if (diff > 0) saveMsg = `You save $${diff} compared to paying monthly.`;
    }

    updateFeeSummary(base, saveMsg, registrationFee, session);

    // Store into hidden fields
    const baseInput = document.querySelector("input[name='baseFee']");
    const regInput  = document.querySelector("input[name='registrationFee']");
    const discInput = document.querySelector("input[name='discountValue']");
    const finalInput= document.querySelector("input[name='finalFee']");
    if (baseInput) baseInput.value = base;
    if (regInput)  regInput.value  = registrationFee;
    if (discInput) discInput.value = ""; // not used now
    if (finalInput)finalInput.value= base + registrationFee;
  }

  // Events
  document.querySelectorAll("input[name='saeSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });
  const levelInput = document.querySelector("[name='saeLevel']");
  if (levelInput) levelInput.addEventListener("change", calculateAndDisplayFee);
  document.getElementById("isNewStudent").addEventListener("change", calculateAndDisplayFee);

  // ---- Build payload ----
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
    const finalFee = base + registrationFee;
    const discount = "";

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
      saeSession: sessionRaw, // keep original case for sheet readability
      sessionLabel: details.sessionLabel,
      sessionLength: details.sessionLength,
      preferredSlot: getVal("preferredSlot"),
      baseFee: base,
      registrationFee: registrationFee,
      discountValue: discount,
      finalFee: finalFee,
      isNewStudent: isNew
    };

    console.log("📦 SAE Payload:", data);
    return data;
  }

  // ---- Submit ----
  const form = document.getElementById("sae-enrollment-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = buildPayload();

    const loader = document.getElementById("submitting-overlay");
    if (loader) loader.style.display = "block";

    fetch("YOUR_GAS_WEBAPP_URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.text())
      .then((result) => {
        console.log("Server response:", result);
        if (loader) loader.style.display = "none";
        // Store context (optional)
        sessionStorage.setItem("programType", "SAE – Seriously Active English");
        sessionStorage.setItem("saeLevel", data.saeLevel);
        sessionStorage.setItem("saeSession", data.saeSession);

        if (result.trim() === "Submitted and emailed successfully.") {
          window.top.location.href = "/confirmation.html";
        } else {
          alert("Submission error: " + result);
        }
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        if (loader) loader.style.display = "none";
        alert("There was an error submitting the form. Please try again.");
      });
  });

  // Initialize on load
  calculateAndDisplayFee();
});
