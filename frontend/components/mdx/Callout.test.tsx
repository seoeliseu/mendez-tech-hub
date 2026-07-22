import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Callout } from "./Callout";

describe("Callout", () => {
  it("renders children and warn styling", () => {
    render(<Callout type="warn"><strong>Cuidado</strong> texto</Callout>);
    expect(screen.getByText("Cuidado")).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveAttribute("data-type", "warn");
  });
});
