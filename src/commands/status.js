const os = require('os');
const osUtils = require('os-utils');

async function getStatus() {
  // Mendapatkan informasi jam
  const currentTime = new Date().toLocaleTimeString();

  // Mendapatkan informasi penggunaan CPU
  const cpuUsage = await new Promise((resolve) => {
    osUtils.cpuUsage((usage) => resolve(usage));
  });

  // Mendapatkan informasi penggunaan RAM
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;

  return {
    currentTime: currentTime,
    cpuUsage: cpuUsage,
    memoryUsage: memoryUsage,
  };
}

async function handleStatusCommand(sock, messages, noWA) {
  const status = await getStatus();

  const replyText = `*Status Server*\n\n[🕰️] Jam: ${status.currentTime}\n[💻] CPU Usage: ${status.cpuUsage.toFixed(2)}%\n[💾] Memory Usage: ${status.memoryUsage.toFixed(2)}%`;

  await sock.sendMessage(
    messages[0].key.remoteJid,
    { text: replyText },
    { quoted: messages[0] }
  );
}

module.exports = { handleStatusCommand };
