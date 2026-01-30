/**
 * 设置 API
 * 处理 GET /api/settings 和 POST /api/settings
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
        // GET /api/settings - 获取设置
        if (method === 'GET') {
            const result = await env.DB.prepare(
                'SELECT commissionRate, commissionThreshold FROM settings WHERE id = 1'
            ).first();

            return new Response(JSON.stringify(result), { headers: corsHeaders });
        }

        // POST /api/settings - 保存设置
        if (method === 'POST') {
            const data = await request.json();

            await env.DB.prepare(
                `UPDATE settings 
         SET commissionRate = ?, commissionThreshold = ? 
         WHERE id = 1`
            ).bind(data.commissionRate, data.commissionThreshold).run();

            const updated = {
                commissionRate: data.commissionRate,
                commissionThreshold: data.commissionThreshold
            };

            return new Response(JSON.stringify(updated), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Error in /api/settings:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
