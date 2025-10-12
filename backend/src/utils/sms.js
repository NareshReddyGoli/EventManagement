const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

// Initialize Twilio client only if credentials are provided
if (accountSid && authToken && twilioPhoneNumber) {
  client = twilio(accountSid, authToken);
}

/**
 * Send SMS to a single recipient
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - Twilio response or mock response
 */
async function sendSMS(to, message) {
  if (!client) {
    console.log('[SMS] Twilio not configured. Mock sending SMS to:', to);
    console.log('[SMS] Message:', message);
    return {
      sid: 'MOCK_' + Date.now(),
      status: 'sent',
      mock: true
    };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });
    
    return {
      sid: result.sid,
      status: result.status,
      to: result.to
    };
  } catch (error) {
    console.error('[SMS] Error sending SMS:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Send SMS to multiple recipients
 * @param {Array<string>} recipients - Array of phone numbers
 * @param {string} message - SMS message content
 * @returns {Promise<Array>} - Array of results
 */
async function sendBulkSMS(recipients, message) {
  const results = [];
  
  for (const phone of recipients) {
    try {
      const result = await sendSMS(phone, message);
      results.push({
        phone,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        phone,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Format phone number to E.164 format if not already formatted
 * @param {string} phone - Phone number
 * @param {string} countryCode - Default country code (e.g., '+91' for India)
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone, countryCode = '+91') {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already has country code
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Add country code if not present
  if (cleaned.length === 10) {
    return countryCode + cleaned;
  }
  
  return '+' + cleaned;
}

module.exports = {
  sendSMS,
  sendBulkSMS,
  formatPhoneNumber
};





