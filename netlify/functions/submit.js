const fetch = require("node-fetch");

const SCRIPT_URLS = {
  Summer2026: "https://script.google.com/macros/s/AKfycbxDWMOsw3qTN2qZ05r5bYKhoGOpzK70n6BRlOSvO1tWDEuYmb8W3sssxGiqOvAAHl5b/exec",

  // Add these later when ready:
  // Chess: "PASTE_CHESS_GAS_URL_HERE",
  // Python: "PASTE_PYTHON_GAS_URL_HERE",
  // PublicSpeaking: "PASTE_PUBLIC_SPEAKING_GAS_URL_HERE"
};

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const programType = payload.programType;

    if (!programType) {
      return {
        statusCode: 400,
        body: "Missing programType in request payload."
      };
    }

    const targetUrl = SCRIPT_URLS[programType];

    if (!targetUrl) {
      return {
        statusCode: 400,
        body: `No Apps Script URL configured for programType: ${programType}`
      };
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const text = await response.text();

    return {
      statusCode: 200,
      body: text
    };
  } catch (err) {
    console.error("Error in Netlify function:", err);
    return {
      statusCode: 500,
      body: "Submission failed: " + err.message
    };
  }
};
