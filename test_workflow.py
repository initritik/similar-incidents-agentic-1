#!/usr/bin/env python3
"""Test script to debug workflow start endpoint."""
import sys
import json
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# Set up environment
import os
os.environ.setdefault("QDRANT_URL", "http://localhost:6333")
os.environ.setdefault("QDRANT_API_KEY", "test-key")
os.environ.setdefault("OPENAI_API_KEY", "test-key")

try:
    from app.orchestrator import StartWorkflowRequest, WorkflowOrchestrator
    from app.mock_data.incidents import MOCK_INCIDENTS
    
    print("✓ Imports successful")
    print(f"✓ Mock incidents loaded: {len(MOCK_INCIDENTS)} incidents")
    print(f"✓ Available incident numbers: {[inc.incident_number for inc in MOCK_INCIDENTS]}")
    
    # Test with valid incident
    incident_number = "INC000005"
    print(f"\n--- Testing workflow start with: {incident_number} ---")
    
    try:
        orchestrator = WorkflowOrchestrator()
        print(f"✓ WorkflowOrchestrator created")
        
        result = orchestrator.start_workflow(incident_number)
        print(f"✓ Workflow started successfully")
        print(f"  - Workflow ID: {result.workflow_id}")
        print(f"  - Status: {result.overall_status}")
        print(f"  - Agent Statuses: {len(result.agent_statuses)} agents")
        for agent in result.agent_statuses:
            print(f"    - {agent.agent_name}: {agent.status} - {agent.message}")
            
    except Exception as e:
        print(f"✗ Error during workflow start:")
        print(f"  Type: {type(e).__name__}")
        print(f"  Message: {str(e)}")
        import traceback
        traceback.print_exc()
        
except Exception as e:
    print(f"✗ Error during initialization:")
    print(f"  Type: {type(e).__name__}")
    print(f"  Message: {str(e)}")
    import traceback
    traceback.print_exc()
