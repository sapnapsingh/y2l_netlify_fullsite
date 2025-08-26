// main-sam-math.js — Math-only + Bundle (Math+ELA) pricing with ELA add-on UI

document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 SAM form booting…");

  // =========================
  // ---- MATH PRICING (as before)
  // =========================
  const MATH_FEE_TABLE = [
    { levels: ["0A", "0B", "0C", "1"], monthly: 200, quarterly: 575, sixmo: 1125, yearly: 1750 },
    { levels: ["2", "3", "4"],       monthly: 220, quarterly: 635,  sixmo: 1245, yearly: 1940 },
    { levels: ["5", "6"],            monthly: 235, quarterly: 680,  sixmo: 1335, yearly: 2083 }
  ];
  function priceMath(levelRaw, session) {
    const L = (levelRaw || "").toUpperCase().replace(/\s/g, "");
    let band = MATH_FEE_TABLE[0];
    for (const g of MATH_FEE_TABLE) { if (g.levels.includes(L)) { band = g; break; } }
    if (session === "Monthly")   return band.monthly;
    if (session === "Quarterly") return band.quarterly;
    if (session === "6 Months")  return band.sixmo;
    if (session === "1 Year")    return band.yearly;
    return 0;
  }

  // =========================
  // ---- BUNDLE PRICING (Math+ELA) you provided
  // Bands: A=0A,0B,0C,1  •  B=2,3,4  •  C=5,6
  // =========================
  const BANDS = {
    A: ["0A","0B","0C","1"],
    B: ["2","3","4"],
    C: ["5","6"]
  };
  function bandKey(level) {
    const L = (level || "").toUpperCase().replace(/\s/g, "");
    if (BANDS.A.includes(L)) return "A";
    if (BANDS.B.includes(L)) return "B";
    if (BANDS.C.includes(L)) return "C";
    return "A";
  }

  // Bundle table by (MathBand|ELABand) for each session
  const BUNDLE = {
    "Monthly": {
      "A|A": 355, "A|B": 355, "A|C": 355,
      "B|A": 395, "B|B": 395, "B|C": 395,
      "C|A": 425, "C|B": 425, "C|C": 425
    },
    "Quarterly": {
      "A|A": 1040, "A|B": 1040, "A|C": 1040,
      "B|A": 1160, "B|B": 1160, "B|C": 1160,
      "C|A": 1250, "C|B": 1250, "C|C": 1250
    },
    "6 Months": {
      "A|A": 2055, "A|B": 2055, "A|C": 2055,
      "B|A": 2295, "B|B": 2295, "B|C": 2295,
      "C|A": 2475, "C|B": 2475, "C|C": 2475
    },
    "1 Year": {
      "A|A": 3223, "A|B": 3223, "A|C": 3223,
      "B|A": 3603, "B|B": 3603, "B|C": 3603,
      "C|A": 3888, "C|B": 3888, "C|C": 3888
    }
  };

  function priceBundle(mathLevel, elaLevel, session) {
    const mk = bandKey(mathLevel);
    const ek = bandKey(elaLevel);
    const map = BUNDLE[session] || {};
    const val = map[`${mk}|${ek}`];
    return (typeof val === "number") ? val : null;
  }

  function monthsFor(session) {
    if (session === "Monthly") return 1;
    if (session === "Quarterly") return 3;
    if (session === "6 Months") return 6;
    if (session === "1 Year") return 12;
    return 1;
  }

  // =========================
  // ---- DOM HELPERS
  // =========================
  const $ = (sel) => document.querySelector(sel);
  const getVal = (name) => document.querySelector(`[name='${name}']`)?.value?.trim() || "";

  const form   = $("#sam-math-enrollment-form");
  const loader = $("#submitting-overlay");
  if (!form) { console.error("❌ #sam-math-enrollment-form not found."); return; }

  function ensureFeeLine(id, labelText) {
    let line = document.getElementById(id);
    if (!line) {
      const box = document.querySelector(".fee-summary-box");
      if (!box) return null;
      line = document.createElement("div");
      line.id = id;
      line.className = "fee-line";
      const l = document.createElement("span"); l.className = "fee-label"; l.textContent = labelText;
      const v = document.createElement("span"); v.className = "fee-value";
      line.appendChild(l); line.appendChild(v);
      const reg = document.getElementById("registration-fee-line");
      box.insertBefore(line, reg || box.lastChild);
    } else {
      const l = line.querySelector(".fee-label");
      if (l) l.textContent = labelText;
    }
    return line;
  }
  function setFeeLine(lineId, label, amount, showWhenZero=false) {
    const line = ensureFeeLine(lineId, label);
    if (!line) return;
    const v = line.querySelector(".fee-value");
    if (amount && amount > 0) {
      line.style.display = "";
      if (v) v.textContent = "$" + amount;
    } else if (showWhenZero) {
      line.style.display = "";
      if (v) v.textContent = "$0";
    } else {
      line.style.display = "none";
    }
  }

  // =========================
  // ---- FEE CALC + UI
  // =========================
  function calculateAndDisplayFee() {
    const session  = document.querySelector("input[name='samSession']:checked")?.value || "";
    const samLevel = getVal("samLevel");
    const isNew    = $("#isNewStudent")?.checked ? "yes" : "no";

    const enrollELA = $("#enrollELA")?.checked || false;
    const saeLevel  = $("#saeLevel")?.value || "";

    // Math tuition (always available when session+samLevel chosen)
    const mathTuition = (session && samLevel) ? priceMath(samLevel, session) : 0;

    let combinedTuition = mathTuition;
    let bundleUsed = false;

    if (enrollELA && session && samLevel && saeLevel) {
      const bundle = priceBundle(samLevel, saeLevel, session);
      if (bundle != null) { combinedTuition = bundle; bundleUsed = true; }
      // (If not all selected, keep showing math tuition until ready)
    }

    // Registration fee: one-time per student
    const registrationFee = (isNew === "yes") ? 50 : 0;

    // Savings vs monthly (based on chosen mode)
    let saveMsg = "";
    if (session && session !== "Monthly") {
      const months = monthsFor(session);
      let monthlyTotal = 0;
      if (bundleUsed) {
        const monthlyBundle = priceBundle(samLevel, saeLevel, "Monthly") || 0;
        monthlyTotal = monthlyBundle * months;
      } else {
        const monthlyMath = priceMath(samLevel, "Monthly") * months;
        monthlyTotal = monthlyMath;
      }
      const savings = monthlyTotal - combinedTuition;
      if (savings > 0) saveMsg = `You save $${savings} compared to monthly pricing${bundleUsed ? " (bundle)" : ""}.`;
    }

    // -------- Fee UI --------
    if (bundleUsed) {
      setFeeLine("bundle-fee-line", "Bundle Tuition (Math+ELA):", combinedTuition, true);
      setFeeLine("math-fee-line",   "Math Tuition:", 0, false);
      setFeeLine("ela-fee-line",    "ELA Tuition:",  0, false);
    } else {
      setFeeLine("bundle-fee-line", "Bundle Tuition (Math+ELA):", 0, false);
      setFeeLine("math-fee-line",   "Math Tuition:", mathTuition, true);
      setFeeLine("ela-fee-line",    "ELA Tuition:",  0, false);
    }

    const totalFeeSpan = $("#total-fee");
    if (totalFeeSpan) totalFeeSpan.innerText = "$" + (combinedTuition || 0);

    const regLine = $("#registration-fee-line");
    const regSpan = $("#registration-fee");
    if (regLine && regSpan) {
      if (registrationFee && registrationFee > 0) { regLine.style.display = ""; regSpan.innerText = "$" + registrationFee; }
      else { regLine.style.display = "none"; regSpan.innerText = "$0"; }
    }

    const discountLine = $("#discount-line");
    const finalLine    = $("#final-fee-line");
    if (discountLine) discountLine.style.display = "none";
    if (finalLine)    finalLine.style.display    = "none";

    let saveMsgDiv = document.getElementById("fee-save-msg");
    if (!saveMsgDiv) {
      saveMsgDiv = document.createElement("div");
      saveMsgDiv.id = "fee-save-msg";
      saveMsgDiv.style.fontWeight = "600";
      saveMsgDiv.style.color = "#2a7ae2";
      const box = document.querySelector(".fee-summary-box");
      if (box) box.appendChild(saveMsgDiv);
    }
    saveMsgDiv.innerText = saveMsg || "";

    // Installment + proration note
    const inst = document.getElementById("installment-info");
    if (inst) {
      if (session === "6 Months") {
        inst.innerText = "Note: The fee for a 6-month session is payable in 2 installments.";
      } else if (session === "1 Year") {
        inst.innerText = "Note: The fee for a 1-year session is payable in 3 installments. Proration applies since sessions began on August 18.";
      } else {
        inst.innerText = "";
      }
    }

    // Keep hidden inputs (SAM legacy) Math-only so backend stays intact
    const baseIn  = document.querySelector("input[name='baseFee']");
    const regIn   = document.querySelector("input[name='registrationFee']");
    const discIn  = document.querySelector("input[name='discountValue']");
    const finalIn = document.querySelector("input[name='finalFee']");
    if (baseIn)  baseIn.value  = mathTuition;
    if (regIn)   regIn.value   = registrationFee;
    if (discIn)  discIn.value  = "";
    if (finalIn) finalIn.value = mathTuition + registrationFee;

    // Publish for payload
    window.__SAM_FEE_STATE__ = {
      mathTuition,
      bundleTuition: bundleUsed ? combinedTuition : null,
      combinedTuition,
      registrationFee,
      pricingMode: bundleUsed ? "bundle" : "math-only"
    };
  }

  // Hook up fee listeners
  document.querySelectorAll("input[name='samSession']").forEach(r => r.addEventListener("change", calculateAndDisplayFee));
  document.querySelector("[name='samLevel']")?.addEventListener("change", calculateAndDisplayFee);
  $("#isNewStudent")?.addEventListener("change", calculateAndDisplayFee);

  // =======================
  // ---- ELA add-on UI ----
  // =======================
  (function elaAddon() {
    const enroll = $("#enrollELA");
    const block  = $("#ela-extra-fields");
    const saeLvl = $("#saeLevel");
    const elaSel = $("#elaPreferredSlot");
    const mathSel= $("#preferredSlot");
    const warn   = $("#ela-slot-warning");

    if (!enroll || !block) { console.warn("ℹ️ ELA block not found in HTML."); return; }

    function show(on) {
      block.style.display = on ? "block" : "none";
      if (saeLvl) saeLvl.required = on;
      if (elaSel) elaSel.required = on;
      if (!on) {
        if (saeLvl) saeLvl.value = "";
        if (elaSel) elaSel.value = "";
        if (warn)   warn.style.display = "none";
      }
      calculateAndDisplayFee();
    }

    function syncElaOptions() {
      if (!elaSel) return;
      [...elaSel.options].forEach(o => o.disabled = false);
      const m = mathSel?.value || "";
      if (m) {
        for (const opt of elaSel.options) {
          if (opt.value === m) {
            opt.disabled = true;
            if (elaSel.value === m) {
              elaSel.value = "";
              if (warn) warn.style.display = "block";
            }
            break;
          }
        }
      }
    }

    enroll.addEventListener("change", () => { show(enroll.checked); if (enroll.checked) syncElaOptions(); });
    mathSel?.addEventListener("change", () => { if (warn) warn.style.display = "none"; syncElaOptions(); });
    elaSel?.addEventListener("change", () => {
      if (warn) warn.style.display = "none";
      if (mathSel && elaSel && elaSel.value === mathSel.value) {
        elaSel.value = "";
        if (warn) warn.style.display = "block";
      }
    });
    saeLvl?.addEventListener("change", calculateAndDisplayFee);

    // init
    show(enroll.checked);
    syncElaOptions();
    console.log("🧩 ELA add-on wired.");
  })();

  // ============================
  // ---- Build submit payload ---
  // ============================
  function buildPayload() {
    const sessionRaw = document.querySelector("input[name='samSession']:checked")?.value || "";
    const session = (sessionRaw || "").trim().toLowerCase();

    const map = {
      "monthly":    { sessionLabel: "Monthly",    sessionLength: "1 month" },
      "quarterly":  { sessionLabel: "Quarterly",  sessionLength: "3 months" },
      "6 months":   { sessionLabel: "6 Months",   sessionLength: "6 months" },
      "1 year":     { sessionLabel: "1 Year",     sessionLength: "12 months" }
    };
    const details = map[session] || { sessionLabel: "", sessionLength: "" };

    const fee = window.__SAM_FEE_STATE__ || { mathTuition:0, bundleTuition:null, combinedTuition:0, registrationFee:0, pricingMode:"math-only" };
    const isNew   = $("#isNewStudent")?.checked ? "yes" : "no";
    const alsoELA = $("#enrollELA")?.checked ? "Yes" : "No";
    const saeLvlV = $("#saeLevel")?.value?.trim() || "";
    const elaSlot = $("#elaPreferredSlot")?.value?.trim() || "";

    const payload = {
      // Parent/Student
      parentName: getVal("parentName"),
      email: getVal("email"),
      phone: getVal("phone"),
      billingAddress: getVal("billingAddress"),
      student_1_name: getVal("student1Name") || getVal("student_1_name"),
      grade_1: getVal("grade1") || getVal("grade_1"),
      school_1: getVal("school1") || getVal("school_1"),
      nationality: getVal("nationality"),
      dob: getVal("dob"),

      // Program identifiers
      programType: "SAM Singapore Math",

      // Levels
      samLevel: getVal("samLevel"),
      saeLevel: saeLvlV,

      // Consents
      photo_consent: document.querySelector('[name="photoConsent"]')?.checked ? "Yes" : "No",
      cancellation_policy: document.querySelector('[name="refundPolicy"]')?.checked ? "Yes" : "No",
      medical_release: document.querySelector('[name="emergencyMedical"]')?.checked ? "Yes" : "No",
      emergency_contact_info: document.querySelector('[name="emergencyContact"]')?.checked ? "Yes" : "No",

      // Emergency/Medical
      emergency_name: getVal("emergencyContactName"),
      emergency_phone: getVal("emergencyContactPhone"),
      medical_conditions: getVal("medicalInfo"),
      medications: getVal("medications"),

      // SAM (Math) session
      samSession: session,
      sessionLabel: details.sessionLabel,
      sessionLength: details.sessionLength,
      preferredSlot: getVal("preferredSlot"),

      // Fees (keep SAM legacy Math-only to avoid breaking existing handler)
      baseFee: fee.mathTuition,
      registrationFee: fee.registrationFee,
      discountValue: "",
      finalFee: fee.mathTuition + fee.registrationFee,
      isNewStudent: isNew,

      // ELA (SAE) add-on
      alsoEnrollELA: alsoELA,
      elaPreferredSlot: elaSlot,
      saePreferredSlot: elaSlot,
      saeSession: session,
      saeSessionLabel: details.sessionLabel,
      saeSessionLength: details.sessionLength,

      // Extended fields for combined PDF / English sheet
      bundleBaseFee: fee.bundleTuition || 0,
      combinedBaseFee: fee.combinedTuition,
      combinedFinalFee: fee.combinedTuition + fee.registrationFee,
      pricingMode: fee.pricingMode
    };

    console.log("📦 Submitting payload:", payload);
    return payload;
  }

  // ==================
  // ---- Submit ------
  // ==================
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // If ELA is selected, enforce required fields + different slot
    const enroll = $("#enrollELA");
    if (enroll?.checked) {
      const saeLvl = $("#saeLevel")?.value || "";
      const elaSel = $("#elaPreferredSlot")?.value || "";
      const mathSel= $("#preferredSlot")?.value || "";

      if (!saeLvl) { alert("Please choose an SAE assessed level for ELA."); return; }
      if (!elaSel) { alert("Please choose an ELA preferred slot."); return; }
      if (mathSel && elaSel === mathSel) { alert("ELA slot cannot be the same as Math slot. Please choose a different time."); return; }
    }

    if (loader) loader.style.display = "block";

    const payload = buildPayload();

    fetch("/.netlify/functions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.text())
      .then(txt => {
        if (loader) loader.style.display = "none";
        console.log("✅ Server response:", txt);
        if (txt.trim() === "Submitted and emailed successfully.") {
          window.top.location.href = "https://y2lacademy.com/summer-confirmation";
        } else {
          alert("Submission error: " + txt);
        }
      })
      .catch(err => {
        if (loader) loader.style.display = "none";
        console.error("❌ Submit failed:", err);
        alert("There was an error submitting the form. Please try again.");
      });
  });

  // First render
  calculateAndDisplayFee();
  console.log("✅ SAM form ready.");
});
