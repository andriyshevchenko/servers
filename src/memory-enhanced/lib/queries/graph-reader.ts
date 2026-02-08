/**
 * Graph reading operations
 */

import { KnowledgeGraph, Entity, Relation, Observation } from '../types.js';
import { IStorageAdapter } from '../storage-interface.js';

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
      // Add ARCHIVED status if importance is less than 0.1 but >= minImportance
      const entityWithStatus = { ...entity };
      if (entity.importance < 0.1 && entity.importance >= minImportance) {
        entityWithStatus.status = 'ARCHIVED';
      }
      
      // Process observations: filter by importance and add ARCHIVED status
      entityWithStatus.observations = entity.observations
        .filter(obs => {
          // Use observation importance if set, otherwise inherit from entity
          const obsImportance = obs.importance !== undefined ? obs.importance : entity.importance;
          return obsImportance >= minImportance;
        })
        .map(obs => {
          const obsImportance = obs.importance !== undefined ? obs.importance : entity.importance;
          if (obsImportance < 0.1 && obsImportance >= minImportance) {
            return { ...obs, status: 'ARCHIVED' };
          }
          return obs;
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
      // Add ARCHIVED status if importance is less than 0.1 but >= minImportance
      if (relation.importance < 0.1 && relation.importance >= minImportance) {
        return { ...relation, status: 'ARCHIVED' };
      }
      return relation;
    });
  
  return {
    entities: filteredEntities,
    relations: filteredRelations
  };
}
