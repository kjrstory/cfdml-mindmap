// src/App.tsx
import { useEffect, useState } from 'react';
import MindMap from './components/MindMap';
import type { MindMapNode } from './components/MindMap';

function App() {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/data.json`)
      .then(res => res.json())
      .then(data => setNodes(data.nodes));
  }, []);

  const handleNodeClick = (node: MindMapNode) => {
    if (node.url) {
      window.open(node.url, '_blank');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>CFD Surrogate Dashboard</h1>
      <MindMap tree={nodes} onNodeClick={handleNodeClick} />
    </div>
  );
}

export default App; 