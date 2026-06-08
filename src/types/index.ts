export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MerchantBusiness {
  _id: string;
  tradingName: string;
  legalName: string;
  category: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  province: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
  description?: string;
  coordinates?: { lat: number; lng: number };
  accountStatus: "pending" | "active" | "suspended" | "need_more_info";
  website?: string;
  address?: string;
  postalCode?: string;
  businessType?: string;
  yearEstablished?: number;
  openingHours?: Record<string, { open: boolean; openTime: string; closeTime: string }>;
  contactName?: string;
  contactRole?: string;
  preferredContactMethod?: string;
  billingEmail?: string;
  initialOfferIdea?: string;
  referralSource?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileProgressStep {
  completed: boolean;
  skipped: boolean;
}

export interface ProfileProgress {
  steps: {
    logo: ProfileProgressStep;
    description: ProfileProgressStep;
    coordinates: ProfileProgressStep;
  };
  resumeStep: "logo" | "description" | "coordinates" | "complete";
  overallStatus: "incomplete" | "complete";
}

export type OfferType =
  | "percentage_discount"
  | "fixed_amount_discount"
  | "buy_x_get_y"
  | "happy_hour"
  | "bundle_offer"
  | "free_item_with_purchase"
  | "minimum_spend"
  | "member_loyalty"
  | "limited_time"
  | "category_specific";

export type OfferStatus = "draft" | "active" | "paused" | "expired";

export interface Offer {
  _id: string;
  merchantBusinessId: string;
  offerType: OfferType;
  title: string;
  shortDescription: string;
  status: OfferStatus;
  validFrom: string;
  validTo: string;
  discountValue?: number;
  discountUnit?: "percent" | "dollars";
  buyQuantity?: number;
  getQuantity?: number;
  happyHourStart?: string;
  happyHourEnd?: string;
  happyHourDays?: string[];
  bundleItems?: string;
  bundlePrice?: number;
  freeItemDescription?: string;
  minimumSpendAmount?: number;
  loyaltyPointsMultiplier?: number;
  limitedTimeDescription?: string;
  categoryName?: string;
  terms?: string;
  exclusions?: string;
  availableDays?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferTemplate {
  type: OfferType;
  label: string;
  emoji: string;
  requiredFieldsForActivation: string[];
}

export interface OfferCounts {
  active: number;
  draft: number;
  paused: number;
  expired: number;
}

export interface DashboardData {
  business: MerchantBusiness;
  offerCounts: OfferCounts;
  profileProgress: ProfileProgress;
  applicationStatus: string;
  sharedAdminNotes?: string;
  latestOffers: Offer[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  fields?: Record<string, string>;
}

export interface RegisterPayload {
  businessLegalName: string;
  tradingName: string;
  category: string;
  businessType: string;
  yearEstablished: number;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  preferredContactMethod: string;
  billingEmail: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  website?: string;
  openingHours?: Record<string, { open: boolean; openTime: string; closeTime: string }>;
  initialOfferIdea?: string;
  referralSource?: string;
  logoUrl?: string;
  coverPhotoUrl?: string;
  password: string;
  confirmPassword: string;
  agreementConfirmed: boolean;
}

export interface RegisterResponse {
  merchantBusinessId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  resumeStep: string;
}
