document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", updateFeeSummary);
  });
  updateFeeSummary();
});

function updateFeeSummary() {
  const basePrices = {
    "Math AM": 160,
    "Math PM": 160,
    "Public Speaking": 160,
    "Creative Writing": 160,
    "Python": 170,
    "Chess AM": 300,
    "Chess PM": 300
  };

  const discountEligiblePrograms = ["Math AM", "Math PM", "Public Speaking", "Creative Writing", "Python"];

  let selections = { S1: [], S2: [] };

  const students = ["S1", "S2"];
  let totalBase = 0;
  let totalDiscount = 0;

  students.forEach(student => {
    for (let week = 1; week <= 8; week++) {
      const rowPrefix = `${student} - Week ${week}`;
      const selected = [];

      Object.keys(basePrices).forEach(program => {
        const checkbox = document.querySelector(`input[name="${rowPrefix} - ${program}"]`);
        if (checkbox && checkbox.checked) {
          selected.push(program);
          totalBase += basePrices[program];
        }
      });

      selections[student] = selections[student].concat(selected);
    }
  });

  // Apply discounts
  const isEarlyBird = new Date() <= new Date("2025-05-21T23:59:59");

  function countWeeks(studentPrograms) {
    const weekSet = new Set();
    studentPrograms.forEach((_, i) => {
      const match = studentPrograms[i].match(/Week (\d)/);
      if (match) weekSet.add(match[1]);
    });
    return weekSet.size;
  }

  const s1DiscountableCount = selections["S1"].filter(p => discountEligiblePrograms.includes(p)).length;
  const s2DiscountableCount = selections["S2"].filter(p => discountEligiblePrograms.includes(p)).length;

  if (isEarlyBird) {
    const totalDiscountable = s1DiscountableCount + s2DiscountableCount;
    totalDiscount += totalDiscountable * 10;

    if (s1DiscountableCount >= 4) totalDiscount += s1DiscountableCount * 5;
    if (s2DiscountableCount >= 4) totalDiscount += s2DiscountableCount * 5;

    const chessWeeks = new Set();
    students.forEach(student => {
      for (let week = 1; week <= 8; week++) {
        ["Chess AM", "Chess PM"].forEach(chessType => {
          const checkbox = document.querySelector(`input[name="${student} - Week ${week} - ${chessType}"]`);
          if (checkbox && checkbox.checked) {
            chessWeeks.add(week);
          }
        });
      }
    });
    totalDiscount += chessWeeks.size * 5;
  }

  document.getElementById("baseFee").textContent = "$" + totalBase;
  document.getElementById("discount").textContent = "-$" + totalDiscount;
  document.getElementById("finalFee").textContent = "$" + (totalBase - totalDiscount);
}

function buildPayload() {
  const payload = {};

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  payload.parentName = val("parentName");
  payload.email = val("email");
  payload.phone = val("phone");
  payload.billingAddress = val("billingAddress");

  payload.student_1_name = val("student_1_name");
  payload.grade_1 = val("grade_1");
  payload.school_1 = val("school_1");

  payload.student_2_name = val("student_2_name");
  payload.grade_2 = val("grade_2");
  payload.school_2 = val("school_2");

  payload.emergency_name = val("emergency_name");
  payload.emergency_phone = val("emergency_phone");

  payload.medical_conditions = val("medical_conditions");
  payload.allergies = val("allergies");
  payload.medications = val("medications");

  payload.photo_consent = document.getElementById("photo_consent")?.checked ? "Yes" : "No";
  payload.cancellation_policy = document.getElementById("cancellation_policy")?.checked ? "Yes" : "No";
  payload.medical_release = document.getElementById("medical_release")?.checked ? "Yes" : "No";
  payload.emergency_contact_info = document.getElementById("emergency_contact_info")?.checked ? "Yes" : "No";

  const students = ["S1", "S2"];
  for (let student of students) {
    for (let week = 1; week <= 8; week++) {
      ["Math AM", "Math PM", "Public Speaking", "Creative Writing", "Python", "Chess AM", "Chess PM"].forEach(program => {
        const checkbox = document.querySelector(`input[name="${student} - Week ${week} - ${program}"]`);
        if (checkbox) {
          payload[`${student} - Week ${week} - ${program}`] = checkbox.checked ? "Yes" : "";
        }
      });
    }
  }

  payload.baseFee = document.getElementById("baseFee").textContent.replace("$", "");
  payload.discount = document.getElementById("discount").textContent.replace("-$", "");
  payload.finalFee = document.getElementById("finalFee").textContent.replace("$", "");

  return payload;
}

document.getElementById("enrollmentForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const payload = buildPayload();

  fetch("https://script.google.com/macros/s/AKfycbyv.../exec", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => response.text())
    .then(result => {
      window.top.location.href = "confirmation_screen.html";
    })
    .catch(error => {
      alert("Submission failed. Please try again later.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Enrollment";
    });
});