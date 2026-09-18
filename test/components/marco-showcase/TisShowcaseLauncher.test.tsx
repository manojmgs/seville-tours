// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TisShowcaseLauncher } from "@/components/marco-showcase/TisShowcaseLauncher";
import { TIS_SCENARIO_FIXTURES } from "@/lib/marco/showcase/tis-scenarios";

afterEach(cleanup);

describe("TisShowcaseLauncher", () => {
  it("renders exactly five scenarios with presenter-friendly status and summaries", () => {
    render(<TisShowcaseLauncher />);

    expect(screen.getByRole("heading", { name: "TIS Showcase Launcher" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    for (const fixture of TIS_SCENARIO_FIXTURES) {
      expect(screen.getByRole("radio", { name: fixture.displayName })).toBeTruthy();
      expect(screen.getAllByText(fixture.travellerMessage).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText("Staged for TIS")).toHaveLength(5);
    expect(screen.getAllByText("Existing working foundation").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Controlled TIS demonstration").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Requires approved source snapshot").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Future production capability").length).toBeGreaterThan(0);
  });

  it("allows every scenario to be selected and exposes its read-only details", () => {
    render(<TisShowcaseLauncher />);

    for (const fixture of TIS_SCENARIO_FIXTURES) {
      const radio = screen.getByRole("radio", { name: fixture.displayName });
      fireEvent.click(radio);
      expect(radio.getAttribute("aria-checked")).toBe("true");
      expect(screen.getByRole("heading", { name: fixture.displayName })).toBeTruthy();
      expect(screen.getByText("Recognised context")).toBeTruthy();
      expect(screen.getByText("Allowed traveller actions")).toBeTruthy();
      expect(screen.getByText("Claims this rehearsal must avoid")).toBeTruthy();
      expect(screen.getByText("Source snapshot status")).toBeTruthy();
    }
  });

  it("shows material questions only for scenarios that define them", () => {
    render(<TisShowcaseLauncher />);

    expect(screen.queryByText("One material question")).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Custom private Seville direction" }));
    expect(screen.getAllByText("What date or date range will you be in Seville?")).toHaveLength(2);

    fireEvent.click(screen.getByRole("radio", { name: "Journey Watch official event" }));
    expect(screen.getAllByText("Which event themes matter most to you?")).toHaveLength(2);
  });

  it("keeps the event rehearsal visibly staged until an approved real event exists", () => {
    render(<TisShowcaseLauncher />);
    fireEvent.click(screen.getByRole("radio", { name: "Journey Watch official event" }));

    expect(screen.getAllByText("Future production capability").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Approved event snapshot required before external demonstration").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Requires confirmation/)).toBeTruthy();
  });

  it("does not expose contact or price data and performs no external or booking action", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<TisShowcaseLauncher />);

    expect(document.body.textContent).not.toMatch(/mailto:|tel:|whatsapp|@\w|€|\$|£/i);
    for (const radio of screen.getAllByRole("radio")) fireEvent.click(radio);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    openSpy.mockRestore();
  });

  it("supports keyboard selection with a visible focusable radio control", () => {
    render(<TisShowcaseLauncher />);
    const radio = screen.getByRole("radio", { name: "Journey Watch official event" });

    radio.focus();
    fireEvent.keyDown(radio, { key: " " });

    expect(document.activeElement).toBe(radio);
    expect(radio.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("heading", { name: "Journey Watch official event" })).toBeTruthy();
  });
});