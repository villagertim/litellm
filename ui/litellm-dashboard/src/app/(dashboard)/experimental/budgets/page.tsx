"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import BudgetPanel from "@/components/budgets/budget_panel";

const BudgetsPage = () => {
  const { accessToken } = useAuthorized();

  return <BudgetPanel accessToken={accessToken} />;
};

export default BudgetsPage;
