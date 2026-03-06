import Database from 'better-sqlite3';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqliteDb = new Database(join(__dirname, '..', 'prisma', 'dev.db'));
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pgPool.connect();
  
  try {
    await client.query('BEGIN');
    
    const tables = [
      'User', 'Kindergarten', 'Aukle', 'Burelis', 'Specialist',
      'Review', 'Favorite', 'ForumCategory', 'ForumPost', 'ForumComment', 'ForumVote'
    ];
    
    // Map table name to PG table name (Prisma uses exact model names for PG)
    // Check actual PG table names
    const pgTables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public'`);
    console.log('PG tables:', pgTables.rows.map(r => r.tablename));
    
    for (const table of tables) {
      // Find matching PG table (case-insensitive)
      const pgTable = pgTables.rows.find(r => r.tablename.toLowerCase() === table.toLowerCase());
      if (!pgTable) {
        console.log(`⚠️  Table ${table} not found in PG, skipping`);
        continue;
      }
      const pgTableName = `"${pgTable.tablename}"`;
      
      const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();
      if (rows.length === 0) {
        console.log(`${table}: 0 rows, skipping`);
        continue;
      }
      
      const cols = Object.keys(rows[0]);
      const colNames = cols.map(c => `"${c}"`).join(', ');
      
      // Batch insert
      let inserted = 0;
      const BATCH = 100;
      
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const values = [];
        const placeholders = [];
        let paramIdx = 1;
        
        for (const row of batch) {
          const rowPlaceholders = [];
          for (const col of cols) {
            let val = row[col];
            // Convert SQLite booleans (0/1) to PG booleans
            const boolFields = ['isApproved', 'isUserAdded', 'isPinned', 'isLocked', 'isServicePortal'];
            if (boolFields.includes(col)) {
              val = val === 1 || val === true;
            }
            // Convert SQLite epoch millis to ISO date for DateTime fields
            const dateFields = ['createdAt', 'updatedAt'];
            if (dateFields.includes(col) && typeof val === 'number') {
              val = new Date(val).toISOString();
            }
            values.push(val);
            rowPlaceholders.push(`$${paramIdx++}`);
          }
          placeholders.push(`(${rowPlaceholders.join(', ')})`);
        }
        
        const sql = `INSERT INTO ${pgTableName} (${colNames}) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`;
        await client.query(sql, values);
        inserted += batch.length;
      }
      
      console.log(`✅ ${table}: ${inserted} rows migrated`);
    }
    
    await client.query('COMMIT');
    console.log('\n🎉 Migration complete!');
    
    // Verify counts
    console.log('\nVerification:');
    for (const table of tables) {
      const pgTable = pgTables.rows.find(r => r.tablename.toLowerCase() === table.toLowerCase());
      if (!pgTable) continue;
      const sqliteCount = sqliteDb.prepare(`SELECT count(*) as c FROM ${table}`).get().c;
      const pgCount = (await client.query(`SELECT count(*) FROM "${pgTable.tablename}"`)).rows[0].count;
      const match = parseInt(pgCount) === sqliteCount ? '✅' : '❌';
      console.log(`  ${match} ${table}: SQLite=${sqliteCount} PG=${pgCount}`);
    }
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pgPool.end();
    sqliteDb.close();
  }
}

migrate();
