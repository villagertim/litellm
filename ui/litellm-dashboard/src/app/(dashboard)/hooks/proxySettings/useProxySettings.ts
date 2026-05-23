import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { fetchProxySettings } from "@/utils/proxyUtils";
import { useEffect, useState } from "react";

export default function useProxySettings() {
  const { accessToken } = useAuthorized();
  const [proxySettings, setProxySettings] = useState({
    PROXY_BASE_URL: "",
    PROXY_LOGOUT_URL: "",
    LITELLM_UI_API_DOC_BASE_URL: null as string | null,
  });

  useEffect(() => {
    if (!accessToken) return;
    fetchProxySettings(accessToken).then((settings) => {
      if (settings) setProxySettings(settings);
    });
  }, [accessToken]);

  return proxySettings;
}
