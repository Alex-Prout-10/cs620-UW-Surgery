import { describe, expect, it } from 'vitest';
import { hasDirectSelfHarmCrisis } from '@/lib/safety';

describe('hasDirectSelfHarmCrisis', () => {
  it.each([
    'I want to end my life',
    "I don't want to live anymore",
    'Someone says they want to end their life',
    'I wish I were dead',
    'I might hurt myself'
  ])('recognizes crisis language: %s', (message) => {
    expect(hasDirectSelfHarmCrisis(message)).toBe(true);
  });

  it('does not flag an ordinary adrenal question', () => {
    expect(hasDirectSelfHarmCrisis('What does an adrenal gland do?')).toBe(false);
  });
});
