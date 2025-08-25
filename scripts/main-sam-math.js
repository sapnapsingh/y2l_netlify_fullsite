document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 SAM Singapore Math form initialized");

  // Level/fee matrix (update as needed)
  const FEE_TABLE = [
    { levels: ["0A", "0B", "0C", "1"], monthly: 200, quarterly: 575, sixmo: 1125, yearly: 1750 },
    { levels: ["2", "3", "4"],       monthly: 220, quarterly: 635,  sixmo: 1245, yearly: 1940 },
    { levels: ["5", "6"],            monthly: 235, quarterly: 680,  sixmo: 1335, yearly: 2083 }
  ];

  function lookupFee(levelRaw, session) {
    const level = (levelRaw || "").toUpperCase().replace(/\s/g, "");
    let found = FEE_TABLE[0];
    for (const group of FEE_TABLE) {
      if (group.levels.includes(level)) { found = group; break; }
    }
    if (session === "Monthly")   return found.monthly;
    if (session === "Quarterly") return found.quarterly;
    if (session === "6 Months")  return found.sixmo;
    if (session === "1 Year")    return found.yearly;
    return 0;
  }

  function getMonthCount(session) {
    if (session === "Monthly")   return 1;
    if (session === "Quarterly") return 3;
    if (session === "6 Months")  return 6;
    if (session === "1 Year")    return 12;
    return 1;
  }

  const form   = document.getElementById("sam-math-enrollment-form");   // same id as your deployed form
  const loader = document.getElementById("submitting-overlay");
  if (!form) { console.error("❌ sam-math-enrollment-form not found!"); return; }

  function getVal(name) {
    return document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  }

  // --- FEE CALCULATION (unchanged) ---
  function calculateAndDisplayFee() {
    const session  = document.querySelector("input[name='samSession']:checked")?.value || "";
    const samLevel = getVal("samLevel");
    const isNew    = document.getElementById("isNewStudent").checked ? "yes" : "no";
    if (!session || !samLevel) { updateFeeSummary(0, "", 0, session); return; }

    const base = lookupFee(samLevel, session);
    let registrationFee = (isNew === "yes") ? 50 : 0;

    let saveMsg = "";
    if (session !== "Monthly") {
      const months = getMonthCount(session);
      const monthlyFee = lookupFee(samLevel, "Monthly") * months;
      const savings = monthlyFee - base;
      if (savings > 0) saveMsg = `You save $${savings} compared to monthly pricing!`;
    }
    updateFeeSummary(base, saveMsg, registrationFee, session);

    document.querySelector("input[name='baseFee']").value         = base;
    document.querySelector("input[name='registrationFee']").value = registrationFee;
    document.querySelector("input[name='discountValue']").value   = ""; // no discount field shown
    document.querySelector("input[name='finalFee']").value        = base + registrationFee;
  }

  function updateFeeSummary(tuition, saveMsg, registrationFee, session) {
    const totalFeeSpan = document.getElementById("total-fee");
    if (totalFeeSpan) totalFeeSpan.innerText = tuition ? "$" + tuition : "$0";

    const regLine = document.getElementById("registration-fee-line");
    const regSpan = document.getElementById("registration-fee");
    if (regLine && regSpan) {
      if (registrationFee && registrationFee > 0) { regLine.style.display = ""; regSpan.innerText = "$" + registrationFee; }
      else { regLine.style.display = "none"; regSpan.innerText = "$0"; }
    }

    const discountLine = document.getElementById("discount-line");
    const finalLine    = document.getElementById("final-fee-line");
    if (discountLine) discountLine.style.display = "none";
    if (finalLine)    finalLine.style.display    = "none";

    let saveMsgDiv = document.getElementById("fee-save-msg");
    if (!saveMsgDiv) {
      saveMsgDiv = document.createElement("div");
      saveMsgDiv.id = "fee-save-msg";
      saveMsgDiv.style.fontWeight = "bold";
      saveMsgDiv.style.color = "#2a7ae2";
      document.querySelector(".fee-summary-box").appendChild(saveMsgDiv);
    }
    saveMsgDiv.innerText = saveMsg || "";

    let installmentDiv = document.getElementById("installment-info");
    if (installmentDiv) {
      if (session === "6 Months")      installmentDiv.innerText = "Note: The fee for a 6-month session is payable in 2 installments.";
      else if (session === "1 Year")   installmentDiv.innerText = "Note: The fee for a 1-year session is payable in 3 installments.";
      else                             installmentDiv.innerText = "";
    }
  }

  document.querySelectorAll("input[name='samSession']").forEach(r => {
    r.addEventListener("change", calculateAndDisplayFee);
  });
  const samLevelInput = document.querySelector("[name='samLevel']");
  if (samLevelInput) samLevelInput.addEventListener("change", calculateAndDisplayFee);
  document.getElementById("isNewStudent").addEventListener("change", calculateAndDisplayFee);

  // =======================
  // ELA add-on interactions
  // =======================
  const enrollELACheck = document.getElementById("enrollELA");
  const elaWrap        = document.getElementById("ela-slot-wrap");
  const elaSelect      = document.getElementById("elaPreferredSlot");
  const mathSelect     = document.getElementById("preferredSlot");
  const elaWarn        = document.getElementById("ela-slot-warning");

  function syncElaOptions() {
    if (!elaSelect) return;
    const mathVal = mathSelect?.value || "";
    // Reset all options enabled
    [...elaSelect.options].forEach(opt => { opt.disabled = false; });
    // Disable the current math slot
    if (mathVal) {
      for (const opt of elaSelect.options) {
        if (opt.value === mathVal) {
          opt.disabled = true;
          // If ELA currently equals Math, clear and warn
          if (elaSelect.value === mathVal) {
            elaSelect.value = "";
            if (elaWarn) elaWarn.style.display = "block";
          }
          break;
        }
      }
    }
  }

  mathSelect?.addEventListener("change", () => {
    if (elaWarn) elaWarn.style.display = "none";
    syncElaOptions();
  });

  enrollELACheck?.addEventListener("change", () => {
    const show = enrollELACheck.checked;
    if (elaWrap) elaWrap.style.display = show ? "block" : "none";
    if (elaWarn) elaWarn.style.display = "none";
    if (show) syncElaOptions();
  });

  elaSelect?.addEventListener("change", () => {
    if (elaWarn) elaWarn.style.display = "none";
    // extra guard: if user somehow picks same slot (e.g., fast click), clear
    if (mathSelect && elaSelect && mathSelect.value && elaSelect.value === mathSelect.value) {
      elaSelect.value = "";
      if (elaWarn) elaWarn.style.display = "block";
    }
  });

  // ----------- BUILD PAYLOAD -----------
  function buildPayload() {
    const sessionRaw = document.querySelector("input[name='samSession']:checked")?.value || "";
    const session = sessionRaw.trim().toLowerCase();
    const sessionDetails = {
      "monthly":    { sessionLabel: "Monthly",    sessionLength: "1 month" },
      "quarterly":  { sessionLabel: "Quarterly",  sessionLength: "3 months" },
      "6 months":   { sessionLabel: "6 Months",   sessionLength: "6 months" },
      "1 year":     { sessionLabel: "1 Year",     sessionLength: "12 months" }
    };
    const details = sessionDetails[session] || { sessionLabel: "", sessionLength: "" };

    const base            = parseInt(document.querySelector("input[name='baseFee']").value) || 0;
    const registrationFee = parseInt(document.querySelector("input[name='registrationFee']").value) || 0;
    const finalFee        = base + registrationFee;
    const isNew           = document.getElementById("isNewStudent").checked ? "yes" : "no";

    // ELA payload bits
    const alsoEnrollELA = enrollELACheck?.checked ? "Yes" : "No";
    const elaSlotVal    = (elaSelect?.value || "").trim();

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
      registrationFee: registrationFee,
      discountValue: "",
      finalFee: finalFee,
      isNewStudent: isNew,

      // NEW fields for ELA add-on:
      alsoEnrollELA: alsoEnrollELA,        // "Yes" / "No"
      elaPreferredSlot: elaSlotVal,        // for human readability
      saePreferredSlot: elaSlotVal         // alias to match SAE handler naming if needed
    };

    console.log("📦 Payload to submit:", data);
    return data;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validation: if ELA is selected, require a different slot than Math
    if (enrollELACheck?.checked) {
      const mathVal = mathSelect?.value || "";
      const elaVal  = elaSelect?.value || "";
      if (!elaVal) {
        alert("Please choose an ELA preferred slot.");
        return;
      }
      if (mathVal && elaVal === mathVal) {
        alert("ELA slot cannot be the same as Math slot. Please choose a different time.");
        return;
      }
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

  // Initialize fee summary once on load
  calculateAndDisplayFee();
});
