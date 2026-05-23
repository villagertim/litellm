import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import {
  type CredentialsResponse,
  credentialListCall,
} from "@/components/networking";
import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";

const credentialsKeys = createQueryKeys("credentials");

export const useCredentials = () => {
  const { accessToken } = useAuthorized();
  return useQuery<CredentialsResponse>({
    queryKey: credentialsKeys.list({}),
    queryFn: async () => await credentialListCall(accessToken!),
    enabled: Boolean(accessToken),
  });
};
