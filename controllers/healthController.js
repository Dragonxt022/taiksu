const heartbeatService = require('../services/heartbeatService');

async function heartbeat(req, res) {
  try {
    await heartbeatService.checkDatabase();
    res.status(200).json({
      success: true,
      message: 'Service is online',
      time: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Service is offline',
      error: error.message,
      time: new Date().toISOString(),
    });
  }
}

function apiHealth(req, res) {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
}

module.exports = { heartbeat, apiHealth };
