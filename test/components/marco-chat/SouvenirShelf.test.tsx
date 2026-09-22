// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SouvenirShelf } from "@/components/marco-chat/SouvenirShelf";
import { shelfForOperator } from "@/lib/marco/souvenirs";
import { PARAUSTED_ALCAZAR_FIXED_GIFT_CARD } from "@/lib/parausted/gift-cards";

/**
 * Claims the shelf must never make. Bounded negatives such as "Nothing ordered
 * yet." use the same words and are required, so we assert the claim, never the word.
 */
const PROHIBITED_CLAIMS = [
  "Booking confirmed",
  "Available now",
  "Order completed",
  "Voucher redeemed",
  "Price confirmed",
];

const SAMPLE_DISCLOSURE_EN = "Sample shelf for this demonstration. Not yet approved by the operator.";

function renderShelf(locale = "en") {
  const shelf = shelfForOperator("seville-tours-co");
  if (!shelf) throw new Error("Seville Tours Co. shelf is missing");

  return render(
    <SouvenirShelf
      shelf={shelf}
      tourId="alcazar"
      giftProviderName="ParaUsted"
      accentColor="#d8b45a"
      primaryColor="#1a3a2a"
      locale={locale}
    />,
  );
}

afterEach(cleanup);

describe("SouvenirShelf boundaries", () => {
  it("leads with the operator-approved gift card and deep-links to the ParaUsted product", () => {
    renderShelf();

    expect(screen.getByRole("heading", { name: "Seville Tours Co.'s shelf" })).toBeTruthy();
    expect(screen.getByText("Alcázar tour gift card")).toBeTruthy();
    expect(screen.getByText(/365 days validity/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open gift card" }).getAttribute("href")).toContain(
      `/m/seville-tours-co/gift-cards/${PARAUSTED_ALCAZAR_FIXED_GIFT_CARD.giftCardId}`,
    );
  });

  it("discloses sample products and never labels the approved gift card as a sample", () => {
    renderShelf();

    const disclosures = screen.getAllByText(SAMPLE_DISCLOSURE_EN);
    expect(disclosures.length).toBeGreaterThan(0);

    const giftCardEntry = screen.getByText("Alcázar tour gift card").closest("li");
    expect(giftCardEntry).toBeTruthy();
    expect(giftCardEntry?.textContent).not.toContain(SAMPLE_DISCLOSURE_EN);
  });

  it("makes no unsupported positive claim, before or after choosing options", () => {
    renderShelf();

    const [firstOptions] = screen.getAllByRole("button", { name: "Choose options" });
    fireEvent.click(firstOptions);
    fireEvent.click(screen.getByRole("button", { name: "A3" }));

    const rendered = document.body.textContent ?? "";
    for (const claim of PROHIBITED_CLAIMS) {
      expect(rendered).not.toContain(claim);
    }
  });

  it("keeps the nothing-ordered footer after a variant is chosen", () => {
    renderShelf();

    const [firstOptions] = screen.getAllByRole("button", { name: "Choose options" });
    fireEvent.click(firstOptions);
    fireEvent.click(screen.getByRole("button", { name: "A3" }));

    expect(screen.getByText("Nothing ordered yet.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /order|checkout|pay/i })).toBeNull();
  });

  it("renders the Spanish shelf copy when the route locale is Spanish", () => {
    renderShelf("es");

    expect(screen.getByRole("heading", { name: "La estantería de Seville Tours Co." })).toBeTruthy();
    expect(screen.getByText("Todavía no has pedido nada.")).toBeTruthy();
  });
});
