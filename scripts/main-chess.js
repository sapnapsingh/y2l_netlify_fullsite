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

  const totalFeeSpan = document.getElementById("total-fee");
  const discountSpan = document.getElementById("discount");
  const finalFeeSpan = document.getElementById("final-fee");

  if (totalFeeSpan && discountSpan && finalFeeSpan) {
    totalFeeSpan.innerText = "$" + base;
    discountSpan.innerText = "$" + discount;
    finalFeeSpan.innerText = "$" + finalFee;
    console.log("✅ Updated fee display elements");
  }

  const baseInput = document.getElementById("baseFee");
  const discountInput = document.getElementById("discountValue");
  const finalInput = document.getElementById("finalFee");

  if (baseInput) baseInput.value = base;
  if (discountInput) discountInput.value = discount;
  if (finalInput) finalInput.value = finalFee;

  console.log("✅ Set input values");
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("input[name='chessSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  const form = document.getElementById("enrollment-form");
  if (!form) {
    console.error("❌ enrollment-form not found!");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        const session = jsonData["chessSession"];
        if (session === "Beginner to Intermediate") {
          window.location.href = "https://564b76c3-9a27-43ef-a0d9-de5359ab6f33.paylinks.godaddy.com/y2l-fall-chess-beginner";
        } else if (session === "Intermediate to Advanced") {
          window.location.href = "https://564b76c3-9a27-43ef-a0d9-de5359ab6f33.paylinks.godaddy.com/y2l-fall-chess-advanced";
        } else {
          alert("Unknown session. Please contact support.");
        }
      } else {
        alert("Submission failed: " + result.error);
      }
    })
    .catch(error => {
      console.error("Submission error:", error);
      alert("An error occurred during submission.");
    });
  });
});
