/**
 * 统计数据 API
 * 处理 GET /api/stats
 */

export async function onRequest(context) {
    const { request, env } = context;
    const { method } = request;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // GET /api/stats - 获取统计数据
        if (method === 'GET') {
            const result = await env.DB.prepare(
                'SELECT totalCommission, roundCount FROM stats WHERE id = 1'
            ).first();

            return new Response(JSON.stringify(result), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Error in /api/stats:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
