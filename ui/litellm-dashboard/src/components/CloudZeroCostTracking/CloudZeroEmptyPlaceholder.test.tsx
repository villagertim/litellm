import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CloudZeroEmptyPlaceholder from "./CloudZeroEmptyPlaceholder";

describe("CloudZeroEmptyPlaceholder", () => {
  it("should render", () => {
    const startCreation = vi.fn();
    render(<CloudZeroEmptyPlaceholder startCreation={startCreation} />);

    expect(
      screen.getByText("No CloudZero Integration Found"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Connect your CloudZero account/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add CloudZero Integration" }),
    ).toBeInTheDocument();
  });
});
