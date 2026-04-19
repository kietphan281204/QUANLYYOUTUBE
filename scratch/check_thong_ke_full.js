const sql = require('mssql');
const dbConfig = {
    user: 'sa',
    password: 'kiet12345',
    server: 'localhost',
    database: 'VIDEO1',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function run() {
    try {
        await sql.connect(dbConfig);
        const res = await sql.query("SELECT SUM(so_luot_xem) as total FROM thong_ke");
        console.log("Total views in thong_ke:", res.recordset[0].total);
        
        const daily = await sql.query("SELECT CONVERT(VARCHAR(10), ngay, 120) as date, SUM(so_luot_xem) as views FROM thong_ke GROUP BY CONVERT(VARCHAR(10), ngay, 120) ORDER BY date DESC");
        console.table(daily.recordset);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
