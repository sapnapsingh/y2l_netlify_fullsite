
function calculateFee() {
  let totalFee = 0;
  let discount = 0;

  const programFees = {
    "Math": 160,
    "Math AM": 160,
    "Math PM": 160,
    "Public Speaking": 160,
    "Creative Writing": 160,
    "Chess": 300,
    "Python": 170
  };

  let chessWeeks = 0;
  let siblingChessWeeks = 0;
  let otherWeeks = 0;
  let siblingOtherWeeks = 0;

  let earlyBirdDeadlinePassed = false;

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
        if (checkbox.name.includes("Math AM") || checkbox.name.includes("Math PM")) {
          if (prog === "Math AM" && checkbox.name.includes("Math AM")) {
            totalFee += programFees["Math AM"];
            otherWeeks++;
            break;
          }
          if (prog === "Math PM" && checkbox.name.includes("Math PM")) {
            totalFee += programFees["Math PM"];
            otherWeeks++;
            break;
          }
        }
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
        if (checkbox.name.includes("Math AM") || checkbox.name.includes("Math PM")) {
          if (prog === "Math AM" && checkbox.name.includes("Math AM")) {
            totalFee += programFees["Math AM"];
            otherWeeks++;
            break;
          }
          if (prog === "Math PM" && checkbox.name.includes("Math PM")) {
            totalFee += programFees["Math PM"];
            otherWeeks++;
            break;
          }
        }
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

  // Chess Multi-Week Discount
  if (chessWeeks >= 2) {
    breakdown.chessMultiWeek += chessWeeks * 5;
  }
  if (siblingChessWeeks >= 2) {
    breakdown.chessMultiWeek += siblingChessWeeks * 5;
  }

  // Sibling Chess Discount
  if (chessWeeks > 0 && siblingChessWeeks > 0) {
    breakdown.chessSibling += siblingChessWeeks * 20;
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
document.getElementById('add-sibling-checkbox').addEventListener('change', calculateFee);
