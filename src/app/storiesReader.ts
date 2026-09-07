export type ReaderChapter = {
  number: number;
  title: string;
  body: string;
  start: number;
  end: number;
};

const chapterWords: Record<string, number> = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20 };
const heading = /^(?:chapter\s+)(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(?:\s*[-—:.)]\s*|\s+)(.+?)\s*$/i;

const titleCase = (value: string) => value
  .trim()
  .replace(/[._]+/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const cleanLength = (value: string) => value.replace(/\s+/g, ' ').trim().length;

export function chapterizeStory(content: string): ReaderChapter[] {
  const source = content.replace(/\r\n?/g, '\n').trim();
  if (!source) return [];
  const lines = source.split('\n');
  const matches: Array<{ index: number; number: number; title: string }> = [];

  lines.forEach((line, index) => {
    const clean = line.trim();
    const match = clean.match(heading);
    if (match && clean.length < 180) {
      const rawNumber = match[1].toLowerCase();
      matches.push({ index, number: Number(rawNumber) || chapterWords[rawNumber] || matches.length + 1, title: titleCase(match[2]) });
    }
  });

  if (matches.length < 2) {
    return [{ number: 1, title: 'The Story', body: source, start: 0, end: cleanLength(source) }];
  }

  return matches.map((match, index) => {
    const next = matches[index + 1];
    const body = lines.slice(match.index + 1, next?.index ?? lines.length).join('\n').trim();
    const start = cleanLength(lines.slice(0, match.index).join('\n'));
    const end = start + cleanLength(body);
    return { number: match.number || index + 1, title: match.title, body, start, end };
  }).filter((chapter) => chapter.body.length > 0);
}

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
