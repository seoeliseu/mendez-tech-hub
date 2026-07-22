import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Pipeline } from "./Pipeline";
import { FlowDiagram } from "./FlowDiagram";
import { ThreadTimeline } from "./ThreadTimeline";
describe("diagrams", () => {
  it("Pipeline renders steps + arrows", () => {
    render(<Pipeline steps={[{ label: "Request", note: "HTTP", kind: "req" }, { label: "Auth", note: "token" }]} />);
    expect(screen.getByText("Request")).toBeInTheDocument();
    expect(screen.getByText("Auth")).toBeInTheDocument();
  });
  it("FlowDiagram renders boxes", () => {
    render(<FlowDiagram rows={[{ box: "T1", note: "runs" }]} />);
    expect(screen.getByText("T1")).toBeInTheDocument();
  });
  it("ThreadTimeline renders labels", () => {
    render(<ThreadTimeline threads={[{ label: "Thread 1", bars: [{ w: 120, kind: "work" }] }]} />);
    expect(screen.getByText("Thread 1")).toBeInTheDocument();
  });
});
