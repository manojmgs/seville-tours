// @vitest-environment jsdom
import type { ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import TisTravellerPlaybackPage from "@/app/[locale]/tis-showcase/playback/page";

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
});