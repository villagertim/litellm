import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import type { AgentsResponse } from "@/components/agents/types";
import { getAgentsList } from "@/components/networking";
import { all_admin_roles } from "@/utils/roles";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";

const agentsKeys = createQueryKeys("agents");

export const useAgents = () => {
  const { accessToken, userRole } = useAuthorized();
  return useQuery<AgentsResponse>({
    queryKey: agentsKeys.list({}),
    queryFn: async () => await getAgentsList(accessToken!),
    enabled: Boolean(accessToken) && all_admin_roles.includes(userRole || ""),
  });
};
