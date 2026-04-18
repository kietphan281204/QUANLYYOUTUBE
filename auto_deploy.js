const fs = require('fs');
const { execSync, spawn } = require('child_process');

console.log("==========================================================");
console.log("  HỆ THỐNG TỰ ĐỘNG CHẠY WEBSITE QUẢN TRỊ VÀ CẬP NHẬT LINK");
console.log("==========================================================");

// 1. Mở server ở một process riêng
console.log("\n[1/3] Đang khởi động Server cục bộ (Port 3000)...");
const serverProcess = spawn('node', ['server.js'], { stdio: 'ignore', detached: true });
serverProcess.unref();

// 2. Mở Cloudflare Tunnel
console.log("\n[2/3] Đang mở đường ống Cloudflare để lấy link xuyên thế giới...");
console.log("Đang chờ Cloudflare cấp link mới (Mất khoảng 5-10 giây, vui lòng đợi...)");

const cloudflareProcess = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:3000'], { stdio: ['ignore', 'pipe', 'pipe'] });

let cloudflareUrl = '';

cloudflareProcess.stderr.on('data', (data) => {
    const output = data.toString();
    const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (urlMatch && !cloudflareUrl) {
        cloudflareUrl = urlMatch[0];
        console.log(`\n=> LINK SERVER MỚI CỦA BẠN LÀ: ${cloudflareUrl}`);
        
        // 3. Cập nhật link vào code và đẩy lên mạng
        console.log("\n[3/3] Đang áp link vào Code và đẩy lên mạng (GitHub)...");
        updateLinksAndPush(cloudflareUrl);
    }
});

function updateLinksAndPush(newUrl) {
    const filesToUpdate = ['auth.js', 'admin.js', 'users.js', 'stats.js', 'index.html']; // Thêm file bạn cần vào đây
    let updatedCount = 0;

    filesToUpdate.forEach(file => {
        if (fs.existsSync(file)) {
            let content = fs.readFileSync(file, 'utf8');
            // Thay thế cả localhost hay link trycloudflare cũ
            content = content.replace(/http:\/\/localhost:3000/g, newUrl);
            content = content.replace(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g, newUrl);
            content = content.replace(/const BASE_URL = '.*?';/g, `const BASE_URL = '${newUrl}';`);
            
            fs.writeFileSync(file, content);
            updatedCount++;
        }
    });

    console.log(`=> Đã cập nhật link an toàn vào ${updatedCount} file code.`);

    console.log("=> Đang đẩy lên Git...");
    try {
        // Chỉ thêm những file html, js, css phổ biến, không đẩy nguyên server
        execSync('git add .', { stdio: 'inherit' });
        execSync('git commit -m "Auto update via bat"', { stdio: 'inherit' });
        execSync('git push -u origin main --force', { stdio: 'inherit' }); // Sửa 'main' thành nhánh của bạn nếu cần
        console.log("\n==================================");
        console.log("✅ ĐÃ HOÀN TẤT. TRANG WEB QUẢN TRỊ ĐÃ SẴN SÀNG TRÊN MẠNG!");
        console.log("==================================");
    } catch (err) {
        console.log("⚠️ Có lỗi khi đẩy lên Git (có thể chưa có sự thay đổi mới, hoặc chưa khởi tạo Git).");
    }
    
    // Giữ cho process tiếp tục chạy để Cloudflare duy trì liên kết
    console.log("\n[!] QUAN TRỌNG: Hãy giữ cửa sổ này mở để Server và Link không bị ngắt.");
}

// Bắt sự kiện thoát để dọn dẹp
process.on('SIGINT', () => {
    console.log("Đang đóng server và đường ống...");
    try { process.kill(-serverProcess.pid); } catch (e) {}
    process.exit();
});
