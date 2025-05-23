// Frontend/src/pages/client/Partner/IBTree.tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LucideInfo } from "lucide-react";

interface User {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
}

interface Partner {
    _id: string;
    userId: User;
    referralCode: string;
    level: number;
    parentId?: string;
    totalVolume: number;
    totalEarned: number;
}

interface TreeNode {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    level: number;
    children: TreeNode[];
    totalVolume: number;
    totalEarned: number;
}

interface IBTreeProps {
    partnersList: Partner[];
}

const IBTree = ({ partnersList }: IBTreeProps) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (partnersList.length === 0) return;

        // Clear previous visualizations
        if (svgRef.current) {
            d3.select(svgRef.current).selectAll('*').remove();
        }

        // Generate tree data structure
        const treeData = buildTreeData(partnersList);
        createTreeVisualization(treeData);
    }, [partnersList]);

    const buildTreeData = (partners: Partner[]): TreeNode => {
        // First, find your own data (level 0)
        const user: TreeNode = {
            id: 'self',
            name: 'You',
            email: 'Your Email',
            referralCode: partners[0]?.referralCode || 'Your Code',
            level: 0,
            children: [] as TreeNode[],
            totalVolume: 0,
            totalEarned: 0
        };

        // Create a map for quick lookup
        const nodesMap = new Map<string, TreeNode>();
        nodesMap.set('self', user);

        // Group partners by level
        const partnersByLevel = partners.reduce((acc, partner) => {
            const level = partner.level;
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push(partner);
            return acc;
        }, {} as Record<number, Partner[]>);

        // Process each level
        for (let level = 1; level <= Math.max(...Object.keys(partnersByLevel).map(Number)); level++) {
            const levelPartners = partnersByLevel[level] || [];

            for (const partner of levelPartners) {
                const node: TreeNode = {
                    id: partner._id,
                    name: `${partner.userId.firstname} ${partner.userId.lastname}`,
                    email: partner.userId.email,
                    referralCode: partner.referralCode,
                    level: partner.level,
                    children: [],
                    totalVolume: partner.totalVolume,
                    totalEarned: partner.totalEarned
                };

                nodesMap.set(partner._id, node);

                // Find parent and add this node as a child
                if (level === 1) {
                    // Level 1 partners are directly under you
                    user.children.push(node);
                } else if (partner.parentId && nodesMap.has(partner.parentId)) {
                    // Add to the parent if we know who it is
                    nodesMap.get(partner.parentId)?.children.push(node);
                } else {
                    // If we don't have a parent, default to adding to the user node
                    user.children.push(node);
                }
            }
        }

        return user;
    };

    const createTreeVisualization = (treeData: TreeNode) => {
        // Set dimensions
        const margin = { top: 50, right: 90, bottom: 30, left: 90 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        // Append the svg object to the div
        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Declares a tree layout and assigns the size
        const treemap = d3.tree<TreeNode>().size([width, height]);

        // Maps the node data to the tree layout
        const root = d3.hierarchy(treeData, d => d.children) as d3.HierarchyNode<TreeNode>;
        const nodes = treemap(root);

        // Adds links between nodes
        svg.selectAll('.link')
            .data(nodes.descendants().slice(1))
            .enter()
            .append('path')
            .attr('class', 'link')
            .style('fill', 'none')
            .style('stroke', '#d1d5db') // Gray-300
            .style('stroke-width', '1.5px')
            .attr('d', d => {
                return `M${d.x},${d.y}
                        C${d.x},${(d.y + d.parent!.y) / 2}
                        ${d.parent!.x},${(d.y + d.parent!.y) / 2}
                        ${d.parent!.x},${d.parent!.y}`;
            });

        // Adds each node as a group
        const node = svg.selectAll('.node')
            .data(nodes.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Adds the circle to the node
        node.append('circle')
            .attr('r', 8)
            .style('fill', d => d.data.level === 0 ? '#10b981' : '#3b82f6') // Green-500 for root, Blue-500 for others
            .style('stroke', 'white')
            .style('stroke-width', '2px');

        // Adds the node text (referral code)
        node.append('text')
            .attr('dy', '.35em')
            .attr('y', d => d.children ? -20 : 20)
            .style('text-anchor', 'middle')
            .style('font-family', 'system-ui, sans-serif')
            .style('font-size', '12px')
            .style('fill', '#64748b') // Slate-500
            .text(d => d.data.referralCode);

        // Add more detailed info on hover
        node.append('title')
            .text(d => `Name: ${d.data.name}
                       Email: ${d.data.email}
                       IB Code: ${d.data.referralCode}
                       Level: ${d.data.level}
                       Volume: ${d.data.totalVolume.toFixed(2)}
                       Earned: ${d.data.totalEarned.toFixed(2)}`);
    };

    if (partnersList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <Alert variant="default" className="max-w-md">
                    <LucideInfo className="h-4 w-4" />
                    <AlertTitle>No network data</AlertTitle>
                    <AlertDescription>
                        No partners in your network yet. Share your referral link to start building your network.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <div className="w-full h-full overflow-auto flex justify-center">
                <svg
                    ref={svgRef}
                    className="w-full min-w-[800px]"
                    style={{ minHeight: '400px' }}
                ></svg>
            </div>
            <div className="text-center mt-4 text-sm text-muted-foreground">
                <p>Hover over nodes to see detailed information. Your node is highlighted in green.</p>
            </div>
        </div>
    );
};

export default IBTree;
