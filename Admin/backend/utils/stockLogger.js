/**
 * STOCK CHANGE LOGGER
 * 
 * Tracks all stock creation, updates, and validation operations
 * Critical for debugging inventory issues
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs/stock');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log file path based on date
 */
function getLogFilePath() {
  const date = new Date().toISOString().split('T')[0];
  return path.join(logsDir, `stock-${date}.log`);
}

/**
 * Format log entry with timestamp
 */
function formatLogEntry(level, event, data) {
  return {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  };
}

/**
 * Write to file
 */
function writeLog(entry) {
  try {
    const logFile = getLogFilePath();
    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    console.error('❌ Failed to write stock log:', error.message);
  }
}

/**
 * Log product creation
 */
exports.logProductCreate = (productId, productName, stock, userId) => {
  const entry = formatLogEntry('INFO', 'PRODUCT_CREATED', {
    productId,
    productName,
    stock,
    userId,
    action: 'Product created with stock value',
  });

  console.log(`📝 STOCK LOG [CREATE]: ${productName} - stock=${stock}`);
  writeLog(entry);
};

/**
 * Log product stock update
 */
exports.logStockUpdate = (productId, productName, oldStock, newStock, reason, userId) => {
  const entry = formatLogEntry('INFO', 'STOCK_UPDATED', {
    productId,
    productName,
    oldStock,
    newStock,
    change: newStock - oldStock,
    reason,
    userId,
    action: `Stock changed from ${oldStock} to ${newStock}`,
  });

  console.log(`📊 STOCK LOG [UPDATE]: ${productName} - ${oldStock} → ${newStock} (${reason})`);
  writeLog(entry);
};

/**
 * Log stock validation success
 */
exports.logValidation = (type, data) => {
  const entry = formatLogEntry('DEBUG', 'STOCK_VALIDATION_SUCCESS', {
    validationType: type,
    ...data,
  });

  console.log(`✅ STOCK VALIDATION [${type}]: Value validated successfully`);
  writeLog(entry);
};

/**
 * Log stock validation failure
 */
exports.logError = (errorType, data) => {
  const entry = formatLogEntry('ERROR', 'STOCK_VALIDATION_FAILURE', {
    errorType,
    ...data,
    action: 'Stock validation rejected invalid data',
  });

  console.error(`❌ STOCK ERROR [${errorType}]:`, data.errorMessage);
  writeLog(entry);
};

/**
 * Log stock reservation (inventory system)
 */
exports.logReservation = (productId, quantity, userId, reservationToken) => {
  const entry = formatLogEntry('INFO', 'STOCK_RESERVED', {
    productId,
    quantity,
    userId,
    reservationToken,
    action: 'Stock reserved for checkout',
  });

  console.log(`🔒 STOCK LOG [RESERVE]: Product ${productId} - ${quantity} units reserved`);
  writeLog(entry);
};

/**
 * Log stock confirmation (order paid)
 */
exports.logConfirmation = (productId, quantity, orderId, userId) => {
  const entry = formatLogEntry('INFO', 'STOCK_CONFIRMED', {
    productId,
    quantity,
    orderId,
    userId,
    action: 'Stock deducted from inventory (order confirmed)',
  });

  console.log(`✔️ STOCK LOG [CONFIRM]: Product ${productId} - ${quantity} units confirmed`);
  writeLog(entry);
};

/**
 * Log stock release
 */
exports.logRelease = (productId, quantity, reason, userId) => {
  const entry = formatLogEntry('INFO', 'STOCK_RELEASED', {
    productId,
    quantity,
    reason,
    userId,
    action: `Stock released back to inventory (${reason})`,
  });

  console.log(`🔓 STOCK LOG [RELEASE]: Product ${productId} - ${quantity} units released (${reason})`);
  writeLog(entry);
};

/**
 * Log critical error (e.g., stock went negative)
 */
exports.logCriticalError = (errorMessage, data) => {
  const entry = formatLogEntry('CRITICAL', 'STOCK_CRITICAL_ERROR', {
    error: errorMessage,
    ...data,
    action: 'CRITICAL ISSUE - Investigate immediately',
  });

  console.error(`🚨 CRITICAL STOCK ERROR:`, errorMessage);
  writeLog(entry);
};

/**
 * Get all logs for a product (for audit trail)
 */
exports.getProductStockHistory = (productId, days = 7) => {
  try {
    const logs = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const logFile = path.join(logsDir, `stock-${dateStr}.log`);

      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        const lines = content.split('\n').filter((l) => l.trim());

        lines.forEach((line) => {
          try {
            const entry = JSON.parse(line);
            if (entry.productId === productId) {
              logs.push(entry);
            }
          } catch (e) {
            // Skip parse errors
          }
        });
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Failed to read stock history:', error.message);
    return [];
  }
};

/**
 * Get recent critical errors
 */
exports.getRecentErrors = (limit = 50) => {
  try {
    const errors = [];
    const logsPath = logsDir;

    if (!fs.existsSync(logsPath)) {
      return [];
    }

    const files = fs
      .readdirSync(logsPath)
      .sort()
      .reverse()
      .slice(0, 7); // Last 7 days

    files.forEach((file) => {
      const logFile = path.join(logsPath, file);
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim());

      lines.forEach((line) => {
        try {
          const entry = JSON.parse(line);
          if (entry.level === 'ERROR' || entry.level === 'CRITICAL') {
            errors.push(entry);
          }
        } catch (e) {
          // Skip parse errors
        }
      });
    });

    return errors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
  } catch (error) {
    console.error('Failed to read error logs:', error.message);
    return [];
  }
};

module.exports = exports;
