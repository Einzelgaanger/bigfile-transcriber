export interface TranscriptPayload {
  title: string;
  recordedAt?: string;
  durationSeconds: number;
  language?: string;
  participants: string[];
  summary?: string;
  keywords?: string[];
  actionItems?: string[];
  chapters?: Array<{ start: number; end: number; headline: string; gist?: string }>;
  utterances: Array<{
    speaker: string;
    start: number;
    end: number;
    text: string;
    confidence?: number;
  }>;
  speakerStats?: Array<{ speaker: string; seconds: number; wordCount: number }>;
  provider: string;
  modelVersion?: string;
  sourceFilename?: string;
  meanConfidence?: number;
}
