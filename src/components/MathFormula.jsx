import { useMemo } from 'react';
import katex from 'katex';

/**
 * Helper component untuk merender ekspresi LaTeX menjadi notasi matematika presisi menggunakan KaTeX.
 */
function MathFormula({ latex, displayMode = true, className = '' }) {
  const html = useMemo(
    () =>
      katex.renderToString(String(latex ?? ''), {
        throwOnError: false,
        displayMode,
      }),
    [latex, displayMode]
  );

  const Tag = displayMode ? 'div' : 'span';

  return (
    <Tag
      className={`[&_.katex-display]:my-0 [&_.katex]:text-[0.95em] ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MathFormula;
