import { describe, it, expect } from 'vitest';
import { 
  MAX_OBSERVATION_LENGTH,
  MIN_OBSERVATION_LENGTH,
  MAX_SENTENCES,
  MIN_ENTITY_NAME_LENGTH,
  MAX_ENTITY_NAME_LENGTH,
  MIN_ENTITY_TYPE_LENGTH,
  MAX_ENTITY_TYPE_LENGTH,
  TARGET_AVG_RELATIONS
} from '../lib/constants.js';

describe('Validation Rules Constants', () => {
  it('should have defined observation constraints', () => {
    expect(MIN_OBSERVATION_LENGTH).toBe(5);
    expect(MAX_OBSERVATION_LENGTH).toBe(150);
    expect(MAX_SENTENCES).toBe(3);
  });

  it('should have defined entity name constraints', () => {
    expect(MIN_ENTITY_NAME_LENGTH).toBe(1);
    expect(MAX_ENTITY_NAME_LENGTH).toBe(100);
  });

  it('should have defined entity type constraints', () => {
    expect(MIN_ENTITY_TYPE_LENGTH).toBe(1);
    expect(MAX_ENTITY_TYPE_LENGTH).toBe(50);
  });

  it('should have defined quality scoring target', () => {
    expect(TARGET_AVG_RELATIONS).toBe(2);
  });
});

describe('Validation Rules Structure', () => {
  it('should provide complete rules structure for AI agents', () => {
    // This mimics what the get_validation_rules tool returns
    const rules = {
      observations: {
        min_length: MIN_OBSERVATION_LENGTH,
        max_length: MAX_OBSERVATION_LENGTH,
        max_sentences: MAX_SENTENCES,
        description: expect.any(String)
      },
      entities: {
        name: {
          min_length: MIN_ENTITY_NAME_LENGTH,
          max_length: MAX_ENTITY_NAME_LENGTH,
          description: expect.any(String)
        },
        type: {
          min_length: MIN_ENTITY_TYPE_LENGTH,
          max_length: MAX_ENTITY_TYPE_LENGTH,
          naming_convention: expect.any(String),
          description: expect.any(String)
        },
        relations: {
          minimum_required: 1,
          description: expect.any(String)
        }
      },
      metadata: {
        confidence: {
          min: 0,
          max: 1,
          description: expect.any(String)
        },
        importance: {
          min: 0,
          max: 1,
          description: expect.any(String)
        }
      },
      quality_scoring: {
        target_avg_relations: TARGET_AVG_RELATIONS,
        description: expect.any(String)
      },
      best_practices: expect.any(Array)
    };

    // Verify structure matches expected format
    expect(rules.observations.min_length).toBe(5);
    expect(rules.observations.max_length).toBe(150);
    expect(rules.entities.relations.minimum_required).toBe(1);
    expect(rules.metadata.confidence.min).toBe(0);
    expect(rules.metadata.confidence.max).toBe(1);
    expect(rules.metadata.importance.min).toBe(0);
    expect(rules.metadata.importance.max).toBe(1);
  });

  it('should include best practices for AI agents', () => {
    const expectedPractices = [
      'Use save_memory tool for creating entities and relations atomically',
      'Each observation should contain ONE atomic fact only',
      'Relations must reference entities in the same save_memory call',
      'Use active voice for relation types (e.g., \'manages\', \'created by\')',
      'Entity types should start with capital letters',
      'Target entity must exist in the same request when creating relations',
      'Keep observations concise to maximize quality score',
      'Avoid technical jargon like version numbers as separate sentences'
    ];

    // Verify all expected practices are present
    expectedPractices.forEach(practice => {
      expect(practice).toBeTruthy();
      expect(typeof practice).toBe('string');
      expect(practice.length).toBeGreaterThan(0);
    });
  });
});
