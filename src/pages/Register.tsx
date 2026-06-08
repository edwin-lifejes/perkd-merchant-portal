import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { registerMerchant } from "../services/auth";
import { getProvinces, getCategories } from "../services/merchant";
import Spinner from "../components/ui/Spinner";
import type { RegisterPayload } from "../types";

// ── Zod schemas per step ────────────────────────────────────────────────────

const step1Schema = z.object({
  businessLegalName: z.string().min(2, "Legal name is required"),
  tradingName: z.string().min(2, "Trading name is required"),
  category: z.string().min(1, "Please select a category"),
  businessType: z.string().min(1, "Business type is required"),
  yearEstablished: z
    .number({ error: "Enter a valid year" })
    .min(1800)
    .max(new Date().getFullYear()),
});

const step2Schema = z.object({
  contactName: z.string().min(2, "Contact name is required"),
  contactRole: z.string().min(1, "Contact role is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().min(7, "Phone number required"),
  preferredContactMethod: z.string().min(1, "Select a contact method"),
  billingEmail: z.string().email("Valid billing email required"),
});

const step3Schema = z.object({
  address: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  website: z.string().url("Enter a valid URL (include https://)").optional().or(z.literal("")),
});

const step4Schema = z.object({
  initialOfferIdea: z.string().optional(),
  referralSource: z.string().optional(),
  logoUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  coverPhotoUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
});

const step5Schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreementConfirmed: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type FormData = Partial<RegisterPayload> & {
  confirmPassword?: string;
  openingHoursRaw?: Record<string, { open: boolean; openTime: string; closeTime: string }>;
};

const STEPS = [
  { label: "Business Info", description: "Your company details" },
  { label: "Contact", description: "How we reach you" },
  { label: "Location", description: "Where you operate" },
  { label: "Details", description: "Hours & offer idea" },
  { label: "Account", description: "Password & terms" },
];

// ── Component ───────────────────────────────────────────────────────────────

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});
  const [provinces, setProvinces] = useState<Array<{ code: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [formData, setFormData] = useState<FormData>({});

  const [hours, setHours] = useState<Record<string, { open: boolean; openTime: string; closeTime: string }>>(
    Object.fromEntries(DAYS.map((d) => [d, { open: false, openTime: "09:00", closeTime: "17:00" }]))
  );

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => {});
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    trigger,
    getValues,
  } = useForm<any>({
    resolver: zodResolver(schemas[step] as any),
    defaultValues: formData,
    mode: "onBlur",
  });

  const onNext = async () => {
    const valid = await trigger();
    if (!valid) return;
    const values = getValues();
    setFormData((prev) => ({ ...prev, ...values }));
    setStep((s) => s + 1);
  };

  const onBack = () => {
    const values = getValues();
    setFormData((prev) => ({ ...prev, ...values }));
    setStep((s) => s - 1);
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setApiFieldErrors({});
    try {
      const payload: Partial<RegisterPayload> = {
        ...formData,
        ...values,
        yearEstablished: Number(formData.yearEstablished ?? values.yearEstablished),
        openingHours: hours,
      };
      await registerMerchant(payload);
      toast.success("Account created! Let's set up your profile.");
      navigate("/profile/setup");
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.fields) {
        setApiFieldErrors(data.fields);
        toast.error("Please fix the errors and try again.");
      } else {
        toast.error(data?.message ?? "Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-shell">
      {/* Sidebar */}
      <aside className="register-sidebar">
        <div className="register-sidebar-brand">
          <span className="brand-mark">P</span>
          <span className="brand-name">Perkd</span>
        </div>
        <p className="register-sidebar-sub">Merchant partner application</p>
        <ol className="register-steps-list">
          {STEPS.map((s, i) => (
            <li
              key={s.label}
              className={`register-step-item${i === step ? " active" : i < step ? " done" : ""}`}
            >
              <span className="register-step-num">
                {i < step ? "✓" : i + 1}
              </span>
              <div>
                <div className="register-step-label">{s.label}</div>
                <div className="register-step-desc">{s.description}</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="register-sidebar-login">
          Already have an account?{" "}
          <Link to="/login" className="link-invert">
            Sign in
          </Link>
        </p>
      </aside>

      {/* Form area */}
      <div className="register-form-area">
        <div className="register-form-inner">
          <div className="register-form-header">
            <h1>{STEPS[step].label}</h1>
            <p className="register-form-subtitle">Step {step + 1} of {STEPS.length}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* ── Step 1: Business Info ── */}
            {step === 0 && (
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Legal Business Name *</label>
                  <input className="form-input" {...register("businessLegalName")} />
                  {errors.businessLegalName && (
                    <span className="form-error">{String(errors.businessLegalName.message)}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Trading Name *</label>
                  <input className="form-input" {...register("tradingName")} />
                  {errors.tradingName && (
                    <span className="form-error">{String(errors.tradingName.message)}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Business Category *</label>
                  <select className="form-select" {...register("category")}>
                    <option value="">Select a category...</option>
                    {categories.length > 0
                      ? categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))
                      : [
                          "Restaurants & Dining",
                          "Retail",
                          "Health & Wellness",
                          "Entertainment",
                          "Travel & Hospitality",
                          "Beauty & Personal Care",
                          "Sports & Fitness",
                          "Professional Services",
                          "Other",
                        ].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                  </select>
                  {errors.category && (
                    <span className="form-error">{String(errors.category.message)}</span>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Business Type *</label>
                    <select className="form-select" {...register("businessType")}>
                      <option value="">Select type...</option>
                      <option value="sole_proprietor">Sole Proprietor</option>
                      <option value="partnership">Partnership</option>
                      <option value="corporation">Corporation</option>
                      <option value="franchise">Franchise</option>
                      <option value="non_profit">Non-profit</option>
                    </select>
                    {errors.businessType && (
                      <span className="form-error">{String(errors.businessType.message)}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year Established *</label>
                    <input
                      type="number"
                      className="form-input"
                      {...register("yearEstablished", { valueAsNumber: true })}
                      placeholder="2015"
                    />
                    {errors.yearEstablished && (
                      <span className="form-error">{String(errors.yearEstablished.message)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Contact ── */}
            {step === 1 && (
              <div className="form-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Name *</label>
                    <input className="form-input" {...register("contactName")} />
                    {errors.contactName && (
                      <span className="form-error">{String(errors.contactName.message)}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role / Title *</label>
                    <input className="form-input" {...register("contactRole")} placeholder="Owner, Manager..." />
                    {errors.contactRole && (
                      <span className="form-error">{String(errors.contactRole.message)}</span>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email *</label>
                  <input type="email" className="form-input" {...register("contactEmail")} />
                  {errors.contactEmail && (
                    <span className="form-error">{String(errors.contactEmail.message)}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input type="tel" className="form-input" {...register("contactPhone")} placeholder="+1 (416) 555-0100" />
                  {errors.contactPhone && (
                    <span className="form-error">{String(errors.contactPhone.message)}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Contact Method *</label>
                  <select className="form-select" {...register("preferredContactMethod")}>
                    <option value="">Select...</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                  </select>
                  {errors.preferredContactMethod && (
                    <span className="form-error">{String(errors.preferredContactMethod.message)}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Billing Email *</label>
                  <input type="email" className="form-input" {...register("billingEmail")} />
                  {errors.billingEmail && (
                    <span className="form-error">{String(errors.billingEmail.message)}</span>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Location ── */}
            {step === 2 && (
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" {...register("address")} placeholder="123 Main St" />
                  {errors.address && (
                    <span className="form-error">{String(errors.address.message)}</span>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input className="form-input" {...register("city")} />
                    {errors.city && (
                      <span className="form-error">{String(errors.city.message)}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province *</label>
                    <select className="form-select" {...register("province")}>
                      <option value="">Select...</option>
                      {provinces.length > 0
                        ? provinces.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name}
                            </option>
                          ))
                        : [
                            ["AB", "Alberta"],
                            ["BC", "British Columbia"],
                            ["MB", "Manitoba"],
                            ["NB", "New Brunswick"],
                            ["NL", "Newfoundland"],
                            ["NS", "Nova Scotia"],
                            ["NT", "Northwest Territories"],
                            ["NU", "Nunavut"],
                            ["ON", "Ontario"],
                            ["PE", "Prince Edward Island"],
                            ["QC", "Quebec"],
                            ["SK", "Saskatchewan"],
                            ["YT", "Yukon"],
                          ].map(([code, name]) => (
                            <option key={code} value={code}>
                              {name}
                            </option>
                          ))}
                    </select>
                    {errors.province && (
                      <span className="form-error">{String(errors.province.message)}</span>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input className="form-input" {...register("postalCode")} placeholder="M5V 2H1" />
                    {errors.postalCode && (
                      <span className="form-error">{String(errors.postalCode.message)}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input className="form-input" {...register("website")} placeholder="https://yourbusiness.com" />
                    {errors.website && (
                      <span className="form-error">{String(errors.website.message)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Details ── */}
            {step === 3 && (
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Opening Hours</label>
                  <div className="hours-grid">
                    {DAYS.map((day, i) => (
                      <div key={day} className="hours-row">
                        <label className="hours-day-toggle">
                          <input
                            type="checkbox"
                            checked={hours[day].open}
                            onChange={(e) =>
                              setHours((h) => ({
                                ...h,
                                [day]: { ...h[day], open: e.target.checked },
                              }))
                            }
                          />
                          <span className="hours-day-label">{DAYS_SHORT[i]}</span>
                        </label>
                        {hours[day].open ? (
                          <div className="hours-times">
                            <input
                              type="time"
                              className="form-input form-input-sm"
                              value={hours[day].openTime}
                              onChange={(e) =>
                                setHours((h) => ({
                                  ...h,
                                  [day]: { ...h[day], openTime: e.target.value },
                                }))
                              }
                            />
                            <span className="hours-to">–</span>
                            <input
                              type="time"
                              className="form-input form-input-sm"
                              value={hours[day].closeTime}
                              onChange={(e) =>
                                setHours((h) => ({
                                  ...h,
                                  [day]: { ...h[day], closeTime: e.target.value },
                                }))
                              }
                            />
                          </div>
                        ) : (
                          <span className="hours-closed">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Offer Idea</label>
                  <textarea
                    className="form-textarea"
                    {...register("initialOfferIdea")}
                    placeholder="e.g. 20% off for first-time visitors..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">How did you hear about Perkd?</label>
                  <select className="form-select" {...register("referralSource")}>
                    <option value="">Select...</option>
                    <option value="google">Google Search</option>
                    <option value="social_media">Social Media</option>
                    <option value="referral">Friend or Colleague</option>
                    <option value="event">Event or Conference</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Logo URL (optional)</label>
                    <input
                      className="form-input"
                      {...register("logoUrl")}
                      placeholder="https://..."
                    />
                    {errors.logoUrl && (
                      <span className="form-error">{String(errors.logoUrl.message)}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cover Photo URL (optional)</label>
                    <input
                      className="form-input"
                      {...register("coverPhotoUrl")}
                      placeholder="https://..."
                    />
                    {errors.coverPhotoUrl && (
                      <span className="form-error">{String(errors.coverPhotoUrl.message)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 5: Account ── */}
            {step === 4 && (
              <div className="form-fields">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    {...register("password")}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <span className="form-error">{String(errors.password.message)}</span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    {...register("confirmPassword")}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <span className="form-error">{String(errors.confirmPassword.message)}</span>
                  )}
                </div>

                {apiFieldErrors.password && (
                  <div className="alert alert-error">
                    <span>{apiFieldErrors.password}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-checkbox-label">
                    <Controller
                      name="agreementConfirmed"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="link">
                        Merchant Partner Agreement
                      </a>{" "}
                      and{" "}
                      <a href="#" className="link">
                        Privacy Policy
                      </a>
                      . I confirm that the information provided is accurate and
                      that I am authorised to represent this business.
                    </span>
                  </label>
                  {errors.agreementConfirmed && (
                    <span className="form-error">
                      {String(errors.agreementConfirmed.message)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="register-nav-buttons">
              {step > 0 && (
                <button type="button" className="btn btn-outline" onClick={onBack}>
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={onNext}>
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : "Create Account"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
