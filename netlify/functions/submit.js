
export async function handler(event, context) {
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
