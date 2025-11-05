import axios from 'axios'
import { Logger } from 'pino'
import { EventBus } from './event-bus'
import { 
  PipelineContext, 
  KeywordFetcherResponse,
  ScriptGeneratorResponse,
  TTSRendererResponse,
  VideoAssemblerResponse,
  ThumbnailMakerResponse,
  MetadataBuilderResponse,
  UploaderResponse,
  ABTesterResponse
} from './types'

export class PipelineExecutor {
  private eventBus: EventBus
  private logger: Logger

  private services = {
    keywordFetcher: process.env.KEYWORD_FETCHER_URL || 'http://keyword-fetcher:3002',
    scriptGenerator: process.env.SCRIPT_GENERATOR_URL || 'http://script-generator:3003',
    ttsRenderer: process.env.TTS_RENDERER_URL || 'http://tts-renderer:3004',
    videoAssembler: process.env.VIDEO_ASSEMBLER_URL || 'http://video-assembler:3005',
    thumbnailMaker: process.env.THUMBNAIL_MAKER_URL || 'http://thumbnail-maker:3006',
    metadataBuilder: process.env.METADATA_BUILDER_URL || 'http://metadata-builder:3007',
    uploader: process.env.UPLOADER_URL || 'http://uploader:3008',
    abTester: process.env.AB_TESTER_URL || 'http://ab-tester:3009'
  }

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus
    this.logger = logger
  }

  async execute(context: PipelineContext): Promise<void> {
    this.logger.info({ pipelineId: context.id }, 'Executing pipeline')

    try {
      // Step 1: Fetch keywords
      const keywords = await this.executeStep<KeywordFetcherResponse>(
        'keyword-fetcher',
        `${this.services.keywordFetcher}/keywords/fetch`,
        { topic: context.topic, format: context.format },
        context
      )

      // Step 2: Generate script
      const script = await this.executeStep<ScriptGeneratorResponse>(
        'script-generator',
        `${this.services.scriptGenerator}/scripts/generate`,
        { 
          topic: context.topic, 
          keywords: keywords.keywords, 
          format: context.format 
        },
        context
      )

      // Step 3: Render TTS
      const audio = await this.executeStep<TTSRendererResponse>(
        'tts-renderer',
        `${this.services.ttsRenderer}/tts/render`,
        { script: script.script },
        context
      )

      // Step 4: Assemble video
      const video = await this.executeStep<VideoAssemblerResponse>(
        'video-assembler',
        `${this.services.videoAssembler}/videos/assemble`,
        { 
          script: script.script, 
          audioPath: audio.audioPath 
        },
        context
      )

      // Step 5: Create thumbnail
      const thumbnail = await this.executeStep<ThumbnailMakerResponse>(
        'thumbnail-maker',
        `${this.services.thumbnailMaker}/thumbnails/generate`,
        { 
          script: script.script, 
          videoPath: video.videoPath 
        },
        context
      )

      // Step 6: Build metadata
      const metadata = await this.executeStep<MetadataBuilderResponse>(
        'metadata-builder',
        `${this.services.metadataBuilder}/metadata/generate`,
        { 
          script: script.script,
          videoPath: video.videoPath,
          thumbnailPath: thumbnail.thumbnailPath
        },
        context
      )

      // Step 7: Upload video
      const upload = await this.executeStep<UploaderResponse>(
        'uploader',
        `${this.services.uploader}/upload/youtube`,
        {
          videoPath: video.videoPath,
          thumbnailPath: thumbnail.thumbnailPath,
          metadata
        },
        context
      )

      // Step 8: Run A/B test
      await this.executeStep<ABTesterResponse>(
        'ab-tester',
        `${this.services.abTester}/abtests/create`,
        {
          videoId: upload.videoId,
          variants: [
            { title: metadata.title, description: metadata.description }
          ]
        },
        context
      )

      this.logger.info({ pipelineId: context.id }, 'Pipeline completed')
    } catch (error) {
      this.logger.error({ pipelineId: context.id, error }, 'Pipeline failed')
      throw error
    }
  }

  private async executeStep<T>(
    stepName: string,
    url: string,
    payload: any,
    context: PipelineContext
  ): Promise<T> {
    this.logger.info({ pipelineId: context.id, step: stepName }, 'Executing step')

    try {
      // Publish step started event
      await this.eventBus.publish(`pipeline.${stepName}.started`, {
        pipelineId: context.id,
        startedAt: new Date().toISOString()
      })

      // Call service
      const response = await axios.post<T>(url, payload, {
        timeout: 300000, // 5 minutes
        headers: {
          'Content-Type': 'application/json',
          'X-Pipeline-ID': context.id
        }
      })

      // Publish step completed event
      await this.eventBus.publish(`pipeline.${stepName}.completed`, {
        pipelineId: context.id,
        data: response.data,
        completedAt: new Date().toISOString()
      })

      this.logger.info({ pipelineId: context.id, step: stepName }, 'Step completed')

      return response.data
    } catch (error) {
      this.logger.error({ pipelineId: context.id, step: stepName, error }, 'Step failed')

      // Publish step failed event
      await this.eventBus.publish(`pipeline.${stepName}.failed`, {
        pipelineId: context.id,
        error: error instanceof Error ? error.message : String(error),
        failedAt: new Date().toISOString()
      })

      throw error
    }
  }
}

