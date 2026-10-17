import { describe, expect, it } from 'vitest';
import { analyzeMessage, assessPayment, classifyRisk } from './engine';

describe('risk classification boundaries', () => {
  it.each([[0,'Safe'],[25,'Safe'],[26,'Caution'],[50,'Caution'],[51,'High'],[75,'High'],[76,'Critical'],[100,'Critical']] as const)(
    'classifies %i as %s', (score, level) => expect(classifyRisk(score)).toBe(level)
  );
  it.each([-1,101,Number.NaN,Number.POSITIVE_INFINITY])('rejects invalid score %s', score => {
    expect(() => classifyRisk(score)).toThrow(RangeError);
  });
});

describe('message analysis', () => {
  it('rejects blank input', () => expect(() => analyzeMessage('  ')).toThrow(/Enter a message/));
  it('rejects input over 5000 characters', () => expect(() => analyzeMessage('x'.repeat(5001))).toThrow(/5,000/));
  it('accepts exactly 5000 characters', () => expect(analyzeMessage('x'.repeat(5000)).inputLength).toBe(5000));
  it('returns no configured signals for a neutral message', () => {
    const result = analyzeMessage('Your monthly statement is available in the official app.');
    expect(result.level).toBe('Safe'); expect(result.signals).toHaveLength(0);
  });
  it('flags a credential-harvesting message', () => {
    const result = analyzeMessage('URGENT: your bank account is blocked. Click now to verify and enter your OTP and UPI PIN.');
    expect(['High','Critical']).toContain(result.level);
    expect(result.signals.map(s => s.label)).toContain('Sensitive information request');
  });
  it('caps accumulated score at 100', () => {
    expect(analyzeMessage('URGENT blocked OTP click you have won send money now bank support').score).toBe(100);
  });
});

describe('payment assessment', () => {
  const base = { recipient: 'Asha', purpose: 'Dinner split', amount: 500, newRecipient: false, urgency: false };
  it('rejects missing recipient', () => expect(() => assessPayment({ ...base, recipient: ' ' })).toThrow(/recipient/));
  it('rejects zero amount', () => expect(() => assessPayment({ ...base, amount: 0 })).toThrow(/amount/));
  it('raises risk for urgent large payments to new recipients', () => {
    const result = assessPayment({ ...base, amount: 75000, newRecipient: true, urgency: true });
    expect(result.score).toBe(75); expect(result.level).toBe('High'); expect(result.signals).toHaveLength(3);
  });
});