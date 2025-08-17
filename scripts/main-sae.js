document.addEventListener("DOMContentLoaded", function () {
  console.log("📝 SAE form initialized");

  // ====== FEE MATRIX (PLACEHOLDER — please adjust to SAE pricing when ready) ======
  // Structure matches SAM style so you can reuse quickly.
  const FEE_TABLE = [
    { levels: ["Beginner"],     monthly: 200, quarterly: 575,  sixmo: 1125, yearly: 1750 },
    { levels: ["Intermediate"], monthly: 220, quarterly: 635,  sixmo: 1245, yearly: 1940 },
    { levels: ["Advanced"],     monthly: 235, quarterly: 680,  sixmo: 1335, yearly: 2083 }
  ];

  function lookupFee(levelRaw, session) {
    const level = (levelRaw || "").trim();
    let found = FEE_TABLE[0];
    for (const group of FEE_TABLE) {
      if (group.levels.includes(level)) {
        found = group; break;
      }
    }
    if (session === "Monthly")   return found.monthly;
    if (session === "Quarterly") return found.quarterly;
    if (session === "6 Months")  return found.sixmo;
    if (session === "1 Year")    return found.yearly;
    return 0;
  }

  function getMonthCount(session) {
    if (session === "Monthly") return 1;
    if (session === "Quarterly") return 3;
    if (session === "6 Months") return 6;
    if (session === "1 Year") return 12;
    return 1;
  }

  const form   = document.getElementById("sae-enrollment-form");
  const loader = document.getElementById("submitting-overlay");

  function getVal(name) {
    return document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  }

  function calculateAndDisplayFee() {
    const session   = document.querySelector("input[name='saeSession']:checked")?.value || "";
    const saeLevel  = getVal("saeLevel");
    const isNew     = document.getElementById("isNewStudent").checked ? "yes" : "no";

    if (!session || !saeLevel) {
      updateFeeSummary(0, "", 0, session);
      return;
    }

    const base = lookupFee(saeLevel, session);
    const registrationFee = (isNew === "yes") ? 50 : 0;

    // Savings vs monthly (info only)
    let saveMsg = "";
    if (session !== "Monthly") {
      const months = getMonthCount(session);
      const monthlyFee = lookupFee(saeLevel, "Monthly") * months;
      const savings = monthlyFee - base;
      if (savings > 0) saveMsg = `You save $${savings} compared to monthly pricing!`;
    }

    updateFeeSummary(base, saveMsg, registrationFee, session);

    // hidden inputs for backend logging
    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='registrationFee']").value = registrationFee;
    document.querySelector("input[name='discountValue']").value = ""; // intentionally unused
    document.querySelector("input[name='finalFee']").value = base + registrationFee;
  }

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

    // Hide discount/final lines (kept for future reuse)
    const discountLine = document.getElementById("discount-line");
    const finalLine = document.getElementById("final-fee-line");
    if (discountLine) discountLine.style.display = "none";
    if (finalLine) finalLine.style.display = "none";

    // Savings note
    let saveMsgDiv = document.getElementById("fee-save-msg");
    if (!saveMsgDiv) {
      saveMsgDiv = document.createElement("div");
      saveMsgDiv.id = "fee-save-msg";
      saveMsgDiv.style.fontWeight = "bold";
      saveMsgDiv.style.color = "#2a7ae2";
      document.querySelector(".fee-summary-box").appendChild(saveMsgDiv);
    }
    saveMsgDiv.innerText = saveMsg || "";

    // Installment info
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

  // Change listeners
  document.querySelectorAll("input[name='saeSession']").forEach(r => r.addEventListener("change", calculateAndDisplayFee));
  const levelSelect = document.querySelector("[name='saeLevel']");
  if (levelSelect) levelSelect.addEventListener("change", calculateAndDisplayFee);
  document.getElementById("isNewStudent").addEventListener("change", calculateAndDisplayFee);

  // Payload
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

      saeLevel: getVal("saeLevel"),           // Beginner / Intermediate / Advanced
      saeSession: session,                    // monthly/quarterly/6 months/1 year
      sessionLabel: details.sessionLabel,
      sessionLength: details.sessionLength,
      preferredSlot: getVal("preferredSlot"),

      baseFee: base,
      registrationFee: registrationFee,
      discountValue: "",                      // kept for future; hidden in UI
      finalFee: finalFee,

      photo_consent: document.querySelector('[name="photoConsent"]')?.checked ? "Yes" : "No",
      cancellation_policy: document.querySelector('[name="refundPolicy"]')?.checked ? "Yes" : "No",
      medical_release: document.querySelector('[name="emergencyMedical"]')?.checked ? "Yes" : "No",
      emergency_contact_info: document.querySelector('[name="emergencyContact"]')?.checked ? "Yes" : "No",
      emergency_name: getVal("emergencyContactName"),
      emergency_phone: getVal("emergencyContactPhone"),

      isNewStudent: isNew
    };

    console.log("📦 SAE payload:", data);
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
      .then(r => r.text())
      .then(result => {
        if (loader) loader.style.display = "none";
        if (result.trim() === "Submitted and emailed successfully.") {
          window.top.location.href = "/sae-confirmation";
        } else {
          alert("Submission error: " + result);
        }
      })
      .catch(err => {
        if (loader) loader.style.display = "none";
        console.error(err);
        alert("There was an error submitting the form. Please try again.");
      });
  });

  // initial
  calculateAndDisplayFee();
});
