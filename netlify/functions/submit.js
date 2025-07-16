
const fetch = require("node-fetch");
const { Buffer } = require("buffer");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const contentType = event.headers["content-type"] || "";
  let jsonPayload = {};

  try {
    if (contentType.includes("application/json")) {
      jsonPayload = JSON.parse(event.body);
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(event.body);
      params.forEach((value, key) => {
        jsonPayload[key] = value;
      });
    } else if (contentType.includes("multipart/form-data")) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "multipart/form-data is not supported in Netlify functions directly. Please convert FormData to a plain object in frontend.",
        })
      };
    } else {
      // Default fallback for any other content-type
      const params = new URLSearchParams(event.body);
      params.forEach((value, key) => {
        jsonPayload[key] = value;
      });
    }

    const response = await fetch("https://script.google.com/macros/s/AKfycbyHfEeb6w_EXWd951Lq043WYuw_H1VCtu-vJQQOYGSjF5vEYpdoNpL_eqRb5kuNFQzF/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonPayload),
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
