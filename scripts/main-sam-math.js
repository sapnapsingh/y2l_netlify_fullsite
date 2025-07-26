document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 SAM Singapore Math form initialized");

  // Session Details Mapping for durations (update fee/logic as needed)
  const sessionDetails = {
    "Monthly":    { sessionLabel: "Monthly",    sessionLength: "1 month" },
    "Quarterly":  { sessionLabel: "Quarterly",  sessionLength: "3 months" },
    "6 Months":   { sessionLabel: "6 Months",   sessionLength: "6 months" },
    "1 Year":     { sessionLabel: "1 Year",     sessionLength: "12 months" }
  };

  const form = document.getElementById("sam-math-enrollment-form");
  const loader = document.getElementById("submitting-overlay");

  if (!form) {
    console.error("❌ sam-math-enrollment-form not found!");
    return;
  }

  function calculateAndDisplayFee() {
    const session = document.querySelector("input[name='samSession']:checked")?.value || "";
    let base = 0, discount = 0;
    if (session === "Monthly") {
      base = 160;
    } else if (session === "Quarterly") {
      base = 450;
    } else if (session === "6 Months") {
      base = 850;
    } else if (session === "1 Year") {
      base = 1600;
    }
    const finalFee = base - discount;

    // Display
    const totalFeeSpan = document.getElementById("total-fee");
    const discountSpan = document.getElementById("discount");
    const finalFeeSpan = document.getElementById("final-fee");

    if (totalFeeSpan && discountSpan && finalFeeSpan) {
      totalFeeSpan.innerText = "$" + base;
      discountSpan.innerText = "$" + discount;
      finalFeeSpan.innerText = "$" + finalFee;
    }

    document.querySelector("input[name='baseFee']").value = base;
    document.querySelector("input[name='discountValue']").value = discount;
    document.querySelector("input[name='finalFee']").value = finalFee;
  }

  document.querySelectorAll("input[name='samSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  function getVal(name) {
    return document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  }

  function buildPayload() {
    const session = document.querySelector("input[name='samSession']:checked")?.value || "";
    const details = sessionDetails[session] || { sessionLabel: "", sessionLength: "" };
    const base = parseInt(document.querySelector("input[name='baseFee']").value) || 0;
    const discount = parseInt(document.querySelector("input[name='discountValue']").value) || 0;
    const finalFee = parseInt(document.querySelector("input[name='finalFee']").value) || 0;

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
        sessionStorage.setItem("samSession", payload.samSession);
        window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.samSession);
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
