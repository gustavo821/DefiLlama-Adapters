const { request, gql } = require("graphql-request");
const { getBlock } = require('../helper/getBlock')

const { toUSDTBalances } = require('../helper/balances');

const graphUrlMainnet = "https://api.thegraph.com/subgraphs/name/gysr-io/gysr";
const graphUrlPolygon = "https://api.thegraph.com/subgraphs/name/gysr-io/gysr-polygon";
const graphQuery = gql`
query GET_TVL($block: Int) {
  platform(id: "0x0000000000000000000000000000000000000000", block: { number: $block }) {
    tvl
  }
}
`;

async function ethereum(_, _block, cb) {
  const block = await getBlock(_, 'ethereum', cb)
  const { platform } = await request(
    graphUrlMainnet,
    graphQuery,
    {
      block
    }
  );

  // if block is before protocol launched platform will be null
  const tvl = platform ? platform.tvl : '0'

  return toUSDTBalances(tvl);
}

async function polygon(_, ethBlock, chainBlocks) {
  const block = await getBlock(_, 'polygon', chainBlocks)
  const { platform } = await request(
    graphUrlPolygon,
    graphQuery,
    {
      block
    }
  );

  // if block is before protocol launched platform will be null
  const tvl = platform ? platform.tvl : '0'

  return toUSDTBalances(tvl);
}



module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethereum
  },
  polygon: {
    tvl: polygon
  },
}
