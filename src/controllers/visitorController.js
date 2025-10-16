const uniqueVisitors = new Set();
const onlineVisitors = new Map();
let totalPageViews = 0;
const ONLINE_TIMEOUT = 5 * 60 * 1000;

function cleanupInactiveVisitors() {
  const now = Date.now();
  for (const [sessionId, lastSeen] of onlineVisitors.entries()) {
    if (now - lastSeen > ONLINE_TIMEOUT) {
      onlineVisitors.delete(sessionId);
    }
  }
}

setInterval(cleanupInactiveVisitors, 30000);

export const trackVisitor = (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.ip || 'unknown';
    const now = Date.now();
    
    uniqueVisitors.add(sessionId);
    onlineVisitors.set(sessionId, now);
    
    totalPageViews++;
    
    res.json({
      success: true,
      totalVisitors: uniqueVisitors.size,
      onlineVisitors: onlineVisitors.size,
      pageViews: totalPageViews
    });
  } catch (error) {
    console.error('Visitor tracking error:', error.message);
    res.status(500).json({ 
      error: 'Failed to track visitor',
      totalVisitors: 0,
      onlineVisitors: 0,
      pageViews: 0
    });
  }
};

export const getVisitorStats = (req, res) => {
  try {
    cleanupInactiveVisitors();
    
    res.json({
      totalVisitors: uniqueVisitors.size,
      onlineVisitors: onlineVisitors.size,
      pageViews: totalPageViews
    });
  } catch (error) {
    console.error('Get visitor stats error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get visitor stats',
      totalVisitors: 0,
      onlineVisitors: 0,
      pageViews: 0
    });
  }
};

export const heartbeat = (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.ip || 'unknown';
    const now = Date.now();
    
    if (uniqueVisitors.has(sessionId)) {
      onlineVisitors.set(sessionId, now);
    }
    
    cleanupInactiveVisitors();
    
    res.json({
      success: true,
      totalVisitors: uniqueVisitors.size,
      onlineVisitors: onlineVisitors.size,
      pageViews: totalPageViews
    });
  } catch (error) {
    console.error('Heartbeat error:', error.message);
    res.status(500).json({ 
      error: 'Failed to update heartbeat',
      totalVisitors: 0,
      onlineVisitors: 0,
      pageViews: 0
    });
  }
};
