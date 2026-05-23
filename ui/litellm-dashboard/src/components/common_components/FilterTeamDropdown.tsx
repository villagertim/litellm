import type React from "react";
import type { FilterOptionCustomComponentProps } from "../molecules/filter";
import TeamDropdown from "./team_dropdown";

const FilterTeamDropdown: React.FC<FilterOptionCustomComponentProps> = ({
  value,
  onChange,
}) => <TeamDropdown value={value} onChange={onChange} />;

export default FilterTeamDropdown;
