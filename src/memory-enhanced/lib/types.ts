/**
 * Core types for the Memory Enhanced MCP Server
 */

// Enhanced entity with metadata
export interface Entity {
  name: string;
  entityType: string;
  observations: string[];
  agentThreadId: string;
  timestamp: string;
  confidence: number;
  importance: number; // 0-1: importance for memory integrity (0=not important, 1=critical)
}

// Enhanced relation with metadata
export interface Relation {
  from: string;
  to: string;
  relationType: string;
  agentThreadId: string;
  timestamp: string;
  confidence: number;
  importance: number; // 0-1: importance for memory integrity (0=not important, 1=critical)
}

export interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// Types for save_memory tool (Section 1 of spec)
export interface SaveMemoryEntity {
  name: string;
  entityType: string;
  observations: string[];
  relations: Array<{
    targetEntity: string;
    relationType: string;
    importance?: number;
  }>;
  confidence?: number;
  importance?: number;
}

export interface SaveMemoryInput {
  entities: SaveMemoryEntity[];
  threadId: string;
}

export interface SaveMemoryOutput {
  success: boolean;
  created: {
    entities: number;
    relations: number;
  };
  warnings: string[];
  quality_score: number;
  validation_errors?: string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
}
