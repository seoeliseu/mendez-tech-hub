import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CardGrid, Card } from "./CardGrid";
describe("CardGrid", () => {
  it("renders cards", () => {
    render(<CardGrid cols={3}><Card title="A">x</Card><Card title="B">y</Card></CardGrid>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
