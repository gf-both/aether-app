/* eslint-disable */
// Demo stub — not production-backed
// WhatsApp messaging integration for AETHER
// Requires:
//   - WhatsApp Business API (cloud-hosted by Meta) or Twilio WhatsApp API
//   - Approved message templates for transactional messages
//   - Webhook endpoint for delivery receipts and incoming replies

const WHATSAPP_CONFIG = {
  apiKey: '', // WhatsApp Business API token or Twilio auth token
  businessPhoneNumber: '', // The registered WhatsApp Business number (E.164 format)
  webhookUrl: '', // Your server endpoint for delivery receipts / inbound messages
  apiBaseUrl: 'https://graph.facebook.com/v18.0', // Meta Cloud API base (or Twilio equivalent)
}

// ---------------------------------------------------------------------------
// generateWhatsAppLink(phoneNumber, message)
// Builds a wa.me deep-link that opens a pre-filled WhatsApp chat.
// This function works without any API keys.
// ---------------------------------------------------------------------------
export function generateWhatsAppLink(phoneNumber, message) {
  // Strip all non-digit characters so the link works with any input format
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

// ---------------------------------------------------------------------------
// sendMessage(phoneNumber, message)
// Sends a free-form text message via the WhatsApp Business API.
// ---------------------------------------------------------------------------
export async function sendMessage(phoneNumber, _message) {
  // TODO: Implement real WhatsApp message sending
  // 1. Validate the phone number (E.164 format)
  // 2. POST to the WhatsApp Cloud API messages endpoint:
  //    POST {apiBaseUrl}/{businessPhoneNumberId}/messages
  //    Body: { messaging_product: 'whatsapp', to: phoneNumber, type: 'text', text: { body: message } }
  // 3. Include Authorization: Bearer {apiKey} header
  // 4. Handle rate limits, template requirements for 24h+ conversations, and error codes
  // 5. Store the message ID for delivery-receipt tracking via the webhook
  console.log(`[whatsapp] sendMessage called (mock) to: ${phoneNumber}`)

  return {
    success: true,
    messageId: `wam_${Date.now()}`,
    to: phoneNumber,
    timestamp: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// sendMeetingSummary(phoneNumber, sessionNotes)
// Formats session notes into a readable WhatsApp message and sends it.
// ---------------------------------------------------------------------------
export async function sendMeetingSummary(phoneNumber, sessionNotes) {
  // TODO: Implement real sending via sendMessage once the API is configured
  // 1. Format the sessionNotes object into a clean WhatsApp-friendly plain-text block
  //    (WhatsApp supports *bold*, _italic_, ~strikethrough~, and ```monospace```)
  // 2. Respect the 4096-character message limit; split into multiple messages if needed
  // 3. Call sendMessage() with the formatted text
  console.log(`[whatsapp] sendMeetingSummary called (mock) to: ${phoneNumber}`)

  const formatted = [
    `*Session Notes* - ${sessionNotes?.date || new Date().toISOString()}`,
    '',
    sessionNotes?.summary || 'No summary available.',
    '',
    sessionNotes?.keyThemes?.length
      ? `*Key themes:* ${sessionNotes.keyThemes.join(', ')}`
      : '',
    '',
    sessionNotes?.recommendations
      ? `*Recommendations:* ${sessionNotes.recommendations}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  return sendMessage(phoneNumber, formatted)
}

// ---------------------------------------------------------------------------
// sendFollowUp(phoneNumber, followUpText)
// Sends a follow-up message to a client after a session.
// ---------------------------------------------------------------------------
export async function sendFollowUp(phoneNumber, followUpText) {
  // TODO: Implement real sending via sendMessage once the API is configured
  // 1. May require a pre-approved template if more than 24 hours have passed
  //    since the client's last inbound message (WhatsApp policy)
  // 2. Consider scheduling via a backend job queue (e.g. BullMQ, cron)
  //    rather than sending immediately
  // 3. Call sendMessage() with the follow-up text
  console.log(`[whatsapp] sendFollowUp called (mock) to: ${phoneNumber}`)

  return sendMessage(phoneNumber, followUpText)
}

// ---------------------------------------------------------------------------
// sendReferralIntroduction(clientPhone, practitionerPhone, clientName, practitionerName)
// Sends a warm introduction to both the client and the referred practitioner.
// ---------------------------------------------------------------------------
export async function sendReferralIntroduction(
  clientPhone,
  practitionerPhone,
  clientName,
  practitionerName
) {
  // TODO: Implement real sending via sendMessage once the API is configured
  // 1. Send the client a message introducing the practitioner
  // 2. Send the practitioner a message introducing the client (with consent)
  // 3. Both messages should include context and next-step instructions
  console.log(
    `[whatsapp] sendReferralIntroduction called (mock) client: ${clientPhone}, practitioner: ${practitionerPhone}`
  )

  const clientMessage = `Hi ${clientName}! I'd like to introduce you to *${practitionerName}*, who I think would be a great fit for the next phase of your journey. They'll be reaching out to you shortly.`

  const practitionerMessage = `Hi ${practitionerName}! I'm referring *${clientName}* to you. They've been working on grounding and breathwork and are ready to explore deeper somatic practices. I'll let them know to expect your message.`

  const [clientResult, practitionerResult] = await Promise.all([
    sendMessage(clientPhone, clientMessage),
    sendMessage(practitionerPhone, practitionerMessage),
  ])

  return { clientResult, practitionerResult }
}

// ---------------------------------------------------------------------------
// sendReminder(phoneNumber, reminderText, scheduledTime)
// Queues a reminder message to be sent at a specific time.
// ---------------------------------------------------------------------------
export async function sendReminder(phoneNumber, reminderText, scheduledTime) {
  // TODO: Implement real scheduled sending
  // 1. Store the reminder in a backend job queue with the scheduledTime
  // 2. A background worker should pick it up at the right time and call sendMessage()
  // 3. For MVP, you could use setTimeout on the server or a cron-based scheduler
  // 4. WhatsApp template messages are required if scheduledTime is 24h+ in the future
  console.log(
    `[whatsapp] sendReminder called (mock) to: ${phoneNumber} at: ${scheduledTime}`
  )

  return {
    success: true,
    reminderId: `rem_${Date.now()}`,
    to: phoneNumber,
    scheduledTime: scheduledTime || null,
    status: 'queued',
  }
}

export { WHATSAPP_CONFIG }
