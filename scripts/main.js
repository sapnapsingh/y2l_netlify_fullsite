function buildPayload() {
  const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";

  const data = {
    parentName: getVal("parentName"),
    email: getVal("email"),
    phone: getVal("phone"),
    billingAddress: getVal("billingAddress"),
    student_1_name: getVal("student1Name"),
    grade_1: getVal("grade1"),
    school_1: getVal("school1"),
    student_2_name: getVal("student2Name"),
    grade_2: getVal("grade2"),
    school_2: getVal("school2"),
    emergency_name: getVal("emergencyContactName"),
    emergency_phone: getVal("emergencyContactPhone"),
    medical_conditions: getVal("medicalInfo"),
    medications: getVal("medications"),
    allergies: getVal("allergies"),
    photo_consent: document.querySelector('[name="photoConsent"]')?.checked ? "Yes" : "No",
    cancellation_policy: document.querySelector('[name="refundPolicy"]')?.checked ? "Yes" : "No",
    medical_release: document.querySelector('[name="emergencyMedical"]')?.checked ? "Yes" : "No",
    emergency_contact_info: document.querySelector('[name="emergencyContact"]')?.checked ? "Yes" : "No"
  };

  // Include all program checkboxes
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(cb => {
    if (cb.name && cb.checked && cb.name.includes(" - ")) {
      data[cb.name] = "Yes";
    }
  });

  data.baseFee = getVal("baseFee");
data.discount = getVal("discountValue");
data.finalFee = getVal("finalFee");
return data;
}


function calculateFee() {
  

  let totalFee = 0;
  let discount = 0;

  const programFees = {
    "Math": 195,
    "Public Speaking": 185,
    "Creative Writing": 175,
    "Chess": 300,
    "Python": 195
  };

  let chessWeeks = 0;
  let siblingChessWeeks = 0;
  let otherWeeks = 0;
  let siblingOtherWeeks = 0;

  const today = new Date();
  const earlyBirdDeadline = new Date("2025-07-06");
  let earlyBirdDeadlinePassed = today > earlyBirdDeadline;

  let breakdown = {
    earlyBird: 0,
    chessMultiWeek: 0,
    chessSibling: 0,
    multiWeek: 0
  };

  // Student 1
  document.querySelectorAll('#program-grid input[type="checkbox"]').forEach(checkbox => {
    if (checkbox.checked) {
      for (const prog in programFees) {
        if (checkbox.name.includes(prog)) {
          totalFee += programFees[prog];
          if (prog === "Chess") chessWeeks++;
          else otherWeeks++;
        }
      }
    }
  });

  // Student 2
  if (document.getElementById('add-sibling-checkbox').checked) {
    document.querySelectorAll('#sibling-program-grid input[type="checkbox"]').forEach(checkbox => {
      if (checkbox.checked) {
        for (const prog in programFees) {
          if (checkbox.name.includes(prog)) {
            totalFee += programFees[prog];
            if (prog === "Chess") siblingChessWeeks++;
            else siblingOtherWeeks++;
          }
        }
      }
    });
  }

  // Early Bird Discount
  if (!earlyBirdDeadlinePassed) {
    breakdown.earlyBird += (chessWeeks + siblingChessWeeks) * 20;
    breakdown.earlyBird += (otherWeeks + siblingOtherWeeks) * 10;
  }

  // Sibling Chess Discount and Correct Multi-Week Logic
  let sharedChessWeeks = 0;
  for (let week = 1; week <= 8; week++) {
    const w = `S1 - ${week} - Chess`;
    const s = `S2 - ${week} - Chess`;
    if (document.querySelector(`[name='${w}']`)?.checked && document.querySelector(`[name='${s}']`)?.checked) {
      sharedChessWeeks++;
    }
  }

  if (sharedChessWeeks > 0) {
    breakdown.chessSibling += sharedChessWeeks * 20;
  } else if (chessWeeks === 0 && siblingChessWeeks >= 2) {
    breakdown.chessMultiWeek += siblingChessWeeks * 5;
  }

  if (chessWeeks >= 2) {
    breakdown.chessMultiWeek += chessWeeks * 5;
  }

  // Multi-Program Discount
  const totalWeeks = otherWeeks + siblingOtherWeeks;
  if (totalWeeks >= 4) {
    breakdown.multiWeek += totalWeeks * 5;
  }

  discount = breakdown.earlyBird + breakdown.chessMultiWeek + breakdown.chessSibling + breakdown.multiWeek;

  document.getElementById('total-fee').innerText = "$" + totalFee;
  document.getElementById('discount').innerText = "$" + discount;
  document.getElementById('final-fee').innerText = "$" + (totalFee - discount);
  const baseFeeInput = document.querySelector("[name='baseFee']");
  const discountInput = document.querySelector("[name='discountValue']");
  const finalFeeInput = document.querySelector("[name='finalFee']");
  if (baseFeeInput) baseFeeInput.value = totalFee;
  if (discountInput) discountInput.value = discount;
  if (finalFeeInput) finalFeeInput.value = totalFee - discount;


  // Update Discount Breakdown
  let breakdownText = "";
  if (discount > 0) {
    breakdownText += "<h4>💸 Discounts Applied:</h4><ul style='margin:0;padding-left:20px'>";
    if (breakdown.earlyBird > 0) breakdownText += `<li>Early Bird Discount: $${breakdown.earlyBird}</li>`;
    if (breakdown.chessMultiWeek > 0) breakdownText += `<li>Chess Multi-Week Discount: $${breakdown.chessMultiWeek}</li>`;
    if (breakdown.chessSibling > 0) breakdownText += `<li>Sibling Chess Discount: $${breakdown.chessSibling}</li>`;
    if (breakdown.multiWeek > 0) breakdownText += `<li>Multi-Program Discount: $${breakdown.multiWeek}</li>`;
    breakdownText += "</ul>";
  }
  const summaryDiv = document.getElementById("discount-breakdown");
  summaryDiv.innerHTML = breakdownText;
  summaryDiv.style.display = discount > 0 ? "block" : "none";
}

