import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Design Tokens — design/COLOR_TYPOGRAPHY.md Compliance', () => {
  it('defines all required brand, neutral, and semantic color variables', () => {
    const tokensPath = path.resolve(__dirname, 'tokens.css');
    const content = fs.readFileSync(tokensPath, 'utf-8');

    // Brand Palette
    expect(content).toContain('--color-brand-900: #174b3a');
    expect(content).toContain('--color-brand-700: #246b50');
    expect(content).toContain('--color-brand-100: #e7f1eb');
    expect(content).toContain('--color-accent-600: #b66a35');

    // Neutral Palette
    expect(content).toContain('--color-text: #18231e');
    expect(content).toContain('--color-muted: #66736c');
    expect(content).toContain('--color-surface: #ffffff');
    expect(content).toContain('--color-canvas: #f5f7f5');
    expect(content).toContain('--color-border: #dce4de');

    // Semantic Colors
    expect(content).toContain('--color-success: #237a4b');
    expect(content).toContain('--color-warning: #94621a');
    expect(content).toContain('--color-danger: #b33a32');

    // 4px Base Spacing
    expect(content).toContain('--space-1: 0.25rem');
    expect(content).toContain('--space-2: 0.5rem');
    expect(content).toContain('--space-4: 1rem');

    // Layout
    expect(content).toContain('--sidebar-width: 256px');
    expect(content).toContain('--content-max-width: 1440px');
  });
});
