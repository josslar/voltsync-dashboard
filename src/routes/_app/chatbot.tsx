import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app";
import { useDevices } from "@/store/devices";
import { useTelemetry } from "@/lib/hooks/useTelemetry";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  Info,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/_app/chatbot")({
  component: ChatbotPage,
  head: () => ({ meta: [{ title: "AI Assistant — VOLTREX" }] }),
});

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const LOCALIZED_DATA = {
  en: {
    welcome: "Hello! I am Voltrex AI, your grid assistant. Ask me anything about your current load, voltage levels, energy-saving tips, or unit status.",
    suggestUnits: "Check remaining energy units",
    suggestLoad: "Check current active power load",
    suggestSave: "Give me energy-saving tips",
    suggestGrid: "Are there any warning signals on the grid?",
    placeholder: "Ask Voltrex AI...",
    onlineStatus: "Telemetry Linked",
    typing: "Voltrex AI is thinking...",
    unitsResponse: (units: number) => `You currently have **${units.toFixed(2)}** energy units remaining. At your current active load, this is projected to last for approximately **${(units / 2.5).toFixed(1)} hours** under normal conditions.`,
    loadResponse: (load: number, count: number, onList: string) => `Your active load is **${load} W** across **${count} active devices** (${onList}). To extend your units, consider switching off high-wattage appliances when not in use.`,
    saveResponse: "Here are top energy-saving recommendations:\n\n1. **Off-peak scheduling**: Run heavy loads like the EV Charger (7200W) or Water Heater (3000W) when solar input is peak.\n2. **Auto-switch mode**: Turn on automated prediction execution under the *Predictions* tab to auto-shed load during pricing peaks.\n3. **HVAC Optimization**: Set your HVAC system to moderate eco-temperatures (each degree saves ~3-5% consumption).",
    gridResponse: (volts: number, source: string) => `The grid voltage is currently **${volts.toFixed(1)}V** running on **${source.toUpperCase()}** power. The grid frequency is nominal, and no critical anomalies have been reported in the past 60 minutes.`,
    defaultResponse: "I'm here to help! You can ask me things like 'How many units are left?', 'What is my current load?', or ask for energy-saving tips. Let me know how I can assist you with your Voltrex console.",
  },
  sw: {
    welcome: "Habari! Mimi ni Voltrex AI, msaidizi wako wa gridi ya umeme. Niulize chochote kuhusu mzigo wako wa sasa, viwango vya voltage, vidokezo vya kuokoa nishati, au hali ya vipimo vya umeme.",
    suggestUnits: "Angalia vipimo vya umeme vilivyobaki",
    suggestLoad: "Angalia mzigo wa sasa wa umeme",
    suggestSave: "Nipe vidokezo vya kuokoa nishati",
    suggestGrid: "Je, kuna ishara zozote za hatari kwenye gridi?",
    placeholder: "Uliza Voltrex AI...",
    onlineStatus: "Mawasiliano ya Gridi Yapo",
    typing: "Voltrex AI anafikiria...",
    unitsResponse: (units: number) => `Kwa sasa una vipimo **${units.toFixed(2)}** vya umeme vilivyosalia. Kulingana na mzigo wako wa sasa, vipimo hivi vinatarajiwa kudumu kwa takriban **${(units / 2.5).toFixed(1)} masaa** chini ya matumizi ya kawaida.`,
    loadResponse: (load: number, count: number, onList: string) => `Mzigo wako amilifu wa umeme kwa sasa ni **${load} W** ukitumiwa na **vifaa ${count}** vilivyowashwa (${onList}). Ili kuongeza muda wa vipimo vyako, fikiria kuzima vifaa vinavyotumia umeme mkubwa visipokuwa vikitumika.`,
    saveResponse: "Hapa kuna mapendekezo muhimu ya kuokoa nishati:\n\n1. **Ratiba ya Saa za Kawaida**: Washa vifaa vikubwa kama vile Chaja ya Gari la Umeme (7200W) au Hita ya Maji (3000W) wakati wa mchana nishati ya sola inapokuwa juu.\n2. **Njia ya Kubadili Kiotomatiki**: Washa utekelezaji wa utabiri wa kiotomatiki kwenye kichupo cha *Predictions* ili kupunguza mzigo wakati wa bei ya juu.\n3. **Ufanisi wa AC (HVAC)**: Weka mifumo ya viyoyozi kwenye nyuzi joto za wastani za kiikolojia ili kupunguza matumizi kwa 3-5%.",
    gridResponse: (volts: number, source: string) => `Voltage ya gridi kwa sasa ni **${volts.toFixed(1)}V** ikitumia chanzo cha **${source.toUpperCase()}**. Mzunguko wa gridi uko sawa, na hakuna hitilafu zilizoripotiwa katika dakika 60 zilizopita.`,
    defaultResponse: "Niko hapa kukusaidia! Unaweza kuniuliza maswali kama 'Kuna vipimo vingapi vilivyobaki?', 'Mzigo wangu ni kiasi gani?', au kuomba vidokezo vya kuokoa umeme. Nifahamishe jinsi ninavyoweza kukusaidia.",
  },
  de: {
    welcome: "Hallo! Ich bin Voltrex AI, Ihr Netzassistent. Fragen Sie mich nach Ihrer aktuellen Last, Netzspannung, Energiespartipps oder dem verbleibenden Guthaben.",
    suggestUnits: "Verbleibende Einheiten prüfen",
    suggestLoad: "Aktuelle Leistungslast prüfen",
    suggestSave: "Energiespartipps erhalten",
    suggestGrid: "Gibt es Warnsignale im Netz?",
    placeholder: "Fragen Sie Voltrex AI...",
    onlineStatus: "Telemetrieverbindung aktiv",
    typing: "Voltrex AI überlegt...",
    unitsResponse: (units: number) => `Sie haben derzeit **${units.toFixed(2)}** Einheiten übrig. Bei Ihrer aktuellen Last reicht dies unter normalen Bedingungen für etwa **${(units / 2.5).toFixed(1)} Stunden** aus.`,
    loadResponse: (load: number, count: number, onList: string) => `Ihre aktive Last beträgt **${load} W** bei **${count} aktiven Geräten** (${onList}). Um Guthaben zu sparen, schalten Sie stromhungrige Geräte bei Nichtgebrauch aus.`,
    saveResponse: "Hier sind unsere besten Energiesparempfehlungen:\n\n1. **Zeitplanung**: Betreiben Sie Großverbraucher wie EV-Ladegeräte (7200W) oder Warmwasserbereiter (3000W) bevorzugt bei hoher Solarstromerzeugung.\n2. **Automatischer Lastabwurf**: Aktivieren Sie die intelligenten Vorhersagen auf dem *Predictions*-Tab, um Geräte bei Spitzenpreisen automatisch abzuschalten.\n3. **Klimaanlagen-Eco**: Betreiben Sie Ihre Heizung/Klimaanlage im Eco-Modus. Jedes Grad spart ca. 3-5% Strom.",
    gridResponse: (volts: number, source: string) => `Die Netzspannung liegt derzeit bei **${volts.toFixed(1)}V** im **${source.toUpperCase()}**-Betrieb. Die Netzfrequenz ist nominal, und es wurden keine kritischen Anomalien gemeldet.`,
    defaultResponse: "Ich helfe Ihnen gerne weiter! Fragen Sie mich zum Beispiel: 'Wie viele Einheiten habe ich noch?', 'Wie hoch ist meine Last?' oder fragen Sie nach Energiespartipps.",
  },
};

