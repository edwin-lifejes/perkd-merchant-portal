import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { listOffers, activateOffer, pauseOffer, deleteOffer } from "../services/offers";
import type { Offer } from "../types";

const OFFER_TYPE_EMOJI: Record<string, string> = {
  percentage_discount: "🏷️",
  fixed_amount_discount: "💰",
  buy_x_get_y: "🛒",
  happy_hour: "⏰",
  bundle_offer: "📦",
  free_item_with_purchase: "🎁",
  minimum_spend: "💳",
  member_loyalty: "⭐",
  limited_time: "🔥",
  category_specific: "🗂️",
};

const TABS: Array<{ label: string; value: string }> = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Paused", value: "paused" },
  { label: "Expired", value: "expired" },
];

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadOffers = useCallback((status: string) => {
    setIsLoading(true);
    listOffers(status || undefined)
      .then(setOffers)
      .catch(() => toast.error("Failed to load offers."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadOffers(activeTab);
  }, [activeTab, loadOffers]);

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await activateOffer(id);
      setOffers((prev) => prev.map((o) => (o._id === id ? updated : o)));
      toast.success("Offer activated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to activate offer.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await pauseOffer(id);
      setOffers((prev) => prev.map((o) => (o._id === id ? updated : o)));
      toast.success("Offer paused.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to pause offer.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await deleteOffer(id);
      setOffers((prev) => prev.filter((o) => o._id !== id));
      toast.success("Offer deleted.");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete offer.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Offers</h1>
        <button className="btn btn-primary" onClick={() => navigate("/offers/new")}>
          + New Offer
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab-item${activeTab === tab.value ? " active" : ""}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="page-loading">
          <Spinner size="lg" />
        </div>
      ) : offers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏷️</span>
          <h3>No offers here</h3>
          <p>
            {activeTab
              ? `You have no ${activeTab} offers.`
              : "Create your first offer to start reaching Perkd members."}
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/offers/new")}>
            Create an offer
          </button>
        </div>
      ) : (
        <div className="offers-table">
          {offers.map((offer) => (
            <div key={offer._id} className="offer-card">
              <div className="offer-card-main">
                <span className="offer-type-chip">
                  {OFFER_TYPE_EMOJI[offer.offerType] ?? "🏷️"}{" "}
                  {offer.offerType.replace(/_/g, " ")}
                </span>
                <h3 className="offer-card-title">{offer.title}</h3>
                <p className="offer-card-desc">{offer.shortDescription}</p>
                <p className="offer-card-dates">
                  {offer.validFrom
                    ? new Date(offer.validFrom).toLocaleDateString("en-CA")
                    : "—"}{" "}
                  →{" "}
                  {offer.validTo
                    ? new Date(offer.validTo).toLocaleDateString("en-CA")
                    : "—"}
                </p>
              </div>
              <div className="offer-card-right">
                <Badge status={offer.status} />
                <div className="offer-card-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/offers/${offer._id}/edit`)}
                  >
                    Edit
                  </button>
                  {offer.status === "draft" && (
                    <button
                      className="btn btn-sage btn-sm"
                      onClick={() => handleActivate(offer._id)}
                      disabled={actionLoading === offer._id}
                    >
                      {actionLoading === offer._id ? <Spinner size="sm" /> : "Activate"}
                    </button>
                  )}
                  {offer.status === "active" && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handlePause(offer._id)}
                      disabled={actionLoading === offer._id}
                    >
                      {actionLoading === offer._id ? <Spinner size="sm" /> : "Pause"}
                    </button>
                  )}
                  {offer.status === "paused" && (
                    <button
                      className="btn btn-sage btn-sm"
                      onClick={() => handleActivate(offer._id)}
                      disabled={actionLoading === offer._id}
                    >
                      {actionLoading === offer._id ? <Spinner size="sm" /> : "Re-activate"}
                    </button>
                  )}
                  {deleteConfirm === offer._id ? (
                    <div className="delete-confirm">
                      <span>Delete?</span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(offer._id)}
                        disabled={actionLoading === offer._id}
                      >
                        {actionLoading === offer._id ? <Spinner size="sm" /> : "Yes, delete"}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm btn-danger-ghost"
                      onClick={() => setDeleteConfirm(offer._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Offers;
