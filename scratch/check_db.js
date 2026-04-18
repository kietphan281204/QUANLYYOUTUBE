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
        
        console.log('\n--- COLUMN NAMES (video) ---');
        const videoCols = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'video'");
        console.log(videoCols.recordset.map(c => c.COLUMN_NAME).join(', '));

        console.log('\n--- COLUMN NAMES (luot_thich) ---');
        const likeCols = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'luot_thich'");
        console.log(likeCols.recordset.map(c => c.COLUMN_NAME).join(', '));

        console.log('\n--- COLUMN NAMES (binh_luan) ---');
        const commentCols = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'binh_luan'");
        console.log(commentCols.recordset.map(c => c.COLUMN_NAME).join(', '));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
