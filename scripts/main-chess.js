document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 Chess Program form initialized");

  // === Session Details Mapping: EDIT HERE IF SESSIONS CHANGE ===
  const sessionDetails = {
    "Beginner to Intermediate": {
      sessionDates: "Aug 27 – Nov 12, 2025",
      sessionTimings: "Wednesdays, 3:30–4:45 pm"
    },
    "Intermediate to Advanced": {
      sessionDates: "Aug 27 – Nov 12, 2025",
      sessionTimings: "Wednesdays, 5:00–6:15 pm"
    }
  };
  // === End Session Details Mapping ===

  const form = document.getElementById("chess-enrollment-form");
  const loader = document.getElementById("submitting-overlay");

  if (!form) {
    console.error("❌ chess-enrollment-form not found!");
    return;
  }

  function calculateAndDisplayFee() {
    console.log("🔧 Fee calc triggered");
    const today = new Date();
    const earlyBirdDeadline = new Date("2025-08-10");

    const session = document.querySelector("input[name='chessSession']:checked")?.value || "";
    console.log("🎯 Session selected:", session);

    let base = 0, discount = 0;
    if (session === "Beginner to Intermediate") {
      base = 360;
      discount = today <= earlyBirdDeadline ? 30 : 0;
    } else if (session === "Intermediate to Advanced") {
      base = 420;
      discount = today <= earlyBirdDeadline ? 35 : 0;
    }

    const finalFee = base - discount;
    console.log("💵 Base:", base, "| Discount:", discount, "| Final:", finalFee);

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

  document.querySelectorAll("input[name='chessSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  function buildPayload() {
    const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";

    const session = document.querySelector("input[name='chessSession']:checked")?.value || "";
    const base = parseInt(document.querySelector("input[name='baseFee']").value) || 0;
    const discount = parseInt(document.querySelector("input[name='discountValue']").value) || 0;
    const finalFee = parseInt(document.querySelector("input[name='finalFee']").value) || 0;

    // Get session details (dates & timings) from mapping above
    const details = sessionDetails[session] || { sessionDates: "", sessionTimings: "" };

    const data = {
      programType: "Chess",
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      billingAddress: getVal("billingAddress"),
      student_1_name: getVal("student1Name"),
      grade_1: getVal("grade1"),
      school_1: getVal("school1"),
      emergency_name: getVal("emergencyContactName"),
      emergency_phone: getVal("emergencyContactPhone"),
      medical_conditions: getVal("medicalInfo"),
      medications: getVal("medications"),
      photo_consent: document.querySelector('[name="photoConsent"]')?.checked ? "Yes" : "No",
      cancellation_policy: document.querySelector('[name="refundPolicy"]')?.checked ? "Yes" : "No",
      medical_release: document.querySelector('[name="emergencyMedical"]')?.checked ? "Yes" : "No",
      emergency_contact_info: document.querySelector('[name="emergencyContact"]')?.checked ? "Yes" : "No",
      chessSession: session,
      sessionDates: details.sessionDates,
      sessionTimings: details.sessionTimings,
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
        sessionStorage.setItem("programType", "Chess");
        sessionStorage.setItem("chessSession", payload.chessSession);
        window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.chessSession);
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
