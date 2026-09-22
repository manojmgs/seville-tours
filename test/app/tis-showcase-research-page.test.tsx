// @vitest-environment jsdom
import type { ReactElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RESEARCH_BANNER, RESEARCH_PROHIBITED_CLAIMS } from "@/lib/marco/research/claims";
import { DEMO1_QUESTIONS } from "@/lib/marco/research/demo1-state";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import SevilleToursResearchPage from "@/app/[locale]/tis-showcase/seville-tours-research/page";

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  notFoundMock.mockClear();
});

async function renderResearchRoute(locale = "en") {
  vi.stubEnv("NODE_ENV", "development");
  const page = await SevilleToursResearchPage({ params: Promise.resolve({ locale }) });
  render(page as ReactElement);
}

/** The whole required conversation: language first, then four more taps. */
function runDemo1Conversation() {
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  fireEvent.click(screen.getByRole("button", { name: "Two of us, a relative may join" }));
  fireEvent.click(screen.getByRole("button", { name: "We have specific dates" }));
  fireEvent.click(screen.getByRole("button", { name: "History" }));
  fireEvent.click(screen.getByRole("button", { name: "Local food" }));
  fireEvent.click(screen.getByRole("button", { name: "Day trips" }));
  fireEvent.click(screen.getByRole("button", { name: "That's everything" }));
  fireEvent.click(screen.getByRole("button", { name: "Private, if available" }));
}

async function openDemo1() {
  await renderResearchRoute();
  fireEvent.click(screen.getByRole("button", { name: /Demo 1: From a WhatsApp question/ }));
}

describe("Seville Tours research route boundary", () => {
  it("blocks production access before rendering anything", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      SevilleToursResearchPage({ params: Promise.resolve({ locale: "en" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  it("renders the presenter menu with all three demos and never auto-advances", async () => {
    await renderResearchRoute();

    expect(screen.getByText(RESEARCH_BANNER)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Demo 1: From a WhatsApp question/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Demo 2: Four-day private journey/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Demo 3: Gift, remember, refer and return/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset all" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Demo 1 ·/ })).toBeNull();
  });

  it("shows the recording-pack and questionnaire paths without navigating away", async () => {
    await renderResearchRoute();

    fireEvent.click(screen.getByRole("button", { name: "Open recording script" }));
    expect(screen.getByText(/seville-tours-carlos-demo-recording-pack-2026-09\.md/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Questionnaire placeholder" }));
    expect(screen.getByText(/seville-tours-carlos-questionnaire-spec-2026-09\.md/)).toBeTruthy();
  });

  it("performs no fetch while the demo is driven", async () => {
    await openDemo1();
    runDemo1Conversation();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("resets Demo 1 back to its deterministic start", async () => {
    await openDemo1();
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.queryByRole("button", { name: "English" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));
    fireEvent.click(screen.getByRole("button", { name: /Demo 1: From a WhatsApp question/ }));

    expect(screen.getByRole("button", { name: "English" })).toBeTruthy();
  });
});

describe("Demo 1 conversation shape", () => {
  it("asks five questions, starting with language", async () => {
    await openDemo1();

    expect(DEMO1_QUESTIONS).toHaveLength(5);
    expect(DEMO1_QUESTIONS[0].slot).toBe("language");
    expect(screen.getByText("Which language would you like this in?")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Español" })).toBeTruthy();
  });

  it("reaches the options in five answers, without asking anything else", async () => {
    await openDemo1();
    runDemo1Conversation();

    expect(screen.getByRole("heading", { name: /Journey Brief · reviewed by the traveller/ })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What operators publish" })).toBeTruthy();
    expect(screen.getByText("You can stop here. Nothing above is required.")).toBeTruthy();
  });

  it("offers further detail instead of demanding it", async () => {
    await openDemo1();
    runDemo1Conversation();

    expect(screen.getByText("Anything else worth knowing? Only if you want to.")).toBeTruthy();
    expect(screen.queryByText("We only have one free afternoon")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "We only have one free afternoon" }));
    expect(screen.getAllByText("We only have one free afternoon").length).toBeGreaterThan(1);
  });

  it("runs inside the two-pane window with an honest status line", async () => {
    await openDemo1();

    expect(screen.getByText("Marco")).toBeTruthy();
    expect(screen.getByText("Local operator knowledge. Not the open web.")).toBeTruthy();
    expect(screen.getByText(/nothing saved yet · nothing booked · nothing sent/)).toBeTruthy();
  });
});

describe("Demo 1 catalogue and operator choice", () => {
  it("shows operator-published possibilities with price basis and what was not checked", async () => {
    await openDemo1();
    runDemo1Conversation();

    expect(screen.getByText("Seville Alcázar Guided Tour")).toBeTruthy();
    expect(screen.getAllByText(/per person/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Why this appeared:/).length).toBe(3);
    expect(screen.getAllByText("Not checked").length).toBe(3);
  });

  it("spans more than one operator and says so", async () => {
    await openDemo1();
    runDemo1Conversation();

    expect(screen.getByText(/These come from 2 different operators/)).toBeTruthy();
    expect(screen.getAllByText(/shown with the operator's permission/).length).toBeGreaterThan(0);
  });

  it("lets the traveller choose the operator before any contact detail is asked", async () => {
    await openDemo1();
    runDemo1Conversation();

    expect(screen.getByText("Pick an operator first. Nothing is sent either way.")).toBeTruthy();
    expect(screen.queryByLabelText("Email")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Áloratur" }));
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByText("Áloratur needs a way to reply.")).toBeTruthy();
  });

  it("asks for contact details only at the point of sending, and still sends nothing", async () => {
    await openDemo1();
    runDemo1Conversation();
    fireEvent.click(screen.getByRole("button", { name: "Seville Tours Co." }));

    const submit = screen.getByRole("button", { name: "Prepare the enquiry" });
    expect((submit as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText("Phone or WhatsApp (optional)"), { target: { value: "600000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Prepare the enquiry" }));

    expect(screen.getByText("Enquiry prepared for Seville Tours Co.")).toBeTruthy();
    expect(
      screen.getByText("Demonstration only — no message left this browser and no operator has been contacted."),
    ).toBeTruthy();
    expect(screen.getByText(/enquiry prepared/)).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("keeps off-catalogue asks as questions and never turns them into products", async () => {
    await openDemo1();
    runDemo1Conversation();
    fireEvent.click(screen.getByRole("button", { name: "Airport pickup" }));

    expect(screen.getByRole("heading", { name: "Things no operator has published" })).toBeTruthy();
    expect(screen.getByText("I do not have these in any catalogue here, so I will not invent one.")).toBeTruthy();
    expect(screen.getByText("A private driver for a day")).toBeTruthy();
  });

  it("makes no unsupported positive claim anywhere in Demo 1", async () => {
    await openDemo1();
    runDemo1Conversation();
    fireEvent.click(screen.getAllByRole("button", { name: "Save as a possibility" })[0]);

    const rendered = document.body.textContent ?? "";
    for (const claim of RESEARCH_PROHIBITED_CLAIMS) {
      expect(rendered).not.toContain(claim);
    }
  });

  it("renders no remote image", async () => {
    await openDemo1();
    runDemo1Conversation();

    expect(document.querySelectorAll("img").length).toBe(0);
  });
});
