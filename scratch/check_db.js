const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'kiet12345',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'VIDEO1',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function check() {
    try {
        await sql.connect(dbConfig);
        console.log('--- TABLES ---');
        const tables = await sql.query('SELECT name FROM sys.tables');
        console.log(tables.recordset.map(t => t.name).join(', '));

        console.log('\n--- COLUMN NAMES (thong_ke) ---');
        const columns = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'thong_ke'");
        console.log(columns.recordset.map(c => c.COLUMN_NAME).join(', '));

        console.log('\n--- DATA (thong_ke top 5) ---');
        const data = await sql.query('SELECT TOP 5 * FROM thong_ke ORDER BY ngay DESC');
        console.log(JSON.stringify(data.recordset, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
