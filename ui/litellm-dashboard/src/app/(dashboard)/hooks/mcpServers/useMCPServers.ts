import type { MCPServer } from "@/components/mcp_tools/types";
import { fetchMCPServers } from "@/components/networking";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";
import useAuthorized from "../useAuthorized";

const mcpServersKeys = createQueryKeys("mcpServers");

export const useMCPServers = (teamId?: string | null) => {
  const { accessToken } = useAuthorized();
  return useQuery<MCPServer[]>({
    queryKey: mcpServersKeys.list(teamId ? { filters: { teamId } } : undefined),
    queryFn: async () => await fetchMCPServers(accessToken!, teamId),
    enabled: !!accessToken,
  });
};
