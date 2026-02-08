/**
 * Graph reading operations
 */

import { KnowledgeGraph, Entity, Relation, Observation } from '../types.js';
import { IStorageAdapter } from '../storage-interface.js';

/**
 * Strip status from an observation (used to clean persisted status values)
 */
function stripObservationStatus(obs: Observation): Observation {
  const { status: _oldStatus, ...obsWithoutStatus } = obs;
  return obsWithoutStatus;
}

/**
 * Strip status from an entity and its observations (used to clean persisted status values)
 */
function stripEntityStatus(entity: Entity): Entity {
  const { status: _oldStatus, ...entityWithoutStatus } = entity;
  return {
    ...entityWithoutStatus,
    observations: entity.observations.map(stripObservationStatus),
  };
}

/**
 * Strip status from a relation (used to clean persisted status values)
 */
function stripRelationStatus(relation: Relation): Relation {
  const { status: _oldStatus, ...relationWithoutStatus } = relation;
  return relationWithoutStatus;
}

/**
 * Strip status from all entities and relations in a graph (used to clean persisted status values)
 */
export function stripGraphStatus(graph: KnowledgeGraph): KnowledgeGraph {
  return {
    entities: graph.entities.map(stripEntityStatus),
    relations: graph.relations.map(stripRelationStatus),
  };
}

/**
 * Read the knowledge graph filtered by threadId for thread isolation
 * and optionally filtered by minimum importance threshold
 */
export async function readGraph(
  storage: IStorageAdapter, 
  threadId: string,
  minImportance: number = 0.1
): Promise<KnowledgeGraph> {
  const graph = await storage.loadGraph();
  
  // Filter entities by threadId and importance
  const filteredEntities = graph.entities
    .filter(e => e.agentThreadId === threadId)
    .filter(e => e.importance >= minImportance)
    .map(entity => {
      // Add ARCHIVED status if importance is less than 0.1 but >= minImportance.
      // Otherwise, explicitly clear status so pre-existing values don't leak through.
      const isArchived = entity.importance < 0.1 && entity.importance >= minImportance;
      const { status: _oldStatus, ...entityWithoutStatus } = entity;
      const entityWithStatus = {
        ...entityWithoutStatus,
        ...(isArchived ? { status: 'ARCHIVED' as const } : {}),
      };
      
      // Process observations: filter by importance and add ARCHIVED status
      entityWithStatus.observations = entity.observations
        .filter(obs => {
          // Use observation importance if set, otherwise inherit from entity
          const obsImportance = obs.importance !== undefined ? obs.importance : entity.importance;
          return obsImportance >= minImportance;
        })
        .map(obs => {
          const obsImportance = obs.importance !== undefined ? obs.importance : entity.importance;
          const isObsArchived = obsImportance < 0.1 && obsImportance >= minImportance;
          const { status: _oldObsStatus, ...obsWithoutStatus } = obs;
          return {
            ...obsWithoutStatus,
            ...(isObsArchived ? { status: 'ARCHIVED' as const } : {}),
          };
        });
      
      return entityWithStatus;
    });
  
  // Create a Set of filtered entity names for quick lookup
  const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
  
  // Filter relations to only include those between filtered entities, from the same thread, and by importance
  const filteredRelations = graph.relations
    .filter(r => 
      r.agentThreadId === threadId &&
      filteredEntityNames.has(r.from) && 
      filteredEntityNames.has(r.to) &&
      r.importance >= minImportance
    )
    .map(relation => {
      // Add ARCHIVED status if importance is less than 0.1 but >= minImportance.
      // Otherwise, explicitly clear status so pre-existing values don't leak through.
      const isArchived = relation.importance < 0.1 && relation.importance >= minImportance;
      const { status: _oldStatus, ...relationWithoutStatus } = relation;
      return {
        ...relationWithoutStatus,
        ...(isArchived ? { status: 'ARCHIVED' as const } : {}),
      };
    });
  
  return {
    entities: filteredEntities,
    relations: filteredRelations
  };
}
