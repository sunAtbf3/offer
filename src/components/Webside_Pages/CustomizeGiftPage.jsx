import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Heart,
  FileCheck2,
  RefreshCw,
  X,
  Send,
  Image as ImageIcon,
  ChevronDown,
  Eye
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function CustomizeGiftPage() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organizationName: "",
    cityState: "",
    occasion: "",
    giftCategory: "",
    quantity: "",
    deliveryDate: "",
    instructions: "",
  });

  const [customOccasion, setCustomOccasion] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomOccasion, setIsCustomOccasion] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // ── Multiple File Upload State (Max 3 files each) ──────────────
  const [referenceFiles, setReferenceFiles] = useState([]); // [{ id, file, preview, name, size }]
  const [logoFiles, setLogoFiles] = useState([]); // [{ id, file, preview, name, size }]
  const [previewModal, setPreviewModal] = useState(null); // { id, name, size, url, preview, isPdf }
  const referenceInputRef = useRef(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPreviewModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Math Captcha
  const [captcha, setCaptcha] = useState({ q: "", ans: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ q: `${a} + ${b} = ?`, ans: a + b });
    setUserAnswer("");
    setIsVerified(false);
  };

  const handleCaptchaChange = (e) => {
    const val = e.target.value.trim();
    setUserAnswer(val);
    setIsVerified(parseInt(val, 10) === captcha.ans);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    generateCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOccasionChange = (e) => {
    const val = e.target.value;
    if (val === "Other") {
      setIsCustomOccasion(true);
      setFormData((prev) => ({ ...prev, occasion: "Other" }));
    } else {
      setIsCustomOccasion(false);
      setCustomOccasion("");
      setFormData((prev) => ({ ...prev, occasion: val }));
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === "Other Specific Request") {
      setIsCustomCategory(true);
      setFormData((prev) => ({ ...prev, giftCategory: "Other Specific Request" }));
    } else {
      setIsCustomCategory(false);
      setCustomCategory("");
      setFormData((prev) => ({ ...prev, giftCategory: val }));
    }
  };

  const processFileList = (incomingFiles, currentFiles, maxCount, fieldLabel) => {
    const rawFiles = Array.from(incomingFiles || []);
    if (rawFiles.length === 0) return currentFiles;

    const available = maxCount - currentFiles.length;
    if (available <= 0) {
      toast.warning(`Maximum of ${maxCount} files already attached for ${fieldLabel}`);
      return currentFiles;
    }

    if (rawFiles.length > available) {
      toast.info(`Adding ${available} file(s) (maximum ${maxCount} allowed for ${fieldLabel})`);
    }

    const validNewFiles = [];
    for (const f of rawFiles.slice(0, available)) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 5MB size limit. Max 5MB allowed per file.`);
        continue;
      }

      const isPdf = f.type === "application/pdf" || /\.pdf$/i.test(f.name);
      const isSvg = f.type === "image/svg+xml" || /\.svg$/i.test(f.name);
      const isImg =
        !isPdf &&
        (f.type.startsWith("image/") ||
          /\.(jpe?g|png|webp|gif|bmp|tiff|heic|heif|avif|svg|jfif|ico)$/i.test(f.name));

      if (!isImg && !isPdf && !isSvg) {
        toast.error(`"${f.name}": Unsupported format. Please upload JPG, PNG, WEBP, SVG or PDF.`);
        continue;
      }

      let objectUrl = null;
      try {
        objectUrl = URL.createObjectURL(f);
      } catch (err) {
        console.error("ObjectURL creation error:", err);
      }

      validNewFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file: f,
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB",
        preview: isPdf ? null : objectUrl,
        pdfUrl: isPdf ? objectUrl : null,
        url: objectUrl,
        isPdf,
        isImg: isImg || isSvg,
      });
    }

    return [...currentFiles, ...validNewFiles];
  };

  const handleReferenceFilesChange = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (e.target) e.target.value = "";
    if (rawFiles.length === 0) return;
    setReferenceFiles((prev) => processFileList(rawFiles, prev, 6, "Reference Design"));
  };

  const removeReferenceFile = (id) => {
    setReferenceFiles((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove?.url) {
        try { URL.revokeObjectURL(itemToRemove.url); } catch (_) {}
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleLogoFilesChange = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (e.target) e.target.value = "";
    if (rawFiles.length === 0) return;
    setLogoFiles((prev) => processFileList(rawFiles, prev, 3, "Logo"));
  };

  const removeLogoFile = (id) => {
    setLogoFiles((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove?.url) {
        try { URL.revokeObjectURL(itemToRemove.url); } catch (_) {}
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleReferenceDrop = (e) => {
    e.preventDefault();
    const rawFiles = Array.from(e.dataTransfer?.files || []);
    if (rawFiles.length > 0) {
      setReferenceFiles((prev) => processFileList(rawFiles, prev, 6, "Reference Design"));
    }
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();
    const rawFiles = Array.from(e.dataTransfer?.files || []);
    if (rawFiles.length > 0) {
      setLogoFiles((prev) => processFileList(rawFiles, prev, 3, "Logo"));
    }
  };

  const clearAllFiles = () => {
    referenceFiles.forEach((item) => {
      if (item.url) try { URL.revokeObjectURL(item.url); } catch (_) {}
    });
    logoFiles.forEach((item) => {
      if (item.url) try { URL.revokeObjectURL(item.url); } catch (_) {}
    });
    setReferenceFiles([]);
    setLogoFiles([]);
    if (referenceInputRef.current) referenceInputRef.current.value = "";
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      toast.error("Please enter your name (at least 2 characters)");
      return;
    }
    // Email is optional (validate only if provided)
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Clean Indian 10-digit mobile number
    const cleanPhone = formData.phone.replace(/\D/g, "");
    let normalizedPhone = cleanPhone;
    if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      normalizedPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      normalizedPhone = cleanPhone.slice(1);
    }
    if (normalizedPhone.length !== 10 || !/^[6-9]\d{9}$/.test(normalizedPhone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (!formData.cityState.trim() || formData.cityState.trim().length < 2) {
      toast.error("Please enter your City & State");
      return;
    }

    const finalOccasion =
      formData.occasion === "Other" && customOccasion.trim()
        ? customOccasion.trim()
        : formData.occasion;
    if (!finalOccasion || finalOccasion === "Other" || finalOccasion.length < 2) {
      toast.error("Please select or enter your gifting occasion");
      return;
    }

    const finalCategory =
      formData.giftCategory === "Other Specific Request" && customCategory.trim()
        ? customCategory.trim()
        : formData.giftCategory;
    if (!finalCategory || finalCategory === "Other Specific Request" || finalCategory.length < 2) {
      toast.error("Please select or enter a gift category");
      return;
    }

    // Validate quantity: integer only
    const rawQty = String(formData.quantity || "").trim();
    const qtyInt = parseInt(rawQty, 10);
    if (!rawQty || !/^\d+$/.test(rawQty) || isNaN(qtyInt) || qtyInt < 1 || qtyInt > 100000) {
      toast.error("Quantity must be a positive whole number (e.g. 50 or 100)");
      return;
    }

    // Validate delivery date (must not be in the past)
    if (formData.deliveryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosenDate = new Date(formData.deliveryDate);
      if (chosenDate < today) {
        toast.error("Target delivery date cannot be in the past");
        return;
      }
    }

    // Message is required
    const msg = formData.instructions.trim();
    if (!msg) {
      toast.error("Please enter customization notes / message");
      return;
    }
    if (msg.length > 2000) {
      toast.error("Customization notes cannot exceed 2000 characters");
      return;
    }

    // Reference photos optional (0–6)
    if (referenceFiles.length > 6) {
      toast.error("Maximum 6 reference photos allowed");
      return;
    }

    // Logos optional (0–3)
    if (logoFiles.length > 3) {
      toast.error("Maximum 3 logo files allowed");
      return;
    }

    if (!isVerified) {
      toast.error("Please complete the anti-spam verification");
      return;
    }

    setStatus("loading");

    try {
      const fd = new FormData();
      fd.append("enquiryType", "custom");
      fd.append("name", formData.fullName.trim());
      if (formData.email.trim()) {
        fd.append("email", formData.email.trim().toLowerCase());
      }
      fd.append("phone", normalizedPhone);
      fd.append("city", formData.cityState.trim());
      if (formData.organizationName && formData.organizationName.trim()) {
        fd.append("organizationName", formData.organizationName.trim());
      }
      fd.append("occasion", finalOccasion);
      fd.append("giftCategory", finalCategory);
      fd.append("quantity", String(qtyInt));
      if (formData.deliveryDate) {
        fd.append("targetDeliveryDate", formData.deliveryDate);
      }
      fd.append("message", msg);

      referenceFiles.forEach((item) => fd.append("referencePhotos", item.file));
      logoFiles.forEach((item) => fd.append("logos", item.file));

      const rawBase = String(import.meta.env.VITE_BACKEND_BASE_URL || "/api").trim();
      const API_BASE = rawBase.replace(/\/api\/?$/, "");
      const endpoint = `${API_BASE}/api/gift-enquiries`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: fd,
        headers: {
          "x-storefront": "ecomm",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        setStatus("success");
        setIsDuplicate(false);
        setSubmittedData(data?.data || null);
        toast.success(data?.message || "Thanks! We received your enquiry and will contact you shortly.");
      } else if (response.status === 200 && data?.alreadyRegistered) {
        setStatus("success");
        setIsDuplicate(true);
        setSubmittedData(data?.data || null);
        toast.info(data?.message || "We already have your enquiry. Our team will contact you shortly.");
      } else {
        setStatus("idle");
        toast.error(data?.message || "Could not submit inquiry. Please check the form fields.");
      }
    } catch (err) {
      console.error("Customize gift submit error:", err);
      setStatus("idle");
      toast.error(err?.message || "Failed to submit inquiry. Please check your connection.");
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      organizationName: "",
      cityState: "",
      occasion: "",
      giftCategory: "",
      quantity: "",
      deliveryDate: "",
      instructions: "",
    });
    setCustomOccasion("");
    setCustomCategory("");
    setIsCustomOccasion(false);
    setIsCustomCategory(false);
    clearAllFiles();
    generateCaptcha();
    setStatus("idle");
    setIsDuplicate(false);
    setSubmittedData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 font-sans pb-16">
      {/* ── Top Header / Breadcrumbs ────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/80 sticky top-[68px] z-20 backdrop-blur-md bg-white/95">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold text-gray-600 hover:text-[#F7A221] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#F7A221] font-bold">Customize Gift</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 sm:pt-8 max-w-3xl">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-100">
              {status === "success" ? (
                /* ── SUCCESS STATE ── */
                <div className="py-12 px-4 text-center animate-fadeIn">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${
                      isDuplicate
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    <CheckCircle2 size={44} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                    {isDuplicate
                      ? "Enquiry Already Received!"
                      : "Gift Customization Request Received!"}
                  </h2>
                  <p className="text-gray-600 max-w-lg mx-auto text-sm sm:text-base mb-3 leading-relaxed">
                    {isDuplicate
                      ? `We already have an active enquiry for ${formData.email || "this contact"}. Our gifting team is reviewing your requirements and will contact you shortly.`
                      : `Thank you, ${formData.fullName || "Friend"}! We have received your custom gifting request. Our gifting specialist will prepare sample options & pricing within 24 hours.`}
                  </p>

                  {submittedData?.id && (
                    <div className="inline-block bg-amber-50 border border-amber-200 text-amber-900 px-4 py-1.5 rounded-full text-xs font-mono font-bold mb-6">
                      Reference ID: #{submittedData.id}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all shadow-md cursor-pointer"
                    >
                      <RefreshCw size={16} />
                      <span>Create Another Gift</span>
                    </button>
                    <a
                      href="https://wa.me/918888888888?text=Hi%20Offer%20Wale%20Baba,%20I%20just%20submitted%20a%20Customized%20Gift%20inquiry!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-md"
                    >
                      <FaWhatsapp size={18} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* ── FORM STATE ── */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                      <Sparkles size={24} className="text-[#F7A221]" />
                      <span>Custom Gift Design Details</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Tell us about your gifting requirement. Fields marked with{" "}
                      <span className="text-red-500 font-bold">*</span> are required.
                    </p>
                  </div>

                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Priya Patel"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="priya@domain.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                        />
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Phone & City/State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Phone / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                        />
                        <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        City &amp; State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cityState"
                          required
                          value={formData.cityState}
                          onChange={handleInputChange}
                          placeholder="e.g. Pune, Maharashtra"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                        />
                        <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Company / Organization Name (Optional) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Company / Organization Name <span className="text-gray-400 text-[11px] font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                    />
                  </div>

                  {/* Row 3: Occasion & Gift Category (Direct in-place input if "Other") */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Occasion field */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Occasion / Purpose <span className="text-red-500">*</span>
                      </label>
                      {formData.occasion === "Other" || isCustomOccasion ? (
                        <div className="relative animate-fadeIn">
                          <input
                            type="text"
                            required
                            value={customOccasion}
                            onChange={(e) => setCustomOccasion(e.target.value)}
                            placeholder="Type your occasion (e.g. Farewell party, Housewarming...)"
                            autoFocus
                            className="w-full pl-4 pr-28 py-3 bg-white border-2 border-[#F7A221] rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomOccasion(false);
                              setCustomOccasion("");
                              setFormData((prev) => ({ ...prev, occasion: "" }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Back to dropdown options"
                          >
                            <span>Select list</span>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      ) : (
                        <select
                          name="occasion"
                          required
                          value={formData.occasion}
                          onChange={handleOccasionChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none cursor-pointer"
                        >
                          <option value="">Select Occasion</option>
                          <option value="Corporate / Employee Welcome Kit">Corporate / Employee Welcome Kit</option>
                          <option value="Diwali / Festive Corporate Gifts">Diwali / Festive Corporate Gifts</option>
                          <option value="Wedding / Anniversary Return Favors">Wedding / Anniversary Return Favors</option>
                          <option value="Promotional Brand Swag & Events">Promotional Brand Swag &amp; Events</option>
                          <option value="Birthday / Milestone Celebration">Birthday / Milestone Celebration</option>
                          <option value="VIP Client Appreciation Box">VIP Client Appreciation Box</option>
                          <option value="Personal / Family Gifting">Personal / Family Gifting</option>
                          <option value="Other">Other (Specify / Type your own)</option>
                        </select>
                      )}
                    </div>

                    {/* Gift Category field */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Gift Category / Product Type <span className="text-red-500">*</span>
                      </label>
                      {formData.giftCategory === "Other Specific Request" || isCustomCategory ? (
                        <div className="relative animate-fadeIn">
                          <input
                            type="text"
                            required
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Type your gift category / product request..."
                            autoFocus
                            className="w-full pl-4 pr-28 py-3 bg-white border-2 border-[#F7A221] rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomCategory(false);
                              setCustomCategory("");
                              setFormData((prev) => ({ ...prev, giftCategory: "" }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Back to dropdown options"
                          >
                            <span>Select list</span>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      ) : (
                        <select
                          name="giftCategory"
                          required
                          value={formData.giftCategory}
                          onChange={handleCategoryChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none cursor-pointer"
                        >
                          <option value="">Select Product Category</option>
                          <option value="Executive Hampers & Gift Boxes">Executive Hampers &amp; Gift Boxes</option>
                          <option value="Custom Insulated Drinkware & Mugs">Custom Insulated Drinkware &amp; Mugs</option>
                          <option value="Smart Gadgets & Tech Accessories">Smart Gadgets &amp; Tech Accessories</option>
                          <option value="Diaries, Metal Pens & Stationery Kits">Diaries, Metal Pens &amp; Stationery Kits</option>
                          <option value="Artificial Jewellery & Fashion Keepsakes">Artificial Jewellery &amp; Fashion Keepsakes</option>
                          <option value="Custom T-Shirts, Hoodies & Caps">Custom T-Shirts, Hoodies &amp; Caps</option>
                          <option value="Home & Kitchen Lifestyle Sets">Home &amp; Kitchen Lifestyle Sets</option>
                          <option value="Other Specific Request">Other Specific Request (Specify / Type your own)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Quantity & Target Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Estimated Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        name="quantity"
                        required
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="e.g. 50, 100, 250"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Target Delivery Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="deliveryDate"
                          value={formData.deliveryDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 6: Two Uploading Fields: 1. Logo  2. Reference Design (Compact, Max 3 each) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ── 1. Logo Field ── */}
                    <div className="bg-gray-50/60 border border-gray-200 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[#F7A221]" />
                            <span>1. Logo</span>
                            <span className="text-gray-400 font-normal lowercase text-[11px]">(optional)</span>
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              logoFiles.length === 3
                                ? "bg-emerald-100 text-emerald-800"
                                : logoFiles.length > 0
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-amber-50 text-amber-800 border border-amber-200/80"
                            }`}
                          >
                            {logoFiles.length}/3 files
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">
                          Upload brand logo or artwork (Images or PDF &bull; Max 5 MB each).
                        </p>

                        {/* Grid preview of uploaded logo files */}
                        {logoFiles.length > 0 && (
                          <div className="grid grid-cols-3 gap-2.5 mb-3 animate-fadeIn">
                            {logoFiles.map((item, idx) => (
                              <div
                                key={item.id}
                                onClick={() => setPreviewModal(item)}
                                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#F7A221] bg-white shadow-2xs transition-all flex items-center justify-center p-1.5 cursor-pointer"
                                title="Click to preview"
                              >
                                {item.preview ? (
                                  <img
                                    src={item.preview}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-1 text-center w-full">
                                    <FileCheck2 size={24} className="text-[#D97706] mb-1 shrink-0" />
                                    <span className="text-[10px] font-bold text-gray-800 truncate max-w-full leading-tight">
                                      {item.name || "PDF File"}
                                    </span>
                                    <span className="text-[9px] text-[#D97706] font-semibold mt-0.5">
                                      👁 Click to view
                                    </span>
                                  </div>
                                )}

                                {/* Hover overlay with eye icon */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Eye size={12} />
                                    <span>Preview</span>
                                  </span>
                                </div>

                                {/* Badge number */}
                                <span className="absolute bottom-1 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10 pointer-events-none">
                                  #{idx + 1}
                                </span>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeLogoFile(item.id);
                                  }}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer z-20"
                                  title={`Remove ${item.name}`}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}

                            {/* Inline '+ Add' slot if under 3 files */}
                            {logoFiles.length < 3 && (
                              <label
                                htmlFor="gift-logo-upload"
                                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#F7A221] bg-white/80 hover:bg-orange-50/40 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2 group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-1 group-hover:scale-105 group-hover:border-[#F7A221] transition-transform">
                                  <Upload size={13} className="text-gray-500 group-hover:text-[#F7A221]" />
                                </div>
                                <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#D97706] leading-tight">
                                  + Add Logo
                                </span>
                                <span className="text-[9px] text-gray-400 mt-0.5">
                                  ({3 - logoFiles.length} left)
                                </span>
                              </label>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Dropzone when empty, or helper bar when files are attached */}
                      <div>
                        {logoFiles.length === 0 ? (
                          <label
                            htmlFor="gift-logo-upload"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleLogoDrop}
                            className="flex items-center justify-center gap-2.5 border-2 border-dashed border-gray-300 hover:border-[#F7A221] bg-white/80 hover:bg-orange-50/30 rounded-xl py-3 px-3 cursor-pointer transition-all text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#F7A221] transition-transform">
                              <Upload size={16} className="text-gray-500 group-hover:text-[#F7A221]" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-gray-800 group-hover:text-[#D97706] leading-tight">
                                Upload Logo Files
                              </p>
                              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                                Select up to 3 files (PNG, JPG, WEBP, SVG or PDF &bull; Max 5 MB)
                              </p>
                            </div>
                          </label>
                        ) : logoFiles.length === 3 ? (
                          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3 text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Max 3 logo files attached</span>
                          </div>
                        ) : (
                          <label
                            htmlFor="gift-logo-upload"
                            className="flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F7A221] bg-white hover:bg-orange-50/20 rounded-xl py-2 px-3 cursor-pointer transition-all text-center group"
                          >
                            <Upload size={13} className="text-gray-500 group-hover:text-[#F7A221]" />
                            <span className="text-xs font-bold text-gray-700 group-hover:text-[#D97706]">
                              Click to add another logo ({3 - logoFiles.length} slots left)
                            </span>
                          </label>
                        )}

                        <input
                          id="gift-logo-upload"
                          ref={logoInputRef}
                          type="file"
                          multiple
                          accept="image/*,.jpg,.jpeg,.png,.webp,.svg,.pdf,application/pdf"
                          onChange={handleLogoFilesChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* ── 2. Reference Design Field ── */}
                    <div className="bg-gray-50/60 border border-gray-200 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                            <ImageIcon size={14} className="text-[#F7A221]" />
                            <span>2. Product Reference</span>
                            <span className="text-gray-400 font-normal lowercase text-[11px]">(optional)</span>
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              referenceFiles.length === 6
                                ? "bg-emerald-100 text-emerald-800"
                                : referenceFiles.length > 0
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-amber-50 text-amber-800 border border-amber-200/80"
                            }`}
                          >
                            {referenceFiles.length}/6 photos
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">
                          Upload sample designs or references (Images only &bull; Max 5 MB each).
                        </p>

                        {/* Grid preview of uploaded reference photos */}
                        {referenceFiles.length > 0 && (
                          <div className="grid grid-cols-3 gap-2.5 mb-3 animate-fadeIn">
                            {referenceFiles.map((item, idx) => (
                              <div
                                key={item.id}
                                onClick={() => setPreviewModal(item)}
                                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#F7A221] bg-white shadow-2xs transition-all cursor-pointer"
                                title="Click to preview"
                              >
                                <img
                                  src={item.preview || item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />

                                {/* Dark overlay on hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Eye size={12} />
                                    <span>Preview</span>
                                  </span>
                                </div>

                                {/* Photo number badge */}
                                <span className="absolute bottom-1 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10 pointer-events-none">
                                  #{idx + 1}
                                </span>

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeReferenceFile(item.id);
                                  }}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer z-20"
                                  title={`Remove ${item.name}`}
                                >
                                  <X size={13} />
                                </button>

                                {/* File size */}
                                <span className="absolute bottom-1 right-1.5 text-[9px] text-gray-200 truncate max-w-[55%] pointer-events-none z-10">
                                  {item.size}
                                </span>
                              </div>
                            ))}

                            {/* Inline '+ Add' slot if under 6 photos */}
                            {referenceFiles.length < 6 && (
                              <label
                                htmlFor="gift-reference-upload"
                                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#F7A221] bg-white/80 hover:bg-orange-50/40 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-2 group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-1 group-hover:scale-105 group-hover:border-[#F7A221] transition-transform">
                                  <Upload size={13} className="text-gray-500 group-hover:text-[#F7A221]" />
                                </div>
                                <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#D97706] leading-tight">
                                  + Add Photo
                                </span>
                                <span className="text-[9px] text-gray-400 mt-0.5">
                                  ({6 - referenceFiles.length} left)
                                </span>
                              </label>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Dropzone when empty, or helper bar when files are attached */}
                      <div>
                        {referenceFiles.length === 0 ? (
                          <label
                            htmlFor="gift-reference-upload"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleReferenceDrop}
                            className="flex items-center justify-center gap-2.5 border-2 border-dashed border-gray-300 hover:border-[#F7A221] bg-white/80 hover:bg-orange-50/30 rounded-xl py-3 px-3 cursor-pointer transition-all text-center group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-[#F7A221] transition-transform">
                              <Upload size={16} className="text-gray-500 group-hover:text-[#F7A221]" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-gray-800 group-hover:text-[#D97706] leading-tight">
                                Upload Reference Photos
                              </p>
                              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                                Select 1–6 images (JPG, PNG, WEBP &bull; Max 5 MB each)
                              </p>
                            </div>
                          </label>
                        ) : referenceFiles.length === 6 ? (
                          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3 text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Max 6 reference photos attached</span>
                          </div>
                        ) : (
                          <label
                            htmlFor="gift-reference-upload"
                            className="flex items-center justify-center gap-2 border border-gray-200 hover:border-[#F7A221] bg-white hover:bg-orange-50/20 rounded-xl py-2 px-3 cursor-pointer transition-all text-center group"
                          >
                            <Upload size={13} className="text-gray-500 group-hover:text-[#F7A221]" />
                            <span className="text-xs font-bold text-gray-700 group-hover:text-[#D97706]">
                              Click to add another photo ({6 - referenceFiles.length} slots left)
                            </span>
                          </label>
                        )}

                        <input
                          id="gift-reference-upload"
                          ref={referenceInputRef}
                          type="file"
                          multiple
                          accept="image/*,.jpg,.jpeg,.png,.webp,.svg"
                          onChange={handleReferenceFilesChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 7: Special Instructions / Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Customization Notes &amp; Special Instructions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="instructions"
                      required
                      rows={4}
                      value={formData.instructions}
                      onChange={handleInputChange}
                      placeholder="Specify font preferences, custom greeting message for inside card, packaging box color scheme, individual employee names, or any special requests..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#F7A221] focus:ring-4 focus:ring-[#F7A221]/15 transition-all outline-none resize-y"
                    />
                  </div>

                  {/* Math Verification Anti-Spam */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Anti-Spam Verification <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-xl font-mono font-bold text-gray-800 text-sm select-none tracking-widest">
                        {captcha.q}
                      </div>
                      <input
                        type="number"
                        required
                        value={userAnswer}
                        onChange={handleCaptchaChange}
                        placeholder="Answer"
                        className="w-28 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-[#F7A221] outline-none"
                      />
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="New question"
                      >
                        <RefreshCw size={16} />
                      </button>
                      {isVerified && (
                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={16} /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-medium text-sm sm:text-base tracking-wide uppercase transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                    >
                      {status === "loading" ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Custom Request...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} className="text-[#F7A221]" />
                          <span>Submit Customize Gift Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
          </div>
        </div>

      {/* ── Image & File Lightbox Preview Modal ── */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-bold text-gray-900 truncate">{previewModal.name}</p>
                <p className="text-xs text-gray-400">
                  {previewModal.size} &bull; {previewModal.isPdf ? "PDF Document" : "Image Preview"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title="Close preview (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-full flex items-center justify-center max-h-[65vh] overflow-auto rounded-2xl bg-gray-50 border border-gray-200 p-3">
              {previewModal.isPdf ? (
                <div className="text-center py-10 px-4">
                  <FileCheck2 size={54} className="text-[#D97706] mx-auto mb-3" />
                  <h4 className="text-base font-bold text-gray-900 mb-1">{previewModal.name}</h4>
                  <p className="text-xs text-gray-500 mb-5">
                    Vector / PDF Document ({previewModal.size})
                  </p>
                  <a
                    href={previewModal.url || previewModal.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    <span>Open / View PDF Document</span>
                  </a>
                </div>
              ) : (
                <img
                  src={previewModal.preview || previewModal.url}
                  alt={previewModal.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
                />
              )}
            </div>

            <div className="w-full pt-3 flex items-center justify-between text-xs text-gray-400">
              <span>Click outside or press Esc to close</span>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="font-bold text-gray-700 hover:text-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
