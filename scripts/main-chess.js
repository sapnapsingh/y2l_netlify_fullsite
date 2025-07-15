
function submitChessForm() {
  const overlay = document.getElementById("submitting-overlay");
  overlay.style.display = "flex";

  const getVal = name => document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  const getRadio = name => document.querySelector(`[name='${name}']:checked`)?.value || "";

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
    photo_consent: document.querySelector("[name='photoConsent']")?.checked ? "Yes" : "No",
    cancellation_policy: document.querySelector("[name='refundPolicy']")?.checked ? "Yes" : "No",
    medical_release: document.querySelector("[name='emergencyMedical']")?.checked ? "Yes" : "No",
    emergency_contact_info: document.querySelector("[name='emergencyContact']")?.checked ? "Yes" : "No",
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
      document.getElementById("form-error-msg").innerText = "Submission failed: " + result;
      overlay.style.display = "none";
    }
  })
  .catch(err => {
    document.getElementById("form-error-msg").innerText = "Submission error: " + err.message;
    overlay.style.display = "none";
  });
}
