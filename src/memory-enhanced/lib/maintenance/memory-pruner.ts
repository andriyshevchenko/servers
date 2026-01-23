/**
 * Memory pruning service
 */

import { IStorageAdapter } from '../storage-interface.js';

/**
 * Prune memory based on age and importance criteria
 */
export async function pruneMemory(
  storage: IStorageAdapter,
  options: {
    olderThan?: string;
    importanceLessThan?: number;
    keepMinEntities?: number;
  }
): Promise<{ removedEntities: number; removedRelations: number }> {
  const graph = await storage.loadGraph();
  const initialEntityCount = graph.entities.length;
  const initialRelationCount = graph.relations.length;
  
  // Filter entities to remove
  let entitiesToKeep = graph.entities;
  
  if (options.olderThan) {
    const cutoffDate = new Date(options.olderThan);
    entitiesToKeep = entitiesToKeep.filter(e => new Date(e.timestamp) >= cutoffDate);
  }
  
  if (options.importanceLessThan !== undefined) {
    entitiesToKeep = entitiesToKeep.filter(e => e.importance >= options.importanceLessThan!);
  }
  
  // Ensure we keep minimum entities
  // If keepMinEntities is set and we need more entities, take from the already-filtered set
  // sorted by importance and recency
  if (options.keepMinEntities && entitiesToKeep.length < options.keepMinEntities) {
    // Sort the filtered entities by importance and timestamp, keep the most important and recent
    const sorted = [...entitiesToKeep].sort((a, b) => {
      if (a.importance !== b.importance) return b.importance - a.importance;
      return b.timestamp.localeCompare(a.timestamp);
    });
    // If we still don't have enough, we keep what we have
    entitiesToKeep = sorted.slice(0, Math.min(options.keepMinEntities, sorted.length));
  }
  
  const keptEntityNames = new Set(entitiesToKeep.map(e => e.name));
  
  // Remove relations that reference removed entities
  const relationsToKeep = graph.relations.filter(r => 
    keptEntityNames.has(r.from) && keptEntityNames.has(r.to)
  );
  
  graph.entities = entitiesToKeep;
  graph.relations = relationsToKeep;
  await storage.saveGraph(graph);
  
  return {
    removedEntities: initialEntityCount - entitiesToKeep.length,
    removedRelations: initialRelationCount - relationsToKeep.length
  };
}
