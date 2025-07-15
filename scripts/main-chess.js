
function submitChessForm() {
  const overlay = document.getElementById("submitting-overlay");
  const errorMsg = document.getElementById("form-error-msg");
  errorMsg.innerText = "";
  errorMsg.style.display = "none";

  const getVal = name => document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  const getRadio = name => document.querySelector(`[name='${name}']:checked`)?.value || "";
  const getCheck = name => document.querySelector(`[name='${name}']`)?.checked;

  const requiredFields = [
    "parentName", "email", "phone", "billingAddress",
    "student1Name", "grade1", "school1",
    "medicalInfo", "medications",
    "emergencyContactName", "emergencyContactPhone"
  ];

  const waiverFields = ["refundPolicy", "emergencyMedical", "emergencyContact"];
  const errors = [];

  for (const name of requiredFields) {
    const value = getVal(name);
    if (!value) {
      errors.push(`• ${name.replace(/([A-Z])/g, ' $1')}`);
    }
  }

  for (const waiver of waiverFields) {
    if (!getCheck(waiver)) {
      errors.push(`• Waiver: ${waiver}`);
    }
  }

  if (!getRadio("chessSession")) {
    errors.push("• Select a Chess Session (Beginner or Advanced)");
  }

  if (errors.length > 0) {
    errorMsg.innerText = "⚠️ Please complete the following before submitting:
" + errors.join("\n");
    errorMsg.style.display = "block";
    overlay.style.display = "none";
    return;
  }

  overlay.style.display = "flex";

  const today = new Date();
  const earlyBirdDeadline = new Date("2025-08-15");

  const session = getRadio("chessSession");
  let base = 0, discount = 0;

  if (session === "Beginner") {
    base = 360;
    discount = today <= earlyBirdDeadline ? 60 : 0;
  } else if (session === "Advanced") {
    base = 420;
    discount = today <= earlyBirdDeadline ? 60 : 0;
  }

  const finalFee = base - discount;
  document.getElementById("total-fee").innerText = "$" + base;
  document.getElementById("discount").innerText = "$" + discount;
  document.getElementById("final-fee").innerText = "$" + finalFee;

  const data = {
    programType: "Chess",
    chessSession: session,
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
    photo_consent: getCheck("photoConsent") ? "Yes" : "No",
    cancellation_policy: getCheck("refundPolicy") ? "Yes" : "No",
    medical_release: getCheck("emergencyMedical") ? "Yes" : "No",
    emergency_contact_info: getCheck("emergencyContact") ? "Yes" : "No",
    baseFee: base,
    discountValue: discount,
    finalFee: finalFee
  };

  fetch("/.netlify/functions/submit", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(result => {
    if (result.includes("success") || result.includes("Submitted")) {
      window.location.href = "https://y2lacademy.com/summer-confirmation";
    } else {
      errorMsg.innerText = "Submission failed: " + result;
      errorMsg.style.display = "block";
      overlay.style.display = "none";
    }
  })
  .catch(err => {
    errorMsg.innerText = "Submission error: " + err.message;
    errorMsg.style.display = "block";
    overlay.style.display = "none";
  });
}
