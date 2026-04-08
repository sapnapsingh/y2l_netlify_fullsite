function buildPayload() {
  const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";

  const data = {
    programType: "Summer2026",
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

  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    if (cb.name && cb.checked && cb.name.includes(" - ")) {
      data[cb.name] = "Yes";
    }
  });

  data.baseFee = getVal("baseFee");
  data.discount = getVal("discountValue");
  data.finalFee = getVal("finalFee");

  return data;
}

// =========================
// Editable Pricing Settings
// =========================
const EARLY_BIRD_TIER_1_DEADLINE = new Date("2026-05-07T23:59:59");
const EARLY_BIRD_TIER_2_DEADLINE = new Date("2026-05-15T23:59:59");
const EARLY_BIRD_TIER_1_AMOUNT = 25;
const EARLY_BIRD_TIER_2_AMOUNT = 15;
const MULTI_WEEK_DISCOUNT_PER_WEEK = 10;
const SIBLING_DISCOUNT_PER_WEEK = 10;

function getProgramMeta(programName) {
  const meta = {
    "Math Explorers Around the World": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "STEAM Builders Lab": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Public Speaking - Confident Speakers": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Chess Camp 1": { price: 250, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Beginner Python with Intro to AI": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Math Through Art": { price: 180, earlyBirdEligible: false, multiWeekEligible: false, siblingEligible: false, holidayWeek: true },
    "Math in Nature": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Public Speaking - Art of Persuasion": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "STEM Innovation Camp": { price: 200, earlyBirdEligible: false, multiWeekEligible: false, siblingEligible: true, holidayWeek: false },
    "Chess Camp 2": { price: 250, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Intermediate Python & AI Projects": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Math Makers Showcase": { price: 225, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false },
    "Chess Mastery Camp": { price: 250, earlyBirdEligible: true, multiWeekEligible: true, siblingEligible: true, holidayWeek: false }
  };

  return meta[programName] || { price: 0, earlyBirdEligible: false, multiWeekEligible: false, siblingEligible: false, holidayWeek: false };
}

function parseSelectionName(name) {
  const parts = name.split(" - ");
  if (parts.length < 3) return null;

  return {
    student: parts[0],
    week: parts[1],
    program: parts.slice(2).join(" - ")
  };
}

function getSelectedPrograms(containerSelector) {
  const selections = [];

  document.querySelectorAll(`${containerSelector} input[type="checkbox"]`).forEach(checkbox => {
    if (!checkbox.checked || !checkbox.name) return;

    const parsed = parseSelectionName(checkbox.name);
    if (!parsed) return;

    const meta = getProgramMeta(parsed.program);

    selections.push({
      fieldName: checkbox.name,
      student: parsed.student,
      week: parsed.week,
      program: parsed.program,
      price: meta.price,
      earlyBirdEligible: meta.earlyBirdEligible,
      multiWeekEligible: meta.multiWeekEligible,
      siblingEligible: meta.siblingEligible,
      holidayWeek: meta.holidayWeek
    });
  });

  return selections;
}

function getEarlyBirdDiscountAmount(today) {
  if (today <= EARLY_BIRD_TIER_1_DEADLINE) return EARLY_BIRD_TIER_1_AMOUNT;
  if (today <= EARLY_BIRD_TIER_2_DEADLINE) return EARLY_BIRD_TIER_2_AMOUNT;
  return 0;
}

function calculateFee() {
  let totalFee = 0;
  let totalDiscount = 0;

  const today = new Date();
  const currentEarlyBirdAmount = getEarlyBirdDiscountAmount(today);
  const earlyBirdActive = currentEarlyBirdAmount > 0;

  const siblingEnabled = document.getElementById("add-sibling-checkbox")?.checked;

  const student1Selections = getSelectedPrograms("#program-grid");
  const student2Selections = siblingEnabled ? getSelectedPrograms("#sibling-program-grid") : [];
  const allSelections = [...student1Selections, ...student2Selections];

  allSelections.forEach(item => {
    totalFee += item.price;
  });

  const breakdown = {
    earlyBird: 0,
    multiWeek: 0,
    sibling: 0
  };

  if (earlyBirdActive) {
    // Early bird applies to eligible programs only
    allSelections.forEach(item => {
      if (item.earlyBirdEligible) {
        breakdown.earlyBird += currentEarlyBirdAmount;
      }
    });

    // During early bird period, do not stack sibling or multi-week
  } else {
    // Multi-week applies only to eligible programs when 3+ eligible weeks are selected
    const multiWeekEligibleSelections = allSelections.filter(item => item.multiWeekEligible);
    if (multiWeekEligibleSelections.length >= 3) {
      breakdown.multiWeek = multiWeekEligibleSelections.length * MULTI_WEEK_DISCOUNT_PER_WEEK;
    }

    // Sibling discount applies to student 2 eligible selections except holiday week
    student2Selections.forEach(item => {
      if (item.siblingEligible && !item.holidayWeek) {
        breakdown.sibling += SIBLING_DISCOUNT_PER_WEEK;
      }
    });
  }

  totalDiscount = breakdown.earlyBird + breakdown.multiWeek + breakdown.sibling;
  const finalFee = totalFee - totalDiscount;

  document.getElementById("total-fee").innerText = "$" + totalFee;
  document.getElementById("discount").innerText = "$" + totalDiscount;
  document.getElementById("final-fee").innerText = "$" + finalFee;

  const baseFeeInput = document.querySelector("[name='baseFee']");
  const discountInput = document.querySelector("[name='discountValue']");
  const finalFeeInput = document.querySelector("[name='finalFee']");

  if (baseFeeInput) baseFeeInput.value = totalFee;
  if (discountInput) discountInput.value = totalDiscount;
  if (finalFeeInput) finalFeeInput.value = finalFee;

  let breakdownHtml = "";
  if (totalDiscount > 0 || allSelections.some(item => item.holidayWeek)) {
    breakdownHtml += "<h4>Discounts Applied</h4><ul style='margin:0;padding-left:20px'>";
    if (breakdown.earlyBird > 0) {
      breakdownHtml += `<li>Early Bird Discount: $${breakdown.earlyBird}</li>`;
    }
    if (breakdown.multiWeek > 0) {
      breakdownHtml += `<li>Multi-Week Discount: $${breakdown.multiWeek}</li>`;
    }
    if (breakdown.sibling > 0) {
      breakdownHtml += `<li>Sibling Discount: $${breakdown.sibling}</li>`;
    }
    if (allSelections.some(item => item.holidayWeek)) {
      breakdownHtml += `<li>Holiday Week Pricing Applied: Week 4 is prorated and not eligible for additional discounts.</li>`;
    }
    breakdownHtml += "</ul>";
  }

  const summaryDiv = document.getElementById("discount-breakdown");
  if (summaryDiv) {
    summaryDiv.innerHTML = breakdownHtml;
    summaryDiv.style.display = breakdownHtml ? "block" : "block";
  }
}

function bindProgramGridEvents(containerId) {
  document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
    cb.addEventListener("change", calculateFee);
  });
}

