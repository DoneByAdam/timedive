/**
 * Strip common Markdown formatting from a string so it renders as plain text.
 *
 * Patterns handled (in application order):
 *  1. Horizontal rules  --- / *** / ___ on their own line  (before emphasis so *** isn't misread)
 *  2. ATX headings  # … ######
 *  3. Bold-italic  ***text*** / ___text___  (must precede bold/italic)
 *  4. Bold         **text** / __text__
 *  5. Italic       *text* / _text_  (negative lookbehind so \* is skipped)
 *  6. Inline code  `text`
 *  7. Links        [label](url)
 *  8. Numbered lists   1. item
 *  9. Unordered lists  - / * / + item
 * 10. Escaped chars   \* \_ \[ etc.  (last, so the unescaped char isn't re-processed)
 * 11. Leading/trailing whitespace
 */
export function stripMarkdown(text: string): string {
  return text
    // 1. Horizontal rules  (--- / *** / ___ with optional surrounding spaces)
    //    Must run before emphasis so "***" on its own line isn't eaten by italic.
    .replace(/^[ \t]*(?:[-*_][ \t]*){3,}[ \t]*$/gm, '')

    // 2. ATX headings
    .replace(/^#{1,6}\s+/gm, '')

    // 3. Bold-italic (must precede bold and italic)
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')

    // 4. Bold
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')

    // 5. Italic — negative lookbehind so escaped \* / \_ are left alone
    .replace(/(?<!\\)\*(.+?)(?<!\\)\*/g, '$1')
    .replace(/(?<!\\)_([^_\n]+)(?<!\\)_/g, '$1')

    // 6. Inline code
    .replace(/`(.+?)`/g, '$1')

    // 7. Links [label](url) → label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    // 8. Numbered lists  "1. " / "12. "
    .replace(/^\d+\.\s+/gm, '')

    // 9. Unordered list markers  "- " / "* " / "+ "
    .replace(/^[ \t]*[-*+]\s+/gm, '')

    // 10. Escaped markdown characters  \* \_ \[ \] \( \) \# etc.
    //     Runs last so the revealed char isn't re-processed by an earlier rule.
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')

    .trim();
}
