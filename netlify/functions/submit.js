
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    const contentType = event.headers["content-type"];
    let data = {};

    if (contentType.includes("application/json")) {
      data = JSON.parse(event.body);
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(event.body);
      params.forEach((value, key) => {
        data[key] = value;
      });
    } else if (contentType.includes("multipart/form-data")) {
      const boundary = contentType.split("boundary=")[1];
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "multipart/form-data not supported. Please use JSON or urlencoded." })
      };
    } else {
      const params = new URLSearchParams(event.body);
      params.forEach((value, key) => {
        data[key] = value;
      });
    }

    const response = await fetch("https://script.google.com/macros/s/AKfycbzSGXUJKUZiUfwaxF6YxOH-7MeLMpqS-n7UvPTM4pFtP6NKg5oMyVUlDKBYm7mSydyf/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Forwarded to Google Apps Script" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
