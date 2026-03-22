"""
graphitiMemory.py — GOLEM Memory Layer via Graphiti + Neo4j

Replaces Zep Cloud with self-hosted Graphiti (open source, by Zep).
Uses the same Neo4j instance as MiroFish.

Architecture:
- Each Watercooler agent has its own Graphiti episode stream
- Each dating match has its own episode stream  
- Gaston's taste preferences accumulate as a knowledge graph
- RelatEngine pulls relevant memories before each sim step

Usage:
  python3.11 graphitiMemory.py server   # starts the memory API on :8765
  python3.11 graphitiMemory.py test     # runs a quick smoke test

Requires:
  pip3.11 install graphiti-core neo4j fastapi uvicorn anthropic
  Neo4j running on bolt://localhost:7687 (same as MiroFish)
  ANTHROPIC_API_KEY in environment
"""

import os
import sys
import json
import asyncio
from datetime import datetime, timezone
from typing import Optional

# ── Graphiti ──────────────────────────────────────────────────────────────────
from graphiti_core import Graphiti
from graphiti_core.nodes import EpisodeType

# ── Web server ────────────────────────────────────────────────────────────────
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# ── Config ────────────────────────────────────────────────────────────────────
NEO4J_URI      = os.getenv("NEO4J_URI",      "bolt://localhost:7687")
NEO4J_USER     = os.getenv("NEO4J_USER",     "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "mirofish")
ANTHROPIC_KEY  = os.getenv("ANTHROPIC_API_KEY", "")
PORT           = int(os.getenv("MEMORY_PORT", "8765"))

# ── Graphiti client (shared) ──────────────────────────────────────────────────
graphiti: Optional[Graphiti] = None

async def get_graphiti() -> Graphiti:
    global graphiti
    if graphiti is None:
        from graphiti_core.llm_client.anthropic_client import AnthropicClient
        from graphiti_core.embedder.anthropic import AnthropicEmbedder
        
        llm    = AnthropicClient(api_key=ANTHROPIC_KEY)
        # Use voyage-3-lite or text-embedding-3-small; fallback to Anthropic
        try:
            from graphiti_core.embedder.openai import OpenAIEmbedder
            embedder = OpenAIEmbedder(api_key=ANTHROPIC_KEY, model="text-embedding-3-small")
        except Exception:
            embedder = None
        
        graphiti = Graphiti(
            uri=NEO4J_URI,
            user=NEO4J_USER,
            password=NEO4J_PASSWORD,
            llm_client=llm,
            embedder=embedder,
        )
        await graphiti.build_indices_and_constraints()
    return graphiti


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="GOLEM Memory API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────────────────
class AddEpisodeRequest(BaseModel):
    group_id: str          # e.g. "watercooler-cmo" or "dating-sofia-1982"
    name: str              # episode name / title
    content: str           # the text content to memorize
    episode_type: str = "text"  # "text" | "message"
    source_description: str = "GOLEM"

class SearchRequest(BaseModel):
    group_id: str
    query: str
    limit: int = 5

class TasteSignalRequest(BaseModel):
    profile_sign: str
    profile_hd_type: str
    profile_lp: int
    score: int
    decision: str          # "right" | "left" | "skip"
    notes: str = ""


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "neo4j": NEO4J_URI}


@app.post("/memory/add")
async def add_episode(req: AddEpisodeRequest):
    """Store a new memory episode."""
    g = await get_graphiti()
    try:
        ep_type = EpisodeType.message if req.episode_type == "message" else EpisodeType.text
        await g.add_episode(
            name=req.name,
            episode_body=req.content,
            source=ep_type,
            source_description=req.source_description,
            group_id=req.group_id,
            reference_time=datetime.now(timezone.utc),
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/memory/search")
async def search_memory(req: SearchRequest):
    """Retrieve relevant memories for a context query."""
    g = await get_graphiti()
    try:
        results = await g.search(
            query=req.query,
            group_ids=[req.group_id],
            num_results=req.limit,
        )
        return {
            "results": [
                {
                    "fact": r.fact,
                    "score": r.score,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/memory/taste")
async def store_taste_signal(req: TasteSignalRequest):
    """Store a dating decision as a taste learning signal."""
    g = await get_graphiti()
    content = (
        f"Gaston {req.decision}d a profile. "
        f"Sign: {req.profile_sign}, HD: {req.profile_hd_type}, LP: {req.profile_lp}. "
        f"Compatibility score: {req.score}/100. "
        f"{req.notes}"
    )
    try:
        await g.add_episode(
            name=f"dating-decision-{req.profile_sign}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            episode_body=content,
            source=EpisodeType.text,
            source_description="Bumble Assistant",
            group_id="gaston-dating-taste",
            reference_time=datetime.now(timezone.utc),
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/memory/taste/insights")
async def get_taste_insights():
    """Return Gaston's learned taste patterns from accumulated signals."""
    g = await get_graphiti()
    try:
        results = await g.search(
            query="What types of women does Gaston consistently choose? What patterns emerge in his dating decisions?",
            group_ids=["gaston-dating-taste"],
            num_results=10,
        )
        return {
            "insights": [r.fact for r in results],
            "count": len(results),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/memory/group/{group_id}")
async def clear_group(group_id: str):
    """Clear all memories for a group (use with care)."""
    # Graphiti doesn't have a direct group-delete API yet
    # This is a placeholder
    return {"ok": True, "note": "Group clear not yet implemented in graphiti-core"}


# ── CLI ───────────────────────────────────────────────────────────────────────
async def smoke_test():
    print("🧪 GOLEM Memory smoke test...")
    g = await get_graphiti()
    
    # Store a test memory
    await g.add_episode(
        name="test-cmo-watercooler",
        episode_body="CMO and Backend Engineer had a tense exchange about shipping velocity. CMO wants faster launches, Backend is pushing back on technical debt.",
        source=EpisodeType.text,
        source_description="Watercooler",
        group_id="watercooler-test",
        reference_time=datetime.now(timezone.utc),
    )
    print("✅ Stored episode")
    
    # Retrieve it
    results = await g.search(
        query="What tension exists between CMO and Backend?",
        group_ids=["watercooler-test"],
        num_results=3,
    )
    print(f"✅ Retrieved {len(results)} results")
    for r in results:
        print(f"   → {r.fact[:100]}...")
    
    print("\n✅ Memory layer working!")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "server"
    
    if cmd == "test":
        asyncio.run(smoke_test())
    else:
        print(f"🧠 GOLEM Memory API starting on port {PORT}...")
        print(f"   Neo4j: {NEO4J_URI}")
        print(f"   Anthropic: {'✓' if ANTHROPIC_KEY else '✗ missing'}")
        uvicorn.run(app, host="0.0.0.0", port=PORT)
