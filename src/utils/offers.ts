import type { Offer } from "../types";

/**
 * Returns true when an offer has any "advanced/optional" content filled in.
 * Keep this in sync with the fields shown in OfferEditor's advanced collapsible section.
 * Used by the future consumer-facing offer tile to decide whether to show an expand affordance.
 */
export function hasAdvancedContent(offer: Partial<Offer>): boolean {
  return !!(
    offer.termsAndConditions ||
    offer.exclusions ||
    offer.redemptionLimit != null ||
    (offer.availableDays && offer.availableDays.length > 0) ||
    offer.contactEmail ||
    offer.contactPhone
  );
}
