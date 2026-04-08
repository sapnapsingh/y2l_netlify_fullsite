const fetch = require("node-fetch");

const SCRIPT_URLS = {
  Summer2026: "https://script.google.com/macros/s/AKfycbxDWMOsw3qTN2qZ05r5bYKhoGOpzK70n6BRlOSvO1tWDEuYmb8W3sssxGiqOvAAHl5b/exec"
};

const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHfEeb6w_EXWd951Lq043WYuw_H1VCtu-vJQQOYGSjF5vEYpdoNpL_eqRb5kuNFQzF/exec";

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
    const targetUrl = SCRIPT_URLS[programType] || DEFAULT_SCRIPT_URL;

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
