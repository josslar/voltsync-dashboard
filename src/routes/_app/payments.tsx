import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app";
import { useDevices } from "@/store/devices";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Info,
  Loader2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/_app/payments")({
  component: PaymentsPage,
  head: () => ({ meta: [{ title: "Buy Units — VOLTREX" }] }),
});

interface Provider {
  id: string;
  name: string;
  color: string;
  textColor: string;
  gradient: string;
  glowColor: string;
  logoText: string;
  feePercent: number;
}

const PROVIDERS: Provider[] = [
  {
    id: "airtel",
    name: "Airtel Money",
    color: "#E31937",
    textColor: "text-white",
    gradient: "from-[#FF415A] to-[#E31937]",
    glowColor: "rgba(227, 25, 55, 0.4)",
    logoText: "airtel",
    feePercent: 0.8,
  },
  {
    id: "halopesa",
    name: "Halopesa",
    color: "#FF6C00",
    textColor: "text-white",
    gradient: "from-[#FF8F3D] to-[#FF6C00]",
    glowColor: "rgba(255, 108, 0, 0.4)",
    logoText: "halotel",
    feePercent: 0.5,
  },
  {
    id: "yas",
    name: "Mix by Yas",
    color: "#7C3AED",
    textColor: "text-white",
    gradient: "from-[#A78BFA] via-[#7C3AED] to-[#EC4899]",
    glowColor: "rgba(124, 58, 237, 0.45)",
    logoText: "YAS",
    feePercent: 0.0, // Promo!
  },
];

const TZS_PER_UNIT = 350; // Cost of 1 unit (kWh) in Tanzanian Shillings

