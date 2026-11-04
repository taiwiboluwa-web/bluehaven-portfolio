import { neon } from '@neondatabase/serverless';

export default async function handler(req:any,res:any){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const secret=process.env.CRON_SECRET;
  if(!secret||req.headers?.authorization!==`Bearer ${secret}`)return res.status(401).json({error:'Unauthorized'});
  if(!process.env.DATABASE_URL)return res.status(503).json({error:'DATABASE_URL is not configured'});
  try{
    const sql=neon(process.env.DATABASE_URL);
    await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_activity (
      id BIGSERIAL PRIMARY KEY, skill_id TEXT, activity_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed', task TEXT NOT NULL,
      result TEXT, model TEXT, duration_ms INTEGER, error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS bluehaven_ai_daily_reports (
      report_date DATE PRIMARY KEY, total_runs INTEGER NOT NULL DEFAULT 0,
      successful_runs INTEGER NOT NULL DEFAULT 0, failed_runs INTEGER NOT NULL DEFAULT 0,
      chatbot_requests INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    const rows=await sql`
      SELECT (created_at AT TIME ZONE 'Africa/Lagos')::date AS report_date,
        COUNT(*) FILTER (WHERE activity_type='manual_skill_run')::int AS total_runs,
        COUNT(*) FILTER (WHERE activity_type='manual_skill_run' AND status='completed')::int AS successful_runs,
        COUNT(*) FILTER (WHERE activity_type='manual_skill_run' AND status='failed')::int AS failed_runs,
        COUNT(*) FILTER (WHERE activity_type='website_chat')::int AS chatbot_requests
      FROM bluehaven_ai_activity
      WHERE (created_at AT TIME ZONE 'Africa/Lagos')::date = (NOW() AT TIME ZONE 'Africa/Lagos')::date - 1
      GROUP BY (created_at AT TIME ZONE 'Africa/Lagos')::date
    ` as any[];
    if(!rows.length){
      await sql`INSERT INTO bluehaven_ai_daily_reports(report_date,total_runs,successful_runs,failed_runs,chatbot_requests)
        VALUES((NOW() AT TIME ZONE 'Africa/Lagos')::date - 1,0,0,0,0)
        ON CONFLICT(report_date) DO UPDATE SET total_runs=0,successful_runs=0,failed_runs=0,chatbot_requests=0`;
      return res.status(200).json({ok:true,report:'empty_day',date:'yesterday'});
    }
    const row=rows[0];
    await sql`INSERT INTO bluehaven_ai_daily_reports(report_date,total_runs,successful_runs,failed_runs,chatbot_requests)
      VALUES(${row.report_date},${row.total_runs},${row.successful_runs},${row.failed_runs},${row.chatbot_requests})
      ON CONFLICT(report_date) DO UPDATE SET total_runs=EXCLUDED.total_runs,successful_runs=EXCLUDED.successful_runs,failed_runs=EXCLUDED.failed_runs,chatbot_requests=EXCLUDED.chatbot_requests`;
    return res.status(200).json({ok:true,...row});
  }catch(error){
    console.error('BlueHaven AI daily report failed:',error);
    return res.status(500).json({error:error instanceof Error?error.message:'Daily report failed'});
  }
}
