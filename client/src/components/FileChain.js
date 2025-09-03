import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  X, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Layers,
  File,
  Folder
} from 'lucide-react';

function FileChain({ isOpen, onClose, repositoryId, repositoryName, isExternalRepository = false, externalRepositoryInfo = null }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '2d' or '3d'
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDependencies, setShowDependencies] = useState(true);
  const svgRef = useRef();
  const containerRef = useRef();

  const fetchFileChainData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url;
      if (isExternalRepository && externalRepositoryInfo) {
        url = `/api/github/repositories/${externalRepositoryInfo.owner}/${externalRepositoryInfo.name}/graph?type=filechain`;
      } else {
        url = `/api/repositories/${repositoryId}/graph?type=filechain`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setGraphData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch file chain data');
      }
    } catch (err) {
      console.error('Error fetching file chain data:', err);
      setError('Failed to fetch file chain data');
    } finally {
      setLoading(false);
    }
  };

  const createGraphNodes = useCallback((fileTree, dependencies) => {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Create nodes from file tree
    const processTree = (items, parentPath = '') => {
      items.forEach(item => {
        const nodeId = item.path;
        const node = {
          id: nodeId,
          name: item.name,
          type: item.type,
          path: item.path,
          size: item.size || 0,
          extension: item.extension,
          level: item.path.split('/').length - 1,
          isFolder: item.type === 'dir',
          children: item.children ? item.children.length : 0
        };
        
        nodes.push(node);
        nodeMap.set(nodeId, node);

        // Create hierarchical links
        if (parentPath) {
          links.push({
            source: parentPath,
            target: nodeId,
            type: 'hierarchy',
            strength: 1
          });
        }

        if (item.children) {
          processTree(item.children, nodeId);
        }
      });
    };

    processTree(fileTree);

    // Add dependency links
    if (dependencies && showDependencies) {
      dependencies.forEach(dep => {
        if (nodeMap.has(dep.from) && nodeMap.has(dep.to)) {
          links.push({
            source: dep.from,
            target: dep.to,
            type: 'dependency',
            strength: 0.3
          });
        }
      });
    }

    return { nodes, links };
  }, [showDependencies]);

  const render2DGraph = useCallback(() => {
    if (!graphData?.data || !svgRef.current) return;

    const { fileTree, dependencies } = graphData.data;
    const { nodes, links } = createGraphNodes(fileTree, dependencies);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    svg.attr("width", width).attr("height", height);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", d => d.type === 'dependency' ? "#3b82f6" : "#94a3b8")
      .attr("stroke-width", d => d.type === 'dependency' ? 2 : 1)
      .attr("stroke-opacity", 0.6);

    // Create nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles for nodes
    node.append("circle")
      .attr("r", d => d.isFolder ? 15 : 8)
      .attr("fill", d => d.isFolder ? "#3b82f6" : "#10b981")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add labels
    node.append("text")
      .attr("dy", d => d.isFolder ? 25 : 15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name);

    // Add tooltips
    node.append("title")
      .text(d => `${d.name}\nType: ${d.type}\nPath: ${d.path}`);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Node click handler
    node.on("click", (event, d) => {
      setSelectedNode(d);
    });
  }, [graphData, showDependencies, createGraphNodes]);

  const render3DGraph = useCallback(() => {
    if (!graphData?.data || !svgRef.current) return;

    const { fileTree, dependencies } = graphData.data;
    const { nodes, links } = createGraphNodes(fileTree, dependencies);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    svg.attr("width", width).attr("height", height);

    // Create 3D-like force simulation with depth
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Add z-coordinate to nodes for 3D effect
    nodes.forEach(node => {
      node.z = Math.random() * 100 - 50;
    });

    // Create links with 3D perspective
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", d => d.type === 'dependency' ? "#3b82f6" : "#94a3b8")
      .attr("stroke-width", d => d.type === 'dependency' ? 3 : 1.5)
      .attr("stroke-opacity", d => {
        const sourceZ = d.source.z || 0;
        const targetZ = d.target.z || 0;
        const avgZ = (sourceZ + targetZ) / 2;
        return Math.max(0.3, 1 - Math.abs(avgZ) / 100);
      });

    // Create nodes with 3D perspective
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles with 3D effect
    node.append("circle")
      .attr("r", d => {
        const baseRadius = d.isFolder ? 18 : 10;
        const zFactor = 1 + (d.z || 0) / 200;
        return baseRadius * zFactor;
      })
      .attr("fill", d => {
        const baseColor = d.isFolder ? "#3b82f6" : "#10b981";
        const z = d.z || 0;
        const intensity = Math.max(0.6, 1 - Math.abs(z) / 150);
        return d3.color(baseColor).brighter(1 - intensity);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", d => {
        const z = d.z || 0;
        return Math.max(1, 3 - Math.abs(z) / 50);
      })
      .attr("opacity", d => {
        const z = d.z || 0;
        return Math.max(0.7, 1 - Math.abs(z) / 200);
      });

    // Add labels with 3D perspective
    node.append("text")
      .attr("dy", d => {
        const baseOffset = d.isFolder ? 30 : 18;
        const z = d.z || 0;
        return baseOffset + z / 10;
      })
      .attr("text-anchor", "middle")
      .style("font-size", d => {
        const z = d.z || 0;
        const baseSize = 12;
        const zFactor = 1 + Math.abs(z) / 200;
        return `${baseSize * zFactor}px`;
      })
      .style("fill", d => {
        const z = d.z || 0;
        const intensity = Math.max(0.6, 1 - Math.abs(z) / 150);
        return d3.color("#374151").brighter(1 - intensity);
      })
      .style("opacity", d => {
        const z = d.z || 0;
        return Math.max(0.6, 1 - Math.abs(z) / 200);
      })
      .text(d => d.name.length > 12 ? d.name.substring(0, 12) + "..." : d.name);

    // Add tooltips
    node.append("title")
      .text(d => `${d.name}\nType: ${d.type}\nPath: ${d.path}\nDepth: ${Math.round(d.z || 0)}`);

    // Update positions on simulation tick with 3D perspective
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => {
          const z = d.z || 0;
          const scale = Math.max(0.8, 1 - Math.abs(z) / 300);
          const translateX = d.x + (z / 10);
          const translateY = d.y + (z / 10);
          return `translate(${translateX},${translateY}) scale(${scale})`;
        });
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Node click handler
    node.on("click", (event, d) => {
      setSelectedNode(d);
    });
  }, [graphData, showDependencies, createGraphNodes]);

  useEffect(() => {
    if (isOpen && repositoryId) {
      fetchFileChainData();
    }
  }, [isOpen, repositoryId, isExternalRepository, externalRepositoryInfo]);

  useEffect(() => {
    if (graphData && !loading && !error) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (viewMode === '2d') {
          render2DGraph();
        } else {
          render3DGraph();
        }
      }, 100);
    }
  }, [graphData, viewMode, showDependencies, loading, error, render2DGraph, render3DGraph]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Network className="h-6 w-6" />
              <span>File Chain Visualization</span>
            </h2>
            <p className="text-gray-600">{repositoryName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === '2d' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                2D View
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === '3d' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                3D View
              </button>
            </div>
            
            <button
              onClick={() => setShowDependencies(!showDependencies)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showDependencies 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {showDependencies ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>Dependencies</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchFileChainData}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-200px)]">
          {/* Graph Area */}
          <div className="flex-1 relative" ref={containerRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Network className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchFileChainData}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                </div>
              </div>
                         ) : (
               <>
                 <svg ref={svgRef} className="w-full h-full"></svg>
                 {viewMode === '2d' ? render2DGraph() : render3DGraph()}
               </>
             )}
          </div>

          {/* Sidebar */}
          {selectedNode && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                {selectedNode.isFolder ? <Folder className="h-5 w-5 text-blue-500" /> : <File className="h-5 w-5 text-green-500" />}
                <span>Node Details</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{selectedNode.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedNode.type}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Path</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedNode.path}</p>
                </div>
                
                {selectedNode.extension && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Extension</label>
                    <p className="text-sm text-gray-900">{selectedNode.extension}</p>
                  </div>
                )}
                
                {selectedNode.size > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Size</label>
                    <p className="text-sm text-gray-900">
                      {selectedNode.size > 1024 
                        ? `${(selectedNode.size / 1024).toFixed(1)} KB` 
                        : `${selectedNode.size} B`
                      }
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Level</label>
                  <p className="text-sm text-gray-900">{selectedNode.level}</p>
                </div>
                
                {selectedNode.isFolder && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Children</label>
                    <p className="text-sm text-gray-900">{selectedNode.children} items</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Footer */}
        {graphData?.data && (
          <div className="border-t bg-gray-50 p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Folders ({graphData.data.totalFolders})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Files ({graphData.data.totalFiles})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Dependencies ({graphData.data.dependencies?.length || 0})</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4" />
                <span>Max Depth: {graphData.data.maxDepth}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileChain;
