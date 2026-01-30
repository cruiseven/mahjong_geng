/**
 * 清空数据库 API
 * 处理 DELETE /api/clear
 */

export async function onRequest(context) {
    const { request, env } = context;
    const { method } = request;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // DELETE /api/clear - 清空数据库
        if (method === 'DELETE') {
            // 删除所有游戏记录
            await env.DB.prepare('DELETE FROM rounds').run();

            // 删除所有金额明细
            await env.DB.prepare('DELETE FROM details').run();

            // 重置设置为默认值
            await env.DB.prepare(
                `UPDATE settings 
         SET commissionRate = 20, commissionThreshold = 500 
         WHERE id = 1`
            ).run();

            // 重置统计数据
            await env.DB.prepare(
                `UPDATE stats 
         SET totalCommission = 0, roundCount = 0 
         WHERE id = 1`
            ).run();

            return new Response(
                JSON.stringify({ message: 'Database cleared successfully' }),
                { headers: corsHeaders }
            );
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Error in /api/clear:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
