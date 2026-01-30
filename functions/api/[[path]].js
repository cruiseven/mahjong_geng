/**
 * 动态路由处理器
 * 处理 /api/rounds/all, /api/details/all, /api/stats/total 等动态路径
 */

export async function onRequest(context) {
    const { request, env, params } = context;
    const { method } = request;
    const path = params.path ? params.path.join('/') : '';

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json; charset=utf-8'
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // POST /api/rounds/all - 批量保存游戏记录
        if (path === 'rounds/all' && method === 'POST') {
            const rounds = await request.json();

            // 删除所有现有记录
            await env.DB.prepare('DELETE FROM rounds').run();

            // 批量插入新记录
            for (const round of rounds) {
                await env.DB.prepare(
                    `INSERT INTO rounds (roundNum, playersData, commission, rate, threshold, time, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
                ).bind(
                    round.roundNum,
                    JSON.stringify(round.playersData),
                    round.commission,
                    round.rate,
                    round.threshold || 500,
                    round.time,
                    round.timestamp
                ).run();
            }

            // 更新统计数据
            const totalCommission = rounds.reduce((sum, r) => sum + r.commission, 0);
            await env.DB.prepare(
                `UPDATE stats 
         SET roundCount = ?, totalCommission = ? 
         WHERE id = 1`
            ).bind(rounds.length, totalCommission).run();

            return new Response(
                JSON.stringify({ message: `Saved ${rounds.length} rounds` }),
                { headers: corsHeaders }
            );
        }

        // POST /api/details/all - 批量保存金额明细
        if (path === 'details/all' && method === 'POST') {
            const details = await request.json();

            // 删除所有现有明细
            await env.DB.prepare('DELETE FROM details').run();

            // 批量插入新明细
            for (const detail of details) {
                await env.DB.prepare(
                    `INSERT INTO details (type, detail, amount, time, timestamp, balance)
           VALUES (?, ?, ?, ?, ?, ?)`
                ).bind(
                    detail.type,
                    detail.detail,
                    detail.amount,
                    detail.time,
                    detail.timestamp,
                    detail.balance
                ).run();
            }

            return new Response(
                JSON.stringify({ message: `Saved ${details.length} details` }),
                { headers: corsHeaders }
            );
        }

        // PUT /api/stats/total - 更新累计佣金
        if (path === 'stats/total' && method === 'PUT') {
            const data = await request.json();

            await env.DB.prepare(
                `UPDATE stats 
         SET totalCommission = ? 
         WHERE id = 1`
            ).bind(data.totalCommission).run();

            const result = await env.DB.prepare(
                'SELECT totalCommission, roundCount FROM stats WHERE id = 1'
            ).first();

            return new Response(JSON.stringify(result), { headers: corsHeaders });
        }

        // 未找到匹配的路由
        return new Response(
            JSON.stringify({ error: 'Not found', path: path }),
            { status: 404, headers: corsHeaders }
        );

    } catch (error) {
        console.error('Error in dynamic route:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
