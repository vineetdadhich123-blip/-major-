// QuickPrint Pro - Full Stack Production Server
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const os = require('os');
const app = require('./backend/app');
const { connectDatabase, getActiveDbType } = require('./backend/config/db');

const PORT = process.env.PORT || 3000;

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        const isWiFi = /wi-?fi|wlan|wireless/i.test(name);
        const isEth = /eth|ethernet/i.test(name);
        candidates.push({ address: net.address, priority: isWiFi ? 3 : (isEth ? 2 : 1) });
      }
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0].address;
}

// Ensure upload directory exists
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function startServer() {
  try {
    // 1. Connect to Database (MongoDB or fallback to SQLite)
    const dbInfo = await connectDatabase();
    const dbName = dbInfo.type === 'mongodb' ? 'MongoDB (Mongoose)' : 'Embedded SQL (SQLite)';

    // 2. Start HTTP Server explicitly on 0.0.0.0
    const server = app.listen(PORT, '0.0.0.0', () => {
      const lanIp = getLocalIpAddress();
      console.log('\n' + '═'.repeat(65));
      console.log('   🚀 QUICKPRINT PRO — FULL STACK COMMERCIAL PRINT PLATFORM');
      console.log('═'.repeat(65));
      console.log(`   🌐 Desktop Web App:    http://localhost:${PORT}`);
      if (lanIp) {
        console.log(`   📱 Mobile (Same Wi-Fi): http://${lanIp}:${PORT}`);
        console.log(`   📸 Mobile QR Upload:   http://${lanIp}:${PORT}/mobile-upload.html`);
      }
      if (process.env.PUBLIC_URL) {
        console.log(`   🌍 Live Public URL:    ${process.env.PUBLIC_URL}`);
      }
      console.log(`   📡 REST API Root:      http://localhost:${PORT}/api/v1/health`);
      console.log(`   🗄️  Active Database:    ${dbName}`);
      console.log(`   📁 Upload Storage:     ${uploadDir}`);
      console.log('═'.repeat(65) + '\n');
    });

    // Graceful Shutdown Handler
    const shutdown = () => {
      console.log('\n🛑 Shutting down QuickPrint server gracefully...');
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('❌ Fatal error starting QuickPrint server:', err);
    process.exit(1);
  }
}

startServer();
