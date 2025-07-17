
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 Chess form initialized");

  const form = document.getElementById("chess-enrollment-form");
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

    if (session === "Beginner") {
      base = 360;
      discount = today <= earlyBirdDeadline ? 35 : 0;
    } else if (session === "Advanced") {
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
      console.log("✅ Updated fee display elements");
    }

    const baseInput = document.querySelector("input[name='baseFee']");
    const discountInput = document.querySelector("input[name='discountValue']");
    const finalInput = document.querySelector("input[name='finalFee']");

    if (baseInput) baseInput.value = base;
    if (discountInput) discountInput.value = discount;
    if (finalInput) finalInput.value = finalFee;

    console.log("✅ Set input values");
  }

  document.querySelectorAll("input[name='chessSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.innerText = "Submitting the form, please wait...";

    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });
    payload.programType = "Chess";

    console.log("📦 Payload:", payload);

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(response => response.text())
    .then(result => {
      console.log("📬 Server Response:", result);
      if (result.trim() === "Submitted and emailed successfully.") {
        window.location.href = "/payment-options.html";
      } else {
        alert("Submission error: " + result);
      }
    })
    .catch(error => {
      console.error("Submission failed:", error);
      alert("There was an error submitting the form. Please try again.");
    });
  });

  calculateAndDisplayFee(); // Initial calc if pre-filled
});
