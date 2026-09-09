const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_q3lYdVLSab4s@ep-damp-rain-aupat3dh-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
  ssl: { rejectUnauthorized: false }
});
async function fix() {
  const { rows } = await pool.query("SELECT id, created_at FROM users WHERE name = 'System Administrator' AND role = 'admin' ORDER BY created_at ASC");
  console.log('Found:', rows.length, 'System Administrator rows');
  if (rows.length > 1) {
    const keepId = rows[0].id;
    const deleteIds = rows.slice(1).map(r => r.id);
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [deleteIds]);
    console.log('Deleted', deleteIds.length, 'duplicates, kept:', keepId);
  } else {
    console.log('No duplicates found.');
  }
  process.exit(0);
}
fix().catch(e => { console.error(e.message); process.exit(1); });
