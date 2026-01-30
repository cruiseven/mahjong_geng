/**
 * 金额明细 API
 * 处理 GET /api/details 和 POST /api/details
 */

export async function onRequest(context) {
    const { request, env } = context;
    const { method } = request;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // GET /api/details - 获取所有金额明细
        if (method === 'GET') {
            const { results } = await env.DB.prepare(
                'SELECT * FROM details ORDER BY timestamp DESC'
            ).all();

            return new Response(JSON.stringify(results), { headers: corsHeaders });
        }

        // POST /api/details - 添加金额明细
        if (method === 'POST') {
            const data = await request.json();

            await env.DB.prepare(
                `INSERT INTO details (type, detail, amount, time, timestamp, balance)
         VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(
                data.type,
                data.detail,
                data.amount,
                data.time,
                data.timestamp,
                data.balance
            ).run();

            // 返回新增的记录
            const newDetail = {
                type: data.type,
                detail: data.detail,
                amount: data.amount,
                time: data.time,
                timestamp: data.timestamp,
                balance: data.balance
            };

            return new Response(JSON.stringify(newDetail), {
                status: 201,
                headers: corsHeaders
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Error in /api/details:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
