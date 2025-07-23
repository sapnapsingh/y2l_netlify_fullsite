document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("tournamentForm");
  const baseFeeElem = document.getElementById("baseFee");
  const uscfFeeElem = document.getElementById("uscfFee");
  const finalFeeElem = document.getElementById("finalFee");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    const ratingCategory = formData.get("rating");
    const hasUscfId = formData.get("hasUscfId") === "yes";
    const purchaseUscf = formData.get("purchaseUscf") === "yes";

    let baseFee = 0;
    if (ratingCategory === "under400") baseFee = 25;
    else if (ratingCategory === "401to800") baseFee = 30;
    else if (ratingCategory === "800plus") baseFee = 35;

    const uscfFee = (!hasUscfId && purchaseUscf) ? 25 : 0;
    const finalFee = baseFee + uscfFee;

    const payload = {
      programType: "ChessTournament",
      timestamp: new Date().toISOString(),
      parentName: formData.get("parentName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      playerName: formData.get("studentName"),
      grade: formData.get("grade"),
      school: formData.get("school"),
      ratingCategory: formData.get("rating"),
      hasUscfId: hasUscfId ? "Yes" : "No",
      uscfId: formData.get("uscfId") || "",
      wantsToPurchaseUscf: purchaseUscf ? "Yes" : "No",
      baseFee: baseFee,
      uscfFee: uscfFee,
      finalFee: finalFee
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_URL/exec",
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        window.location.href = "/payment-options.html?session=" + ratingCategory + "&programType=ChessTournament&finalFee=" + finalFee;
      } else {
        alert("Error submitting form. Please try again.");
      }
    } catch (err) {
      alert("Error submitting form.");
    }
  });
});