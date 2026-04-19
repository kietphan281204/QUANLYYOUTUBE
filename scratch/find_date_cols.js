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
        const res = await sql.query(`
            SELECT TABLE_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE COLUMN_NAME LIKE '%ngay%' 
               OR COLUMN_NAME LIKE '%thoi_gian%' 
               OR COLUMN_NAME LIKE '%date%' 
               OR COLUMN_NAME LIKE '%time%'
        `);
        console.table(res.recordset);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
