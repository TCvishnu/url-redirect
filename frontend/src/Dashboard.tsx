import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const socket = io("http://localhost:3000");

function Card({ children, className = "", title }) {
  return (
    <div
      className={`bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg overflow-hidden ${className}`}
    >
      {title && (
        <div className="border-b border-[#1F1F1F] px-4 py-2 bg-[#0F0F0F]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">
            {title}
          </span>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const shortCode = "demo";
  const [liveEvents, setLiveEvents] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.emit("join", shortCode);
    socket.on("new-click", (data) => {
      setLiveEvents((prev) => [data, ...prev.slice(0, 9)]);
      setCount((c) => c + 1);
    });
    return () => socket.off("new-click");
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] font-mono selection:bg-white selection:text-black">
      <div className="max-w-350 mx-auto p-6 lg:p-12">
        {/* TOP NAV / HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#1F1F1F] pb-8 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white uppercase">
              Traffic_Control <span className="text-[#444]">v1.0</span>
            </h1>
            <p className="text-sm text-[#666] mt-1 font-sans">
              Real-time performance metrics for /{shortCode}
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] text-[#444] uppercase font-bold">
                Status
              </p>
              <p className="text-sm text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />{" "}
                Synchronized
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#444] uppercase font-bold">
                Latency
              </p>
              <p className="text-sm text-white">24ms</p>
            </div>
          </div>
        </header>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#1F1F1F] divide-y md:divide-y-0 md:divide-x divide-[#1F1F1F] mb-12">
          <div className="p-8 bg-[#0A0A0A]">
            <p className="text-xs text-[#666] uppercase mb-4">Total_Events</p>
            <div className="text-5xl font-bold tracking-tighter">
              {count.toLocaleString()}
            </div>
          </div>
          <div className="p-8 bg-[#0A0A0A]">
            <p className="text-xs text-[#666] uppercase mb-4">Unique_Reach</p>
            <div className="text-5xl font-bold tracking-tighter text-[#333]">
              --
            </div>
          </div>
          <div className="p-8 bg-[#0A0A0A]">
            <p className="text-xs text-[#666] uppercase mb-4">
              Conversion_Rate
            </p>
            <div className="text-5xl font-bold tracking-tighter text-[#333]">
              0.0%
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CHART AREA */}
          <div className="lg:col-span-8">
            <Card title="Activity_Graph" className="h-full">
              <div className="h-100 w-full flex flex-col items-center justify-center relative">
                {/* Visual Placeholder for a Grid */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    size: "40px 40px",
                    backgroundSize: "40px 40px",
                  }}
                />
                <span className="text-[#333] text-xs uppercase tracking-[0.3em]">
                  Initialize Chart Engine
                </span>
              </div>
            </Card>
          </div>

          {/* LIVE FEED AREA */}
          <div className="lg:col-span-4">
            <Card title="Live_Stream" className="flex flex-col h-full">
              <div className="space-y-1 font-mono text-[11px] overflow-y-auto max-h-100">
                <AnimatePresence initial={false}>
                  {liveEvents.map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 hover:bg-[#111] border-b border-[#161616] group"
                    >
                      <span className="text-[#444] whitespace-nowrap">
                        [{new Date().toLocaleTimeString([], { hour12: false })}]
                      </span>
                      <span className="text-white">EVNT_CLICK</span>
                      <span className="text-[#666] truncate">
                        — {e.country || "LOC_UNK"}
                      </span>
                      <span className="ml-auto text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {liveEvents.length === 0 && (
                  <div className="py-20 text-center text-[#333] uppercase text-[10px] tracking-widest">
                    Listening_for_socket_events...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* SUB-GRIDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {["GEO_DISTRIBUTION", "DEVICE_OS", "REF_SOURCE", "SESSION_DEPTH"].map(
            (label) => (
              <div
                key={label}
                className="border border-[#1F1F1F] p-4 bg-[#0A0A0A]"
              >
                <p className="text-[10px] text-[#444] font-bold uppercase mb-4 italic">
                  {label}
                </p>
                <div className="h-1 bg-[#1F1F1F] w-full" />
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
