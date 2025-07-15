
document.getElementById('chessEnrollmentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const today = new Date();
  const earlyBirdDeadline = new Date("2025-08-15");
  let fee = 0;
  let base = 0;
  let discount = 0;

  if (data.chessSession === "Beginner") {
    base = 360;
    discount = today <= earlyBirdDeadline ? 60 : 0;
  } else if (data.chessSession === "Advanced") {
    base = 420;
    discount = today <= earlyBirdDeadline ? 60 : 0;
  }

  fee = base - discount;
  document.getElementById('total-fee').innerText = "$" + fee;

  data.baseFee = base;
  data.discountValue = discount;
  data.finalFee = fee;
  data.programType = "Chess";

  fetch("/.netlify/functions/submit", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(result => {
    if (result.includes("success")) {
      window.location.href = "https://y2lacademy.com/summer-confirmation";
    } else {
      document.getElementById('form-error-msg').innerText = "Submission failed: " + result;
      document.getElementById('form-error-msg').style.display = "block";
    }
  })
  .catch(err => {
    document.getElementById('form-error-msg').innerText = "Submission error: " + err.message;
    document.getElementById('form-error-msg').style.display = "block";
  });
});
