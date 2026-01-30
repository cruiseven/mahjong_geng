/**
 * 数据导出 API
 * 处理 GET /api/export
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
        // GET /api/export - 导出所有数据
        if (method === 'GET') {
            // 获取所有游戏记录
            const { results: rounds } = await env.DB.prepare(
                'SELECT * FROM rounds'
            ).all();

            // 将 playersData 从 JSON 字符串解析为对象
            const allRounds = rounds.map(round => ({
                ...round,
                playersData: JSON.parse(round.playersData)
            }));

            // 获取所有金额明细
            const { results: details } = await env.DB.prepare(
                'SELECT * FROM details'
            ).all();

            // 获取设置
            const settings = await env.DB.prepare(
                'SELECT commissionRate, commissionThreshold FROM settings WHERE id = 1'
            ).first();

            // 获取统计数据
            const stats = await env.DB.prepare(
                'SELECT totalCommission, roundCount FROM stats WHERE id = 1'
            ).first();

            // 构建导出数据
            const exportData = {
                allRounds: allRounds,
                totalCommission: stats.totalCommission,
                goldDetails: details,
                commissionSettings: settings,
                exportTime: new Date().toLocaleString('zh-CN', {
                    timeZone: 'Asia/Shanghai',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(/\//g, '-')
            };

            return new Response(JSON.stringify(exportData), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Error in /api/export:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
