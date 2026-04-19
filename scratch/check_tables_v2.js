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

async function check() {
    try {
        await sql.connect(dbConfig);
        
        console.log('\n--- thong_ke ---');
        const tkCols = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'thong_ke'");
        console.log(tkCols.recordset.map(c => c.COLUMN_NAME).join(', '));
        const tkData = await sql.query("SELECT TOP 5 * FROM thong_ke ORDER BY ngay DESC");
        console.log(tkData.recordset);

        console.log('\n--- nguoi_xem ---');
        const nxCols = await sql.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'nguoi_xem'");
        console.log(nxCols.recordset.map(c => c.COLUMN_NAME).join(', '));
        // Check if thoi_gian_xem column exists first, or just select top
        const nxData = await sql.query("SELECT TOP 5 * FROM nguoi_xem");
        console.log(nxData.recordset);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
