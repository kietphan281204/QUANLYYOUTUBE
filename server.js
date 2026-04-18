const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Serve static files from current directory

// SQL Server Configuration
// Please update these credentials depending on your SQL Server setup
const dbConfig = {
    user: process.env.DB_USER || 'sa',          // Default SQL user
    password: process.env.DB_PASSWORD || 'kiet12345', // Default password (change this!)
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'VIDEO1',
    options: {
        encrypt: false, // For local dev
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Connect to Database
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log('✅ Connected to SQL Server database: VIDEO1');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
}
connectDB();

// ============================================
// API ROUTES FOR [video] TABLE
// ============================================

// Cấp quyền cho Admin xem được video thư mục uploads (nằm bên thư mục ĐAWEBSIET của người dùng)
const path = require('path');
const uploadsDir = 'C:/Users/PHANT/OneDrive/Desktop/ĐAWEBSIET/uploads';
// fallback for standard
const uploadsDir2 = 'C:/Users/PHANT/OneDrive/Desktop/DAWEBSIET/uploads';
const fs = require('fs');

if (fs.existsSync(uploadsDir)) {
    app.use('/uploads', express.static(uploadsDir));
} else if (fs.existsSync(uploadsDir2)) {
    app.use('/uploads', express.static(uploadsDir2));
} else {
    app.use('/uploads', express.static('./uploads'));
}

// GET ALL APPROVED videos (Dành cho trang chủ / Người dùng xem)
app.get('/api/videos', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT * FROM video 
            WHERE trang_thai = 'da_duyet'
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching videos:', err);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// GET ALL videos (Dành riêng cho Quản trị viên quản lý)
app.get('/api/admin/videos', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT v.*, u.ten_dang_nhap as nguoi_dang 
            FROM video v
            LEFT JOIN nguoi_dung u ON v.nguoi_dung_id = u.nguoi_dung_id
            ORDER BY v.ngay_tao DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching admin videos:', err);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// GET ALL USERS (Admin dashboard)
app.get('/api/admin/users', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT nguoi_dung_id, ten_dang_nhap, email, anh_dai_dien, ngay_tao
            FROM nguoi_dung
            ORDER BY nguoi_dung_id DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching admin users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// RESET USER PASSWORD (Admin action)
const crypto = require('crypto');
function hashPassword(raw) {
    return crypto.createHash("sha256").update(String(raw || ""), "utf8").digest("hex");
}
app.put('/api/admin/users/:id/reset-password', async (req, res) => {
    try {
        const { id } = req.params;
        const newPasswordHash = hashPassword('123456'); // Reset to 123456
        
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('hash', sql.NVarChar, newPasswordHash)
            .query(`
                UPDATE nguoi_dung 
                SET mat_khau_hash = @hash, ngay_cap_nhat = GETDATE()
                WHERE nguoi_dung_id = @id
            `);
            
        res.json({ message: 'Password reset to 123456 successfully' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// GET single video by ID
app.get('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM video WHERE video_id = @id');
            
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Video not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching video:', err);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// CREATE a new video
app.post('/api/videos', async (req, res) => {
    try {
        const { title, url, description, thumbnail } = req.body;
        const pool = await sql.connect(dbConfig);
        
        const result = await pool.request()
            .input('tieu_de', sql.NVarChar, title || '')
            .input('duong_dan_video', sql.NVarChar, url || '')
            .input('mo_ta', sql.NVarChar, description || '')
            .input('duong_dan_anh_bia', sql.NVarChar, thumbnail || '')
            // Default nguoi_dung_id to 1 (since it's NOT NULL in your DB, we must provide it)
            .query(`
                INSERT INTO video (tieu_de, duong_dan_video, mo_ta, duong_dan_anh_bia, nguoi_dung_id, trang_thai)
                OUTPUT inserted.*
                VALUES (@tieu_de, @duong_dan_video, @mo_ta, @duong_dan_anh_bia, 1, 'cho_duyet')
            `);
            
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error inserting video:', err);
        res.status(500).json({ error: 'Failed to add video. Lỗi SQL.' });
    }
});

// UPDATE an existing video
app.put('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url, description, thumbnail } = req.body;
        const pool = await sql.connect(dbConfig);
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('tieu_de', sql.NVarChar, title || '')
            .input('duong_dan_video', sql.NVarChar, url || '')
            .input('mo_ta', sql.NVarChar, description || '')
            .input('duong_dan_anh_bia', sql.NVarChar, thumbnail || '')
            .query(`
                UPDATE video
                SET tieu_de = @tieu_de, duong_dan_video = @duong_dan_video, mo_ta = @mo_ta, duong_dan_anh_bia = @duong_dan_anh_bia
                WHERE video_id = @id;
                
                SELECT * FROM video WHERE video_id = @id;
            `);
            
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Video not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error updating video:', err);
        res.status(500).json({ error: 'Failed to update video' });
    }
});

// UPDATE video STATUS
app.put('/api/videos/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { trang_thai, ly_do, admin_username } = req.body;
        if (!trang_thai) return res.status(400).json({ error: 'Thiếu trang_thai' });

        const pool = await sql.connect(dbConfig);
        
        // Cập nhật bảng video
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('trang_thai', sql.NVarChar, trang_thai)
            .query(`
                UPDATE video
                SET trang_thai = @trang_thai
                WHERE video_id = @id;
                SELECT * FROM video WHERE video_id = @id;
            `);
            
        // Lưu lịch sử vào bảng kiem_duyet_video
        await pool.request()
            .input('video_id', sql.Int, id)
            .input('admin_username', sql.NVarChar, admin_username || 'Admin')
            .input('trang_thai_moi', sql.NVarChar, trang_thai)
            .input('ly_do', sql.NVarChar, ly_do || '')
            .query(`
                INSERT INTO kiem_duyet_video (video_id, admin_username, trang_thai_moi, ly_do)
                VALUES (@video_id, @admin_username, @trang_thai_moi, @ly_do)
            `);
            
        if (result.recordset.length === 0) return res.status(404).json({ message: 'Video not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// DELETE a video
app.delete('/api/videos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM video WHERE video_id = @id');
            
        res.json({ message: 'Video deleted successfully' });
    } catch (err) {
        console.error('Error deleting video:', err);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// ============================================
// API ROUTES FOR AUTHENTICATION
// ============================================
const bcrypt = require('bcryptjs');

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Thiếu username hoặc password' });

        const pool = await sql.connect(dbConfig);
        
        // Kiểm tra xem username đã tồn tại chưa
        const checkUser = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT username FROM tai_khoan_admin WHERE username = @username');
            
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào DB
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .query('INSERT INTO tai_khoan_admin (username, password) VALUES (@username, @password)');

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Lỗi server khi đăng ký' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Thiếu username hoặc password' });

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM tai_khoan_admin WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Tài khoản không tồn tại' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Mật khẩu không chính xác' });
        }

        res.json({ message: 'Đăng nhập thành công', token: 'fake_jwt_token_for_now', username: user.username });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
    }
});

// GET OVERALL STATISTICS (Admin) - Live Data from Source Tables
app.get('/api/admin/stats/overall', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        
        // 1. Get live totals from primary tables
        const totalsResult = await pool.request().query(`
            SELECT 
                (SELECT ISNULL(SUM(luot_xem), 0) FROM video) as total_views,
                (SELECT COUNT(*) FROM luot_thich) as total_likes,
                (SELECT COUNT(*) FROM binh_luan) as total_comments
        `);
        
        // 2. Get daily stats (Last 60 days)
        // Grouping by date from transaction tables for Likes and Comments
        // For Views, we still need to rely on the thong_ke snapshot table for historical daily data
        const dailyResult = await pool.request().query(`
            SELECT 
                ISNULL(t.date, ISNULL(l.date, c.date)) as date,
                ISNULL(t.views, 0) as views,
                ISNULL(l.likes, 0) as likes,
                ISNULL(c.comments, 0) as comments
            FROM 
                (SELECT CONVERT(VARCHAR(10), ngay, 120) as date, SUM(so_luot_xem) as views FROM [thong_ke] WHERE ngay >= DATEADD(day, -60, GETDATE()) GROUP BY CONVERT(VARCHAR(10), ngay, 120)) t
            FULL OUTER JOIN 
                (SELECT CONVERT(VARCHAR(10), ngay_tao, 120) as date, COUNT(*) as likes FROM luot_thich WHERE ngay_tao >= DATEADD(day, -60, GETDATE()) GROUP BY CONVERT(VARCHAR(10), ngay_tao, 120)) l
            ON t.date = l.date
            FULL OUTER JOIN 
                (SELECT CONVERT(VARCHAR(10), ngay_tao, 120) as date, COUNT(*) as comments FROM binh_luan WHERE ngay_tao >= DATEADD(day, -60, GETDATE()) GROUP BY CONVERT(VARCHAR(10), ngay_tao, 120)) c
            ON ISNULL(t.date, l.date) = c.date
            ORDER BY date ASC
        `);
        
        res.json({
            totals: totalsResult.recordset[0],
            daily: dailyResult.recordset
        });
    } catch (err) {
        console.error('Error fetching admin live stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics: ' + err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`👉 Admin Panel available at http://localhost:${PORT}/admin.html`);
});
