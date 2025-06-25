
// Patched main.js with support for Chess AM/PM, correct sibling discount, and updated logic

// --- Constants ---
const PROGRAM_FEES = {
  "Math AM": 160,
  "Math PM": 160,
  "Chess AM": 300,
  "Chess PM": 300,
  "Python": 170,
  "Creative Writing": 160,
  "Public Speaking": 160
};

const EARLY_BIRD_END = new Date("2025-05-21T23:59:59");

// --- Utility Functions ---
function getSelectedPrograms(student) {
  const selected = {};
  const weeks = document.querySelectorAll(`#${student} .week`);
  weeks.forEach(week => {
    const weekNum = week.dataset.week;
    selected[weekNum] = [];
    week.querySelectorAll("input[type='checkbox']:checked").forEach(cb => {
      selected[weekNum].push(cb.value);
    });
  });
  return selected;
}

function calculateFees(basePrograms, siblingPrograms, isEarlyBird) {
  let baseFee = 0;
  let discount = 0;
  let chessCount = 0;
  let siblingChessOverlap = 0;

  const weeks = Object.keys(basePrograms);
  weeks.forEach(week => {
    basePrograms[week].forEach(p => {
      baseFee += PROGRAM_FEES[p] || 0;
      if (p.includes("Chess")) chessCount++;
    });
  });

  const siblingWeeks = Object.keys(siblingPrograms || {});
  if (siblingPrograms) {
    siblingWeeks.forEach(week => {
      siblingPrograms[week].forEach(p => {
        baseFee += PROGRAM_FEES[p] || 0;
        if (p.includes("Chess")) {
          if (basePrograms[week] && basePrograms[week].some(bp => bp.includes("Chess"))) {
            siblingChessOverlap++;
          }
        }
      });
    });
  }

  const chessDiscount = isEarlyBird ? 25 : 0;
  discount += chessCount * chessDiscount;
  discount += siblingChessOverlap * chessDiscount;

  return {
    baseFee,
    discount,
    finalFee: baseFee - discount
  };
}

function updateFeeSummary() {
  const isEarlyBird = new Date() <= EARLY_BIRD_END;

  const student1Programs = getSelectedPrograms("student1-programs");
  const student2Programs = document.getElementById("student2-toggle").checked
    ? getSelectedPrograms("student2-programs")
    : {};

  const fees = calculateFees(student1Programs, student2Programs, isEarlyBird);

  document.getElementById("base-fee").textContent = `$${fees.baseFee}`;
  document.getElementById("discount").textContent = `$${fees.discount}`;
  document.getElementById("final-fee").textContent = `$${fees.finalFee}`;

  document.getElementById("baseFeeInput").value = fees.baseFee;
  document.getElementById("discountInput").value = fees.discount;
  document.getElementById("finalFeeInput").value = fees.finalFee;
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", updateFeeSummary);
  });

  const toggle = document.getElementById("student2-toggle");
  if (toggle) {
    toggle.addEventListener("change", () => {
      document.getElementById("student2-programs").style.display = toggle.checked ? "block" : "none";
      updateFeeSummary();
    });
  }

  updateFeeSummary();
});
