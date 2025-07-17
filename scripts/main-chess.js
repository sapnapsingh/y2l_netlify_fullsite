document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 Chess form initialized");

  document.querySelectorAll("input[name='chessSession']").forEach(radio => {
    radio.addEventListener("change", calculateAndDisplayFee);
  });

  const form = document.getElementById("chess-enrollment-form");
  if (!form) {
    console.error("❌ chess-enrollment-form not found!");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const overlay = document.createElement("div");
    overlay.innerText = "Submitting your form...";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    overlay.style.color = "#000";
    overlay.style.fontSize = "24px";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 9999;
    document.body.appendChild(overlay);

    const payload = buildPayload(form);

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(response => response.text())
    .then(result => {
      document.body.removeChild(overlay);
      if (result.trim() === "Submitted and emailed successfully.") {
        window.location.href = "/payment-options.html";
      } else {
        alert("Submission failed: " + result);
      }
    })
    .catch(error => {
      document.body.removeChild(overlay);
      console.error("Submission error:", error);
      alert("An error occurred during submission.");
    });
  });

  calculateAndDisplayFee();
});

function calculateAndDisplayFee() {
  console.log("🔧 Fee calc triggered");

  const today = new Date();
  const earlyBirdDeadline = new Date("2025-08-10");

  const session = document.querySelector("input[name='chessSession']:checked")?.value || "";
  console.log("🎯 Session selected:", session);

  let base = 0, discount = 0;

  if (session === "Beginner") {
    base = 360;
    discount = today <= earlyBirdDeadline ? 60 : 0;
  } else if (session === "Advanced") {
    base = 420;
    discount = today <= earlyBirdDeadline ? 60 : 0;
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

function buildPayload(form) {
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    if (data.hasOwnProperty(key)) {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });

  data.programType = "Chess";
  console.log("📦 Payload built:", data);
  return data;
}
