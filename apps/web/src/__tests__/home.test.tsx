import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "../app/page";

// Mock next/navigation since Home uses client-side only features
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Home Page", () => {
  it("renders the Acte title", () => {
    render(<Home />);
    expect(screen.getByText("Acte")).toBeInTheDocument();
  });

  it("renders the Monorepo Demo subtitle", () => {
    render(<Home />);
    expect(screen.getByText("Monorepo Demo")).toBeInTheDocument();
  });

  it("shows the loading state initially", () => {
    render(<Home />);
    expect(screen.getByText("API'ye bağlanıyor...")).toBeInTheDocument();
  });
});
