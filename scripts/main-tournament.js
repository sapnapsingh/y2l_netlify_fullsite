
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tournamentForm");
  const overlay = document.getElementById("submittingOverlay");
  const categoryRadios = document.querySelectorAll("input[name='ratingCategory']");
  const purchaseCheckbox = document.getElementById("purchaseUSCF");
  const dobField = document.getElementById("dobField");
  const dobInput = document.getElementById("dobInput");

  function updateFeeSummary() {
    let base = 0;
    let uscfFee = 0;

    const category = document.querySelector("input[name='ratingCategory']:checked");
    if (category) {
      if (category.value === "under400") base = 25;
      else if (category.value === "401to800") base = 30;
      else if (category.value === "800plus") base = 35;
    }

    if (purchaseCheckbox && purchaseCheckbox.checked) {
      uscfFee = 20;
    }

    const final = base + uscfFee;

    document.getElementById("baseFee").innerText = base;
    document.getElementById("uscfFee").innerText = uscfFee;
    document.getElementById("finalFee").innerText = final;
  }

  categoryRadios.forEach(radio => {
    radio.addEventListener("change", updateFeeSummary);
  });

  if (purchaseCheckbox) {
    purchaseCheckbox.addEventListener("change", () => {
      updateFeeSummary();
      if (purchaseCheckbox.checked) {
        dobField.style.display = "block";
        dobInput.required = true;
      } else {
        dobField.style.display = "none";
        dobInput.required = false;
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    overlay.style.display = "flex";

    const payload = {
      programType: "ChessTournament",
      parentName: form.parentName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      studentName: form.studentName.value.trim(),
      grade: form.grade.value.trim(),
      school: form.school.value.trim(),
      uscfId: form.uscfId.value.trim(),
      purchaseUSCF: form.purchaseUSCF.checked ? "Yes" : "No",
      dob: form.purchaseUSCF.checked ? form.dob.value.trim() : "",
      ratingCategory: form.ratingCategory.value,
      baseFee: parseInt(document.getElementById("baseFee").innerText),
      uscfFee: parseInt(document.getElementById("uscfFee").innerText),
      finalFee: parseInt(document.getElementById("finalFee").innerText)
    };

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(() => {
        window.location.href = "/payment-options.html";
      })
      .catch(() => {
        overlay.style.display = "none";
        alert("Something went wrong. Please try again.");
      });
  });

  updateFeeSummary();
});