function loadGrids() {
  fetch("/grids/program_grid.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("program-grid").innerHTML = html;
      bindProgramGridEvents("program-grid");
      calculateFee();
    });

  fetch("/grids/sibling_program_grid.html")
    .then(r => r.text())
    .then(html => {
      document.getElementById("sibling-program-grid").innerHTML = html;
      bindProgramGridEvents("sibling-program-grid");
      calculateFee();
    });
}

document.addEventListener("DOMContentLoaded", function () {
  loadGrids();

  const siblingToggle = document.getElementById("add-sibling-checkbox");
  if (siblingToggle) {
    siblingToggle.addEventListener("change", function () {
      const section = document.getElementById("sibling-info-section");
      if (section) {
        section.style.display = this.checked ? "block" : "none";
      }
      calculateFee();
    });
  }

  const submitBtn = document.querySelector("button[type='submit']");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", function (e) {
    const waiverBoxes = document.querySelectorAll(".waiver-section input[type='checkbox']");
    const requiredWaivers = [waiverBoxes[1], waiverBoxes[2], waiverBoxes[3]];

    const parentFields = ["parentName", "email", "phone", "billingAddress"];
    const studentFields = ["student1Name", "grade1", "school1"];
    const emergencyFields = ["medicalInfo", "medications", "emergencyContactName", "emergencyContactPhone"];

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

    const allProgramSelections = [
      ...document.querySelectorAll("#program-grid input[type='checkbox']"),
      ...document.querySelectorAll("#sibling-program-grid input[type='checkbox']")
    ];

    if (!allProgramSelections.some(cb => cb.checked)) {
      errors.push("• Program Selection");
    }

    const errorMsgBox = document.getElementById("form-error-msg");
    if (errors.length > 0) {
      e.preventDefault();
      if (errorMsgBox) {
        errorMsgBox.innerText = "⚠️ Please complete the following sections before submitting:\n" + [...new Set(errors)].join("\n");
        errorMsgBox.style.display = "block";
      }
      document.getElementById("submitting-overlay").style.display = "none";
      return;
    } else {
      if (errorMsgBox) {
        errorMsgBox.innerText = "";
        errorMsgBox.style.display = "none";
      }
      document.getElementById("submitting-overlay").style.display = "flex";
    }

    const payload = buildPayload();

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
          document.getElementById("submitting-overlay").style.display = "none";
        }
      })
      .catch(error => {
        console.error("Submission failed:", error);
        alert("There was an error submitting the form. Please try again.");
        document.getElementById("submitting-overlay").style.display = "none";
      });
  });
});
