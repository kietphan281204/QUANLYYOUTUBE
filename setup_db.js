const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'VIDEO1',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function setup() {
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tai_khoan_admin' AND xtype='U')
            BEGIN
                CREATE TABLE tai_khoan_admin (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    username NVARCHAR(50) UNIQUE NOT NULL,
                    password NVARCHAR(255) NOT NULL
                )
                PRINT 'Table tai_khoan_admin created'
            END
            ELSE
            BEGIN
                PRINT 'Table tai_khoan_admin already exists'
            END
        `);
        console.log('✅ Created tai_khoan_admin table checkout successfully!');
        process.exit(0);
    } catch(err) {
        console.error('❌ Database error:', err);
        process.exit(1);
    }
}
setup();
