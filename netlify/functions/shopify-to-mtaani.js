// Example Vercel Serverless Function: api/bridge.js
export default async function handler(req, res) {
  const PARCELGRID_KEY = "J7TgPP7kAXbJIbLsXynP31aesqQ1kEBR"; // Replace with your regenerated key later
  const order = req.body;

  // 1. Format the data for ParcelGrid
  const payload = {
    deliveries: [{
      recipient_name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
      recipient_address: `${order.shipping_address.address1}, ${order.shipping_address.city}`,
      recipient_phone: order.shipping_address.phone,
      order_reference: order.name // This shows your Shopify Order # (e.g. #1005)
    }]
  };

  // 2. Send to ParcelGrid
  try {
    const pgResponse = await fetch('https://api.tryparcel.com/api/v4/task', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PARCELGRID_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await pgResponse.json();
    return res.status(200).json({ status: 'Success', parcelgrid_id: result.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}