import amqp, { Connection, Channel } from 'amqplib'
import pino from 'pino'

const logger = pino()

export class EventBus {
  private connection: Connection | null = null
  private channel: Channel | null = null
  private readonly url: string
  private readonly exchange = 'faceless-pipeline'

  constructor(url: string) {
    this.url = url
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url)
      this.channel = await this.connection.createChannel()
      
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true })
      
      logger.info({ exchange: this.exchange }, 'Connected to message broker')
    } catch (error) {
      logger.error({ error }, 'Failed to connect to message broker')
      throw error
    }
  }

  async publish(event: string, data: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.')
    }

    try {
      const message = JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      })

      this.channel.publish(
        this.exchange,
        event,
        Buffer.from(message),
        { persistent: true }
      )

      logger.debug({ event, data }, 'Event published')
    } catch (error) {
      logger.error({ error, event }, 'Failed to publish event')
      throw error
    }
  }

  async subscribe(pattern: string, handler: (data: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.')
    }

    try {
      const queue = await this.channel.assertQueue('', { exclusive: true })
      
      await this.channel.bindQueue(queue.queue, this.exchange, pattern)

      this.channel.consume(queue.queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString())
            await handler(content.data)
            this.channel!.ack(msg)
          } catch (error) {
            logger.error({ error, pattern }, 'Failed to process message')
            this.channel!.nack(msg, false, false)
          }
        }
      })

      logger.info({ pattern }, 'Subscribed to events')
    } catch (error) {
      logger.error({ error, pattern }, 'Failed to subscribe')
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.channel?.close()
      await this.connection?.close()
      logger.info('Disconnected from message broker')
    } catch (error) {
      logger.error({ error }, 'Error during disconnect')
    }
  }
}

