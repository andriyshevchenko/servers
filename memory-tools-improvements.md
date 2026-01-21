# Memory Tools Improvement Proposal

## Issue: Memory Tools Need Better Support for Technical Content

### Problem Statement

AI agents attempting to document technical debugging sessions face significant friction with current validation rules. The memory system is excellent for natural language narratives but breaks down when storing technical content like URLs, connection strings, file paths, and configuration values.

### Observed Issues (From Real Usage)

1. **Sentence Detection Breaks on Technical Content**
   - URLs containing `://` are counted as multiple sentences
   - Hostnames like `ni-internal-dev.servicebus.windows.net` trigger sentence boundary detection
   - Example that failed validation: `"URL: https://dvdat-uks-01-es.develastic.nidemo.com/"` (counted as 4 sentences)

2. **150-Character Limit Too Restrictive**
   - Technical observations often need more space
   - Configuration values, file paths, connection strings regularly exceed limit
   - Forces artificial splitting of atomic facts

3. **Cross-Reference Requirement Blocks Incremental Building**
   - Relations can only reference entities in the same `save_memory` call
   - Cannot build graph incrementally across multiple saves
   - Makes it impossible to add relationships to existing entities

4. **All-or-Nothing Validation Wastes Resources**
   - Single validation error rejects entire save operation
   - Wasted token costs and processing time
   - No feedback on which entities are valid

### Proposed Solutions (No Heavy Dependencies Required)

#### 1. **Smarter Sentence Detection (Regex-Based)**

```python
# Replace naive period-splitting with context-aware detection
import re

def count_sentences(text):
    # Exclude periods in URLs, IP addresses, file paths, version numbers
    patterns_to_ignore = [
        r'https?://[^\s]+',      # URLs
        r'\b\d+\.\d+\.\d+\.\d+', # IP addresses  
        r'[A-Za-z]:\\[^\s]+',    # Windows paths
        r'\bv?\d+\.\d+\.\d+',    # Version numbers
        r'\w+\.\w+\.\w+',        # Hostnames/domains
    ]
    
    # Replace ignored patterns with placeholders
    cleaned = text
    for pattern in patterns_to_ignore:
        cleaned = re.sub(pattern, 'PLACEHOLDER', cleaned)
    
    # Now count sentences
    sentences = re.split(r'[.!?]+\s+', cleaned)
    return len([s for s in sentences if s.strip()])
```

#### 2. **Increase Character Limit for Technical Content**

```python
# Simple config change
OBSERVATION_MAX_LENGTH = 300  # Up from 150
OBSERVATION_MAX_SENTENCES = 3  # Keep as is
```

#### 3. **Allow Cross-Thread Entity References**

```python
def resolve_target_entity(entity_name, thread_id):
    # First check current batch
    if entity_name in current_batch:
        return current_batch[entity_name]
    
    # Then check existing entities in thread (simple DB query)
    existing = db.query(
        "SELECT * FROM entities WHERE name = ? AND thread_id = ?",
        entity_name, thread_id
    )
    
    if existing:
        return existing
    
    # Optional: Return warning instead of hard error
    return None  # or raise validation warning, not error
```

#### 4. **Better Validation Error Messages**

```python
# Partial saves are intentionally not supported to maintain memory integrity
# Instead, provide detailed errors so AI can fix and retry

def save_memory(entities, thread_id):
    validation_errors = []
    
    # Validate ALL entities first, collect all errors
    for i, entity in enumerate(entities):
        errors = validate_entity(entity)
        if errors:
            validation_errors.append({
                "entity_index": i,
                "entity_name": entity.get("name", "unknown"),
                "entity_type": entity.get("entityType", "unknown"),
                "errors": errors,
                "observation_issues": [
                    {
                        "observation": obs[:50] + "...",
                        "issue": issue
                    }
                    for obs, issue in check_observations(entity.get("observations", []))
                ]
            })
    
    # Only save if ALL entities are valid (maintains referential integrity)
    if validation_errors:
        return {
            "success": False,
            "created": {"entities": 0, "relations": 0},
            "validation_errors": validation_errors,
            "hint": "Fix all validation errors and retry. All entities must be valid to maintain memory integrity."
        }
    
    # All valid - save atomically
    result = db.save_entities(entities)
    return {"success": True, "created": result}
```

#### 5. **Add Simple Entity Lookup Tool**

```python
# New tool: list_entities
def list_entities(thread_id, entity_type=None, name_pattern=None):
    query = "SELECT name, entityType FROM entities WHERE thread_id = ?"
    params = [thread_id]
    
    if entity_type:
        query += " AND entityType = ?"
        params.append(entity_type)
    
    if name_pattern:
        query += " AND name LIKE ?"
        params.append(f"%{name_pattern}%")
    
    return db.query(query, *params)
```

#### 6. **Pre-Validation Tool**

