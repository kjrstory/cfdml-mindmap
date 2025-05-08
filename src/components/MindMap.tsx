// src/components/MindMap.tsx
import React, { useEffect, useRef } from 'react';
import {
  Network,
  Data,
  Node as VisNode,
  Edge as VisEdge,
  Options,
} from 'vis-network';


export interface MindMapNode {
  id: string;
  label: string;
  parent?: string;        // root 노드는 parent 없음
  color?: string;
  url?: string;
}

export interface MindMapProps {
  tree: MindMapNode[];
  onNodeClick?: (node: MindMapNode) => void;
}

const MindMap: React.FC<MindMapProps> = ({ tree, onNodeClick }) => {
    const container = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (!container.current) return;
  
    // 1) 부모-자식 관계 맵 만들기
    const childrenMap = new Map<string, string[]>();
    tree.forEach(n => {
    if (n.parent) {
        const arr = childrenMap.get(n.parent) || [];
        arr.push(n.id);
        childrenMap.set(n.parent, arr);
    }
    });

    // 2) 각 노드 깊이(depth) 계산 (BFS)
    const levels = new Map<string, number>();
    const queue: string[] = [];
    const rootId = 'root';
    levels.set(rootId, 0);
    queue.push(rootId);
    while (queue.length) {
    const id = queue.shift()!;
    const depth = levels.get(id)!;
    (childrenMap.get(id) || []).forEach(childId => {
        levels.set(childId, depth + 1);
        queue.push(childId);
    });
    }

    // 3) 깊이별 노드 그룹화
    const nodesByDepth = new Map<number, string[]>();
    levels.forEach((depth, id) => {
    const arr = nodesByDepth.get(depth) || [];
    arr.push(id);
    nodesByDepth.set(depth, arr);
    });

    // 4) Backbone 색상 맵 (부모→자식 전파용)
    const colorMap = new Map<string, string>();
    tree.forEach(n => {
    if (n.color) colorMap.set(n.id, n.color);
    });

    // 5) 방사형 위치 계산
    const positions = new Map<string, { x: number; y: number }>();
    const radiusStep = 200;
    nodesByDepth.forEach((ids, depth) => {
    const radius = depth * radiusStep;
    const angleStep = (2 * Math.PI) / ids.length;
    ids.forEach((id, i) => {
        const angle = angleStep * i;
        positions.set(id, {
        x: Math.round(radius * Math.cos(angle)),
        y: Math.round(radius * Math.sin(angle)),
        });
    });
    });
  
    // 6) 부모 맵 (ancestor 탐색용)
    const parentMap = new Map<string, string>();
    tree.forEach(n => {
      if (n.parent) parentMap.set(n.id, n.parent);
    });

    // 7) vis-network용 노드 생성
    const visNodes: VisNode[] = tree.map(n => {
      const title = n.url ?? '';
      let col = n.color;
      let ancestor = n.parent;
      while (!col && ancestor) {
        col = colorMap.get(ancestor);
        ancestor = parentMap.get(ancestor);
      }
      const pos = positions.get(n.id)!;
      return {
        id: n.id,
        label: n.label,
        title,
        color: col,
        shape: 'box',
        margin: 4,
        font: { size: 18 },
        x: pos.x,
        y: pos.y,
        fixed: { x: false, y: false },
      };
    });

    // 8) vis-network용 엣지 생성
    const visEdges: VisEdge[] = tree
      .filter(n => n.parent)
      .map(n => ({
        from: n.parent!,
        to: n.id,
        arrows: 'to',
        physics: false,
      }));

    // 9) 네트워크 생성 (완전 고정 레이아웃)
    const network = new Network(
      container.current,
      { nodes: visNodes, edges: visEdges },
      {
        physics: {
          enabled: true,
        },
        interaction: { 
          dragNodes: true,
          dragView: true,
          zoomView: true,
          hover: true
        },
      }
    );

    // 마우스 포인터 바꿔 주기
    network.on('hoverNode', () => {
    if (container.current) container.current.style.cursor = 'pointer';
    });
    network.on('blurNode', () => {
    if (container.current) container.current.style.cursor = 'default';
    });

    // 10) 클릭 이벤트
    network.on('click', params => {
      if (params.nodes.length && onNodeClick) {
        const clicked = tree.find(n => n.id === params.nodes[0]);
        if (clicked) onNodeClick(clicked);
      }
    });
  
      return () => network.destroy();
    }, [tree, onNodeClick]);
  
    return <div ref={container} style={{ width: '100%', height: '80vh' }} />;
  };
  
  export default MindMap;