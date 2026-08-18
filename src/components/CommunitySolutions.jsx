import React, { useState } from "react";

const farmerSteps = [
  {
    title: "🐄 Move Livestock",
    description:
      "Move cattle, goats and other livestock to higher ground immediately.",
    time: "15 - 20 minutes",
    visual: "🐄 ➜ ⛰️",
  },
  {
    title: "🌾 Secure Equipment",
    description:
      "Move tractors, pumps and farming tools away from flood-prone areas.",
    time: "20 minutes",
    visual: "🚜 ➜ 🏠",
  },
  {
    title: "💧 Protect Feed & Water",
    description:
      "Store feed supplies in a dry, elevated location.",
    time: "10 minutes",
    visual: "🌾 ➜ 📦",
  },
  {
    title: "🏠 Evacuate To Safe Hub",
    description:
      "Proceed immediately to the nearest Safe Hub before flood waters reach your area.",
    time: "Depart Now",
    visual: "📍 ➜ 🏠",
  },
];

export default function FloodAlertDemo() {
  const [screen, setScreen] = useState("alert");
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("read");

  const currentStep = farmerSteps[step];

  const nextStep = () => {
    if (step < farmerSteps.length - 1) {
      setStep(step + 1);
    } else {
      setScreen("safeHub");
    }
  };

  const playAudio = (file) => {
  const audio = new Audio(file);
  audio.play();
};
  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div
      style={{
        background: "#f1f5f9",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
        }}
      >
        {/* ALERT SCREEN */}
        {screen === "alert" && (
          <div
            style={{
              background: "#dc2626",
              color: "white",
              padding: "24px",
              borderRadius: "24px",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(220,38,38,.25)",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "12px",
              }}
            >
              🚨 🚨 🚨
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "28px",
              }}
            >
              VERIFIED FLOOD ALERT
            </h1>

            <p
              style={{
                lineHeight: 1.7,
                marginTop: "16px",
              }}
            >
              A flood has been reported and verified in your area.
            </p>

            <div style={infoBox}>
              ⏳ Estimated Impact
              <br />
              <strong>2 Hours 15 Minutes</strong>
            </div>

            <div style={infoBox}>
              🔴 Risk Level
              <br />
              <strong>HIGH</strong>
            </div>

            <div style={infoBox}>
              📍 Location
              <br />
              <strong>Ferndale River Basin</strong>
            </div>
              <br />  <br />  <br /> 
            <button
              onClick={() => setScreen("guide")}
              style={primaryBtn}
            >
              Take Next Steps
            </button>
          </div>
        )}

        {/* STEP GUIDE */}
        {screen === "guide" && (
          <>
            {/* Header */}
            <div
              style={{
                background: "#dc2626",
                color: "white",
                padding: "18px",
                borderRadius: "20px",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                🚨 Flood Alert
              </h2>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "18px",
                }}
              >
                👤 Farmer
                <br />
                Priorities: Livestock, Equipment, Feed
              </div>
            </div>

            {/* Mode Tabs */}
            <div style={card}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                {["voice", "visual", "read"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMode(tab)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "12px",
                      background:
                        mode === tab
                          ? "#15803d"
                          : "#e5e7eb",
                      color:
                        mode === tab
                          ? "#fff"
                          : "#111827",
                      fontWeight: "bold",
                    }}
                  >
                    {tab === "voice" && "🔊 Voice"}
                    {tab === "visual" && "🖼 Visual"}
                    {tab === "read" && "📖 Read"}
                  </button>
                ))}
              </div>
            </div>
                <br/><br/>
            {/* Step Progress */}
            <div style={card}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  marginBottom: "12px",
                }}
              >
                Step {step + 1} of 4
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {[0, 1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      flex: 1,
                      height: "12px",
                      borderRadius: "999px",
                      background:
                        dot <= step
                          ? "#16a34a"
                          : "#d1d5db",
                    }}
                  />
                ))}
              </div>

              <h2>{currentStep.title}</h2>

              {mode === "read" && (
                <>
                  <p>{currentStep.description}</p>

                  <div style={highlightBox}>
                    ⏱ Estimated Time:
                    <br />
                    <strong>{currentStep.time}</strong>
                  </div>
                </>
              )}

              {mode === "visual" && (
                <>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "64px",
                      marginTop: "30px",
                      marginBottom: "30px",
                    }}
                  >
                    {currentStep.visual}
                  </div>

                  <p>{currentStep.description}</p>
                </>
              )}

              {mode === "voice" && (
                <>
                  <button 
                   onMouseEnter={(e) => {
                      e.target.style.background = "#15803d";
                      e.target.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#eff6ff";
                      e.target.style.color = "#111827";
                    }}
                   style={voiceBtn}
                   onClick={() =>
                    playAudio("/sounds/engInstrct.mp3")
                    }
                  >
                    ▶ Listen in English
                  </button>

                  <button 
                  onMouseEnter={(e) => {
                    e.target.style.background = "#15803d";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#eff6ff";
                    e.target.style.color = "#111827";
                  }}

                  style={voiceBtn}
                   onClick={() =>
                    playAudio("/sounds/shona.mp3")
                    }
                  >
                    ▶ Listen in Shona
                  </button>

                  <button 
                   onMouseEnter={(e) => {
                    e.target.style.background = "#15803d";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#eff6ff";
                    e.target.style.color = "#111827";
                  }}
                   style={voiceBtn}
                   onClick={() =>
                    playAudio("/sounds/ZuluTransc.m4a")
                    }
                  >
                    ▶ Listen in isiZulu
                  </button>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={previousStep}
                  disabled={step === 0}
                  style={{
                    ...secondaryBtn,
                    opacity: step === 0 ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>

                <button
                  onClick={nextStep}
                  style={primaryBtn}
                >
                  {step === 3
                    ? "Find Safe Hub"
                    : "Next"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* SAFE HUB SCREEN */}
        {screen === "safeHub" && (
          <div style={card}>
            <h1
              style={{
                color: "#15803d",
                marginTop: 0,
              }}
            >
              🏠 SAFE HUB FOUND
            </h1>

            <div style={highlightBox}>
              ⚠ Flood Water Expected In
              <br />
              <strong>
                1 Hour 47 Minutes
              </strong>
              <br />
              <br />
              Recommended Departure:
              <br />
              <strong style={{ color: "#dc2626" }}>
                NOW
              </strong>
            </div>

            <h3>📍 Ferndale Community Centre</h3>

            <p>Distance: 2.3 km</p>
            <p>Travel Time: 8 minutes</p>
            <p>Capacity: 276 People</p>
            <p>✅ Status: Open</p>

            <div
              style={{
                background: "#eff6ff",
                borderRadius: "16px",
                padding: "20px",
                marginTop: "20px",
                marginBottom: "20px",
                textAlign: "center",
                lineHeight: "2",
                fontFamily: "monospace",
              }}
            >
              N
              <br />
              🏠 Safe Hub
              <br />
              │
              <br />
              │
              <br />
              │
              <br />
              │
              <br />
              📍 You
            </div>

            <button
              onClick={() =>
                setScreen("directions")
              }
              style={primaryBtn}
            >
              📍 GET DIRECTIONS
            </button>
          </div>
        )}

        {/* DIRECTIONS SCREEN */}
        {screen === "directions" && (
          <div style={card}>
  <h2>📍 Directions To Nearest Safe Hub</h2>

  <div style={highlightBox}>
    Destination:
    <br />
    <strong>Ferndale Community Centre</strong>
    <br />
    📍 2.3 km away
  </div>

  <button
    style={primaryBtn}
    onClick={() =>
      window.open(
        "https://www.google.com/maps/dir/?api=1&destination=Ferndale+Community+Centre",
        "_blank"
      )
    }
  >
    🗺️ Open Google Maps
  </button>

  <button
    onClick={() => setScreen("safe")}
    style={{
      ...secondaryBtn,
      marginTop: "10px",
      width: "100%",
    }}
  >
    Arrived At Safe Hub
  </button>
</div>
        )}

        {/* ARRIVAL SCREEN */}
        {screen === "safe" && (
          <div
            style={{
              ...card,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "80px",
              }}
            >
              ✅
            </div>

            <h1>You Have Reached Safety</h1>

            <div style={highlightBox}>
              Safe Hub:
              <br />
              <strong>
                Ferndale Community Centre
              </strong>
            </div>

            <div
              style={{
                textAlign: "left",
                marginTop: "20px",
                lineHeight: "2",
                  }}
            >
              ✅ Emergency Shelter
              <br />
              ✅ First Aid Available
              <br />
              ✅ Drinking Water
              <br />
              ✅ Food Supplies
              <br />
              ✅ Charging Stations
              <br />
              ✅ Community Volunteers
            </div>

            <div
              style={{
                marginTop: "20px",
                background: "#dcfce7",
                padding: "16px",
                borderRadius: "16px",
                color: "#166534",
                lineHeight: "1.7",
              }}
            >
              EcoKubatana helped you receive an early warning,
              understand what action to take, locate a Safe Hub,
              and safely evacuate before flood waters arrived.
            </div>

            <button
              onClick={() => {
                setScreen("alert");
                setStep(0);
                setMode("read");
              }}
              style={{
                ...primaryBtn,
                marginTop: "20px",
              }}
            >
              Instructions Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const card = {
  background: "#ffffff",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 20px 40px rgba(0,0,0,.08)",
};

const infoBox = {
  background: "rgba(255,255,255,.15)",
  borderRadius: "16px",
  padding: "14px",
  marginTop: "12px",
};

const highlightBox = {
  background: "#fef3c7",
  borderRadius: "16px",
  padding: "16px",
  marginTop: "16px",
  marginBottom: "16px",
};

const directionBox = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
  marginBottom: "10px",
};

const primaryBtn = {
  flex: 1,
  padding: "16px",
  border: "none",
  borderRadius: "14px",
  background: "#15803d",
  color: "#ffffff",
  fontWeight: "bold",
  cursor: "pointer",
};

const secondaryBtn = {
  flex: 1,
  padding: "16px",
  border: "none",
  borderRadius: "14px",
  background: "#e5e7eb",
  color: "#111827",
  fontWeight: "bold",
  cursor: "pointer",
};

const voiceBtn = {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "14px",
  marginBottom: "10px",
  background: "#eff6ff",
  color: "#111827",
  cursor: "pointer",
  fontWeight: "bold",
};