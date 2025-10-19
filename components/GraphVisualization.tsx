import React, { useCallback, useMemo } from 'react';
import type { GraphData, Node, Link } from '../types';

interface GraphVisualizationProps {
  data: GraphData;
}

const GROUP_COLORS: { [key: string]: string } = {
  character: '#00e5ff',
  location: '#ff00ff',
  concept: '#ffff00',
  event: '#ff4d00',
  faction: '#ff0000',
  object: '#00ff00',
  default: '#ffffff'
};

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({ data }) => {
  const ForceGraph3D = (window as any).ForceGraph3D;
  const SpriteText = (window as any).SpriteText;

  const handleNodeColor = useCallback((node: any) => {
    return GROUP_COLORS[node.group] || GROUP_COLORS.default;
  }, []);

  const memoizedData = useMemo(() => {
    // ForceGraph3D mutates the data, so we need to provide a copy
    return {
      nodes: data.nodes.map(node => ({ ...node })),
      links: data.links.map(link => ({ ...link }))
    };
  }, [data]);
  
  if (!ForceGraph3D || !SpriteText) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center text-cyan-300">
        <p>Loading Graph Engine...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <ForceGraph3D
        graphData={memoizedData}
        backgroundColor="#000003"
        nodeThreeObject={(node: any) => {
          const sprite = new SpriteText(node.name);
          sprite.color = handleNodeColor(node);
          sprite.textHeight = 4;
          sprite.fontFace = '"Roboto", "Helvetica", "Arial", sans-serif';
          return sprite;
        }}
        nodeAutoColorBy={handleNodeColor}
        linkThreeObjectExtend={true}
        linkThreeObject={(link: any) => {
            const sprite = new SpriteText(link.label);
            sprite.color = 'rgba(170, 170, 170, 0.8)';
            sprite.textheight = 2.5;
            return sprite;
        }}
        linkPositionUpdate={(sprite: any, { start, end }: any) => {
            // FIX: The spread operator on an array from .map() causes a TypeScript error. Using .reduce() is a type-safe alternative to create the coordinate object.
            const middlePos = ['x', 'y', 'z'].reduce((acc, c) => ({
                ...acc,
                [c]: start[c] + (end[c] - start[c]) / 2
            }), {});
            Object.assign(sprite.position, middlePos);
        }}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        linkWidth={0.5}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};
