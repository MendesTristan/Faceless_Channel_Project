import { Job } from 'bullmq'
import { logger } from './logger'
import { withRetry } from './retry'
import { PipelineStateManager } from './pipeline-state'
import { 
  PipelineContext, 
  KeywordFetcherInput, 
  KeywordFetcherOutput,
  KeywordFetcher,
  ScriptGeneratorInput,
  ScriptGeneratorOutput,
  ScriptGenerator,
  TTSRendererInput,
  TTSRendererOutput,
  TTSRenderer,
  VideoAssemblerInput,
  VideoAssemblerOutput,
  VideoAssembler,
  ThumbnailMakerInput,
  ThumbnailMakerOutput,
  ThumbnailMaker,
  MetadataBuilderInput,
  MetadataBuilderOutput,
  MetadataBuilder,
  UploaderInput,
  UploaderOutput,
  Uploader,
  ABTesterInput,
  ABTesterOutput,
  ABTester
} from '../types/src/index'
import path from 'node:path'
import fs from 'node:fs'

export class PipelineExecutor {
  private stateManager: PipelineStateManager
  private dataDir: string

  constructor(dataDir: string) {
    this.stateManager = new PipelineStateManager(dataDir)
    this.dataDir = dataDir
  }

  async executeStep(
    job: Job<any>,
    stepName: string,
    executionFn: (context: PipelineContext) => Promise<any>
  ): Promise<any> {
    const id = job.data.id
    const context: PipelineContext = job.data

    try {
      // Mark step as running
      this.stateManager.updateStepStatus(id, stepName, {
        status: 'running',
        startedAt: new Date().toISOString()
      })

      logger.info({ id, step: stepName }, 'Step started')

      // Execute with retry
      const result = await withRetry(
        () => executionFn(context),
        { maxRetries: 3, delay: 1000 }
      )

      // Mark step as completed
      this.stateManager.updateStepStatus(id, stepName, {
        status: 'completed',
        completedAt: new Date().toISOString()
      })

      logger.info({ id, step: stepName }, 'Step completed')

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Mark step as failed
      this.stateManager.updateStepStatus(id, stepName, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        error: errorMessage
      })

      logger.error({ id, step: stepName, error: errorMessage }, 'Step failed')
      
      throw error
    }
  }

  async executeFullPipeline(job: Job<any>): Promise<void> {
    const { keywordFetcher, scriptGenerator, ttsRenderer, videoAssembler, thumbnailMaker, metadataBuilder, uploader, abTester } = await this.getModules()

    const context: PipelineContext = job.data

    logger.info({ id: context.id }, 'Pipeline started')

    // Step 1: Fetch keywords
    const keywords = await this.executeStep(job, 'keyword-fetcher', async () => {
      const input: KeywordFetcherInput = {
        topic: context.topic,
        format: context.format
      }
      return await keywordFetcher.execute(input, context)
    })

    // Step 2: Generate script
    const script = await this.executeStep(job, 'script-generator', async () => {
      const input: ScriptGeneratorInput = {
        topic: context.topic,
        keywords: keywords.keywords,
        format: context.format
      }
      return await scriptGenerator.execute(input, context)
    })

    // Step 3: Generate TTS audio
    const audio = await this.executeStep(job, 'tts-renderer', async () => {
      const input: TTSRendererInput = {
        script: script.script
      }
      return await ttsRenderer.execute(input, context)
    })

    // Step 4: Assemble video
    const video = await this.executeStep(job, 'video-assembler', async () => {
      const input: VideoAssemblerInput = {
        script: script.script,
        audioPath: audio.audioPath
      }
      return await videoAssembler.execute(input, context)
    })

    // Step 5: Create thumbnail
    const thumbnail = await this.executeStep(job, 'thumbnail-maker', async () => {
      const input: ThumbnailMakerInput = {
        script: script.script,
        videoPath: video.videoPath
      }
      return await thumbnailMaker.execute(input, context)
    })

    // Step 6: Build metadata
    const metadata = await this.executeStep(job, 'metadata-builder', async () => {
      const input: MetadataBuilderInput = {
        script: script.script,
        videoPath: video.videoPath,
        thumbnailPath: thumbnail.thumbnailPath
      }
      return await metadataBuilder.execute(input, context)
    })

    // Step 7: Upload video
    const upload = await this.executeStep(job, 'uploader', async () => {
      const input: UploaderInput = {
        videoPath: video.videoPath,
        thumbnailPath: thumbnail.thumbnailPath,
        metadata: metadata
      }
      return await uploader.execute(input, context)
    })

    // Step 8: Run A/B test
    await this.executeStep(job, 'ab-tester', async () => {
      const input: ABTesterInput = {
        videoId: upload.videoId,
        scripts: [metadata.title, metadata.description].map((text, i) => ({
          title: `${metadata.title} (${i})`,
          description: text
        }))
      }
      return await abTester.execute(input, context)
    })

    logger.info({ id: context.id }, 'Pipeline completed successfully')
  }

  private async getModules(): Promise<{
    keywordFetcher: KeywordFetcher
    scriptGenerator: ScriptGenerator
    ttsRenderer: TTSRenderer
    videoAssembler: VideoAssembler
    thumbnailMaker: ThumbnailMaker
    metadataBuilder: MetadataBuilder
    uploader: Uploader
    abTester: ABTester
  }> {
    // Import modules dynamically
    const keywordFetcher = await import('../../keyword-fetcher/src/index')
    const scriptGenerator = await import('../../script-generator/src/index')
    const ttsRenderer = await import('../../tts-renderer/src/index')
    const videoAssembler = await import('../../video-assembler/src/index')
    const thumbnailMaker = await import('../../thumbnail-maker/src/index')
    const metadataBuilder = await import('../../metadata-builder/src/index')
    const uploader = await import('../../uploader/src/index')
    const abTester = await import('../../ab-tester/src/index')

    return {
      keywordFetcher: keywordFetcher.module,
      scriptGenerator: scriptGenerator.module,
      ttsRenderer: ttsRenderer.module,
      videoAssembler: videoAssembler.module,
      thumbnailMaker: thumbnailMaker.module,
      metadataBuilder: metadataBuilder.module,
      uploader: uploader.module,
      abTester: abTester.module
    }
  }
}

