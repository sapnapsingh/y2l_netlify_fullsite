function calculateAndDisplayFee() {
  console.log("🔧 Fee calc triggered");

  const today = new Date();
  const earlyBirdDeadline = new Date("2025-08-10");

  const session = document.querySelector("input[name='chessSession']:checked")?.value || "";
  console.log("🎯 Session selected:", session);

  let base = 0, discount = 0;

  if (session === "Beginner to Intermediate") {
    base = 360;
    discount = today <= earlyBirdDeadline ? 35 : 0;
  } else if (session === "Intermediate to Advanced") {
    base = 420;
    discount = today <= earlyBirdDeadline ? 35 : 0;
  }

  const finalFee = base - discount;
  console.log("💵 Base:", base, "| Discount:", discount, "| Final:", finalFee);

  document.getElementById("total-fee").innerText = "$" + base;
  document.getElementById("discount").innerText = "$" + discount;
  document.getElementById("final-fee").innerText = "$" + finalFee;

  document.getElementById("baseFee").value = base;
  document.getElementById("discountValue").value = discount;
  document.getElementById("finalFee").value = finalFee;
}

function buildChessPayload() {
  const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";
  const getChecked = (name) => document.querySelector(`[name='${name}']`)?.checked ? "Yes" : "No";

  return {
    programType: "Chess",
    parentName: getVal("parentName"),
    email: getVal("email"),
    phone: getVal("phone"),
    billingAddress: getVal("billingAddress"),
    student_1_name: getVal("studentName"),
    grade_1: getVal("grade"),
    school_1: getVal("school"),
    emergency_name: getVal("emergencyContactName"),
    emergency_phone: getVal("emergencyContactPhone"),
    medical_conditions: getVal("medicalInfo"),
    medications: getVal("medications"),
    photo_consent: getChecked("photoConsent"),
    cancellation_policy: getChecked("refundPolicy"),
    medical_release: getChecked("emergencyMedical"),
    emergency_contact_info: getChecked("emergencyContact"),
    chessSession: getVal("chessSession"),
    baseFee: getVal("baseFee"),
    discountValue: getVal("discountValue"),
    finalFee: getVal("finalFee")
  };
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input[name='chessSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  const form = document.getElementById("chess-enrollment-form");
  if (!form) {
    console.error("❌ Form ID not found: chess-enrollment-form");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const payload = buildChessPayload();
    console.log("📦 Submitting payload:", payload);

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        const session = payload.chessSession;
        if (session === "Beginner to Intermediate") {
          window.location.href = "https://564b76c3-9a27-43ef-a0d9-de5359ab6f33.paylinks.godaddy.com/y2l-fall-chess-beginner";
        } else if (session === "Intermediate to Advanced") {
          window.location.href = "https://564b76c3-9a27-43ef-a0d9-de5359ab6f33.paylinks.godaddy.com/y2l-fall-chess-advanced";
        } else {
          alert("Unknown session type selected.");
        }
      } else {
        console.error("❌ Submission failed:", response.error);
        alert("Submission failed: " + response.error);
      }
    })
    .catch(err => {
      console.error("❌ Fetch error:", err);
      alert("Error submitting form. Please try again.");
    });
  });
});
