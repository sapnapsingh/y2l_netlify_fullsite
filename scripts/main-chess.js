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

  // Update visible summary
  const totalFeeSpan = document.getElementById("total-fee");
  const discountSpan = document.getElementById("discount");
  const finalFeeSpan = document.getElementById("final-fee");

  if (totalFeeSpan && discountSpan && finalFeeSpan) {
    totalFeeSpan.innerText = "$" + base;
    discountSpan.innerText = "$" + discount;
    finalFeeSpan.innerText = "$" + finalFee;
    console.log("✅ Updated fee display elements");
  }

  // Set hidden field values by name
  const baseInput = document.querySelector("input[name='baseFee']");
  const discountInput = document.querySelector("input[name='discountValue']");
  const finalInput = document.querySelector("input[name='finalFee']");

  if (baseInput) baseInput.value = base;
  if (discountInput) discountInput.value = discount;
  if (finalInput) finalInput.value = finalFee;

  console.log("✅ Set input values");
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input[name='chessSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  // Trigger calculation initially if a radio is pre-selected
  calculateAndDisplayFee();
});
