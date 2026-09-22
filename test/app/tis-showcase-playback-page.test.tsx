// @vitest-environment jsdom
import type { ReactElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import TisTravellerPlaybackPage from "@/app/[locale]/tis-showcase/playback/page";

/** Claims the playback must never make. Bounded negatives share the words and must survive. */
const PROHIBITED_CLAIMS = [
  "Booking confirmed",
  "Available now",
  "Order completed",
  "Voucher redeemed",
  "Price confirmed",
];

/** Drives the traveller flow to the deciding phase, where gift card and shelf both live. */
async function renderDecidingPhase(locale = "en") {
  vi.stubEnv("NODE_ENV", "development");

  const page = await TisTravellerPlaybackPage({ params: Promise.resolve({ locale }) });
  render(page as ReactElement);

  fireEvent.click(screen.getByRole("button", { name: "Just me" }));
  fireEvent.click(screen.getByRole("button", { name: "Not decided yet" }));
  fireEvent.click(screen.getByRole("button", { name: "A small group is fine" }));
  fireEvent.click(screen.getByRole("button", { name: "History" }));
  fireEvent.click(screen.getByRole("button", { name: "That's everything" }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  notFoundMock.mockClear();
});

describe("TIS traveller playback route boundary", () => {
  it("blocks production access before rendering playback", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      TisTravellerPlaybackPage({ params: Promise.resolve({ locale: "en" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  it("renders the playback in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const page = await TisTravellerPlaybackPage({ params: Promise.resolve({ locale: "en" }) });
    render(page as ReactElement);

    expect(screen.getByRole("heading", { name: "A Journey Brief, built by the traveller" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Your conversation with Marco" })).toBeTruthy();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("opens the tour-matched operator shelf inline after the traveller choices", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const page = await TisTravellerPlaybackPage({ params: Promise.resolve({ locale: "en" }) });
    render(page as ReactElement);

    fireEvent.click(screen.getByRole("button", { name: "Just me" }));
    fireEvent.click(screen.getByRole("button", { name: "Not decided yet" }));
    fireEvent.click(screen.getByRole("button", { name: "A small group is fine" }));
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    fireEvent.click(screen.getByRole("button", { name: "That's everything" }));
    fireEvent.click(screen.getByRole("button", { name: "Take something home" }));

    expect(screen.getByRole("heading", { name: "Seville Tours Co.'s shelf" })).toBeTruthy();
    expect(screen.getByText("Alcázar tour gift card")).toBeTruthy();
    expect(screen.getByText(/365 days validity/)).toBeTruthy();
    expect(screen.getAllByText("Sample shelf for this demonstration. Not yet approved by the operator.").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Open gift card" }).getAttribute("href")).toContain(
      "/gift-cards/c1965108-bff7-479e-95a7-825983e50515",
    );
    expect(screen.getByText("Nothing ordered yet.")).toBeTruthy();
  });

  it("keeps the gift-card panel available in the deciding phase", async () => {
    await renderDecidingPhase();

    expect(screen.getByRole("heading", { name: "Gift cards and keepsakes" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "See gift cards on ParaUsted" }).getAttribute("href")).toContain(
      "/m/seville-tours-co",
    );
  });

  it("keeps the shelf closed until the traveller asks for it, and does not replace the gift-card panel", async () => {
    await renderDecidingPhase();

    expect(screen.queryByRole("heading", { name: "Seville Tours Co.'s shelf" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Take something home" }));

    expect(screen.getByRole("heading", { name: "Seville Tours Co.'s shelf" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Gift cards and keepsakes" })).toBeTruthy();
  });

  it("creates no order, booking, request or unsupported claim when the shelf opens", async () => {
    await renderDecidingPhase();

    const statusBefore = screen.getAllByText(/^Trip Plan ·/).map((node) => node.textContent);
    fireEvent.click(screen.getByRole("button", { name: "Take something home" }));

    expect(screen.getAllByText(/^Trip Plan ·/).map((node) => node.textContent)).toEqual(statusBefore);
    expect(screen.getAllByText(/nothing saved yet · nothing booked/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/nothing sent/).length).toBeGreaterThan(0);
    expect(screen.getByText("Nothing ordered yet.")).toBeTruthy();

    const rendered = document.body.textContent ?? "";
    for (const claim of PROHIBITED_CLAIMS) {
      expect(rendered).not.toContain(claim);
    }
  });

  it("closes the shelf and leaves the operator view when the traveller starts over", async () => {
    await renderDecidingPhase();

    fireEvent.click(screen.getByRole("button", { name: "Take something home" }));
    fireEvent.click(screen.getByRole("button", { name: "View as operator" }));
    expect(screen.getByRole("button", { name: "Back to traveller" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Start over" }));

    expect(screen.getByRole("button", { name: "View as operator" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Seville Tours Co.'s shelf" })).toBeNull();
  });

  it("passes the route locale to the shelf without claiming a translated playback", async () => {
    await renderDecidingPhase("es");

    fireEvent.click(screen.getByRole("button", { name: "Take something home" }));

    expect(screen.getByRole("heading", { name: "La estantería de Seville Tours Co." })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "A Journey Brief, built by the traveller" })).toBeTruthy();
  });
});
