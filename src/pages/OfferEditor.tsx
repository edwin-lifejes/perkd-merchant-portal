import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Spinner from "../components/ui/Spinner";
import Icon from "../components/ui/Icon";
import { getOffer, createOffer, updateOffer } from "../services/offers";
import type { Offer, OfferType } from "../types";

// ── Offer type catalogue ──────────────────────────────────────────────────────

interface OfferTypeDef {
  type: OfferType;
  icon: string;
  label: string;
  description: string;
}

const OFFER_TYPES: OfferTypeDef[] = [
  { type: "percentage_discount",     icon: "percent",               label: "Percentage Discount",     description: "e.g. 20% off your total bill" },
  { type: "fixed_amount_discount",   icon: "payments",              label: "Fixed Amount Off",         description: "e.g. $10 off any purchase" },
  { type: "buy_x_get_y",             icon: "shopping_cart",         label: "Buy X Get Y",              description: "e.g. Buy 2 get 1 free" },
  { type: "happy_hour",              icon: "schedule",              label: "Happy Hour",               description: "Time-limited deals on specific days" },
  { type: "bundle_offer",            icon: "inventory_2",           label: "Bundle Deal",              description: "e.g. Lunch combo for $15" },
  { type: "free_item_with_purchase", icon: "redeem",                label: "Free Item with Purchase",  description: "e.g. Free dessert with main course" },
  { type: "minimum_spend",           icon: "credit_card",           label: "Minimum Spend",            description: "e.g. 15% off when you spend $50+" },
  { type: "member_loyalty",          icon: "star",                  label: "Member Loyalty",           description: "Exclusive deal for Perkd members" },
  { type: "limited_time",            icon: "local_fire_department", label: "Limited Time Offer",       description: "Create urgency with a time-boxed deal" },
  { type: "category_specific",       icon: "category",              label: "Category Specific",        description: "e.g. 25% off all appetisers" },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ── Theme options ─────────────────────────────────────────────────────────────

const GRADIENTS = [
  { label: "Sage",  style: "linear-gradient(135deg, rgba(74,101,73,0.9) 0%, #8ba888 100%)" },
  { label: "Gold",  style: "linear-gradient(135deg, #735c00 0%, #e9c349 100%)" },
  { label: "Rose",  style: "linear-gradient(135deg, #7d525f 0%, #c593a1 100%)" },
  { label: "Dark",  style: "linear-gradient(135deg, #1a1c1a 0%, #737970 100%)" },
];

const CATEGORY_VISUALS = [
  { key: "coffee",        icon: "coffee",        label: "Coffee" },
  { key: "spa",           icon: "spa",           label: "Salon"  },
  { key: "shopping_bag",  icon: "shopping_bag",  label: "Retail" },
  { key: "card_giftcard", icon: "card_giftcard", label: "Gift"   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateInputValue(isoString?: string | null): string {
  if (!isoString) return "";
  return isoString.substring(0, 10);
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return Math.max(0, diff);
}

// ── Component ─────────────────────────────────────────────────────────────────

const OfferEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [editorStep, setEditorStep] = useState<1 | 2>(isEdit ? 2 : 1);
  const [selectedType, setSelectedType] = useState<OfferType | null>(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Theming state
  const [gradientIndex, setGradientIndex] = useState(0);
  const [logoPlacement, setLogoPlacement] = useState<"top-left" | "top-right" | "center">("top-left");
  const [categoryVisual, setCategoryVisual] = useState(CATEGORY_VISUALS[0]);

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
  const expiresIn = daysUntil(form.validTo);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-loading"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ── Step 1 — Type selection ── */}
      {editorStep === 1 && (
        <>
          <div className="page-header">
            <div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/offers")} style={{ marginBottom: "0.5rem" }}>
                ← Back to offers
              </button>
              <h1 className="page-title">Create New Offer</h1>
              <p className="page-subtitle">Choose the type of offer that best fits your promotion.</p>
            </div>
          </div>
          <div className="offer-type-grid">
            {OFFER_TYPES.map((t) => (
              <button
                key={t.type}
                className={`offer-type-card${selectedType === t.type ? " selected" : ""}`}
                onClick={() => handleTypeSelect(t.type)}
              >
                <Icon name={t.icon} size={28} className="offer-type-icon" />
                <span className="offer-type-label">{t.label}</span>
                <span className="offer-type-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Step 2 — Offer details ── */}
      {editorStep === 2 && selectedType && typeDef && (
        <>
          {/* Subheader: tabs + action buttons */}
          <div className="offer-editor-subheader">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h1 className="page-title">Offer Editor</h1>
              <div className="offer-editor-tabs">
                <button
                  className="offer-editor-tab"
                  onClick={() => !isEdit && setEditorStep(1)}
                  style={{ cursor: isEdit ? "default" : "pointer" }}
                >
                  <Icon name={typeDef.icon} size={16} /> Type Selection
                </button>
                <span className="offer-editor-tab active">Offer Details</span>
              </div>
            </div>
            <div className="offer-editor-actions">
              <button className="btn btn-outline" onClick={() => handleSave(false)} disabled={isSaving}>
                {isSaving ? <Spinner size="sm" /> : "Save as Draft"}
              </button>
              <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={isSaving}>
                {isSaving ? <Spinner size="sm" /> : "Publish Offer"}
              </button>
            </div>
          </div>

          <p className="page-subtitle" style={{ marginBottom: "2rem" }}>
            Step 2: Define the value and visual identity of your merchant offer.
          </p>

          {/* Two-column grid */}
          <div className="offer-details-grid">

            {/* ── Left: Value Proposition ── */}
            <div className="offer-details-card">
              <h4 className="offer-details-card-title">Value Proposition</h4>

              {/* Type-specific value fields */}
              {selectedType === "percentage_discount" && (
                <div className="form-group">
                  <label className="form-label">Percentage Discount</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number" step="1" min="1" max="100"
                      className="form-input"
                      style={{ paddingRight: "2.5rem" }}
                      value={form.discountPercentage ?? ""}
                      onChange={(e) => setField("discountPercentage", parseFloat(e.target.value))}
                      placeholder="e.g. 20"
                    />
                    <span style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontWeight: 600 }}>%</span>
                  </div>
                </div>
              )}

              {selectedType === "fixed_amount_discount" && (
                <div className="form-group">
                  <label className="form-label">Discount Amount</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontWeight: 600 }}>$</span>
                    <input
                      type="number" step="0.01" min="0"
                      className="form-input"
                      style={{ paddingLeft: "2rem" }}
                      value={form.discountAmount ?? ""}
                      onChange={(e) => setField("discountAmount", parseFloat(e.target.value))}
                      placeholder="10.00"
                    />
                  </div>
                </div>
              )}

              {selectedType === "buy_x_get_y" && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Buy Quantity</label>
                    <input type="number" min="1" className="form-input"
                      value={form.buyQuantity ?? ""}
                      onChange={(e) => setField("buyQuantity", parseInt(e.target.value))}
                      placeholder="2" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Free Quantity</label>
                    <input type="number" min="1" className="form-input"
                      value={form.freeQuantity ?? ""}
                      onChange={(e) => setField("freeQuantity", parseInt(e.target.value))}
                      placeholder="1" />
                  </div>
                </div>
              )}

              {selectedType === "happy_hour" && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Happy Hour Start</label>
                    <input type="time" className="form-input"
                      value={form.availableTimeFrom ?? ""}
                      onChange={(e) => setField("availableTimeFrom", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Happy Hour End</label>
                    <input type="time" className="form-input"
                      value={form.availableTimeTo ?? ""}
                      onChange={(e) => setField("availableTimeTo", e.target.value)} />
                  </div>
                </div>
              )}

              {selectedType === "bundle_offer" && (
                <div className="form-group">
                  <label className="form-label">Bundle Description</label>
                  <input className="form-input"
                    value={form.bundleDetails ?? ""}
                    onChange={(e) => setField("bundleDetails", e.target.value)}
                    placeholder="e.g. Main + Side + Drink for $15" />
                </div>
              )}

              {selectedType === "free_item_with_purchase" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Free Item</label>
                    <input className="form-input"
                      value={form.freeItemDetails ?? ""}
                      onChange={(e) => setField("freeItemDetails", e.target.value)}
                      placeholder="e.g. Free slice of cheesecake" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minimum Spend to Qualify</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontWeight: 600 }}>$</span>
                      <input type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: "2rem" }}
                        value={form.minimumSpend ?? ""}
                        onChange={(e) => setField("minimumSpend", parseFloat(e.target.value))}
                        placeholder="30.00" />
                    </div>
                  </div>
                </>
              )}

              {selectedType === "minimum_spend" && (
                <div className="form-group">
                  <label className="form-label">Minimum Spend Amount</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontWeight: 600 }}>$</span>
                    <input type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: "2rem" }}
                      value={form.minimumSpend ?? ""}
                      onChange={(e) => setField("minimumSpend", parseFloat(e.target.value))}
                      placeholder="50.00" />
                  </div>
                </div>
              )}

              {selectedType === "member_loyalty" && (
                <div className="form-group">
                  <label className="form-label">Eligible Reward / Item</label>
                  <input className="form-input"
                    value={form.eligibleItem ?? ""}
                    onChange={(e) => setField("eligibleItem", e.target.value)}
                    placeholder="e.g. Double points on all drinks" />
                </div>
              )}

              {selectedType === "category_specific" && (
                <div className="form-group">
                  <label className="form-label">Category Name</label>
                  <input className="form-input"
                    value={form.eligibleItem ?? ""}
                    onChange={(e) => setField("eligibleItem", e.target.value)}
                    placeholder="e.g. Appetisers, Desserts, Beverages" />
                </div>
              )}

              {/* Offer Title */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label">Offer Title</label>
                  <span className="char-count">{(form.title ?? "").length}/60</span>
                </div>
                <input
                  className="form-input"
                  maxLength={60}
                  value={form.title ?? ""}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. 20% Off on weekend Happy hours"
                />
              </div>

              {/* Short Description */}
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  maxLength={200}
                  value={form.shortDescription ?? ""}
                  onChange={(e) => setField("shortDescription", e.target.value)}
                  placeholder="Join us for a relaxing afternoon. Valid on all beverages and snacks from 4pm to 7pm."
                />
              </div>

              {/* Dates */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Valid From</label>
                  <input type="date" className="form-input"
                    value={form.validFrom ?? ""}
                    onChange={(e) => setField("validFrom", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Valid Until</label>
                  <input type="date" className="form-input"
                    value={form.validTo ?? ""}
                    onChange={(e) => setField("validTo", e.target.value)} />
                </div>
              </div>

              {/* Redemption Limit */}
              <div className="form-group">
                <label className="form-label">
                  Redemption Limit <span className="form-hint" style={{ display: "inline", marginTop: 0 }}>(Optional)</span>
                </label>
                <input type="number" min="1" className="form-input"
                  value={form.redemptionLimit ?? ""}
                  onChange={(e) => setField("redemptionLimit", parseInt(e.target.value))}
                  placeholder="e.g. 100 uses total" />
              </div>

              {/* Advanced toggle */}
              <button
                type="button"
                className="offer-advanced-toggle"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                <Icon name={showAdvanced ? "expand_less" : "expand_more"} size={18} />
                Advanced settings
              </button>

              {showAdvanced && (
                <div className="offer-advanced-section">
                  {selectedType !== "happy_hour" && (
                    <div className="form-group">
                      <label className="form-label">Available Days <span className="form-hint" style={{ display: "inline", marginTop: 0 }}>(leave empty for all week)</span></label>
                      <div className="days-checkboxes">
                        {DAYS_OF_WEEK.map((day) => (
                          <label key={day} className="day-checkbox">
                            <input type="checkbox"
                              checked={(form.availableDays ?? []).includes(day)}
                              onChange={() => toggleDay(day)} />
                            {day.substring(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedType === "happy_hour" && (
                    <div className="form-group">
                      <label className="form-label">Available Days</label>
                      <div className="days-checkboxes">
                        {DAYS_OF_WEEK.map((day) => (
                          <label key={day} className="day-checkbox">
                            <input type="checkbox"
                              checked={(form.availableDays ?? []).includes(day)}
                              onChange={() => toggleDay(day)} />
                            {day.substring(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Terms & Conditions</label>
                    <textarea className="form-textarea" rows={3}
                      value={form.termsAndConditions ?? ""}
                      onChange={(e) => setField("termsAndConditions", e.target.value)}
                      placeholder="e.g. One per customer. Cannot be combined with other offers." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Exclusions</label>
                    <textarea className="form-textarea" rows={2}
                      value={form.exclusions ?? ""}
                      onChange={(e) => setField("exclusions", e.target.value)}
                      placeholder="e.g. Not valid on public holidays." />
                  </div>
                  {selectedType === "limited_time" && (
                    <div className="form-group">
                      <label className="form-label">What makes this time-limited?</label>
                      <textarea className="form-textarea" rows={3}
                        value={form.termsAndConditions ?? ""}
                        onChange={(e) => setField("termsAndConditions", e.target.value)}
                        placeholder="e.g. Summer special running through August only..." />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: Theming + Preview ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Theme card */}
              <div className="offer-details-card">
                <h4 className="offer-details-card-title">Theme Your Offer</h4>

                {/* Background gradient */}
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: "0.75rem" }}>Background Accent</label>
                  <div className="offer-gradient-options">
                    {GRADIENTS.map((g, i) => (
                      <button
                        key={g.label}
                        type="button"
                        className={`offer-gradient-dot${gradientIndex === i ? " active" : ""}`}
                        style={{ background: g.style }}
                        onClick={() => setGradientIndex(i)}
                        title={g.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Logo placement */}
                <div className="form-group">
                  <label className="form-label">Logo Placement</label>
                  <select
                    className="form-select"
                    value={logoPlacement}
                    onChange={(e) => setLogoPlacement(e.target.value as typeof logoPlacement)}
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>

                {/* Service category visual */}
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: "0.75rem" }}>Service Category Visual</label>
                  <div className="offer-category-grid">
                    {CATEGORY_VISUALS.map((cv) => (
                      <button
                        key={cv.key}
                        type="button"
                        className={`offer-category-btn${categoryVisual.key === cv.key ? " active" : ""}`}
                        onClick={() => setCategoryVisual(cv)}
                      >
                        <Icon name={cv.icon} size={22} filled={categoryVisual.key === cv.key} />
                        {cv.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div>
                <div className="offer-preview-header">
                  <span className="offer-preview-label">Live Preview</span>
                  <span className="offer-preview-hint" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Icon name="visibility" size={14} /> Consumer App View
                  </span>
                </div>

                <div
                  className="offer-preview-tile"
                  style={{ background: GRADIENTS[gradientIndex].style }}
                >
                  {/* Logo */}
                  <div
                    className="offer-preview-logo-area"
                    style={{
                      justifyContent:
                        logoPlacement === "center" ? "center" :
                        logoPlacement === "top-right" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div className="offer-preview-logo">
                      <Icon name={categoryVisual.icon} size={22} filled style={{ color: "var(--sage)" }} />
                    </div>
                  </div>

                  {/* Background icon overlay */}
                  <div className="offer-preview-bg-icon">
                    <Icon name={categoryVisual.icon} size={160} filled style={{ color: "#fff" }} />
                  </div>

                  {/* Text content */}
                  <div className="offer-preview-content">
                    <span className="offer-preview-badge">Limited Time</span>
                    <h5 className="offer-preview-title">
                      {form.title || "Your offer title here"}
                    </h5>
                    <p className="offer-preview-desc">
                      {form.shortDescription || "Your offer description will appear here."}
                    </p>
                    <div className="offer-preview-footer">
                      <span className="offer-preview-expiry" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <Icon name="calendar_today" size={15} />
                        {expiresIn !== null ? `Expires in ${expiresIn} day${expiresIn !== 1 ? "s" : ""}` : "Set an expiry date"}
                      </span>
                      <div className="offer-preview-arrow">
                        <Icon name="arrow_forward" size={18} style={{ color: "var(--sage)" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

    </DashboardLayout>
  );
};

export default OfferEditor;
