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

import TisShowcasePage from "@/app/[locale]/tis-showcase/page";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  notFoundMock.mockClear();
});

describe("TIS showcase route boundary", () => {
  it("blocks production access before rendering the launcher", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      TisShowcasePage({ params: Promise.resolve({ locale: "en" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  it("renders the launcher in development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const page = await TisShowcasePage({ params: Promise.resolve({ locale: "en" }) });
    render(page as ReactElement);

    expect(screen.getByRole("heading", { name: "TIS Showcase Launcher" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});