// Load Grids
fetch('/grids/program_grid.html').then(r => r.text()).then(d => {
  document.getElementById('program-grid').innerHTML = d;
  document.querySelectorAll('#program-grid input[type="checkbox"]').forEach(cb => cb.onchange = calculateFee);
  calculateFee();
});
fetch('/grids/sibling_program_grid.html').then(r => r.text()).then(d => {
  document.getElementById('sibling-program-grid').innerHTML = d;
  document.querySelectorAll('#sibling-program-grid input[type="checkbox"]').forEach(cb => cb.onchange = calculateFee);
  calculateFee();
});




document.getElementById('add-sibling-checkbox').addEventListener('change', function () {
  const section = document.getElementById('sibling-info-section');
  if (this.checked) {
    section.style.display = 'block';
  } else {
    section.style.display = 'none';
  }
  calculateFee();
});

document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.querySelector("button[type='submit']");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", function (e) {
    const waiverBoxes = document.querySelectorAll(".waiver-section input[type='checkbox']");
    const requiredWaivers = [waiverBoxes[1], waiverBoxes[2], waiverBoxes[3]];
    const parentFields = ["parentName", "email", "phone", "billingAddress"];
    const studentFields = ["student1Name", "grade1", "school1"];
    const emergencyFields = ["medicalInfo", "medications", "emergencyContactName", "emergencyContactPhone"];
    const programBoxes = document.querySelectorAll("#program-grid input[type='checkbox']");

    let errors = [];

    for (let name of parentFields) {
      const el = document.querySelector(`[name='${name}']`);
      if (!el || el.value.trim() === "") {
        errors.push("• Parent Information");
        break;
      }
    }

    for (let name of studentFields) {
      const el = document.querySelector(`[name='${name}']`);
      if (!el || el.value.trim() === "") {
        errors.push("• Student Information");
        break;
      }
    }

    for (let name of emergencyFields) {
      const el = document.querySelector(`[name='${name}']`);
      if (!el || el.value.trim() === "") {
        errors.push("• Emergency & Medical Info");
        break;
      }
    }

    
    if (document.getElementById("add-sibling-checkbox")?.checked) {
      const siblingFields = ["student2Name", "grade2", "school2"];
      for (let name of siblingFields) {
        const el = document.querySelector(`[name='${name}']`);
        if (!el || el.value.trim() === "") {
          errors.push("• Sibling Information");
          break;
        }
      }
    }


    if (!requiredWaivers.every(cb => cb && cb.checked)) {
      errors.push("• Required Waivers");
    }

    if (!Array.from(programBoxes).some(cb => cb.checked)) {
      errors.push("• Program Selection");
    }

    const errorMsgBox = document.getElementById("form-error-msg");
    if (errors.length > 0) {
      e.preventDefault();
      errorMsgBox.innerText = "⚠️ Please complete the following sections before submitting:\n" + errors.join("\n");
      errorMsgBox.style.display = "block";
      document.getElementById("submitting-overlay").style.display = "none";
      console.warn("Validation failed:", errors);
      return;
    } else {
      errorMsgBox.innerText = "";
      errorMsgBox.style.display = "none";
      document.getElementById("submitting-overlay").style.display = "flex";
    }

    const payload = buildPayload();
    
    
    console.log("Waiver values being submitted:", {
  photo_consent: payload.photo_consent,
  cancellation_policy: payload.cancellation_policy,
  medical_release: payload.medical_release,
  emergency_contact_info: payload.emergency_contact_info
});
fetch("/.netlify/functions/submit", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => response.text())
    .then(result => {
      if (result.trim() === "Submitted and emailed successfully.") {
        window.top.location.href = "https://y2lacademy.com/summer-confirmation";
      } else {
        alert("Submission error: " + result);
      }
    })
    .catch(error => {
      console.error("Submission failed:", error);
      alert("There was an error submitting the form. Please try again.");
    });

    
  });
});
