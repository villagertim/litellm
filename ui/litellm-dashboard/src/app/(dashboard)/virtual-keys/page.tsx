"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import useTeams from "@/app/(dashboard)/hooks/useTeams";
import useKeyList from "@/components/key_team_helpers/key_list";
import type { Organization } from "@/components/networking";
import UserDashboard from "@/components/user_dashboard";
import { useState } from "react";

const VirtualKeysPage = () => {
  const { accessToken, userRole, userId, premiumUser, userEmail } =
    useAuthorized();
  const { teams, setTeams } = useTeams();
  const [createClicked, setCreateClicked] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const { keys, isLoading, error, pagination, refresh, setKeys } = useKeyList({
    selectedKeyAlias: null,
    currentOrg: null,
    accessToken: accessToken || "",
    createClicked,
  });

  const addKey = (data: any) => {
    setKeys((prevData) => (prevData ? [...prevData, data] : [data]));
    setCreateClicked(() => !createClicked);
  };

  return (
    <UserDashboard
      userID={userId}
      userRole={userRole}
      userEmail={userEmail}
      teams={teams}
      keys={keys}
      setUserRole={() => {}}
      setUserEmail={() => {}}
      setTeams={setTeams}
      setKeys={setKeys}
      premiumUser={premiumUser}
      organizations={organizations}
      addKey={addKey}
      createClicked={createClicked}
    />
  );
};

export default VirtualKeysPage;
