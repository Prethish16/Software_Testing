export type RiskLevel = 'Safe' | 'Caution' | 'High' | 'Critical';
export type Signal = { label: string; detail: string; weight: number };
export type Analysis = {
  score: number; level: RiskLevel; summary: string; signals: Signal[];
  recommendation: string; inputLength: number;
};

const patterns: Array<{ label: string; detail: string; weight: number; regex: RegExp }> = [
  { label: 'Urgency or pressure', detail: 'The message pressures the recipient to act quickly.', weight: 22, regex: /\b(urgent|immediately|right now|within \d+ hours?|act now|today only|expires today)\b/i },
  { label: 'Threat or account suspension', detail: 'It threatens a block, suspension, penalty or legal action.', weight: 24, regex: /\b(block(?:ed)?|suspend(?:ed|sion)?|freeze(?:d)?|penalty|legal action|arrest|fine)\b/i },
  { label: 'Sensitive information request', detail: 'It asks for credentials, an OTP, PIN or password.', weight: 32, regex: /\b(otp|one.time password|upi pin|password|cvv|card number|bank details)\b/i },
  { label: 'Suspicious link language', detail: 'It asks you to follow a verification or claim link.', weight: 18, regex: /\b(click|tap|verify|claim|track parcel|update kyc|reactivate)\b/i },
  { label: 'Prize or unexpected reward', detail: 'It mentions an unexpected prize, reward or lottery.', weight: 16, regex: /\b(you have won|winner|lottery|free gift|claim your prize|reward awaits)\b/i },
  { label: 'Payment pressure', detail: 'It asks for an urgent transfer or payment.', weight: 22, regex: /\b(send money|transfer now|pay immediately|payment pending|pay a fee|release your funds)\b/i },
  { label: 'Impersonation cues', detail: 'It uses common bank, government or delivery impersonation language.', weight: 12, regex: /\b(bank support|customs officer|tax department|parcel held|account department)\b/i }
];

export function classifyRisk(score: number): RiskLevel {
  if (!Number.isFinite(score) || score < 0 || score > 100) throw new RangeError('Risk score must be between 0 and 100.');
  if (score <= 25) return 'Safe';
  if (score <= 50) return 'Caution';
  if (score <= 75) return 'High';
  return 'Critical';
}

export function analyzeMessage(raw: string): Analysis {
  const message = raw.trim();
  if (!message) throw new Error('Enter a message before scanning.');
  if (message.length > 5000) throw new Error('Message must be 5,000 characters or fewer.');
  const signals: Signal[] = [];
  for (const p of patterns) {
    if (p.regex.test(message)) signals.push({ label: p.label, detail: p.detail, weight: p.weight });
  }
  // Keep this deterministic and explainable; it is a rules-based demo, not a trained AI model.
  const score = Math.min(100, signals.reduce((sum, signal) => sum + signal.weight, 0));
  const level = classifyRisk(score);
  const recommendation = level === 'Safe'
    ? 'No common scam patterns were detected. Still verify unexpected requests independently.'
    : level === 'Caution'
      ? 'Pause and verify the sender through an official channel before responding.'
      : 'Do not click links or share credentials. Contact the organization using its official contact details.';
  return {
    score, level,
    summary: signals.length ? `${signals.length} potential risk indicator${signals.length === 1 ? '' : 's'} detected.` : 'No configured scam indicators detected.',
    signals, recommendation, inputLength: message.length
  };
}

export type PaymentInput = { recipient: string; purpose: string; amount: number; newRecipient: boolean; urgency: boolean };
export function assessPayment(input: PaymentInput): Analysis {
  if (!input.recipient.trim()) throw new Error('Enter the recipient name.');
  if (!input.purpose.trim()) throw new Error('Enter the payment purpose.');
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > 100000000) throw new Error('Enter an amount greater than ₹0 and no more than ₹10 crore.');
  const signals: Signal[] = [];
  if (input.newRecipient) signals.push({ label: 'New recipient', detail: 'You have not paid this recipient before.', weight: 25 });
  if (input.urgency) signals.push({ label: 'Urgency', detail: 'The request is described as urgent.', weight: 25 });
  if (input.amount >= 50000) signals.push({ label: 'Large payment', detail: 'The amount is ₹50,000 or more; verify the recipient carefully.', weight: 25 });
  if (/\b(gift card|unlock|prize|job fee|verification fee|investment guaranteed)\b/i.test(input.purpose)) signals.push({ label: 'Risky payment purpose', detail: 'The purpose matches a common payment-scam phrase.', weight: 35 });
  const score = Math.min(100, signals.reduce((sum, s) => sum + s.weight, 0));
  const level = classifyRisk(score);
  return { score, level, summary: signals.length ? `${signals.length} payment risk indicator(s) found.` : 'No configured payment risk indicators found.', signals, recommendation: level === 'Safe' ? 'Confirm the recipient and purpose before paying.' : 'Pause payment and independently verify the recipient using a trusted channel.', inputLength: input.recipient.length + input.purpose.length };
}
