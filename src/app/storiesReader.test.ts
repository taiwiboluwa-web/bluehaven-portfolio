import { describe, expect, it } from 'vitest';
import { chapterizeStory, getReadingProgress, getResumeChapter, type ReaderChapter } from './storiesReader';

describe('stories reader', () => {
  it('splits a manuscript into real chapters while preserving chapter text', () => {
    const chapters = chapterizeStory('CHAPTER ONE\nThe beginning.\n\nCHAPTER TWO\nThe night arrives.');
    expect(chapters).toHaveLength(2);
    expect(chapters[0].title).toBe('The Beginning');
    expect(chapters[0].body).toContain('The beginning.');
    expect(chapters[1].title).toBe('The Night Arrives');
  });

  it('supports numbered chapter headings', () => {
    const chapters = chapterizeStory('Chapter 3 — The Door\nA sound came from outside.\n\nChapter 4: The Room\nHe waited.');
    expect(chapters.map((chapter) => chapter.number)).toEqual([3, 4]);
    expect(chapters[0].title).toBe('The Door');
    expect(chapters[1].title).toBe('The Room');
  });

  it('calculates progress from an exact reading position', () => {
    expect(getReadingProgress(500, 1000)).toBe(50);
    expect(getReadingProgress(0, 1000)).toBe(0);
    expect(getReadingProgress(1200, 1000)).toBe(100);
  });

  it('resumes the chapter represented by saved progress', () => {
    const chapters: ReaderChapter[] = [
      { number: 1, title: 'One', body: 'one', start: 0, end: 100 },
      { number: 2, title: 'Two', body: 'two', start: 100, end: 300 },
      { number: 3, title: 'Three', body: 'three', start: 300, end: 600 },
    ];
    expect(getResumeChapter(chapters, 250)?.number).toBe(2);
    expect(getResumeChapter(chapters, 599)?.number).toBe(3);
  });
});
