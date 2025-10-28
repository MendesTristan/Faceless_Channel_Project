import { z } from 'zod'

// ============================================================================
// Pipeline Context & State
// ============================================================================

export type PipelineContext = {
  id: string
  topic: string
  format: 'short' | 'long'
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export type PipelineStepStatus = {
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: string
  completedAt?: string
  error?: string
  retryCount?: number
}

export type PipelineState = {
  context: PipelineContext
  steps: Record<string, PipelineStepStatus>
}

// ============================================================================
// Module Input/Output Interfaces
// ============================================================================

// Keyword Fetcher
export const KeywordSchema = z.object({
  keyword: z.string(),
  searchVolume: z.number().optional(),
  competition: z.string().optional(),
  cpc: z.number().optional()
})

export type Keyword = z.infer<typeof KeywordSchema>

export interface KeywordFetcherInput {
  topic: string
  format: 'short' | 'long'
}

export interface KeywordFetcherOutput {
  keywords: Keyword[]
}

// Script Generator
export const ScriptSchema = z.object({
  title: z.string(),
  description: z.string(),
  transcript: z.string(),
  segments: z.array(z.object({
    text: z.string(),
    timestamp: z.number()
  })),
  tags: z.array(z.string())
})

export type Script = z.infer<typeof ScriptSchema>

export interface ScriptGeneratorInput {
  topic: string
  keywords: Keyword[]
  format: 'short' | 'long'
}

export interface ScriptGeneratorOutput {
  script: Script
}

// TTS Renderer
export interface TTSRendererInput {
  script: Script
  voice?: string
  speed?: number
}

export interface TTSRendererOutput {
  audioPath: string
  duration: number
}

// Video Assembler
export interface VideoAssemblerInput {
  script: Script
  audioPath: string
  backgroundVideo?: string
}

export interface VideoAssemblerOutput {
  videoPath: string
  duration: number
}

// Thumbnail Maker
export interface ThumbnailMakerInput {
  script: Script
  videoPath?: string
}

export interface ThumbnailMakerOutput {
  thumbnailPath: string
}

// Metadata Builder
export interface MetadataBuilderInput {
  script: Script
  videoPath: string
  thumbnailPath: string
}

export interface MetadataBuilderOutput {
  title: string
  description: string
  tags: string[]
  categoryId?: string
  privacyStatus: 'private' | 'public' | 'unlisted'
}

// Uploader
export interface UploaderInput {
  videoPath: string
  thumbnailPath: string
  metadata: MetadataBuilderOutput
}

export interface UploaderOutput {
  videoId: string
  url: string
  uploadDate: string
}

// AB Tester
export interface ABTesterInput {
  videoId: string
  scripts: {
    title: string
    description: string
  }[]
}

export interface ABTesterOutput {
  testId: string
  variantIds: string[]
}

// Module Base Interface
export interface Module<I, O> {
  name: string
  execute(input: I, context: PipelineContext): Promise<O>
  validate?(input: I): boolean
}

// Specific Module Implementations
export interface KeywordFetcher extends Module<KeywordFetcherInput, KeywordFetcherOutput> {}
export interface ScriptGenerator extends Module<ScriptGeneratorInput, ScriptGeneratorOutput> {}
export interface TTSRenderer extends Module<TTSRendererInput, TTSRendererOutput> {}
export interface VideoAssembler extends Module<VideoAssemblerInput, VideoAssemblerOutput> {}
export interface ThumbnailMaker extends Module<ThumbnailMakerInput, ThumbnailMakerOutput> {}
export interface MetadataBuilder extends Module<MetadataBuilderInput, MetadataBuilderOutput> {}
export interface Uploader extends Module<UploaderInput, UploaderOutput> {}
export interface ABTester extends Module<ABTesterInput, ABTesterOutput> {}

