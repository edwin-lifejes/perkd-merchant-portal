import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Spinner from "../components/ui/Spinner";
import { getOffer, createOffer, updateOffer } from "../services/offers";
import type { Offer, OfferType } from "../types";

// ── Offer type catalogue ────────────────────────────────────────────────────

interface OfferTypeDef {
  type: OfferType;
  emoji: string;
  label: string;
  description: string;
  extraFields: string[];
}

const OFFER_TYPES: OfferTypeDef[] = [
  {
    type: "percentage_discount",
    emoji: "🏷️",
    label: "Percentage Discount",
    description: "e.g. 20% off your total bill",
    extraFields: ["discountValue"],
  },
  {
    type: "fixed_amount_discount",
    emoji: "💰",
    label: "Fixed Amount Off",
    description: "e.g. $10 off any purchase",
    extraFields: ["discountValue"],
  },
  {
    type: "buy_x_get_y",
    emoji: "🛒",
    label: "Buy X Get Y",
    description: "e.g. Buy 2 get 1 free",
    extraFields: ["buyQuantity", "getQuantity"],
  },
  {
    type: "happy_hour",
    emoji: "⏰",
    label: "Happy Hour",
    description: "Time-limited deals on specific days",
    extraFields: ["happyHourStart", "happyHourEnd", "happyHourDays"],
  },
  {
    type: "bundle_offer",
    emoji: "📦",
    label: "Bundle Deal",
    description: "e.g. Lunch combo for $15",
    extraFields: ["bundleItems", "bundlePrice"],
  },
  {
    type: "free_item_with_purchase",
    emoji: "🎁",
    label: "Free Item with Purchase",
    description: "e.g. Free dessert with main course",
    extraFields: ["freeItemDescription"],
  },
  {
    type: "minimum_spend",
    emoji: "💳",
    label: "Minimum Spend",
    description: "e.g. 15% off when you spend $50+",
    extraFields: ["minimumSpendAmount", "discountValue"],
  },
  {
    type: "member_loyalty",
    emoji: "⭐",
    label: "Member Loyalty",
    description: "Exclusive deal for Perkd members",
    extraFields: ["loyaltyPointsMultiplier"],
  },
  {
    type: "limited_time",
    emoji: "🔥",
    label: "Limited Time Offer",
    description: "Create urgency with a time-boxed deal",
    extraFields: ["limitedTimeDescription"],
  },
  {
    type: "category_specific",
    emoji: "🗂️",
    label: "Category Specific",
    description: "e.g. 25% off all appetisers",
    extraFields: ["categoryName", "discountValue"],
  },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ── Helpers ─────────────────────────────────────────────────────────────────

function toDateInputValue(isoString?: string): string {
  if (!isoString) return "";
  return isoString.substring(0, 10);
}

// ── Component ────────────────────────────────────────────────────────────────

const OfferEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [editorStep, setEditorStep] = useState<1 | 2>(isEdit ? 2 : 1);
  const [selectedType, setSelectedType] = useState<OfferType | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<Offer>>({
    availableDays: [],
    happyHourDays: [],
  });

  useEffect(() => {
    if (isEdit && id) {
      getOffer(id)
        .then((offer) => {
          setSelectedType(offer.offerType);
          setForm({
            ...offer,
            validFrom: toDateInputValue(offer.validFrom),
            validTo: toDateInputValue(offer.validTo),
          });
        })
        .catch(() => toast.error("Failed to load offer."))
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit]);

  const handleTypeSelect = (type: OfferType) => {
    setSelectedType(type);
    setForm((f) => ({ ...f, offerType: type }));
    setEditorStep(2);
  };

  const setField = (key: keyof Offer, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleDay = (day: string, field: "availableDays" | "happyHourDays") => {
    setForm((f) => {
      const current = (f[field] as string[]) ?? [];
      return {
        ...f,
        [field]: current.includes(day)
          ? current.filter((d) => d !== day)
          : [...current, day],
      };
    });
  };

  const handleSave = async (activate: boolean) => {
    if (!selectedType) return;
    setIsSaving(true);
    try {
      const payload = { ...form, offerType: selectedType, activate };
      if (isEdit && id) {
        await updateOffer(id, payload);
      } else {
        await createOffer(payload);
      }
      toast.success(activate ? "Offer activated!" : "Offer saved as draft.");
      navigate("/offers");
    } catch (err: any) {
      const data = err?.response?.data;
      toast.error(data?.message ?? "Failed to save offer.");
    } finally {
      setIsSaving(false);
    }
  };

  const typeDef = OFFER_TYPES.find((t) => t.type === selectedType);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-loading">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/offers")}
            style={{ marginBottom: "0.5rem" }}
          >
            ← Back to offers
          </button>
          <h1 className="page-title">{isEdit ? "Edit Offer" : "Create New Offer"}</h1>
        </div>
      </div>

      {/* Step 1 — Template selector */}
      {editorStep === 1 && (
        <div className="offer-templates">
          <p className="offer-templates-subtitle">
            Choose the type of offer that best fits your promotion:
          </p>
          <div className="offer-type-grid">
            {OFFER_TYPES.map((t) => (
              <button
                key={t.type}
                className={`offer-type-card${selectedType === t.type ? " selected" : ""}`}
                onClick={() => handleTypeSelect(t.type)}
              >
                <span className="offer-type-emoji">{t.emoji}</span>
                <span className="offer-type-label">{t.label}</span>
                <span className="offer-type-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Offer details form */}
      {editorStep === 2 && selectedType && typeDef && (
        <div className="offer-form-shell">
          {!isEdit && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setEditorStep(1)}
              style={{ marginBottom: "1.25rem" }}
            >
              ← Change offer type
            </button>
          )}

          <div className="offer-form-type-badge">
            {typeDef.emoji} {typeDef.label}
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Offer Details</h2>

            <div className="form-group">
              <label className="form-label">
                Title *{" "}
                <span className="char-count">{(form.title ?? "").length}/80</span>
              </label>
              <input
                className="form-input"
                maxLength={80}
                value={form.title ?? ""}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. 20% Off Your First Visit"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Short Description *{" "}
                <span className="char-count">{(form.shortDescription ?? "").length}/200</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                maxLength={200}
                value={form.shortDescription ?? ""}
                onChange={(e) => setField("shortDescription", e.target.value)}
                placeholder="Brief, compelling summary shown on the offer card..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Valid From *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.validFrom ?? ""}
                  onChange={(e) => setField("validFrom", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valid To *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.validTo ?? ""}
                  onChange={(e) => setField("validTo", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Conditional fields by type ── */}
          <div className="form-section">
            <h2 className="form-section-title">Offer Specifics</h2>

            {(selectedType === "percentage_discount" ||
              selectedType === "fixed_amount_discount" ||
              selectedType === "minimum_spend" ||
              selectedType === "category_specific") && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={form.discountValue ?? ""}
                    onChange={(e) => setField("discountValue", parseFloat(e.target.value))}
                    placeholder={selectedType === "percentage_discount" ? "20" : "10"}
                  />
                </div>
                {selectedType === "percentage_discount" ? (
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-select"
                      value={form.discountUnit ?? "percent"}
                      onChange={(e) => setField("discountUnit", e.target.value)}
                    >
                      <option value="percent">%</option>
                      <option value="dollars">$</option>
                    </select>
                  </div>
                ) : null}
              </div>
            )}

            {selectedType === "buy_x_get_y" && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Buy Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.buyQuantity ?? ""}
                    onChange={(e) => setField("buyQuantity", parseInt(e.target.value))}
                    placeholder="2"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Get Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.getQuantity ?? ""}
                    onChange={(e) => setField("getQuantity", parseInt(e.target.value))}
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            {selectedType === "happy_hour" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Happy Hour Start *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.happyHourStart ?? ""}
                      onChange={(e) => setField("happyHourStart", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Happy Hour End *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.happyHourEnd ?? ""}
                      onChange={(e) => setField("happyHourEnd", e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Available Days</label>
                  <div className="days-checkboxes">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={(form.happyHourDays ?? []).includes(day)}
                          onChange={() => toggleDay(day, "happyHourDays")}
                        />
                        {day.substring(0, 3)}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedType === "bundle_offer" && (
              <>
                <div className="form-group">
                  <label className="form-label">Bundle Items Description *</label>
                  <input
                    className="form-input"
                    value={form.bundleItems ?? ""}
                    onChange={(e) => setField("bundleItems", e.target.value)}
                    placeholder="e.g. Main + Side + Drink"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bundle Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={form.bundlePrice ?? ""}
                    onChange={(e) => setField("bundlePrice", parseFloat(e.target.value))}
                    placeholder="15.00"
                  />
                </div>
              </>
            )}

            {selectedType === "free_item_with_purchase" && (
              <div className="form-group">
                <label className="form-label">Free Item Description *</label>
                <input
                  className="form-input"
                  value={form.freeItemDescription ?? ""}
                  onChange={(e) => setField("freeItemDescription", e.target.value)}
                  placeholder="e.g. Free slice of cheesecake"
                />
              </div>
            )}

            {selectedType === "minimum_spend" && (
              <div className="form-group">
                <label className="form-label">Minimum Spend Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={form.minimumSpendAmount ?? ""}
                  onChange={(e) => setField("minimumSpendAmount", parseFloat(e.target.value))}
                  placeholder="50.00"
                />
              </div>
            )}

            {selectedType === "member_loyalty" && (
              <div className="form-group">
                <label className="form-label">Loyalty Points Multiplier</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={form.loyaltyPointsMultiplier ?? ""}
                  onChange={(e) => setField("loyaltyPointsMultiplier", parseFloat(e.target.value))}
                  placeholder="2"
                />
              </div>
            )}

            {selectedType === "limited_time" && (
              <div className="form-group">
                <label className="form-label">What makes this time-limited? *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.limitedTimeDescription ?? ""}
                  onChange={(e) => setField("limitedTimeDescription", e.target.value)}
                  placeholder="e.g. Summer special running through August only..."
                />
              </div>
            )}

            {selectedType === "category_specific" && (
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  className="form-input"
                  value={form.categoryName ?? ""}
                  onChange={(e) => setField("categoryName", e.target.value)}
                  placeholder="e.g. Appetisers, Desserts, Beverages"
                />
              </div>
            )}
          </div>

          {/* ── Terms & availability ── */}
          <div className="form-section">
            <h2 className="form-section-title">Terms & Availability</h2>

            <div className="form-group">
              <label className="form-label">Available Days</label>
              <div className="days-checkboxes">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={(form.availableDays ?? []).includes(day)}
                      onChange={() => toggleDay(day, "availableDays")}
                    />
                    {day.substring(0, 3)}
                  </label>
                ))}
              </div>
              <p className="form-hint">Leave empty to apply all week.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Terms & Conditions</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={form.terms ?? ""}
                onChange={(e) => setField("terms", e.target.value)}
                placeholder="e.g. One per customer. Cannot be combined with other offers."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Exclusions</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={form.exclusions ?? ""}
                onChange={(e) => setField("exclusions", e.target.value)}
                placeholder="e.g. Not valid on public holidays."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Offer Image URL (optional)</label>
              <input
                className="form-input"
                value={form.imageUrl ?? ""}
                onChange={(e) => setField("imageUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Save buttons */}
          <div className="offer-form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? <Spinner size="sm" /> : "Save as Draft"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              {isSaving ? <Spinner size="sm" /> : "Save & Activate"}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OfferEditor;
