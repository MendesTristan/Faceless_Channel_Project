export interface PipelineContext {
  id: string
  topic: string
  format: 'short' | 'long'
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export interface CreatePipelineRequest {
  topic: string
  format: 'short' | 'long'
}

export interface Keyword {
  keyword: string
  searchVolume?: number
  competition?: string
  cpc?: number
}

export interface Script {
  title: string
  description: string
  transcript: string
  segments: {
    text: string
    timestamp: number
  }[]
  tags: string[]
}

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Service input/output types
export interface KeywordFetcherResponse {
  keywords: Keyword[]
}

export interface ScriptGeneratorResponse {
  script: Script
}

export interface TTSRendererResponse {
  audioPath: string
  duration: number
}

export interface VideoAssemblerResponse {
  videoPath: string
  duration: number
}

export interface ThumbnailMakerResponse {
  thumbnailPath: string
}

export interface MetadataBuilderResponse {
  title: string
  description: string
  tags: string[]
  categoryId?: string
  privacyStatus: 'private' | 'public' | 'unlisted'
}

export interface UploaderResponse {
  videoId: string
  url: string
  uploadDate: string
}

export interface ABTesterResponse {
  testId: string
  variantIds: string[]
}

