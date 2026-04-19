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
        const tk = await sql.query("SELECT SUM(so_luot_xem) as views, SUM(so_luot_thich) as likes, SUM(so_binh_luan) as comments FROM thong_ke");
        const real = await sql.query(`
            SELECT 
                (SELECT SUM(luot_xem) FROM video) as views,
                (SELECT COUNT(*) FROM luot_thich) as likes,
                (SELECT COUNT(*) FROM binh_luan) as comments
        `);
        console.log("Thong Ke Totals:", tk.recordset[0]);
        console.log("Real Totals:", real.recordset[0]);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
