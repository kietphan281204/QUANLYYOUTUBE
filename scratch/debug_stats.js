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

async function checkData() {
    try {
        await sql.connect(dbConfig);
        const today = new Date().toISOString().split('T')[0]; // 2026-04-19
        console.log(`Checking data for today: ${today}`);

        console.log('\n--- Recent videos ---');
        try {
            const recentVideos = await sql.query("SELECT TOP 5 tieu_de, ngay_tao FROM video ORDER BY ngay_tao DESC");
            console.log(recentVideos.recordset);
        } catch (e) {
            console.log("Error checking recent videos:", e.message);
        }

        console.log('\n--- Tables in DB ---');
        const tables = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'");
        console.log(tables.recordset.map(t => t.TABLE_NAME));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkData();
