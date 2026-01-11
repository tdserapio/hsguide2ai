import React, { useMemo } from 'react';

export default function NeuralGraphic() {
  const layerConfig = [3, 4, 2]; 
  const width = 500; 
  const height = 500;
  
  const nodeRadius = 35;

  // Animation constants
  const dashSize = 23;
  const gapSize = 390; 
  const totalDashLength = dashSize + gapSize; // 400
  
  const durationSeconds = 2; 

  const networkData = useMemo(() => {
    const nodes = [];
    const links = [];

    // Generate Nodes
    layerConfig.forEach((nodeCount, layerIndex) => {
      const availableWidth = width * 0.7; 
      const marginX = (width - availableWidth) / 2;
      const layerX = marginX + (layerIndex / (layerConfig.length - 1)) * availableWidth;
      
      for (let i = 0; i < nodeCount; i++) {
        const layerHeight = nodeCount * 90; 
        const startY = (height - layerHeight) / 2 + 45;
        const nodeY = startY + i * 90;

        nodes.push({
          id: `${layerIndex}-${i}`,
          x: layerX,
          y: nodeY,
          layer: layerIndex,
        });
      }
    });

    // Generate Links
    nodes.forEach((node) => {
      const nextLayerNodes = nodes.filter((n) => n.layer === node.layer + 1);
      nextLayerNodes.forEach((nextNode) => {
        links.push({
          source: node,
          target: nextNode,
          sourceLayerIndex: node.layer
        });
      });
    });

    return { nodes, links };
  }, [layerConfig]);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      
      <style>{`
        @keyframes flowAnimation {
          from { stroke-dashoffset: ${totalDashLength}; }
          to { stroke-dashoffset: 0; }
        }
        
        .neural-link-flow {
          animation-name: flowAnimation;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>

      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`} 
        className="max-w-3xl"
        style={{ 
          overflow: 'visible',
          // CHANGED: This moves the graphic up by 150px. 
          // Adjust this negative number to move it even higher or lower.
          transform: 'translateY(-23vh)' 
        }}
      >
        <defs>
          <linearGradient id="nodeGradientHorizontal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="5%" stopColor="#d4d4d4" />
            <stop offset="95%" stopColor="#171717" />
          </linearGradient>
        </defs>

        {/* 2. Passive Links (Gray) */}
        <g opacity="0.4">
          {networkData.links.map((link, i) => (
            <line
              key={`base-${i}`}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke="#9ca3af"
              strokeWidth="2"
            />
          ))}
        </g>

        {/* 3. Active "Flow" Links (Black pulses) */}
        <g>
          {networkData.links.map((link, i) => {
            const isFirstSet = link.sourceLayerIndex === 0;
            const delay = isFirstSet ? 0 : durationSeconds / 2;

            return (
              <line
                key={`flow-${i}`}
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
                stroke="black"
                strokeWidth="3"
                strokeDasharray={`${dashSize} ${gapSize}`} 
                strokeLinecap="round"
                className="neural-link-flow"
                style={{
                  opacity: 1,
                  animationDuration: `${durationSeconds}s`,
                  animationDelay: `${delay}s` 
                }}
              />
            );
          })}
        </g>

        {/* 4. Draw Nodes (Bigger, No Outline) */}
        <g>
          {networkData.nodes.map((node) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={nodeRadius} 
              fill="url(#nodeGradientHorizontal)"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}