function ChatbotPage() {
  const language = useAppStore((s) => s.language);
  const energyUnits = useAppStore((s) => s.energyUnits);
  const powerSource = useAppStore((s) => s.powerSource);
  const devices = useDevices((s) => s.devices);
  const readings = useTelemetry(5);
  const latestVoltage = readings[readings.length - 1]?.voltage ?? 230;

  const t = useTranslation(language);
  const dict = LOCALIZED_DATA[language] || LOCALIZED_DATA.en;

  const activeDevices = devices.filter((d) => d.status === "on");
  const activeLoad = activeDevices.reduce((sum, d) => sum + d.watts, 0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: dict.welcome,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      let replyText = "";
      const cleanedText = text.toLowerCase();

      if (
        cleanedText.includes("unit") ||
        cleanedText.includes("left") ||
        cleanedText.includes("vipimo") ||
        cleanedText.includes("baki") ||
        cleanedText.includes("guthaben") ||
        cleanedText.includes("verbleibende")
      ) {
        replyText = dict.unitsResponse(energyUnits);
      } else if (
        cleanedText.includes("load") ||
        cleanedText.includes("watt") ||
        cleanedText.includes("mzigo") ||
        cleanedText.includes("nguvu") ||
        cleanedText.includes("last") ||
        cleanedText.includes("verbrauch")
      ) {
        const onList = activeDevices.map((d) => `${d.name} [${d.watts}W]`).join(", ") || "none";
        replyText = dict.loadResponse(activeLoad, activeDevices.length, onList);
      } else if (
        cleanedText.includes("save") ||
        cleanedText.includes("saving") ||
        cleanedText.includes("tip") ||
        cleanedText.includes("okoa") ||
        cleanedText.includes("tipps") ||
        cleanedText.includes("sparen")
      ) {
        replyText = dict.saveResponse;
      } else if (
        cleanedText.includes("grid") ||
        cleanedText.includes("voltage") ||
        cleanedText.includes("volt") ||
        cleanedText.includes("frequency") ||
        cleanedText.includes("hz") ||
        cleanedText.includes("gridi") ||
        cleanedText.includes("netz") ||
        cleanedText.includes("strom")
      ) {
        replyText = dict.gridResponse(latestVoltage, powerSource);
      } else {
        replyText = dict.defaultResponse;
      }

      const botMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "bot",
        text: replyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(inputText);
    }
  };

  const promptSuggestions = [
    { label: dict.suggestUnits, icon: Zap },
    { label: dict.suggestLoad, icon: TrendingDown },
    { label: dict.suggestSave, icon: Sparkles },
    { label: dict.suggestGrid, icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
      {/* Bot Status Bar */}
      <div className="panel rounded-t-2xl px-5 py-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 text-primary-glow">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-background" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Voltrex AI Assistant</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              {dict.onlineStatus}
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-mono bg-secondary/60 px-3 py-1 rounded-md border border-border/40">
          Units: {energyUnits.toFixed(2)} kWh
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto panel border-y-0 p-5 space-y-4 bg-black/5 dark:bg-card/20 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-primary-glow" />
                )}
              </div>
              <div
                className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-secondary/80 text-foreground rounded-tl-none border border-border/40"
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert max-w-none">
                  {msg.text.split("**").map((part, index) =>
                    index % 2 === 1 ? (
                      <strong key={index} className="font-bold text-glow">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </div>
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    msg.sender === "user"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mr-auto"
            >
              <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-glow" />
              </div>
              <div className="bg-secondary/40 rounded-2xl px-4 py-3 border border-border/40 text-xs text-muted-foreground italic flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                {dict.typing}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="panel border-t-0 p-3 bg-card/45 flex flex-wrap gap-2 justify-center border-b border-border/60">
        {promptSuggestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendMessage(suggestion.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary border border-border/80 text-xs text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <Icon className="h-3 w-3 text-primary-glow" />
              <span>{suggestion.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Send Input Panel */}
      <div className="panel rounded-b-2xl p-3 border-t-0 flex items-center gap-2 bg-card/85">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={dict.placeholder}
          className="flex-1 bg-secondary/50 hover:bg-secondary/70 focus:bg-secondary border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm outline-none transition duration-200"
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSendMessage(inputText)}
          className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200"
          aria-label="Send message"
        >
          <Send className="h-4.5 w-4.5" />
        </motion.button>
      </div>
    </div>
  );
}
