
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("enrollmentForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Your submission logic here...
    });
  }

  // Initialize the fee summary safely
  updateFeeSummary();
});

function updateFeeSummary() {
  let totalBaseFee = 0;
  let totalDiscount = 0;
  let finalFee = 0;

  // Example calculation logic with null checks
  const baseFeeElement = document.getElementById("baseFee");
  const discountElement = document.getElementById("discount");
  const finalFeeElement = document.getElementById("finalFee");

  if (baseFeeElement) baseFeeElement.textContent = totalBaseFee.toFixed(2);
  if (discountElement) discountElement.textContent = totalDiscount.toFixed(2);
  if (finalFeeElement) finalFeeElement.textContent = finalFee.toFixed(2);
}

// Add other logic from your script here if needed, like fee calculations
