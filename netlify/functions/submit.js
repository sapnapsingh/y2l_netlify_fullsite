
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);

    // Inject programType for Chess if missing
    if (body.chessSession && !body.programType) {
      body.programType = "Chess";
    }

    const payloadKey = "payload_" + uuidv4();
    const scriptPropsUrl = "https://script.google.com/macros/s/AKfycbyHfEeb6w_EXWd951Lq043WYuw_H1VCtu-vJQQOYGSjF5vEYpdoNpL_eqRb5kuNFQzF/exec";

    await fetch(scriptPropsUrl, {
      method: "POST",
      body: JSON.stringify({
        [payloadKey]: JSON.stringify(body)
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Submission sent" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
