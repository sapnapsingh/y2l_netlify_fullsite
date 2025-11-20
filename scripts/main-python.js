document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 Python Programming form initialized");

  // === Session Details Mapping: EDIT HERE IF SESSIONS CHANGE ===
  const sessionDetails = {
    "Beginner": {
      sessionDates: "Aug 27 – Nov 19, 2025 - No Class: Oct 8",
      sessionTimings: "5:30 pm – 7:00 pm"
    },
    "Intermediate": {
      sessionDates: "Nov 21 – Dec 19, 2025 - No Class: Nov 27",
      sessionTimings: "4:30 pm – 5:30 pm"
    },
    "Advanced": {
      sessionDates: "TBD",
      sessionTimings: "TBD"
    }
  };
  // === End Session Details Mapping ===

  const form = document.getElementById("python-enrollment-form");
  const loader = document.getElementById("submitting-overlay");

  if (!form) {
    console.error("❌ python-enrollment-form not found!");
    return;
  }

  function calculateAndDisplayFee() {
    console.log("🔧 Fee calc triggered");
    const today = new Date();
    const earlyBirdDeadline = new Date("2025-08-10");

    const session = document.querySelector("input[name='pythonSession']:checked")?.value || "";
    console.log("🎯 Session selected:", session);

    
    let base = 0, discount = 0;
    if (session === "Beginner") {
      base = 420;
      discount = today <= earlyBirdDeadline ? 35 : 0;
    } else if (session === "Intermediate") {
      base = 480;
      discount = today <= earlyBirdDeadline ? 40 : 0;
    } else if (session === "Advanced") {
      base = 600;
      discount = today <= earlyBirdDeadline ? 50 : 0;
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

  document.querySelectorAll("input[name='pythonSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  function buildPayload() {
    const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";

    const session = document.querySelector("input[name='pythonSession']:checked")?.value || "";
    const base = parseInt(document.querySelector("input[name='baseFee']").value) || 0;
    const discount = parseInt(document.querySelector("input[name='discountValue']").value) || 0;
    const finalFee = parseInt(document.querySelector("input[name='finalFee']").value) || 0;

    // Get session details (dates & timings) from mapping above
    const details = sessionDetails[session] || { sessionDates: "", sessionTimings: "" };

    const data = {
      programType: "Python Programming",
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
      pythonSession: session,
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
        sessionStorage.setItem("programType", "Python Programming");
        sessionStorage.setItem("pythonSession", payload.pythonSession);
        window.location.href = "/payment-options.html?session=" + encodeURIComponent(payload.pythonSession);
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
