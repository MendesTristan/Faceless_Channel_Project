import { z } from 'zod'
import fs from 'node:fs'
import path from 'node:path'
import { PipelineContext, PipelineState, PipelineStepStatus } from '../types/src/index'

export class PipelineStateManager {
  private stateDir: string

  constructor(dataDir: string) {
    this.stateDir = path.join(dataDir, 'state')
    fs.mkdirSync(this.stateDir, { recursive: true })
  }

  private getStatePath(id: string): string {
    return path.join(this.stateDir, `${id}.json`)
  }

  loadState(id: string): PipelineState | null {
    const statePath = this.getStatePath(id)
    if (!fs.existsSync(statePath)) {
      return null
    }

    try {
      const data = fs.readFileSync(statePath, 'utf-8')
      const parsed = JSON.parse(data)
      return parsed as PipelineState
    } catch (error) {
      console.error(`Failed to load state for ${id}:`, error)
      return null
    }
  }

  createState(context: PipelineContext): PipelineState {
    const state: PipelineState = {
      context,
      steps: {}
    }
    this.saveState(state)
    return state
  }

  updateStepStatus(id: string, stepName: string, status: Partial<PipelineStepStatus>): void {
    const currentState = this.loadState(id)
    if (!currentState) {
      throw new Error(`No state found for pipeline ${id}`)
    }

    if (!currentState.steps[stepName]) {
      currentState.steps[stepName] = {
        status: 'pending'
      }
    }

    currentState.steps[stepName] = {
      ...currentState.steps[stepName],
      ...status
    }

    this.saveState(currentState)
  }

  saveState(state: PipelineState): void {
    const statePath = this.getStatePath(state.context.id)
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
  }

  getStepStatus(id: string, stepName: string): PipelineStepStatus | null {
    const state = this.loadState(id)
    if (!state) return null
    return state.steps[stepName] || null
  }

  isStepCompleted(id: string, stepName: string): boolean {
    const status = this.getStepStatus(id, stepName)
    return status?.status === 'completed'
  }

  getAllStates(): PipelineState[] {
    if (!fs.existsSync(this.stateDir)) {
      return []
    }

    const files = fs.readdirSync(this.stateDir)
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const id = file.replace('.json', '')
        return this.loadState(id)
      })
      .filter((state): state is PipelineState => state !== null)
  }
}

