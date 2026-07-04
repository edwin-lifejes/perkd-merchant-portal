import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Spinner from "../components/ui/Spinner";
import { getProgress, getProfile, updateLogo, updateDescription, updateCoordinates, skipStep } from "../services/merchant";
import type { ProfileProgress } from "../types";

type SetupStep = "logo" | "description" | "coordinates";

const STEPS: SetupStep[] = ["logo", "description", "coordinates"];

const STEP_LABELS: Record<SetupStep, string> = {
  logo: "Business Logo",
  description: "About Your Business",
  coordinates: "Location Coordinates",
};

const STEP_ICONS: Record<SetupStep, string> = {
  logo: "🖼️",
  description: "📝",
  coordinates: "📍",
};

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>("logo");
  const [progress, setProgress] = useState<ProfileProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Step-specific state — pre-populated from saved data
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreviewError, setLogoPreviewError] = useState(false);
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    Promise.all([getProgress(), getProfile()])
      .then(([p, biz]) => {
        setProgress(p);

        // Pre-populate from existing saved data
        if (biz.logoUrl) setLogoUrl(biz.logoUrl);
        if (biz.description) setDescription(biz.description);
        if (biz.coordinates) {
          setLat(String(biz.coordinates.lat));
          setLng(String(biz.coordinates.lng));
        }

        // Jump to the resume step
        if (p.resumeStep && p.resumeStep !== "complete") {
          setCurrentStep(p.resumeStep as SetupStep);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const stepIndex = STEPS.indexOf(currentStep);

  const isStepDone = (step: SetupStep) => {
    const s = progress?.steps[step];
    return s?.status === "completed" || s?.status === "skipped";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (currentStep === "logo") {
        if (!logoUrl.trim()) {
          toast.error("Please enter a logo URL or skip this step.");
          setIsSaving(false);
          return;
        }
        await updateLogo(logoUrl.trim());
        toast.success("Logo saved!");
      } else if (currentStep === "description") {
        if (!description.trim()) {
          toast.error("Please enter a description or skip this step.");
          setIsSaving(false);
          return;
        }
        await updateDescription(description.trim());
        toast.success("Description saved!");
      } else if (currentStep === "coordinates") {
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (isNaN(latNum) || isNaN(lngNum)) {
          toast.error("Please enter valid coordinates.");
          setIsSaving(false);
          return;
        }
        await updateCoordinates(latNum, lngNum);
        toast.success("Coordinates saved!");
      }
      // Refresh progress after save
      const updated = await getProgress();
      setProgress(updated);
      goToNext();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      const updated = await skipStep(currentStep);
      setProgress(updated as unknown as ProfileProgress);
      toast("Step skipped — you can complete it later from your profile.", { icon: "ℹ️" });
      goToNext();
    } catch {
      toast.error("Failed to skip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    } else {
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-loading"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="setup-shell">
        <div className="setup-header">
          <h1 className="page-title">Set up your profile</h1>
          <p className="page-subtitle">
            A complete profile helps customers discover and trust your business.
          </p>
        </div>

        {/* Step indicator */}
        <div className="setup-steps">
          {STEPS.map((s, i) => {
            const done = isStepDone(s);
            const isActive = s === currentStep;
            return (
              <button
                key={s}
                className={`setup-step-indicator${isActive ? " active" : done ? " done" : ""}`}
                onClick={() => setCurrentStep(s)}
              >
                <span className="setup-step-icon">
                  {done && !isActive ? "✓" : STEP_ICONS[s]}
                </span>
                <span className="setup-step-name">{STEP_LABELS[s]}</span>
                {i < STEPS.length - 1 && <span className="setup-step-connector" />}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="setup-card">
          <h2 className="setup-card-title">
            {STEP_ICONS[currentStep]} {STEP_LABELS[currentStep]}
            {isStepDone(currentStep) && (
              <span className="setup-step-saved-badge">Saved</span>
            )}
          </h2>

          {currentStep === "logo" && (
            <div className="setup-step-content">
              <p className="setup-step-desc">
                Add a logo so customers can recognise your business in search results.
              </p>
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourbusiness.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    setLogoPreviewError(false);
                  }}
                />
              </div>
              {logoUrl && !logoPreviewError && (
                <div className="logo-preview">
                  <img src={logoUrl} alt="Logo preview" onError={() => setLogoPreviewError(true)} />
                </div>
              )}
              {logoPreviewError && (
                <p className="form-hint form-hint-warning">
                  ⚠️ Could not load image from this URL. Please check the link.
                </p>
              )}
              <p className="form-hint">Recommended: square image, at least 400×400px, PNG or JPG.</p>
            </div>
          )}

          {currentStep === "description" && (
            <div className="setup-step-content">
              <p className="setup-step-desc">
                Tell customers what makes your business special. Keep it concise and compelling.
              </p>
              <div className="form-group">
                <label className="form-label">
                  Business Description{" "}
                  <span className="char-count">{description.length}/300</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  maxLength={300}
                  placeholder="We're a family-owned Italian restaurant known for our wood-fired pizza and warm atmosphere..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <p className="form-hint">
                ⚠️ Businesses without a description are 60% less likely to be clicked by members.
              </p>
            </div>
          )}

          {currentStep === "coordinates" && (
            <div className="setup-step-content">
              <p className="setup-step-desc">
                Add your precise location so customers can find you on the map.
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="43.6532"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="-79.3832"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                  />
                </div>
              </div>
              <p className="form-hint">
                💡 Find your coordinates at{" "}
                <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="link">
                  latlong.net
                </a>{" "}
                or by right-clicking your location on Google Maps.
              </p>
              <p className="form-hint form-hint-warning">
                ⚠️ Without coordinates, your business won't appear in location-based searches.
              </p>
            </div>
          )}

          <div className="setup-card-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Spinner size="sm" /> : isStepDone(currentStep) ? "Update & Continue" : "Save & Continue"}
            </button>
            {!isStepDone(currentStep) && (
              <button className="btn btn-ghost btn-sm" onClick={handleSkip} disabled={isSaving}>
                Skip for now
              </button>
            )}
            {isStepDone(currentStep) && stepIndex < STEPS.length - 1 && (
              <button className="btn btn-ghost btn-sm" onClick={goToNext} disabled={isSaving}>
                Next step →
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSetup;
