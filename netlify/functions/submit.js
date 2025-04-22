
/*export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const payload = JSON.parse(event.body);

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbyHfEeb6w_EXWd951Lq043WYuw_H1VCtu-vJQQOYGSjF5vEYpdoNpL_eqRb5kuNFQzF/exec',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success', response: text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: error.message }),
    };
  }
}
*/



const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const data = JSON.parse(event.body);
    const parentEmail = data.email || "parent@example.com";

    // 1. Send data to Google Apps Script
    const sheetWebhookURL = "https://script.google.com/macros/s/AKfycbyHfEeb6w_EXWd951Lq043WYuw_H1VCtu-vJQQOYGSjF5vEYpdoNpL_eqRb5kuNFQzF/exec";
    await fetch(sheetWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    // 2. Prepare invoice HTML (simplified here)
    const htmlContent = `
      <h2>Enrollment Receipt</h2>
      <p><strong>Parent:</strong> ${data.parentName}</p>
      <p><strong>Student:</strong> ${data.student_1_name}</p>
      ${data.student_2_name ? `<p><strong>Sibling:</strong> ${data.student_2_name}</p>` : ""}
      <p><strong>Base Fee:</strong> $${data.baseFee}</p>
      <p><strong>Discount:</strong> $${data.discount}</p>
      <p><strong>Total Due:</strong> $${data.finalFee}</p>
      <p><strong>Payment:</strong> Zelle - 209-937-3171<br>CC - contact office</p>
    `;

    // 3. Email it using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "contact@y2lacademy.com", // replace with real credentials
        pass: "YOUR_APP_PASSWORD"
      }
    });

    await transporter.sendMail({
      from: "Y2L Academy <contact@y2lacademy.com>",
      to: parentEmail,
      subject: "Y2L Summer Program Enrollment Receipt",
      html: htmlContent
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", message: "Data submitted and email sent" })
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: err.message })
    };
  }
};

