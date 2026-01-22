/**
 * Test helper utilities for update-observation tests
 */

import { Entity, Observation } from '../lib/types.js';

/**
 * Test data constants to avoid magic values
 */
export const TEST_CONSTANTS = {
  ENTITY_NAME: 'TestEntity',
  ENTITY_TYPE: 'Test',
  THREAD_ID: 'test-thread',
  INITIAL_TIMESTAMP: '2026-01-01T10:00:00Z',
  UPDATE_TIMESTAMP: '2026-01-01T11:00:00Z',
  SECOND_UPDATE_TIMESTAMP: '2026-01-01T12:00:00Z',
  THIRD_UPDATE_TIMESTAMP: '2026-01-03T10:00:00Z',
  DEFAULT_CONFIDENCE: 0.9,
  DEFAULT_IMPORTANCE: 0.8,
  HIGH_CONFIDENCE: 0.95,
  LOW_CONFIDENCE: 0.85,
  LOW_IMPORTANCE: 0.75
};

/**
 * Create a test observation with default or custom values
 */
export function createTestObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    id: 'obs-001',
    content: 'Original content',
    timestamp: TEST_CONSTANTS.INITIAL_TIMESTAMP,
    version: 1,
    agentThreadId: TEST_CONSTANTS.THREAD_ID,
    confidence: TEST_CONSTANTS.DEFAULT_CONFIDENCE,
    importance: TEST_CONSTANTS.DEFAULT_IMPORTANCE,
    ...overrides
  };
}

/**
 * Create a test entity with default or custom values
 */
export function createTestEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    name: TEST_CONSTANTS.ENTITY_NAME,
    entityType: TEST_CONSTANTS.ENTITY_TYPE,
    observations: [createTestObservation()],
    agentThreadId: TEST_CONSTANTS.THREAD_ID,
    timestamp: TEST_CONSTANTS.INITIAL_TIMESTAMP,
    confidence: TEST_CONSTANTS.DEFAULT_CONFIDENCE,
    importance: TEST_CONSTANTS.DEFAULT_IMPORTANCE,
    ...overrides
  };
}

/**
 * Create a test entity without observation confidence/importance for testing inheritance
 */
export function createEntityWithMinimalObservation(): Entity {
  return createTestEntity({
    observations: [{
      id: 'obs-001',
      content: 'Original content',
      timestamp: TEST_CONSTANTS.INITIAL_TIMESTAMP,
      version: 1,
      agentThreadId: TEST_CONSTANTS.THREAD_ID
      // No confidence/importance - should inherit from entity
    }]
  });
}

/**
 * Create a test entity with a superseded observation chain
 */
export function createEntityWithSupersededObservation(): Entity {
  return createTestEntity({
    observations: [
      {
        id: 'obs-001',
        content: 'Original content',
        timestamp: TEST_CONSTANTS.INITIAL_TIMESTAMP,
        version: 1,
        superseded_by: 'obs-002',
        agentThreadId: TEST_CONSTANTS.THREAD_ID
      },
      {
        id: 'obs-002',
        content: 'Updated content',
        timestamp: TEST_CONSTANTS.UPDATE_TIMESTAMP,
        version: 2,
        supersedes: 'obs-001',
        agentThreadId: TEST_CONSTANTS.THREAD_ID
      }
    ]
  });
}

/**
 * Create update parameters with default or custom values
 */
export function createUpdateParams(overrides: {
  entityName?: string;
  observationId?: string;
  newContent?: string;
  agentThreadId?: string;
  timestamp?: string;
  confidence?: number;
  importance?: number;
} = {}) {
  return {
    entityName: TEST_CONSTANTS.ENTITY_NAME,
    observationId: 'obs-001',
    newContent: 'Updated content',
    agentThreadId: TEST_CONSTANTS.THREAD_ID,
    timestamp: TEST_CONSTANTS.UPDATE_TIMESTAMP,
    ...overrides
  };
}
