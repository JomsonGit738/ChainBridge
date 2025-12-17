import { GraphQLClient, gql } from "graphql-request";

export type ActivityRow = {
  id: string;
  timestamp?: string | number | null;
  txHash?: string | null;
};

export const ACTIVITY_QUERY = gql`
  query Activity {
    items: transfers(first: 20, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      txHash
    }
  }
`;

export async function fetchActivity(endpoint: string): Promise<ActivityRow[]> {
  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request<{ items?: ActivityRow[] }>(ACTIVITY_QUERY);
    if (!data?.items) {
      throw new Error("No 'items' field returned. Adjust ACTIVITY_QUERY to your schema.");
    }
    return data.items;
  } catch (err: any) {
    throw new Error(err?.message || "Unknown GraphQL error");
  }
}

export const mockActivity: ActivityRow[] = [
  {
    id: "demo-1",
    timestamp: Math.floor(Date.now() / 1000).toString(),
    txHash: "0x51f3ad0cd5548a5c306bbd0cabcd935c9c9b5ad2bb1f5e88bb0c1ce10a000001"
  },
  {
    id: "demo-2",
    timestamp: Math.floor(Date.now() / 1000 - 120).toString(),
    txHash: "0x7e9fbd0cd5548a5c306bbd0cabcd935c9c9b5ad2bb1f5e88bb0c1ce10a000002"
  },
  {
    id: "demo-3",
    timestamp: Math.floor(Date.now() / 1000 - 260).toString(),
    txHash: "0x9acfad0cd5548a5c306bbd0cabcd935c9c9b5ad2bb1f5e88bb0c1ce10a000003"
  }
];
