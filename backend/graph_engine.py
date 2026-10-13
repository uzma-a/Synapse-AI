import networkx as nx
from schemas import KnowledgeGraph

class GraphEngine:
    @staticmethod
    def generate_react_flow_data(kg: KnowledgeGraph):
        if not kg.nodes:
            return {"nodes": [], "edges": []}

        G = nx.DiGraph()
        for node in kg.nodes:
            G.add_node(node.id, label=node.label, description=node.description)
        
        for edge in kg.edges:
            G.add_edge(edge.source, edge.target, label=edge.relationship)

        # 1. Use a simpler layout and scale it to be centered around 0,0
        pos = nx.spring_layout(G, k=150, iterations=50)
        
        centrality = nx.degree_centrality(G)

        rf_nodes = []
        for node_id, coords in pos.items():
            # We multiply by 400 instead of 1000 to keep nodes closer together
            # and shift them so they aren't stuck in one corner.
            rf_nodes.append({
                "id": node_id,
                "type": "conceptNode",
                "position": {"x": coords[0] * 400, "y": coords[1] * 400},
                "data": {
                    "label": G.nodes[node_id]['label'],
                    "description": G.nodes[node_id]['description'],
                    "centrality": centrality.get(node_id, 0)
                }
            })

        rf_edges = []
        for source, target, data in G.edges(data=True):
            rf_edges.append({
                "id": f"e{source}-{target}",
                "source": source,
                "target": target,
                "label": data['label'],
                "animated": True,
                "style": {"stroke": "#6366f1", "strokeWidth": 2}
            })

        print(f"--- 📊 GraphEngine: Generated {len(rf_nodes)} nodes and {len(rf_edges)} edges ---")
        return {"nodes": rf_nodes, "edges": rf_edges}