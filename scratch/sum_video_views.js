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
        const res = await sql.query("SELECT SUM(luot_xem) as total FROM video");
        console.log("Total views in video table:", res.recordset[0].total);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
