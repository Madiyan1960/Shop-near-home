export default {
  async fetch(request, env, ctx) {
    const airtableApiKey = env.AIRTABLE_API_KEY;
    const baseId = env.AIRTABLE_BASE_ID;
    const ordersTableName = 'Заказы';
    const productsTableName = 'Товары';

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Обработка CORS preflight-запросов
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // Получение списка товаров
    if (pathname === '/products' && request.method === 'GET') {
      const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(productsTableName)}`;
      try {
        const airtableRes = await fetch(airtableUrl, {
          headers: {
            'Authorization': `Bearer ${airtableApiKey}`
          }
        });

        const data = await airtableRes.json();

        return new Response(JSON.stringify(data.records), {
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        });
      }
    }

    // Отправка заказа
    if (pathname === '/order' && request.method === 'POST') {
      try {
        const body = await request.json();
        const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(ordersTableName)}`;

        const airtableRes = await fetch(airtableUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${airtableApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: body })
        });

        const result = await airtableRes.json();

        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders()
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
