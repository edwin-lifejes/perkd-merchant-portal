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
}

const OFFER_TYPES: OfferTypeDef[] = [
  { type: "percentage_discount",   emoji: "🏷️", label: "Percentage Discount",    description: "e.g. 20% off your total bill" },
  { type: "fixed_amount_discount", emoji: "💰", label: "Fixed Amount Off",        description: "e.g. $10 off any purchase" },
  { type: "buy_x_get_y",           emoji: "🛒", label: "Buy X Get Y",             description: "e.g. Buy 2 get 1 free" },
  { type: "happy_hour",            emoji: "⏰", label: "Happy Hour",              description: "Time-limited deals on specific days" },
  { type: "bundle_offer",          emoji: "📦", label: "Bundle Deal",             description: "e.g. Lunch combo for $15" },
  { type: "free_item_with_purchase", emoji: "🎁", label: "Free Item with Purchase", description: "e.g. Free dessert with main course" },
  { type: "minimum_spend",         emoji: "💳", label: "Minimum Spend",           description: "e.g. 15% off when you spend $50+" },
  { type: "member_loyalty",        emoji: "⭐", label: "Member Loyalty",          description: "Exclusive deal for Perkd members" },
  { type: "limited_time",          emoji: "🔥", label: "Limited Time Offer",      description: "Create urgency with a time-boxed deal" },
  { type: "category_specific",     emoji: "🗂️", label: "Category Specific",       description: "e.g. 25% off all appetisers" },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ── Helpers ─────────────────────────────────────────────────────────────────

function toDateInputValue(isoString?: string | null): string {
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

  // Form state — field names match the backend Offer model exactly
  const [form, setForm] = useState<Partial<Offer>>({ availableDays: [] });

  useEffect(() => {
    if (isEdit && id) {
      getOffer(id)
        .then((offer) => {
          setSelectedType(offer.offerType);
          setForm({
            ...offer,
            validFrom: toDateInputValue(offer.validFrom),
            validTo:   toDateInputValue(offer.validTo),
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

  const setField = <K extends keyof Offer>(key: K, value: Offer[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleDay = (day: string) => {
    setForm((f) => {
      const current = f.availableDays ?? [];
      return {
        ...f,
        availableDays: current.includes(day)
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
      if (data?.fields) {
        const fieldMsgs = Object.values(data.fields).join("\n");
        toast.error(fieldMsgs, { duration: 6000 });
      } else {
        toast.error(data?.message ?? "Failed to save offer.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const typeDef = OFFER_TYPES.find((t) => t.type === selectedType);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-loading"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/offers")} style={{ marginBottom: "0.5rem" }}>
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
            <button className="btn btn-ghost btn-sm" onClick={() => setEditorStep(1)} style={{ marginBottom: "1.25rem" }}>
              ← Change offer type
            </button>
          )}

          <div className="offer-form-type-badge">
            {typeDef.emoji} {typeDef.label}
          </div>

          {/* ── Base details ── */}
          <div className="form-section">
            <h2 className="form-section-title">Offer Details</h2>

            <div className="form-group">
              <label className="form-label">
                Title * <span className="char-count">{(form.title ?? "").length}/80</span>
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
                Short Description * <span className="char-count">{(form.shortDescription ?? "").length}/200</span>
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
                <input type="date" className="form-input" value={form.validFrom ?? ""} onChange={(e) => setField("validFrom", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Valid To *</label>
                <input type="date" className="form-input" value={form.validTo ?? ""} onChange={(e) => setField("validTo", e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── Type-specific fields — names match backend model exactly ── */}
          <div className="form-section">
            <h2 className="form-section-title">Offer Specifics</h2>

            {/* percentage_discount */}
            {selectedType === "percentage_discount" && (
              <div className="form-group">
                <label className="form-label">Discount Percentage (%) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  className="form-input"
                  value={form.discountPercentage ?? ""}
                  onChange={(e) => setField("discountPercentage", parseFloat(e.target.value))}
                  placeholder="20"
                />
              </div>
            )}

            {/* fixed_amount_discount */}
            {selectedType === "fixed_amount_discount" && (
              <div className="form-group">
                <label className="form-label">Discount Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={form.discountAmount ?? ""}
                  onChange={(e) => setField("discountAmount", parseFloat(e.target.value))}
                  placeholder="10.00"
                />
              </div>
            )}

            {/* buy_x_get_y */}
            {selectedType === "buy_x_get_y" && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Buy Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={form.buyQuantity ?? ""}
                    onChange={(e) => setField("buyQuantity", parseInt(e.target.value))}
                    placeholder="2"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Free Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={form.freeQuantity ?? ""}
                    onChange={(e) => setField("freeQuantity", parseInt(e.target.value))}
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            {/* happy_hour */}
            {selectedType === "happy_hour" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Happy Hour Start *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.availableTimeFrom ?? ""}
                      onChange={(e) => setField("availableTimeFrom", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Happy Hour End *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.availableTimeTo ?? ""}
                      onChange={(e) => setField("availableTimeTo", e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Available Days (leave empty for all week)</label>
                  <div className="days-checkboxes">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={(form.availableDays ?? []).includes(day)}
                          onChange={() => toggleDay(day)}
                        />
                        {day.substring(0, 3)}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* bundle_offer */}
            {selectedType === "bundle_offer" && (
              <div className="form-group">
                <label className="form-label">Bundle Description *</label>
                <input
                  className="form-input"
                  value={form.bundleDetails ?? ""}
                  onChange={(e) => setField("bundleDetails", e.target.value)}
                  placeholder="e.g. Main + Side + Drink for $15"
                />
                <p className="form-hint">Describe exactly what's in the bundle and the bundle price.</p>
              </div>
            )}

            {/* free_item_with_purchase */}
            {selectedType === "free_item_with_purchase" && (
              <>
                <div className="form-group">
                  <label className="form-label">Free Item Description *</label>
                  <input
                    className="form-input"
                    value={form.freeItemDetails ?? ""}
                    onChange={(e) => setField("freeItemDetails", e.target.value)}
                    placeholder="e.g. Free slice of cheesecake"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Spend to Qualify ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={form.minimumSpend ?? ""}
                    onChange={(e) => setField("minimumSpend", parseFloat(e.target.value))}
                    placeholder="30.00"
                  />
                </div>
              </>
            )}

            {/* minimum_spend */}
            {selectedType === "minimum_spend" && (
              <div className="form-group">
                <label className="form-label">Minimum Spend Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={form.minimumSpend ?? ""}
                  onChange={(e) => setField("minimumSpend", parseFloat(e.target.value))}
                  placeholder="50.00"
                />
              </div>
            )}

            {/* member_loyalty — eligibleItem describes the reward/tier */}
            {selectedType === "member_loyalty" && (
              <div className="form-group">
                <label className="form-label">Eligible Reward / Item *</label>
                <input
                  className="form-input"
                  value={form.eligibleItem ?? ""}
                  onChange={(e) => setField("eligibleItem", e.target.value)}
                  placeholder="e.g. Double points on all drinks"
                />
                <p className="form-hint">Describe what Perkd members receive.</p>
              </div>
            )}

            {/* limited_time — no extra required fields; use terms for context */}
            {selectedType === "limited_time" && (
              <div className="form-group">
                <label className="form-label">What makes this time-limited?</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.termsAndConditions ?? ""}
                  onChange={(e) => setField("termsAndConditions", e.target.value)}
                  placeholder="e.g. Summer special running through August only..."
                />
              </div>
            )}

            {/* category_specific — eligibleItem holds the category name */}
            {selectedType === "category_specific" && (
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  className="form-input"
                  value={form.eligibleItem ?? ""}
                  onChange={(e) => setField("eligibleItem", e.target.value)}
                  placeholder="e.g. Appetisers, Desserts, Beverages"
                />
              </div>
            )}
          </div>

          {/* ── Terms & availability ── */}
          <div className="form-section">
            <h2 className="form-section-title">Terms & Availability</h2>

            {/* General available days (not happy_hour — that already has it above) */}
            {selectedType !== "happy_hour" && (
              <div className="form-group">
                <label className="form-label">Available Days</label>
                <div className="days-checkboxes">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={(form.availableDays ?? []).includes(day)}
                        onChange={() => toggleDay(day)}
                      />
                      {day.substring(0, 3)}
                    </label>
                  ))}
                </div>
                <p className="form-hint">Leave empty to apply all week.</p>
              </div>
            )}

            {selectedType !== "limited_time" && (
              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.termsAndConditions ?? ""}
                  onChange={(e) => setField("termsAndConditions", e.target.value)}
                  placeholder="e.g. One per customer. Cannot be combined with other offers."
                />
              </div>
            )}

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
              <label className="form-label">Redemption Limit (optional)</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={form.redemptionLimit ?? ""}
                onChange={(e) => setField("redemptionLimit", parseInt(e.target.value))}
                placeholder="e.g. 100"
              />
              <p className="form-hint">Maximum number of times this offer can be redeemed. Leave blank for unlimited.</p>
            </div>
          </div>

          {/* Save buttons */}
          <div className="offer-form-actions">
            <button type="button" className="btn btn-outline" onClick={() => handleSave(false)} disabled={isSaving}>
              {isSaving ? <Spinner size="sm" /> : "Save as Draft"}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving ? <Spinner size="sm" /> : "Save & Activate"}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OfferEditor;
