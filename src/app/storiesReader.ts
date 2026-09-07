export type ReaderChapter = {
  number: number;
  title: string;
  body: string;
  start: number;
  end: number;
};

const heading = /^(?:chapter\s+)(\d+)(?:\s*[-—:.)]\s*|\s+)(.+?)\s*$/i;

const titleCase = (value: string) => value
  .trim()
  .replace(/[._]+/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function chapterizeStory(content: string): ReaderChapter[] {
  const source = content.replace(/\r\n?/g, '\n').trim();
  if (!source) return [];
  const lines = source.split('\n');
  const matches: Array<{ index: number; number: number; title: string }> = [];

  lines.forEach((line, index) => {
    const clean = line.trim();
    const match = clean.match(heading);
    if (match && clean.length < 180) {
      matches.push({ index, number: Number(match[1]), title: titleCase(match[2]) });
    }
  });

  if (matches.length < 2) {
    return [{ number: 1, title: 'The Story', body: source, start: 0, end: source.length }];
  }

  return matches.map((match, index) => {
    const next = matches[index + 1];
    const body = lines.slice(match.index + 1, next?.index ?? lines.length).join('\n').trim();
    const start = lines.slice(0, match.index).join('\n').length;
    const end = start + cleanLength(body);
    return { number: match.number || index + 1, title: match.title, body, start, end };
  }).filter((chapter) => chapter.body.length > 0);
}

const cleanLength = (value: string) => value.replace(/\s+/g, ' ').trim().length;

export function getReadingProgress(position: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((position / total) * 100)));
}

export function getResumeChapter(chapters: ReaderChapter[], position: number) {
  if (!chapters.length) return undefined;
  return chapters.find((chapter) => position < chapter.end) || chapters[chapters.length - 1];
}

export const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
export const minutes = (value: string) => Math.max(1, Math.ceil(words(value) / 220));
