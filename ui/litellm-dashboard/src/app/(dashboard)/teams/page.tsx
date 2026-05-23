"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import useTeams from "@/app/(dashboard)/hooks/useTeams";
import TeamsView from "@/app/(dashboard)/teams/TeamsView";
import type { Organization } from "@/components/networking";
import { fetchOrganizations } from "@/components/organizations";
import { useEffect, useState } from "react";

const TeamsPage = () => {
  const { accessToken, userId, userRole } = useAuthorized();
  const { teams, setTeams } = useTeams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    fetchOrganizations(accessToken, setOrganizations).then(() => {});
  }, [accessToken]);

  return (
    <TeamsView
      teams={teams}
      accessToken={accessToken}
      setTeams={setTeams}
      userID={userId}
      userRole={userRole}
      organizations={organizations}
    />
  );
};

export default TeamsPage;
