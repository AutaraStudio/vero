import { SplitText } from 'gsap/SplitText';

export type SplitType = 'chars' | 'words' | 'lines';

/**
 * Determines split type based on text length
 * - Under 20 chars  → split by chars  (short labels, tags)
 * - 20–80 chars     → split by words  (headlines, subheadings)
 * - Over 80 chars   → split by lines  (paragraphs, long copy)
 */
export function getSplitType(text: string): SplitType {
  const length = text.trim().length;
  if (length < 20) return 'chars';
  if (length <= 80) return 'words';
  return 'lines';
}

export interface SplitResult {
  split: SplitText;
  type: SplitType;
  elements: Element[];
}

/**
 * Creates a SplitText instance with auto-detected or forced split type
 */
export function createSplit(
  element: Element,
  forcedType?: SplitType
): SplitResult {
  const text = element.textContent ?? '';
  const type = forcedType ?? getSplitType(text);

  const split = new SplitText(element, {
    type: type,
    linesClass: 'split-line',
    wordsClass: 'split-word',
    charsClass: 'split-char',
  });

  const elements =
    type === 'chars'
      ? split.chars
      : type === 'words'
      ? split.words
      : split.lines;

  return { split, type, elements };
}
