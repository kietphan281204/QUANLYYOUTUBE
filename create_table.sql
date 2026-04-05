IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tai_khoan_admin' AND xtype='U')
BEGIN
    CREATE TABLE tai_khoan_admin (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL
    )
    PRINT 'Table created'
END
ELSE
BEGIN
    PRINT 'Table exists'
END
