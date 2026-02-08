/**
 * Test suite for verifying status stripping in search/open/query tools
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { searchNodes, openNodes, queryNodes } from '../lib/queries/search-service.js';
import { IStorageAdapter } from '../lib/storage-interface.js';
import { KnowledgeGraph } from '../lib/types.js';

// Mock storage adapter
class MockStorageAdapter implements IStorageAdapter {
  private graph: KnowledgeGraph = { entities: [], relations: [] };

  async initialize(): Promise<void> {}
  
  async loadGraph(): Promise<KnowledgeGraph> {
    return this.graph;
  }
  
  async saveGraph(graph: KnowledgeGraph): Promise<void> {
    this.graph = graph;
  }
  
  setGraph(graph: KnowledgeGraph): void {
    this.graph = graph;
  }
}

describe('Status stripping in search/open/query tools', () => {
  let storage: MockStorageAdapter;
  const threadId = 'test-thread';

  beforeEach(() => {
    storage = new MockStorageAdapter();
  });

  it('should strip persisted status from searchNodes results', async () => {
    const testGraph: KnowledgeGraph = {
      entities: [
        {
          name: 'Entity With Status',
          entityType: 'Test',
          observations: [
            {
              id: 'obs-1',
              content: 'Test observation with status',
              timestamp: '2024-01-01T00:00:00Z',
              version: 1,
              agentThreadId: threadId,
              status: 'ARCHIVED' as const // Pre-existing status that should be stripped
            }
          ],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5,
          status: 'ARCHIVED' as const // Pre-existing status that should be stripped
        },
        {
          name: 'Other Entity',
          entityType: 'Test',
          observations: [],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5
        }
      ],
      relations: [
        {
          from: 'Entity With Status',
          to: 'Other Entity',
          relationType: 'relates to',
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5,
          status: 'ARCHIVED' as const // Pre-existing status that should be stripped
        }
      ]
    };

    storage.setGraph(testGraph);
    
    const result = await searchNodes(storage, threadId, 'Entity');
    
    // Verify status is stripped from entities
    expect(result.entities.length).toBeGreaterThanOrEqual(1);
    const entityWithStatus = result.entities.find(e => e.name === 'Entity With Status');
    expect(entityWithStatus).toBeDefined();
    expect(entityWithStatus!.status).toBeUndefined();
    
    // Verify status is stripped from observation
    expect(entityWithStatus!.observations[0].status).toBeUndefined();
    
    // Verify status is stripped from relation
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0].status).toBeUndefined();
  });

  it('should strip persisted status from openNodes results', async () => {
    const testGraph: KnowledgeGraph = {
      entities: [
        {
          name: 'Entity A',
          entityType: 'Test',
          observations: [],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5,
          status: 'ARCHIVED' as const
        },
        {
          name: 'Entity B',
          entityType: 'Test',
          observations: [],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5,
          status: 'ARCHIVED' as const
        }
      ],
      relations: [
        {
          from: 'Entity A',
          to: 'Entity B',
          relationType: 'relates to',
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5,
          status: 'ARCHIVED' as const
        }
      ]
    };

    storage.setGraph(testGraph);
    
    const result = await openNodes(storage, threadId, ['Entity A', 'Entity B']);
    
    // Verify status is stripped
    expect(result.entities).toHaveLength(2);
    expect(result.entities[0].status).toBeUndefined();
    expect(result.entities[1].status).toBeUndefined();
    expect(result.relations[0].status).toBeUndefined();
  });

  it('should strip persisted status from queryNodes results', async () => {
    const testGraph: KnowledgeGraph = {
      entities: [
        {
          name: 'High Confidence Entity',
          entityType: 'Test',
          observations: [],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 0.9,
          importance: 0.8,
          status: 'ARCHIVED' as const
        },
        {
          name: 'Other',
          entityType: 'Test',
          observations: [],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 0.9,
          importance: 0.8
        }
      ],
      relations: [
        {
          from: 'High Confidence Entity',
          to: 'Other',
          relationType: 'relates to',
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 0.9,
          importance: 0.8,
          status: 'ARCHIVED' as const
        }
      ]
    };

    storage.setGraph(testGraph);
    
    const result = await queryNodes(storage, threadId, { confidenceMin: 0.8 });
    
    // Verify status is stripped
    expect(result.entities).toHaveLength(2);
    const highConfEntity = result.entities.find(e => e.name === 'High Confidence Entity');
    expect(highConfEntity).toBeDefined();
    expect(highConfEntity!.status).toBeUndefined();
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0].status).toBeUndefined();
  });

  it('should not strip status when no persisted status exists (performance check)', async () => {
    const testGraph: KnowledgeGraph = {
      entities: [
        {
          name: 'Clean Entity',
          entityType: 'Test',
          observations: [
            {
              id: 'obs-1',
              content: 'Clean observation',
              timestamp: '2024-01-01T00:00:00Z',
              version: 1,
              agentThreadId: threadId
            }
          ],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5
        },
        {
          name: 'Clean Other Entity',
          entityType: 'Test',
          observations: [],
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5
        }
      ],
      relations: [
        {
          from: 'Clean Entity',
          to: 'Clean Other Entity',
          relationType: 'relates to',
          agentThreadId: threadId,
          timestamp: '2024-01-01T00:00:00Z',
          confidence: 1.0,
          importance: 0.5
        }
      ]
    };

    storage.setGraph(testGraph);
    
    const result = await searchNodes(storage, threadId, 'Clean');
    
    // Verify results are returned correctly without status field
    expect(result.entities).toHaveLength(2);
    expect(result.entities[0].status).toBeUndefined();
    expect(result.entities[0].observations[0].status).toBeUndefined();
    expect(result.relations).toHaveLength(1);
    expect(result.relations[0].status).toBeUndefined();
  });
});
