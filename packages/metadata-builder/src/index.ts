import { 
  MetadataBuilder, 
  MetadataBuilderInput, 
  MetadataBuilderOutput,
  PipelineContext 
} from '../../types/src/index'
import { logger } from '../../core/src/logger'

class MetadataBuilderModule implements MetadataBuilder {
  name = 'metadata-builder'

  async execute(input: MetadataBuilderInput, context: PipelineContext): Promise<MetadataBuilderOutput> {
    logger.info({ title: input.script.title }, 'Building metadata')

    // TODO: Implement actual metadata building logic
    // This is a placeholder implementation
    const metadata: MetadataBuilderOutput = {
      title: input.script.title,
      description: input.script.description,
      tags: input.script.tags,
      categoryId: '22', // People & Blogs
      privacyStatus: 'private'
    }

    logger.info({ title: metadata.title }, 'Metadata built')

    return metadata
  }

  validate(input: MetadataBuilderInput): boolean {
    return !!input.script && !!input.videoPath && !!input.thumbnailPath
  }
}

export const module = new MetadataBuilderModule()