```python
# Instead of partial saves, provide a dry-run validation tool
# AI can validate before attempting save

def validate_memory(entities, thread_id):
    """
    Validate entities without saving. Returns detailed errors.
    AI agents can call this before save_memory to catch issues early.
    """
    validation_results = []
    
    for i, entity in enumerate(entities):
        result = {
            "index": i,
            "name": entity.get("name"),
            "type": entity.get("entityType"),
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        # Check observations
        for j, obs in enumerate(entity.get("observations", [])):
            if len(obs) > 300:
                result["errors"].append(f"Observation {j}: Exceeds 300 chars ({len(obs)} chars)")
                result["valid"] = False
            
            sentence_count = count_sentences(obs)
            if sentence_count > 3:
                result["errors"].append(f"Observation {j}: Too many sentences ({sentence_count} > 3)")
                result["valid"] = False
        
        # Check relations reference valid entities
        for rel in entity.get("relations", []):
            target = rel.get("targetEntity")
            if not entity_exists_in_batch_or_thread(target, entities, thread_id):
                result["errors"].append(f"Relation target '{target}' not found")
                result["valid"] = False
        
        validation_results.append(result)
    
    return {
        "all_valid": all(r["valid"] for r in validation_results),
        "results": validation_results
    }
```

### Implementation Priority

1. **High Priority** (Critical for usability)
   - Fix sentence detection for technical content
   - Allow cross-thread entity references
   - Add `list_entities` tool
   - Better validation error messages with entity names and indices

2. **Medium Priority** (Improve UX)
   - Increase character limit to 300
   - Add `validate_memory` pre-check tool
   - Return entity IDs after successful save

3. **Low Priority** (Nice to have)
   - Observation update/edit capability
   - Entity merging suggestions
   - Bulk operation optimizations

### Design Constraints (Intentional)

**Memory Integrity is Non-Negotiable:**
- ✅ All-or-nothing saves are correct (maintains referential integrity)
- ✅ Validation failures should block saves (prevents corrupted graph)
- ✅ Relations must reference valid entities (no dangling pointers)

**What AI Needs Instead:**
- Better error messages so it knows exactly what to fix
- Pre-validation tool to check before attempting save
- Ability to query existing entities to avoid duplicate/missing references

### Testing Scenarios

1. **Technical Content Test**
   ```json
   {
     "observation": "URL: https://dvdat-uks-01-es.develastic.nidemo.com/"
   }
   ```
   Expected: Count as 1 sentence, not 4

2. **Incremental Building Test**
   ```python
   # First save
   save_memory([{"name": "ServiceA", ...}])
   
   # Second save (should work)
   save_memory([{
     "name": "ServiceB",
     "relations": [{"targetEntity": "ServiceA", ...}]
   }])
   ```

3. **Detailed Error Messages Test**
   ```python
   result = save_memory([
     {"name": "Valid1", "observations": ["Good"]},
     {"name": "Invalid", "observations": [""]},  # Empty observation
     {"name": "Valid2", "observations": ["Also good"]}
   ])
   ```
   Expected: Reject all, but return detailed error:
   ```json
   {
     "success": false,
     "validation_errors": [{
       "entity_index": 1,
       "entity_name": "Invalid",
       "errors": ["Observation 0: Cannot be empty"]
     }]
   }
   ```

4. **Pre-Validation Test**
   ```python
   # Validate before saving (avoids wasted tokens)
   validation = validate_memory([...entities...], thread_id)
   
   if validation["all_valid"]:
       save_memory([...entities...], thread_id)
   else:
       # Fix issues and retry
       print(validation["results"])
   ```

### Success Metrics

- AI agents can document 100+ entity technical sessions without validation failures
- <5% of saves require retry due to validation (after pre-validation)
- Technical content (URLs, paths, configs) stores without workarounds
- Cross-referencing doesn't require batch planning
- When validation fails, AI knows exactly what to fix from error messages

### Backwards Compatibility

All changes maintain existing API. Existing clients continue to work unchanged.

### Why Not Partial Saves?

**Integrity matters more than convenience.** Consider this scenario:

```python
save_memory([
  {"name": "ServiceA", ...},
  {"name": "ServiceB", "relations": [{"targetEntity": "ServiceA"}]},
  {"name": "ServiceC", "relations": [{"targetEntity": "ServiceB"}]}  # Invalid observation
])
```

If we did partial saves:
- ServiceA and ServiceB would save
- ServiceC would fail
- BUT: ServiceC might be critical context that makes ServiceB make sense
- Memory graph would be incomplete/misleading

**Better approach:**
1. Validate all entities first
2. Return detailed errors for ALL problems
3. AI fixes and retries entire batch
4. All-or-nothing save maintains graph integrity

This aligns with database ACID principles - atomicity is a feature, not a limitation.

---

**Priority Level**: P1 - Blocking adoption by AI agents for technical documentation  
**Estimated Effort**: 2-3 days (all solutions are lightweight, no dependencies)  
**Impact**: High - Enables primary use case (technical session documentation)
