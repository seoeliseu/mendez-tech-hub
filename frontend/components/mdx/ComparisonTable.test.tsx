import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComparisonTable } from "./ComparisonTable";
describe("ComparisonTable", () => {
  it("renders head and rows", () => {
    render(<ComparisonTable head={["Padrão", "Resolve"]} rows={[["Retry", "falha transitória"]]} />);
    expect(screen.getByText("Padrão")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});
