import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { getDashboard } from "../services/merchant";
import type { DashboardData } from "../types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => {
        setError(err?.response?.data?.message ?? "Failed to load dashboard.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="page-loading">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert type="error" message={error} />
      </DashboardLayout>
    );
  }

  const { business, offerCounts, profileProgress, applicationStatus, sharedAdminNotes, latestOffers } =
    data!;

  const profileIncomplete = profileProgress?.overallStatus !== "complete";
  const completedSteps = Object.values(profileProgress?.steps ?? {}).filter(
    (s) => s.status === "completed" || s.status === "skipped"
  ).length;
  const totalSteps = 3;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <DashboardLayout tradingName={business?.tradingName}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {getGreeting()}, {business?.tradingName ?? "Partner"} 👋
          </h1>
          <p className="page-subtitle">{formatDate(new Date())}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/offers/new")}>
          + New Offer
        </button>
      </div>

      {/* Admin notes warning */}
      {applicationStatus === "need_more_info" && sharedAdminNotes && (
        <Alert
          type="warning"
          message={`Action required: ${sharedAdminNotes}`}
          icon="📋"
        />
      )}

      {/* Profile completion banner */}
      {profileIncomplete && (
        <div className="profile-banner">
          <div className="profile-banner-text">
            <strong>Complete your profile</strong>
            <span>
              A complete profile helps customers trust your business.{" "}
              {completedSteps}/{totalSteps} steps done.
            </span>
          </div>
          <div className="profile-banner-progress">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <button
            className="btn btn-sage btn-sm"
            onClick={() => navigate("/profile/setup")}
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-row">
        {[
          { label: "Active Offers", count: offerCounts?.active ?? 0, color: "sage" },
          { label: "Drafts", count: offerCounts?.draft ?? 0, color: "gold" },
          { label: "Paused", count: offerCounts?.paused ?? 0, color: "muted" },
          { label: "Expired", count: offerCounts?.expired ?? 0, color: "terra" },
        ].map((stat) => (
          <div key={stat.label} className={`stat-card stat-${stat.color}`}>
            <span className="stat-count">{stat.count}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Offers section */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-card-title">Latest Offers</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/offers")}>
            View all →
          </button>
        </div>

        {!latestOffers || latestOffers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏷️</span>
            <h3>No offers yet</h3>
            <p>Create your first offer to start reaching Perkd members.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/offers/new")}
            >
              Create your first offer
            </button>
          </div>
        ) : (
          <div className="offers-list">
            {latestOffers.map((offer) => (
              <div key={offer._id} className="offer-row">
                <div className="offer-row-info">
                  <span className="offer-row-title">{offer.title}</span>
                  <span className="offer-row-meta">
                    {offer.validFrom
                      ? new Date(offer.validFrom).toLocaleDateString("en-CA")
                      : "—"}{" "}
                    →{" "}
                    {offer.validTo
                      ? new Date(offer.validTo).toLocaleDateString("en-CA")
                      : "—"}
                  </span>
                </div>
                <div className="offer-row-actions">
                  <Badge status={offer.status} />
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/offers/${offer._id}/edit`)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
