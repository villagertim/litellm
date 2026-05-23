import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { OnboardingErrorView } from "./OnboardingErrorView";

describe("OnboardingErrorView", () => {
  it("should show the failed to load invitation message", () => {
    render(<OnboardingErrorView />);
    expect(screen.getByText("Failed to load invitation")).toBeInTheDocument();
  });

  it("should show the expiry description", () => {
    render(<OnboardingErrorView />);
    expect(
      screen.getByText("The invitation link may be invalid or expired."),
    ).toBeInTheDocument();
  });

  it("should render a Back to Login link pointing to /ui/login", () => {
    render(<OnboardingErrorView />);
    // antd Button with href renders as an <a> element
    const link = screen.getByRole("link", { name: "Back to Login" });
    expect(link).toHaveAttribute("href", "/ui/login");
  });
});
