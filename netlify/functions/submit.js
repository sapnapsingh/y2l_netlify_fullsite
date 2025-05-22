
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbyHfEeb6w_EXWd951Lq043WYuw_H1VCtu-vJQQOYGSjF5vEYpdoNpL_eqRb5kuNFQzF/exec", {
      method: "POST",
      body: event.body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();

    return {
      statusCode: 200,
      body: text,
    };
  } catch (err) {
    console.error("Error in Netlify function:", err);
    return {
      statusCode: 500,
      body: "Submission failed: " + err.message,
    };
  }
};
