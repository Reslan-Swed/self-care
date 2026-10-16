/**
 * Dual-Mode WhatsApp Dispatcher:
 * 1. Primary: Invokes backend automated dispatch (/api/notifications/appointments/{id}/dispatch).
 * 2. Fallback: Generates free browser Click-to-Chat URL (https://wa.me/{sanitized_phone}?text={encoded_message}).
 */

export interface WhatsAppNotificationPayload {
  appointmentId: string;
  patientName: string;
  phone: string;
  doctorName: string;
  scheduledTime: string;
  clinicName?: string;
}

export function sanitizePhoneNumber(phone: string): string {
  // Strip non-numeric characters except leading '+'
  const cleaned = phone.replace(/[^\d+]/g, '');
  // wa.me format requires no '+' prefix and full country code
  return cleaned.startsWith('+') ? cleaned.substring(1) : cleaned;
}

export function generateWhatsAppMessage(payload: WhatsAppNotificationPayload): string {
  const clinic = payload.clinicName || 'Metro Health Medical Center';
  return `Hello ${payload.patientName}, your appointment at ${clinic} with ${payload.doctorName} is confirmed for ${payload.scheduledTime}. Please arrive 10 minutes early. Reply 'YES' to confirm or call us if you need to reschedule.`;
}

export function getClickToChatUrl(payload: WhatsAppNotificationPayload): string {
  const phone = sanitizePhoneNumber(payload.phone);
  const text = encodeURIComponent(generateWhatsAppMessage(payload));
  return `https://wa.me/${phone}?text=${text}`;
}

export async function sendWhatsAppNotification(
  payload: WhatsAppNotificationPayload,
  preferFreeBrowserFallback: boolean = true
): Promise<{ success: boolean; mode: 'AUTOMATED_API' | 'BROWSER_CLICK_TO_CHAT'; url?: string }> {
  // If user selected browser fallback or no credits available
  if (preferFreeBrowserFallback) {
    const url = getClickToChatUrl(payload);
    window.open(url, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      mode: 'BROWSER_CLICK_TO_CHAT',
      url
    };
  }

  // Attempt backend API dispatch
  try {
    const response = await fetch(`/api/notifications/appointments/${payload.appointmentId}/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return {
        success: true,
        mode: 'AUTOMATED_API'
      };
    }
  } catch {
    // Backend API failed or unavailable -> fallback to Click-to-Chat
  }

  // Graceful fallback to Click-to-Chat
  const fallbackUrl = getClickToChatUrl(payload);
  window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  return {
    success: true,
    mode: 'BROWSER_CLICK_TO_CHAT',
    url: fallbackUrl
  };
}
