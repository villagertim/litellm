import type { MCPToolset } from "@/components/mcp_tools/types";
import { fetchMCPToolsets } from "@/components/networking";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";
import useAuthorized from "../useAuthorized";

const mcpToolsetKeys = createQueryKeys("mcpToolsets");

export const useMCPToolsets = () => {
  const { accessToken } = useAuthorized();
  return useQuery<MCPToolset[]>({
    queryKey: mcpToolsetKeys.list(),
    queryFn: async () => await fetchMCPToolsets(accessToken!),
    enabled: !!accessToken,
  });
};
