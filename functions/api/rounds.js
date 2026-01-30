/**
 * 游戏记录 API
 * 处理 GET /api/rounds 和 POST /api/rounds
 */

export async function onRequest(context) {
    const { request, env } = context;
    const { method } = request;

    // 设置 CORS 响应头
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    };

    // 处理 OPTIONS 预检请求
    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // GET /api/rounds - 获取所有游戏记录
        if (method === 'GET') {
            const { results } = await env.DB.prepare(
                'SELECT * FROM rounds ORDER BY timestamp DESC'
            ).all();

            // 将 playersData 从 JSON 字符串解析为对象
            const rounds = results.map(round => ({
                ...round,
                playersData: JSON.parse(round.playersData)
            }));

            return new Response(JSON.stringify(rounds), { headers: corsHeaders });
        }

        // POST /api/rounds - 添加游戏记录
        if (method === 'POST') {
            const data = await request.json();

            // 插入游戏记录
            await env.DB.prepare(
                `INSERT INTO rounds (roundNum, playersData, commission, rate, threshold, time, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                data.roundNum,
                JSON.stringify(data.playersData),
                data.commission,
                data.rate,
                data.threshold || 500,
                data.time,
                data.timestamp
            ).run();

            // 更新统计数据
            await env.DB.prepare(
                `UPDATE stats 
         SET totalCommission = totalCommission + ?, 
             roundCount = roundCount + 1 
         WHERE id = 1`
            ).bind(data.commission).run();

            // 返回新增的记录
            const newRound = {
                roundNum: data.roundNum,
                playersData: data.playersData,
                commission: data.commission,
                rate: data.rate,
                threshold: data.threshold || 500,
                time: data.time,
                timestamp: data.timestamp
            };

            return new Response(JSON.stringify(newRound), {
                status: 201,
                headers: corsHeaders
            });
        }

        // 不支持的方法
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Error in /api/rounds:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
