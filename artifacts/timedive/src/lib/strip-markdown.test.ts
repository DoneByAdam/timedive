import { describe, it, expect } from 'vitest';
import { stripMarkdown } from './strip-markdown';

describe('stripMarkdown', () => {
  // ── Emphasis ────────────────────────────────────────────────────────────────
  it('removes bold-italic ***text***', () => {
    expect(stripMarkdown('***bold-italic***')).toBe('bold-italic');
  });

  it('removes bold-italic ___text___', () => {
    expect(stripMarkdown('___bold-italic___')).toBe('bold-italic');
  });

  it('removes bold **text**', () => {
    expect(stripMarkdown('**bold**')).toBe('bold');
  });

  it('removes bold __text__', () => {
    expect(stripMarkdown('__bold__')).toBe('bold');
  });

  it('removes italic *text*', () => {
    expect(stripMarkdown('*italic*')).toBe('italic');
  });

  it('removes italic _text_', () => {
    expect(stripMarkdown('_italic_')).toBe('italic');
  });

  // ── Headings ────────────────────────────────────────────────────────────────
  it('removes ATX heading level 1', () => {
    expect(stripMarkdown('# Heading One')).toBe('Heading One');
  });

  it('removes ATX heading level 3', () => {
    expect(stripMarkdown('### Sub-heading')).toBe('Sub-heading');
  });

  it('removes ATX heading level 6', () => {
    expect(stripMarkdown('###### Deep heading')).toBe('Deep heading');
  });

  // ── Inline code ─────────────────────────────────────────────────────────────
  it('removes inline code backticks', () => {
    expect(stripMarkdown('use `console.log` here')).toBe('use console.log here');
  });

  // ── Links ───────────────────────────────────────────────────────────────────
  it('collapses [label](url) to label', () => {
    expect(stripMarkdown('[click here](https://example.com)')).toBe('click here');
  });

  // ── Horizontal rules ────────────────────────────────────────────────────────
  it('removes --- horizontal rule', () => {
    expect(stripMarkdown('above\n---\nbelow')).toBe('above\n\nbelow');
  });

  it('removes *** horizontal rule', () => {
    expect(stripMarkdown('above\n***\nbelow')).toBe('above\n\nbelow');
  });

  it('removes ___ horizontal rule', () => {
    expect(stripMarkdown('above\n___\nbelow')).toBe('above\n\nbelow');
  });

  // ── Numbered lists ──────────────────────────────────────────────────────────
  it('removes numbered list prefix "1. "', () => {
    expect(stripMarkdown('1. First item')).toBe('First item');
  });

  it('removes multi-digit numbered list prefix "10. "', () => {
    expect(stripMarkdown('10. Tenth item')).toBe('Tenth item');
  });

  it('strips numbers from every line of a numbered list', () => {
    const input = '1. Alpha\n2. Beta\n3. Gamma';
    expect(stripMarkdown(input)).toBe('Alpha\nBeta\nGamma');
  });

  // ── Unordered lists ─────────────────────────────────────────────────────────
  it('removes "- " unordered list marker', () => {
    expect(stripMarkdown('- item')).toBe('item');
  });

  it('removes "* " unordered list marker', () => {
    expect(stripMarkdown('* item')).toBe('item');
  });

  it('removes "+ " unordered list marker', () => {
    expect(stripMarkdown('+ item')).toBe('item');
  });

  // ── Escaped characters ──────────────────────────────────────────────────────
  it('unescapes \\* so literal asterisks survive', () => {
    // \*text\* should NOT be treated as italic; the backslashes are removed
    // and the asterisks remain as plain characters.
    expect(stripMarkdown('\\*not bold\\*')).toBe('*not bold*');
  });

  it('unescapes \\_ so literal underscores survive', () => {
    expect(stripMarkdown('\\_filename\\_')).toBe('_filename_');
  });

  // ── Compound / Claude-style output ──────────────────────────────────────────
  it('cleans a typical Claude story paragraph', () => {
    const input =
      '**The Roman Empire** was *vast* and `powerful`.\n\n' +
      '### Key Facts\n\n' +
      '1. Founded in 27 BC\n' +
      '2. Fell in 476 AD\n\n' +
      '---\n\n' +
      '[Learn more](https://example.com)';

    const expected =
      'The Roman Empire was vast and powerful.\n\n' +
      'Key Facts\n\n' +
      'Founded in 27 BC\n' +
      'Fell in 476 AD\n\n' +
      '\n\n' +
      'Learn more';

    expect(stripMarkdown(input)).toBe(expected.trim());
  });

  it('leaves plain text unchanged', () => {
    const plain = 'This is just plain text with no formatting.';
    expect(stripMarkdown(plain)).toBe(plain);
  });

  it('trims leading and trailing whitespace', () => {
    expect(stripMarkdown('   hello world   ')).toBe('hello world');
  });
});
