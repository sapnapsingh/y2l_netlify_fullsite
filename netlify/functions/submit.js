
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("chess-enrollment-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const session = formData.get("chessSession");

    fetch("/.netlify/functions/submit", {
      method: "POST",
      body: formData
    })
    .then(() => {
      const sessionType = (session === "Beginner to Intermediate") ? "beginner" : "advanced";
      window.location.href = "/payment-options.html?session=" + sessionType;
    })
    .catch(() => {
      alert("Submission failed. Please try again.");
    });
  });
});
