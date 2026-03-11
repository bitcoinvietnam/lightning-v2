const site = require('./site.json');

module.exports = async function () {
  const ranks = {};

  for (const node of site.nodes) {
    const query = `{ getNode(pubkey: "${node.pubkey}") { graph_info { metrics { capacity_rank channels_rank capacity_rank_change { day } channels_rank_change { day } } } } }`;

    try {
      const res = await fetch('https://api.amboss.space/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const metrics = data?.data?.getNode?.graph_info?.metrics;
      if (metrics) {
        ranks[node.pubkey] = {
          channels: metrics.channels_rank,
          capacity: metrics.capacity_rank,
          channelsChange: metrics.channels_rank_change?.day || 0,
          capacityChange: metrics.capacity_rank_change?.day || 0,
        };
      }
    } catch (e) {
      console.warn(`Failed to fetch ranks for ${node.name}:`, e.message);
    }
  }

  return ranks;
};
