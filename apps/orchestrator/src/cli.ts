import 'dotenv/config'
import { Queue } from 'bullmq'
import { nanoid } from 'nanoid'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs'
import { loadConfig } from '../../../packages/core/src/config'
import { PipelineContext } from '../../../packages/types/src/index'

const cfg = loadConfig()
const q = new Queue<PipelineContext>('video', { connection: { url: cfg.REDIS_URL }})

yargs(hideBin(process.argv))
  .command('run:full', 'Run a full pipeline for a topic', (y) => y
    .option('topic', { type: 'string', demandOption: true })
    .option('format', { type: 'string', choices: ['short','long'], default: 'short' })
  , async (argv) => {
    const context: PipelineContext = {
      id: `${new Date().toISOString().slice(0,10)}_${(argv.topic||'').toString().replace(/\s+/g,'-').toLowerCase()}_${nanoid(6)}`,
      topic: String(argv.topic),
      format: argv.format as 'short' | 'long',
      createdAt: new Date().toISOString()
    }
    await q.add('video', context)
    console.log('Pipeline enqueued with ID:', context.id)
    process.exit(0)
  })
  .command('generate:script','(placeholder) generate script', ()=>{}, ()=>{ console.log('TODO: Implement standalone script generation') })
  .command('build:video','(placeholder) build video', ()=>{}, ()=>{ console.log('TODO: Implement standalone video building') })
  .command('upload','(placeholder) upload', ()=>{}, ()=>{ console.log('TODO: Implement standalone upload') })
  .demandCommand(1)
  .help()
  .parse()
