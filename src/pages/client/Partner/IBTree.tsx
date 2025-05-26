// Frontend/src/pages/client/Partner/IBTree.tsx - Fixed D3 zoom state issue
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trees, Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface TreeNode {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    level: number;
    isRoot?: boolean;
    isCurrentUser?: boolean;
    children: TreeNode[];
}

interface IBTreeProps {
    partnersList?: any[]; // Removed since we'll fetch directly
}

const IBTree = ({ }: IBTreeProps) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const [treeData, setTreeData] = useState<TreeNode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTreeData();
    }, []);

    const fetchTreeData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('clientToken');

            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/ibclients/ib-configurations/tree`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setTreeData(response.data.treeData);
                // Wait a bit for DOM to update, then create visualization
                setTimeout(() => createTreeVisualization(response.data.treeData), 100);
            }
        } catch (error) {
            console.error("Error fetching tree data:", error);
        } finally {
            setLoading(false);
        }
    };

    const createTreeVisualization = (data: TreeNode) => {
        if (!svgRef.current || !data) return;

        // Clear previous visualizations
        d3.select(svgRef.current).selectAll('*').remove();

        const containerWidth = svgRef.current.parentElement?.clientWidth || 1000;
        const containerHeight = 600;

        // Set dimensions
        const margin = { top: 30, right: 50, bottom: 150, left: 50 };
        const width = Math.max(containerWidth - margin.left - margin.right, 800);
        const height = containerHeight - margin.top - margin.bottom;

        // Create SVG with zoom behavior
        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('background', 'transparent')
            .style('cursor', 'grab');

        // Create main group
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create zoom behavior
        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 5])
            .on('zoom', (event) => {
                g.attr('transform', `translate(${margin.left},${margin.top}) ${event.transform}`);
            });

        svg.call(zoomBehavior);
        zoomRef.current = zoomBehavior;

        // Calculate tree dimensions based on data
        const getTreeDepth = (node: TreeNode): number => {
            if (!node.children || node.children.length === 0) return 1;
            return 1 + Math.max(...node.children.map(child => getTreeDepth(child)));
        };

        const getTreeWidth = (node: TreeNode): number => {
            if (!node.children || node.children.length === 0) return 1;
            return node.children.reduce((sum, child) => sum + getTreeWidth(child), 0);
        };

        const treeDepth = getTreeDepth(data);
        const treeWidth = Math.max(getTreeWidth(data), 3);

        // Create tree layout with proper spacing
        const treemap = d3.tree<TreeNode>()
            .size([width, height * 0.8])
            .separation((a, b) => {
                // Increase separation based on level to prevent overcrowding
                const baseSpacing = a.parent === b.parent ? 1 : 1.5;
                const levelMultiplier = 1 + (a.depth * 0.2);
                return baseSpacing * levelMultiplier;
            });

        // Create hierarchy
        const root = d3.hierarchy(data, d => d.children) as d3.HierarchyPointNode<TreeNode>;
        const nodes = treemap(root);

        // Add links
        g.selectAll('.link')
            .data(nodes.descendants().slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .style('fill', 'none')
            .style('stroke', '#cbd5e1')
            .style('stroke-width', '2px')
            .style('stroke-opacity', 0.6)
            .attr('d', d => {
                const source = d.parent!;
                const target = d;
                return `M${source.x},${source.y}
                        C${source.x},${(source.y + target.y) / 2}
                        ${target.x},${(source.y + target.y) / 2}
                        ${target.x},${target.y}`;
            });

        // Add node groups
        const nodeGroups = g.selectAll('.node')
            .data(nodes.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Add circles for nodes with different styles
        nodeGroups.append('circle')
            .attr('r', d => {
                if (d.data.isRoot) return 16;
                if (d.data.isCurrentUser) return 14;
                return 12;
            })
            .style('fill', d => {
                if (d.data.isRoot) return '#10b981'; // emerald-500 for root
                if (d.data.isCurrentUser) return '#f59e0b'; // amber-500 for current user

                // Different colors for each level
                const colors = ['#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
                return colors[d.data.level % colors.length];
            })
            .style('stroke', d => d.data.isCurrentUser ? '#f59e0b' : 'white')
            .style('stroke-width', d => d.data.isCurrentUser ? '4px' : '3px')
            .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))')
            .style('cursor', 'pointer');

        // Add level badges
        nodeGroups.append('text')
            .attr('dy', d => d.data.isRoot ? -25 : (d.children ? -22 : 22))
            .attr('text-anchor', 'middle')
            .style('font-family', 'system-ui, sans-serif')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .style('fill', '#374151')
            .style('background', 'white')
            .style('padding', '2px 6px')
            .style('border-radius', '12px')
            .text(d => {
                if (d.data.isRoot) return 'ROOT';
                return `L${d.data.level}`;
            });

        // Add referral code labels
        nodeGroups.append('text')
            .attr('dy', d => d.data.isRoot ? -8 : (d.children ? -8 : -8))
            .attr('text-anchor', 'middle')
            .style('font-family', 'system-ui, sans-serif')
            .style('font-size', d => d.data.isRoot ? '12px' : '10px')
            .style('font-weight', d => d.data.isRoot || d.data.isCurrentUser ? 'bold' : '600')
            .style('fill', 'white')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
            .text(d => d.data.referralCode);

        // Add name labels below nodes
        nodeGroups.append('text')
            .attr('dy', d => d.children ? 35 : -35)
            .attr('text-anchor', 'middle')
            .style('font-family', 'system-ui, sans-serif')
            .style('font-size', '11px')
            .style('font-weight', '500')
            .style('fill', '#4b5563')
            .text(d => {
                const maxLength = 15;
                if (d.data.name.length > maxLength) {
                    return d.data.name.substring(0, maxLength) + '...';
                }
                return d.data.name;
            });

        // Add hover effects and tooltips
        nodeGroups
            .on('mouseenter', function (event, d) {
                // Highlight the node
                d3.select(this).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', (d.data.isRoot ? 20 : d.data.isCurrentUser ? 18 : 16))
                    .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))');

                // Show tooltip
                const tooltip = d3.select('body')
                    .append('div')
                    .attr('class', 'tree-tooltip')
                    .style('position', 'absolute')
                    .style('background', 'rgba(0, 0, 0, 0.9)')
                    .style('color', 'white')
                    .style('padding', '12px')
                    .style('border-radius', '8px')
                    .style('font-size', '14px')
                    .style('font-family', 'system-ui, sans-serif')
                    .style('pointer-events', 'none')
                    .style('z-index', '1000')
                    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
                    .style('max-width', '280px')
                    .html(`
                        <div style="font-weight: bold; margin-bottom: 8px; color: #60a5fa;">
                            ${d.data.name}
                            ${d.data.isRoot ? ' 🌟' : ''}
                            ${d.data.isCurrentUser ? ' (You)' : ''}
                        </div>
                        <div style="margin-bottom: 6px; color: #cbd5e1;">
                            📧 ${d.data.email}
                        </div>
                        <div style="margin-bottom: 6px; color: #cbd5e1;">
                            🏷️ Code: <span style="font-weight: bold; color: #fbbf24;">${d.data.referralCode}</span>
                        </div>
                        <div style="margin-bottom: 6px; color: #cbd5e1;">
                            📊 Level: <span style="font-weight: bold; color: #34d399;">${d.data.isRoot ? 'ROOT' : 'L' + d.data.level}</span>
                        </div>
                        <div style="color: #cbd5e1;">
                            👥 Children: <span style="font-weight: bold; color: #a78bfa;">${d.data.children?.length || 0}</span>
                        </div>
                    `);

                // Position tooltip
                const [mouseX, mouseY] = d3.pointer(event, document.body);
                tooltip
                    .style('left', (mouseX + 15) + 'px')
                    .style('top', (mouseY - 15) + 'px');
            })
            .on('mouseleave', function (_, d) {
                // Reset node size
                d3.select(this).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', d.data.isRoot ? 16 : d.data.isCurrentUser ? 14 : 12)
                    .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))');

                // Remove tooltip
                d3.selectAll('.tree-tooltip').remove();
            })
            .on('click', function (event, d) {
                // Center the clicked node
                const currentTransform = d3.zoomTransform(svg.node()!);
                const [x, y] = [d.x, d.y];

                const newTransform = d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(currentTransform.k)
                    .translate(-x, -y);

                svg.transition()
                    .duration(750)
                    .call(zoomBehavior.transform, newTransform);
            });

        // Set initial zoom to show entire tree
        setTimeout(() => {
            const gNode = g.node();
            if (gNode && gNode instanceof SVGGraphicsElement) {
                try {
                    const bounds = gNode.getBBox();
                    if (bounds && bounds.width > 0 && bounds.height > 0) {
                        const fullWidth = bounds.width;
                        const fullHeight = bounds.height;
                        const midX = bounds.x + fullWidth / 2;
                        const midY = bounds.y + fullHeight / 2;

                        const scale = Math.min(width / fullWidth, height / fullHeight) * 0.8;
                        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

                        const initialTransform = d3.zoomIdentity
                            .translate(translate[0], translate[1])
                            .scale(scale);

                        svg.call(zoomBehavior.transform, initialTransform);
                    }
                } catch (error) {
                    console.warn('Could not set initial zoom:', error);
                }
            }
        }, 100);
    };

    const handleZoomIn = () => {
        if (zoomRef.current && svgRef.current) {
            d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoomRef.current.scaleBy, 1.5);
        }
    };

    const handleZoomOut = () => {
        if (zoomRef.current && svgRef.current) {
            d3.select(svgRef.current)
                .transition()
                .duration(300)
                .call(zoomRef.current.scaleBy, 1 / 1.5);
        }
    };

    const handleResetZoom = () => {
        if (zoomRef.current && svgRef.current && treeData) {
            const svg = d3.select(svgRef.current);
            const g = svg.select('g');
            const gNode = g.node();

            if (gNode && gNode instanceof SVGGraphicsElement) {
                try {
                    const bounds = gNode.getBBox();
                    if (bounds && bounds.width > 0 && bounds.height > 0) {
                        const containerWidth = svgRef.current.parentElement?.clientWidth || 1000;
                        const containerHeight = 600;
                        const margin = { top: 30, right: 50, bottom: 150, left: 50 };
                        const width = containerWidth - margin.left - margin.right;
                        const height = containerHeight - margin.top - margin.bottom;

                        const fullWidth = bounds.width;
                        const fullHeight = bounds.height;
                        const midX = bounds.x + fullWidth / 2;
                        const midY = bounds.y + fullHeight / 2;

                        const scale = Math.min(width / fullWidth, height / fullHeight) * 0.8;
                        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

                        const resetTransform = d3.zoomIdentity
                            .translate(translate[0], translate[1])
                            .scale(scale);

                        svg.transition()
                            .duration(750)
                            .call(zoomRef.current!.transform, resetTransform);
                    }
                } catch (error) {
                    console.warn('Could not reset zoom:', error);
                    // Fallback to identity transform
                    svg.transition()
                        .duration(750)
                        .call(zoomRef.current!.transform, d3.zoomIdentity);
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div>Loading network tree...</div>
                </div>
            </div>
        );
    }

    if (!treeData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                        <Trees className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Alert variant="default">
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Network Data Available</AlertTitle>
                        <AlertDescription>
                            Your network tree will appear here once you start referring partners.
                            Share your referral link to begin building your network hierarchy.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    className="w-10 h-10 p-0"
                    title="Zoom In"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    className="w-10 h-10 p-0"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetZoom}
                    className="w-10 h-10 p-0"
                    title="Reset View"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            {/* Tree Container */}
            <div className="w-full h-full overflow-hidden rounded-lg border bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
                <svg
                    ref={svgRef}
                    className="w-full h-full"
                    style={{ minHeight: '600px' }}
                />
            </div>

            {/* Legend and Instructions */}
            <div className="mt-1 space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        <span>Root User</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-amber-500"></div>
                        <span>You</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                        <span>L1 Partners</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                        <span>L2 Partners</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                        <span>L3+ Partners</span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground space-y-1">
                        <p>
                            <strong>💡 Controls:</strong> Mouse wheel to zoom • Drag to pan • Click node to center • Hover for details
                        </p>
                        <p>
                            The tree shows your referral hierarchy with proper level structure. ROOT is the top-level referrer, followed by L0, L1, L2, etc.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IBTree;