function PaymentsPage() {
  const language = useAppStore((s) => s.language);
  const energyUnits = useAppStore((s) => s.energyUnits);
  const setEnergyUnits = useAppStore((s) => s.setEnergyUnits);
  const pushNotification = useAppStore((s) => s.pushNotification);
  const pushHistory = useDevices((s) => s.pushHistory);

  const t = useTranslation(language);

  // Form State
  const [selectedProvider, setSelectedProvider] = useState<Provider>(PROVIDERS[0]);
  const [meterNumber, setMeterNumber] = useState("MTR-4029-VOLT");
  const [amountStr, setAmountStr] = useState("10000");
  const [phoneNumber, setPhoneNumber] = useState("0782456789");
  
  // Validation / UI State
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "ussd_push" | "pin_entry" | "processing" | "success">("idle");
  const [purchasedUnitsAmount, setPurchasedUnitsAmount] = useState(0);

  // Live Unit calculation
  const amountVal = parseFloat(amountStr) || 0;
  const calculatedUnits = amountVal / TZS_PER_UNIT;
  const transactionFee = (amountVal * selectedProvider.feePercent) / 100;
  const totalCharge = amountVal + transactionFee;

  const handleProviderSelect = (p: Provider) => {
    setSelectedProvider(p);
    // Auto adjust mock phones to match provider prefix
    if (p.id === "airtel" && !phoneNumber.startsWith("078") && !phoneNumber.startsWith("068")) {
      setPhoneNumber("0782456789");
    } else if (p.id === "halopesa" && !phoneNumber.startsWith("062")) {
      setPhoneNumber("0629456789");
    } else if (p.id === "yas" && !phoneNumber.startsWith("062") && !phoneNumber.startsWith("061")) {
      setPhoneNumber("0625345678");
    }
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Simple Tanzanian Phone number regex check (starts with 06 or 07, total 10 digits)
    const phoneRegex = /^(06|07)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMsg(
        language === "sw" 
          ? "Tafadhali weka namba sahihi ya simu ya Tanzania (k.m. 078XXXXXXX)" 
          : "Please enter a valid 10-digit Tanzanian phone number (e.g., 078XXXXXXX)"
      );
      return;
    }

    if (amountVal < 1000) {
      setErrorMsg(
        language === "sw"
          ? "Kiasi cha chini kabisa ni TZS 1,000"
          : "Minimum amount is 1,000 TZS"
      );
      return;
    }

    if (!meterNumber.trim()) {
      setErrorMsg(
        language === "sw" ? "Tafadhali weka namba ya mita" : "Please enter meter number"
      );
      return;
    }

    // Capture units purchased
    setPurchasedUnitsAmount(calculatedUnits);
    
    // Begin simulated USSD push process
    setPaymentStatus("ussd_push");

    // Phase 1: USSD Push
    setTimeout(() => {
      setPaymentStatus("pin_entry");
      
      // Phase 2: Awaiting PIN
      setTimeout(() => {
        setPaymentStatus("processing");
        
        // Phase 3: Processing
        setTimeout(() => {
          // Success! Update global states
          setEnergyUnits((prev) => prev + calculatedUnits);
          
          pushHistory({
            event: "Units Purchased",
            detail: `${calculatedUnits.toFixed(1)} kWh via ${selectedProvider.name} (${amountVal.toLocaleString()} TZS)`,
            level: "info",
          });

          pushNotification({
            title: language === "sw" ? "Malipo Imekamilika" : "Token Purchase Successful",
            message: language === "sw" 
              ? `Vipimo ${calculatedUnits.toFixed(1)} vimeongezwa kwenye mita ${meterNumber}.`
              : `Successfully recharged ${calculatedUnits.toFixed(1)} units to meter ${meterNumber}.`,
            level: "info",
          });

          setPaymentStatus("success");
        }, 1800);
      }, 2500);
    }, 1500);
  };

  const resetForm = () => {
    setPaymentStatus("idle");
    setAmountStr("10000");
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {language === "sw" ? "Nunua Vipimo vya Umeme" : "Prepaid Unit Payments"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {language === "sw"
            ? "Ongeza vipimo vya umeme papo hapo kwa kutumia Airtel Money, Halopesa, au Mix by Yas."
            : "Instantly top up your electricity units (LUKU) via local mobile networks."}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Form panel */}
        <div className="panel rounded-2xl p-6 md:col-span-7 space-y-6">
          <form onSubmit={handleStartPayment} className="space-y-5">
            {/* Payment provider selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("paymentProvider")}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PROVIDERS.map((provider) => {
                  const active = selectedProvider.id === provider.id;
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleProviderSelect(provider)}
                      className={`relative overflow-hidden rounded-xl p-3 text-left transition-all duration-300 border ${
                        active
                          ? "border-primary/50"
                          : "border-border/60 bg-secondary/30 hover:bg-secondary/60"
                      }`}
                      style={{
                        boxShadow: active ? `0 8px 24px -6px ${provider.glowColor}` : "none",
                      }}
                    >
                      {/* Brand Gradient on active */}
                      {active && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${provider.gradient} opacity-90 -z-10`} />
                      )}
                      
                      <div className="flex flex-col h-full justify-between min-h-[4.5rem]">
                        <span
                          className={`text-lg font-bold tracking-tighter uppercase ${
                            active ? "text-white text-glow" : "text-foreground"
                          }`}
                        >
                          {provider.logoText}
                        </span>
                        <div>
                          <div className={`text-xs font-semibold ${active ? "text-white/90" : "text-foreground"}`}>
                            {provider.name}
                          </div>
                          <div className={`text-[9px] ${active ? "text-white/70" : "text-muted-foreground"}`}>
                            Fee: {provider.feePercent}%
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meter input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                {t("meterNumber")}
              </label>
              <input
                type="text"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value.toUpperCase())}
                className="w-full bg-secondary/40 border border-border focus:border-primary/50 focus:bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none transition"
                placeholder="e.g. MTR-4029-VOLT"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  {t("amount")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full bg-secondary/40 border border-border focus:border-primary/50 focus:bg-secondary rounded-xl pl-4 pr-12 py-2.5 text-sm outline-none transition"
                    placeholder="10000"
                    min="1000"
                    step="500"
                    required
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-muted-foreground">TZS</span>
                </div>
              </div>

              {/* Phone input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-secondary/40 border border-border focus:border-primary/50 focus:bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none transition"
                  placeholder="0782456789"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary/20 transition-all duration-200 mt-2"
            >
              <span>{language === "sw" ? "Nunua Sasa" : "Recharge Meter"}</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </form>
        </div>

        {/* Invoice Summary Panel */}
        <div className="md:col-span-5 space-y-4">
          <div className="panel rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {language === "sw" ? "Muhtasari wa Malipo" : "Invoice Summary"}
            </h3>

            {/* Calculations info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Electricity Tariff</span>
                <span className="font-medium">{TZS_PER_UNIT} TZS / kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meter Target</span>
                <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded border border-border">
                  {meterNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Selected</span>
                <span>{amountVal.toLocaleString()} TZS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Transaction Fee ({selectedProvider.feePercent}%)
                </span>
                <span>{transactionFee.toLocaleString()} TZS</span>
              </div>

              <hr className="border-border/60" />

              <div className="flex justify-between text-base font-semibold pt-1">
                <span>Total Payable</span>
                <span className="text-glow text-primary-glow">{totalCharge.toLocaleString()} TZS</span>
              </div>
            </div>

            {/* Simulated Units Output Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {language === "sw" ? "Vipimo Utakavyopokea" : "Total Units Acquired"}
                </div>
                <div className="text-2xl font-bold tracking-tight text-glow text-primary-glow mt-1">
                  {calculatedUnits.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">kWh</span>
                </div>
              </div>
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary-glow">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>

            {/* Secure payment pledge */}
            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="h-4.5 w-4.5 text-success shrink-0" />
              <span>Simulated SSL Encrypted USSD push payment gateway. Safe & secure.</span>
            </div>
          </div>

          {/* Current balance indicator */}
          <div className="panel rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">
                {language === "sw" ? "Salio la sasa la Vipimo" : "Current Account Balance"}
              </div>
              <div className="text-lg font-semibold mt-1">{energyUnits.toFixed(2)} kWh</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <Clock className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulated USSD Modal Dialog Overlay */}
      <AnimatePresence>
        {paymentStatus !== "idle" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="panel rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Background accent glow */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b ${selectedProvider.gradient} opacity-10 rounded-full blur-3xl`} />

              {paymentStatus === "ussd_push" && (
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-secondary/80 border border-border/80 rounded-2xl mx-auto flex items-center justify-center text-primary-glow animate-pulse">
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {language === "sw" ? "Ombi la USSD" : "USSD Push Initiated"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {language === "sw"
                      ? `Tunaomba idhini ya malipo kwenye simu yako ${phoneNumber}. Tafadhali subiri kidadisi cha PIN.`
                      : `Sending push prompt request to ${phoneNumber}. Please keep your phone unlocked.`}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-primary-glow" />
                    <span>Contacting operator...</span>
                  </div>
                </div>
              )}

              {paymentStatus === "pin_entry" && (
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-secondary/80 border border-border/80 rounded-2xl mx-auto flex items-center justify-center text-warning">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {language === "sw" ? "Ingiza PIN ya Malipo" : "Confirm PIN on Mobile"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {language === "sw"
                      ? `Tafadhali ingiza PIN yako kwenye simu yako ya mkononi kuthibitisha kiasi cha TZS ${amountVal.toLocaleString()}.`
                      : `Please enter your secret wallet PIN on your device to authorize transaction of ${amountVal.toLocaleString()} TZS.`}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-warning bg-warning/10 border border-warning/20 p-2 rounded-xl">
                    <Info className="h-4 w-4" />
                    <span>Awaiting user response on mobile phone...</span>
                  </div>
                </div>
              )}

              {paymentStatus === "processing" && (
                <div className="space-y-4">
                  <div className="h-16 w-16 bg-secondary/80 border border-border/80 rounded-2xl mx-auto flex items-center justify-center text-primary-glow">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-glow" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {language === "sw" ? "Kushughulikia Malipo..." : "Processing Payment..."}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {language === "sw"
                      ? "Miamala inathibitishwa na opereta wa mtandao. Tafadhali usifunge dirisha hili."
                      : "PIN verified. Finalizing unit generation and logging smart contract with network grid."}
                  </p>
                </div>
              )}

              {paymentStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  <div className="h-16 w-16 bg-success/20 border border-success/30 rounded-2xl mx-auto flex items-center justify-center text-success">
                    <CheckCircle2 className="h-9 w-9 text-glow" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-glow">
                      {language === "sw" ? "Malipo Yamefanikiwa!" : "Recharge Successful!"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {language === "sw" ? "Vipimo vyako vipya vimeongezwa" : "New units loaded on console"}
                    </p>
                  </div>

                  <div className="bg-secondary/60 p-4 rounded-2xl space-y-2 text-left text-xs font-mono border border-border/40">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchased:</span>
                      <span className="font-semibold text-foreground">+{purchasedUnitsAmount.toFixed(2)} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meter:</span>
                      <span className="text-foreground">{meterNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span className="text-foreground">{selectedProvider.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ref ID:</span>
                      <span className="text-foreground text-[10px] truncate max-w-[120px]">
                        TXN-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={resetForm}
                    className="w-full bg-success text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-success/90 transition duration-200"
                  >
                    {language === "sw" ? "Sawa" : "Back to Console"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
