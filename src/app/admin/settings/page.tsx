"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Globe, Image, Phone, Truck, AlertTriangle } from "lucide-react";
import { ALGERIA_WILAYAS } from "@/constants/algeriaWilayas";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  announcementText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  metaPixelId: string;
  tiktokPixelId: string;
  maintenanceMode: boolean;
}

interface ShippingRate {
  code: string;
  nameAr: string;
  homePrice: number;
  officePrice: number;
}

type Tab = "general" | "images" | "contact" | "shipping" | "tracking" | "maintenance";

const defaultSettings: SiteSettings = {
  siteName: "Sn Shop16",
  siteDescription: "",
  announcementText: "-10% SUR VOTRE PREMIÈRE COMMANDE",
  heroTitle: "NEW COLLECTION 2026",
  heroSubtitle: "Découvrez les dernières tendances à des prix irrésistibles",
  heroImageUrl: "",
  phone: "+213 656 12 34 56",
  email: "contact@snshop.dz",
  whatsappNumber: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  metaPixelId: "",
  tiktokPixelId: "",
  maintenanceMode: false,
};

const inputClass = "w-full border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors";
const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ratesSearch, setRatesSearch] = useState("");

  useEffect(() => {
    Promise.all([fetchSettings(), fetchRates()]).finally(() => setLoading(false));
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings({
            siteName: data.settings.siteName || "",
            siteDescription: data.settings.siteDescription || "",
            announcementText: data.settings.announcementText || "",
            heroTitle: data.settings.heroTitle || "",
            heroSubtitle: data.settings.heroSubtitle || "",
            heroImageUrl: data.settings.heroImageUrl || "",
            phone: data.settings.phone || "",
            email: data.settings.email || "",
            whatsappNumber: data.settings.whatsappNumber || "",
            instagramUrl: data.settings.instagramUrl || "",
            facebookUrl: data.settings.facebookUrl || "",
            tiktokUrl: data.settings.tiktokUrl || "",
            metaPixelId: data.settings.metaPixelId || "",
            tiktokPixelId: data.settings.tiktokPixelId || "",
            maintenanceMode: data.settings.maintenanceMode ?? false,
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch settings:", e);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/admin/settings/shipping", { cache: "no-store" });
      console.log("[Settings] Shipping API status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("[Settings] Shipping API data:", data);
        const apiRates = data.rates || [];
        if (Array.isArray(apiRates) && apiRates.length > 0) {
          setRates(apiRates.map((r: any) => ({
            code: r.wilayaCode || r.code || "",
            nameAr: r.wilayaName || r.nameAr || "",
            homePrice: r.homePrice || 0,
            officePrice: r.officePrice || 0,
          })));
        } else {
          console.log("[Settings] No rates from API, using ALGERIA_WILAYAS fallback");
          setRates(ALGERIA_WILAYAS.map((w) => ({
            code: w.code, nameAr: w.nameAr, homePrice: w.homePrice, officePrice: w.officePrice,
          })));
        }
      } else {
        console.log("[Settings] Shipping API failed:", res.status, "falling back to ALGERIA_WILAYAS");
        setRates(ALGERIA_WILAYAS.map((w) => ({
          code: w.code, nameAr: w.nameAr, homePrice: w.homePrice, officePrice: w.officePrice,
        })));
      }
    } catch (e) {
      console.error("[Settings] Shipping fetch error:", e);
      setRates(ALGERIA_WILAYAS.map((w) => ({
        code: w.code, nameAr: w.nameAr, homePrice: w.homePrice, officePrice: w.officePrice,
      })));
    }
  };

  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateRate = (index: number, field: "homePrice" | "officePrice", value: string) => {
    const numValue = parseInt(value) || 0;
    setRates((prev) => prev.map((r, i) => i === index ? { ...r, [field]: numValue } : r));
    setSaved(false);
  };

  const handleSave = async () => {
    console.log("Payload:", settings);
    setSaving(true);
    try {
      if (activeTab === "shipping") {
        const res = await fetch("/api/admin/settings/shipping", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rates: rates.map((r) => ({
              wilayaCode: r.code, wilayaName: r.nameAr, homePrice: r.homePrice, officePrice: r.officePrice,
            })),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          alert("Erreur: " + (data.error || "Échec de l'enregistrement"));
        }
      } else {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        const data = await res.json();
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          alert("Erreur: " + (data.error || "Échec de l'enregistrement"));
        }
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const filteredRates = rates.filter((r) =>
    ratesSearch.trim()
      ? r.nameAr.toLowerCase().includes(ratesSearch.toLowerCase()) || r.code.includes(ratesSearch)
      : true
  );

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "general", label: "Général", icon: Globe },
    { key: "images", label: "Images", icon: Image },
    { key: "contact", label: "Contact", icon: Phone },
    { key: "shipping", label: "Livraison", icon: Truck },
    { key: "tracking", label: "Suivi", icon: Settings },
    { key: "maintenance", label: "Maintenance", icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Paramètres du site</h1>
            <p className="text-sm text-gray-500">Configurez l&apos;apparence et les informations du site</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</>
          ) : saved ? (
            <><Save className="w-4 h-4" />Enregistré ✓</>
          ) : (
            <><Save className="w-4 h-4" />Enregistrer</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 p-6">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Informations générales</h3>
            <div>
              <label className={labelClass}>Nom du site</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateSetting("siteName", e.target.value)}
                className={inputClass}
                placeholder="Sn Shop16"
              />
            </div>
            <div>
              <label className={labelClass}>Description du site</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => updateSetting("siteDescription", e.target.value)}
                className={inputClass + " resize-none"}
                rows={2}
                placeholder="Votre destination mode féminine en Algérie"
              />
            </div>
            <div>
              <label className={labelClass}>Texte d&apos;annonce (barre supérieure)</label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => updateSetting("announcementText", e.target.value)}
                className={inputClass}
                placeholder="-10% SUR VOTRE PREMIÈRE COMMANDE"
              />
            </div>
            <div>
              <label className={labelClass}>Titre du hero banner</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => updateSetting("heroTitle", e.target.value)}
                className={inputClass}
                placeholder="NEW COLLECTION 2026"
              />
            </div>
            <div>
              <label className={labelClass}>Sous-titre du hero banner</label>
              <input
                type="text"
                value={settings.heroSubtitle}
                onChange={(e) => updateSetting("heroSubtitle", e.target.value)}
                className={inputClass}
                placeholder="Découvrez les dernières tendances..."
              />
            </div>
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === "images" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Images & Bannières</h3>
            <div>
              <label className={labelClass}>URL de l&apos;image hero</label>
              <input
                type="url"
                value={settings.heroImageUrl}
                onChange={(e) => updateSetting("heroImageUrl", e.target.value)}
                className={inputClass}
                placeholder="https://images.unsplash.com/photo-..."
              />
              {settings.heroImageUrl && (
                <div className="mt-3 relative aspect-[16/9] overflow-hidden bg-gray-100 max-w-md">
                  <img
                    src={settings.heroImageUrl}
                    alt="Hero preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <p className="mt-2 text-xs text-gray-400">Collez l&apos;URL d&apos;une image Unsplash ou autre. Laissez vide pour l&apos;image par défaut.</p>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact & Réseaux sociaux</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Téléphone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSetting("phone", e.target.value)}
                  className={inputClass}
                  placeholder="+213 656 12 34 56"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting("email", e.target.value)}
                  className={inputClass}
                  placeholder="contact@snshop.dz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro WhatsApp
                </label>
                <input
                  type="tel"
                  value={settings.whatsappNumber || ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black dir-ltr text-left"
                  placeholder="ex: 213656123456"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Numéro au format international sans + (ex: 213656123456). L&apos;icône WhatsApp s&apos;affichera dans le footer du site.
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <label className={labelClass}>Réseaux sociaux</label>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Instagram URL</label>
                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(e) => updateSetting("instagramUrl", e.target.value)}
                  className={inputClass}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Facebook URL</label>
                <input
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(e) => updateSetting("facebookUrl", e.target.value)}
                  className={inputClass}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">TikTok URL</label>
                <input
                  type="url"
                  value={settings.tiktokUrl}
                  onChange={(e) => updateSetting("tiktokUrl", e.target.value)}
                  className={inputClass}
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* SHIPPING TAB */}
        {activeTab === "shipping" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Tarifs de livraison</h3>
              <input
                type="text"
                placeholder="Rechercher une wilaya..."
                value={ratesSearch}
                onChange={(e) => setRatesSearch(e.target.value)}
                className="w-60 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-600 w-14">Code</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Wilaya</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-gray-600">Maison (DA)</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-gray-600">Bureau (DA)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map((rate, idx) => {
                    const origIdx = rates.findIndex((r) => r.code === rate.code);
                    return (
                      <tr key={rate.code} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-mono text-xs text-gray-500">{rate.code}</td>
                        <td className="py-2 px-3 font-medium text-gray-800">{rate.nameAr}</td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            value={rate.homePrice}
                            onChange={(e) => updateRate(origIdx, "homePrice", e.target.value)}
                            className="w-24 border border-gray-200 px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            value={rate.officePrice}
                            onChange={(e) => updateRate(origIdx, "officePrice", e.target.value)}
                            className="w-24 border border-gray-200 px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRACKING TAB */}
        {activeTab === "tracking" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Pixels de suivi</h3>
            <p className="text-sm text-gray-500">Configurez vos identifiants de pixels publicitaires. Ils seront automatiquement injectés dans toutes les pages du site.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Pixel ID (معرف بيكسل فيسبوك)
              </label>
              <input
                type="text"
                placeholder="مثال: 123456789012345"
                value={settings.metaPixelId || ""}
                onChange={(e) => updateSetting("metaPixelId", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black dir-ltr text-left"
              />
              <p className="text-xs text-gray-500 mt-1">
                اترك الخانة فارغة إذا كنت لا تريد تفعيل البيكسل حالياً.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TikTok Pixel ID (معرف بيكسل تيك توك)
              </label>
              <input
                type="text"
                placeholder="مثال: C0000000000000000000000"
                value={settings.tiktokPixelId || ""}
                onChange={(e) => updateSetting("tiktokPixelId", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black dir-ltr text-left"
              />
              <p className="text-xs text-gray-500 mt-1">
                اترك الخانة فارغة إذا كنت لا تريد تفعيل البيكسل حالياً.
              </p>
            </div>
          </div>
        )}

        {/* MAINTENANCE TAB */}
        {activeTab === "maintenance" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Mode Maintenance</h3>
            <p className="text-sm text-gray-500">
              Lorsque le mode maintenance est activé, seuls les administrateurs peuvent accéder au site.
              Les visiteurs seront redirigés vers la page de maintenance.
            </p>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div>
                <p className="text-sm font-medium text-gray-900">Activer le mode maintenance</p>
                <p className="text-xs text-gray-500 mt-1">
                  {settings.maintenanceMode ? "Le site est actuellement en maintenance" : "Le site est actuellement en ligne"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting("maintenanceMode" as any, settings.maintenanceMode ? "false" : "true")}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? "bg-red-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Note: Le toggle dans le code middleware (src/middleware.ts) doit aussi être mis à jour pour appliquer le changement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
