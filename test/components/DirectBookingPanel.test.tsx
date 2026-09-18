// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DirectBookingPanel } from "@/components/booking/DirectBookingPanel";
import { enCopy } from "@/lib/i18n/locales/en";

/**
 * DirectBookingPanel gift-verification behavior.
 *
 * Guards the browser containment: the panel calls the read-only verify route, blocks
 * duplicate in-flight requests, clears stale verification when the code changes, and
 * gives actionable feedback without claiming a provider state it cannot prove.
 */

const copy = enCopy.book.experience.direct;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function renderPanel() {
  return render(
    <DirectBookingPanel
      copy={copy}
      tourName="Alcázar Evening Tour"
      dateLabel="Sat 10 Aug"
      timeLabel="10:00"
      guests={[{ id: "g1", label: "Adult" }]}
      totalLabel="Estimated total: €120"
      whatsappNumber="34600000000"
      requiresId={false}
      locale="en"
      onBack={vi.fn()}
    />,
  );
}

function openGiftAndType(code: string) {
  fireEvent.click(screen.getByRole("button", { name: copy.paymentGift }));
  const input = screen.getByPlaceholderText(copy.giftCodePlaceholder);
  fireEvent.change(input, { target: { value: code } });
  return input;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("DirectBookingPanel gift verification", () => {
  it("shows an eligible result with a formatted balance after verifying", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { eligible: true, maskedCode: "PU-****-****-5E6F", balanceCents: 5000 }),
    );

    renderPanel();
    openGiftAndType("PU-1A2B-3C4D-5E6F");
    fireEvent.click(screen.getByRole("button", { name: copy.giftRedeem }));

    expect(await screen.findByText(copy.giftVerified)).toBeTruthy();
    expect(screen.getByText(copy.giftEligibleNote)).toBeTruthy();
    // €50,00 from 5000 integer cents (es-ES formatting).
    expect(screen.getByText((text) => text.includes("50"))).toBeTruthy();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/parausted/verify");
    expect(init.method).toBe("POST");
  });

  it("prevents duplicate requests while verification is in progress", async () => {
    // Never resolves: keeps the panel in the "checking" state.
    fetchMock.mockReturnValue(new Promise<Response>(() => {}));

    renderPanel();
    openGiftAndType("PU-1A2B-3C4D-5E6F");

    const verifyButton = screen.getByRole("button", { name: copy.giftRedeem });
    fireEvent.click(verifyButton);
    fireEvent.click(screen.getByRole("button", { name: copy.giftChecking }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("clears a prior verified result when the code changes", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { eligible: true, maskedCode: "PU-****-****-5E6F", balanceCents: 5000 }),
    );

    renderPanel();
    const input = openGiftAndType("PU-1A2B-3C4D-5E6F");
    fireEvent.click(screen.getByRole("button", { name: copy.giftRedeem }));

    expect(await screen.findByText(copy.giftVerified)).toBeTruthy();

    fireEvent.change(input, { target: { value: "PU-9999-9999-9999" } });

    await waitFor(() => {
      expect(screen.queryByText(copy.giftVerified)).toBeNull();
    });
  });

  it("rejects a malformed code locally with a format-specific message", async () => {
    renderPanel();
    openGiftAndType("not a code!");
    fireEvent.click(screen.getByRole("button", { name: copy.giftRedeem }));

    expect(
      await screen.findByText("Enter a valid gift card code and try again."),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains the possible states when a valid-looking code is rejected", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { eligible: false }));

    renderPanel();
    openGiftAndType("PU-1A2B-3C4D-5E6F");
    fireEvent.click(screen.getByRole("button", { name: copy.giftRedeem }));

    expect(
      await screen.findByText(
        "This gift card is not active. The code may be incorrect, expired, or already redeemed.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText(copy.giftVerified)).toBeNull();
  });
});
