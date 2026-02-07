import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KnowledgeGraphManager } from '../lib/knowledge-graph-manager.js';
import { Entity, Relation, Observation } from '../lib/types.js';

describe('MinImportance Filter for read_graph', () => {
  let manager: KnowledgeGraphManager;
  let testDirPath: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDirPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      `test-min-importance-${Date.now()}`
    );
    await fs.mkdir(testDirPath, { recursive: true });
    manager = new KnowledgeGraphManager(testDirPath);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      const files = await fs.readdir(testDirPath);
      await Promise.all(files.map(f => fs.unlink(path.join(testDirPath, f))));
      await fs.rmdir(testDirPath);
    } catch (error) {
      // Ignore errors if directory doesn't exist
    }
  });

  describe('Default minImportance (0.1)', () => {
    it('should filter out entities with importance < 0.1 by default', async () => {
      const entities: Entity[] = [
        {
          name: 'HighImportance',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.8
        },
        {
          name: 'LowImportance',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:01:00Z',
          confidence: 0.9,
          importance: 0.05
        },
        {
          name: 'EdgeCase',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:02:00Z',
          confidence: 0.9,
          importance: 0.1
        }
      ];

      await manager.createEntities('thread-001', entities);
      
      // Read with default minImportance (0.1)
      const graph = await manager.readGraph('thread-001');
      
      expect(graph.entities).toHaveLength(2);
      expect(graph.entities.find(e => e.name === 'HighImportance')).toBeDefined();
      expect(graph.entities.find(e => e.name === 'EdgeCase')).toBeDefined();
      expect(graph.entities.find(e => e.name === 'LowImportance')).toBeUndefined();
    });

    it('should filter out relations with importance < 0.1 by default', async () => {
      const entities: Entity[] = [
        {
          name: 'EntityA',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.5
        },
        {
          name: 'EntityB',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:01:00Z',
          confidence: 0.9,
          importance: 0.5
        }
      ];

      await manager.createEntities('thread-001', entities);

      const relations: Relation[] = [
        {
          from: 'EntityA',
          to: 'EntityB',
          relationType: 'relates_to',
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:05:00Z',
          confidence: 0.9,
          importance: 0.8
        },
        {
          from: 'EntityB',
          to: 'EntityA',
          relationType: 'depends_on',
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:06:00Z',
          confidence: 0.9,
          importance: 0.05
        }
      ];

      await manager.createRelations('thread-001', relations);

      // Read with default minImportance (0.1)
      const graph = await manager.readGraph('thread-001');
      
      expect(graph.relations).toHaveLength(1);
      expect(graph.relations[0].relationType).toBe('relates_to');
      expect(graph.relations[0].importance).toBe(0.8);
    });
  });

  describe('Custom minImportance', () => {
    it('should filter entities based on custom minImportance', async () => {
      const entities: Entity[] = [
        {
          name: 'VeryHighImportance',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.8
        },
        {
          name: 'MediumImportance',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:01:00Z',
          confidence: 0.9,
          importance: 0.3
        },
        {
          name: 'LowImportance',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:02:00Z',
          confidence: 0.9,
          importance: 0.05
        }
      ];

      await manager.createEntities('thread-001', entities);
      
      // Read with custom minImportance (0.05)
      const graph = await manager.readGraph('thread-001', 0.05);
      
      expect(graph.entities).toHaveLength(3);
      
      // Read with custom minImportance (0.5)
      const highGraph = await manager.readGraph('thread-001', 0.5);
      expect(highGraph.entities).toHaveLength(1);
      expect(highGraph.entities[0].name).toBe('VeryHighImportance');
    });
  });

  describe('ARCHIVED status marking', () => {
    it('should mark entities with importance < 0.1 as ARCHIVED when minImportance allows them', async () => {
      const entities: Entity[] = [
        {
          name: 'HighImportance',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.8
        },
        {
          name: 'LowButIncluded',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:01:00Z',
          confidence: 0.9,
          importance: 0.07
        },
        {
          name: 'EdgeCaseArchived',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:02:00Z',
          confidence: 0.9,
          importance: 0.09
        }
      ];

      await manager.createEntities('thread-001', entities);
      
      // Read with minImportance of 0.05 to include entities with importance >= 0.05
      const graph = await manager.readGraph('thread-001', 0.05);
      
      expect(graph.entities).toHaveLength(3);
      
      // Check that high importance entity has no status
      const highEntity = graph.entities.find(e => e.name === 'HighImportance');
      expect(highEntity?.status).toBeUndefined();
      
      // Check that low importance entities are marked as ARCHIVED
      const lowEntity = graph.entities.find(e => e.name === 'LowButIncluded');
      expect(lowEntity?.status).toBe('ARCHIVED');
      
      const edgeEntity = graph.entities.find(e => e.name === 'EdgeCaseArchived');
      expect(edgeEntity?.status).toBe('ARCHIVED');
    });

    it('should mark relations with importance < 0.1 as ARCHIVED when minImportance allows them', async () => {
      const entities: Entity[] = [
        {
          name: 'EntityA',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.5
        },
        {
          name: 'EntityB',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:01:00Z',
          confidence: 0.9,
          importance: 0.5
        }
      ];

      await manager.createEntities('thread-001', entities);

      const relations: Relation[] = [
        {
          from: 'EntityA',
          to: 'EntityB',
          relationType: 'strong_relation',
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:05:00Z',
          confidence: 0.9,
          importance: 0.8
        },
        {
          from: 'EntityB',
          to: 'EntityA',
          relationType: 'weak_relation',
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:06:00Z',
          confidence: 0.9,
          importance: 0.06
        }
      ];

      await manager.createRelations('thread-001', relations);

      // Read with minImportance of 0.05 to include relations with importance >= 0.05
      const graph = await manager.readGraph('thread-001', 0.05);
      
      expect(graph.relations).toHaveLength(2);
      
      // Check that high importance relation has no status
      const strongRelation = graph.relations.find(r => r.relationType === 'strong_relation');
      expect(strongRelation?.status).toBeUndefined();
      
      // Check that low importance relation is marked as ARCHIVED
      const weakRelation = graph.relations.find(r => r.relationType === 'weak_relation');
      expect(weakRelation?.status).toBe('ARCHIVED');
    });

    it('should not mark items with importance exactly 0.1 as ARCHIVED', async () => {
      const entities: Entity[] = [
        {
          name: 'ExactThreshold',
          entityType: 'task',
          observations: [],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.1
        }
      ];

      await manager.createEntities('thread-001', entities);
      
      // Read with default minImportance (0.1)
      const graph = await manager.readGraph('thread-001');
      
      expect(graph.entities).toHaveLength(1);
      expect(graph.entities[0].status).toBeUndefined();
    });
  });

  describe('Observation importance and ARCHIVED status', () => {
    it('should filter out observations with importance < minImportance', async () => {
      const obs1: Observation = {
        id: 'obs-1',
        content: 'High importance observation',
        timestamp: '2024-01-20T10:00:00Z',
        version: 1,
        agentThreadId: 'thread-001',
        importance: 0.8
      };

      const obs2: Observation = {
        id: 'obs-2',
        content: 'Low importance observation',
        timestamp: '2024-01-20T10:01:00Z',
        version: 1,
        agentThreadId: 'thread-001',
        importance: 0.03
      };

      const entities: Entity[] = [
        {
          name: 'EntityWithMixedObs',
          entityType: 'task',
          observations: [obs1, obs2],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.5
        }
      ];

      await manager.createEntities('thread-001', entities);
      
      // Read with minImportance of 0.05 - should filter out obs2
      const graph = await manager.readGraph('thread-001', 0.05);
      
      expect(graph.entities).toHaveLength(1);
      expect(graph.entities[0].observations).toHaveLength(1);
      expect(graph.entities[0].observations[0].id).toBe('obs-1');
    });

    it('should mark observations with importance < 0.1 as ARCHIVED when they inherit from entity', async () => {
      const obs1: Observation = {
        id: 'obs-1',
        content: 'High importance observation',
        timestamp: '2024-01-20T10:00:00Z',
        version: 1,
        agentThreadId: 'thread-001',
        importance: 0.8
      };

      const obs2: Observation = {
        id: 'obs-2',
        content: 'Low importance observation',
        timestamp: '2024-01-20T10:01:00Z',
        version: 1,
        agentThreadId: 'thread-001',
        importance: 0.07
      };

      const entities: Entity[] = [
        {
          name: 'EntityWithMixedObs',
          entityType: 'task',
          observations: [obs1, obs2],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.5
        }
      ];

      await manager.createEntities('thread-001', entities);
      
      // Read with minImportance of 0.05
      const graph = await manager.readGraph('thread-001', 0.05);
      
      expect(graph.entities).toHaveLength(1);
      expect(graph.entities[0].observations).toHaveLength(2);
      
      // High importance observation should not be marked
      const highObs = graph.entities[0].observations.find(o => o.id === 'obs-1');
      expect(highObs?.status).toBeUndefined();
      
      // Low importance observation should be marked as ARCHIVED
      const lowObs = graph.entities[0].observations.find(o => o.id === 'obs-2');
      expect(lowObs?.status).toBe('ARCHIVED');
    });

    it('should use entity importance when observation importance is not set', async () => {
      const obs: Observation = {
        id: 'obs-1',
        content: 'Observation without explicit importance',
        timestamp: '2024-01-20T10:00:00Z',
        version: 1,
        agentThreadId: 'thread-001'
        // importance not set, should inherit from entity
      };

      const entities: Entity[] = [
        {
          name: 'EntityLowImportance',
          entityType: 'task',
          observations: [obs],
          agentThreadId: 'thread-001',
          timestamp: '2024-01-20T10:00:00Z',
          confidence: 0.9,
          importance: 0.08 // Low importance entity
        }
      ];

      await manager.createEntities('thread-001', entities);
      
      // Read with minImportance of 0.05
      const graph = await manager.readGraph('thread-001', 0.05);
      
      expect(graph.entities).toHaveLength(1);
      expect(graph.entities[0].status).toBe('ARCHIVED'); // Entity marked
      expect(graph.entities[0].observations[0].status).toBe('ARCHIVED'); // Observation also marked due to inherited importance
    });
  });
});
