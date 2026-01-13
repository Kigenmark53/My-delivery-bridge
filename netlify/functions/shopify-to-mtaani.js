exports.handler = async (event, context) => {
  // Netlify only allows POST requests for this bridge
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const shopifyOrder = JSON.parse(event.body);
  const MTAANI_API_KEY = process.env.MTAANI_API_KEY || "J7TgPP7kAXbJIbLsXynP31aesqQ1kEBR";

  const agentId = shopifyOrder.note_attributes?.find(attr => attr.name === 'mtaani_agent_id')?.value;

  const payload = {
    sender_name: "Blush Noir",
    recipient_name: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`,
    recipient_phone: shopifyOrder.shipping_address.phone,
    destination_agent_id: agentId || "1", 
    description: `Order ${shopifyOrder.name}`,
    price: parseFloat(shopifyOrder.total_price)
  };

  try {
    const response = await fetch('https://api.pickupmtaani.com/api/v1/packages/agent-agent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MTAANI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, mtaani_id: result.data?.id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};