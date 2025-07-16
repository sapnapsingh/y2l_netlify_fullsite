
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
  } else {
    console.warn("❌ Could not find one or more fee summary spans");
  }

  const baseInput = document.getElementById("baseFee");
  const discountInput = document.getElementById("discountValue");
  const finalInput = document.getElementById("finalFee");

  if (baseInput) baseInput.value = base;
  if (discountInput) discountInput.value = discount;
  if (finalInput) finalInput.value = finalFee;

  console.log("✅ Set input values");

  return { session, base, discount, finalFee };
}


// Bind fee calc on session selection
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input[name='chessSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });
});
