/**
 * Public Landing Page
 * Implements T-019, T-021, T-028, and T-029.
 * Strictly adheres to docs/design.md:
 * - Light mode ONLY
 * - White (#FFFFFF) & Cobalt (#3157D5)
 * - Zero emoji anywhere
 * - Direct APK release section with checksum and sideload guidance
 */
import React, { useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  Shield,
  Download,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Smartphone,
  Check,
  ChevronRight,
  PhoneForwarded,
} from 'lucide-react';
import { STANDARD_PLANS } from '@callivaan/shared';

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [selectedVertical, setSelectedVertical] = useState<'repair' | 'salon' | 'property' | 'clinic'>('repair');

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section
        id="hero"
        style={{
          padding: '80px 0 64px 0',
          borderBottom: '1px solid #E4E8F0',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <h1
            style={{
              fontSize: '48px',
              lineHeight: '56px',
              fontWeight: 700,
              color: '#172033',
              marginBottom: '20px',
              letterSpacing: '-0.025em',
              textWrap: 'balance',
            }}
          >
            Never lose a customer call when you are busy serving one.
          </h1>

          <p
            style={{
              fontSize: '18px',
              lineHeight: '28px',
              color: '#667085',
              marginBottom: '36px',
            }}
          >
            Callivaan answers inbound calls 24/7 with a fluent Hindi and English voice agent, captures caller requirements, and delivers concise summaries straight to your WhatsApp.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onOpenAuth('signup')}
            >
              Start free trial
              <ArrowRight size={18} />
            </button>
            <a
              href="#apk"
              className="btn btn-secondary btn-lg"
              style={{ textDecoration: 'none' }}
            >
              <Download size={18} />
              Download Android APK
            </a>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '36px',
              fontSize: '13px',
              color: '#667085',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#3157D5" />
              <span>30 free minutes on signup</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#3157D5" />
              <span>No credit card required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#3157D5" />
              <span>Direct carrier call forwarding</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE PILLARS / HOW IT WORKS */}
      <section
        id="features"
        style={{
          padding: '72px 0',
          backgroundColor: '#F6F8FC',
          borderBottom: '1px solid #E4E8F0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <h2 style={{ fontSize: '30px', marginBottom: '12px' }}>How Callivaan operates</h2>
            <p style={{ fontSize: '16px' }}>
              Cloud telephony connects calls directly to our secure voice gateway. Your mobile handset remains free while leads are recorded.
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ padding: '32px 24px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#EEF2FC',
                  color: '#3157D5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <PhoneForwarded size={22} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>1. Route or Forward Calls</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Activate your dedicated cloud virtual number or forward busy calls from your existing SIM using standard carrier codes (*21*).
              </p>
            </div>

            <div className="card" style={{ padding: '32px 24px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#EEF2FC',
                  color: '#3157D5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <PhoneCall size={22} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. AI Voice Answers & Qualifies</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Your assistant speaks in Hindi, English, or Hinglish. It shares verified business facts, captures caller name, service needs, and preferred time.
              </p>
            </div>

            <div className="card" style={{ padding: '32px 24px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#EEF2FC',
                  color: '#3157D5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                <MessageSquare size={22} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>3. WhatsApp Summary & Control</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Receive structured lead summaries on WhatsApp after each call. Adjust your assistant prompt anytime by sending plain WhatsApp messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERTICAL PRESETS & SCENARIOS */}
      <section
        id="verticals"
        style={{
          padding: '72px 0',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E4E8F0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
            <h2 style={{ fontSize: '30px', marginBottom: '12px' }}>Tailored for your business type</h2>
            <p style={{ fontSize: '16px' }}>
              Choose a starter vertical template with pre-built FAQs, greetings, and lead extraction rules.
            </p>
          </div>

          {/* Vertical Tabs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'repair', label: 'Appliance & AC Repair' },
              { id: 'salon', label: 'Salon & Spa Wellness' },
              { id: 'property', label: 'Real Estate Consultant' },
              { id: 'clinic', label: 'Clinic & Healthcare' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVertical(v.id as any)}
                className={selectedVertical === v.id ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ padding: '8px 18px', fontSize: '14px' }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Interactive Vertical Card Preview */}
          <div className="card-subtle" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
            {selectedVertical === 'repair' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px' }}>Home & Appliance Repair Service</h3>
                  <span className="badge badge-info">Hindi & English Mix</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E4E8F0', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3157D5' }}>DEFAULT AGENT GREETING:</span>
                  <p style={{ fontSize: '14px', color: '#172033', marginTop: '4px' }}>
                    "Namaste! Callivaan Repair Services mein aapka swagat hai. Main AI assistant hoon. Main aapki kya madad kar sakta hoon?"
                  </p>
                </div>
                <div className="grid-2">
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Verified Facts & Rules:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Inspection charge ₹199; 30-day warranty on repairs.</li>
                      <li>Operating hours: 9:00 AM to 8:00 PM.</li>
                      <li>Strict rule: Never quote final repair cost before inspection.</li>
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Extracted Lead Fields:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Appliance model & issue description</li>
                      <li>Caller location & preferred inspection slot</li>
                      <li>Urgency flag (Urgent / Normal)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedVertical === 'salon' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px' }}>Salon & Beauty Wellness</h3>
                  <span className="badge badge-info">English & Hindi</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E4E8F0', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3157D5' }}>DEFAULT AGENT GREETING:</span>
                  <p style={{ fontSize: '14px', color: '#172033', marginTop: '4px' }}>
                    "Hello and welcome! Thank you for calling. I am your AI assistant. How may I help you today?"
                  </p>
                </div>
                <div className="grid-2">
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Verified Facts & Rules:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Hair styling, organic facials, and spa packages.</li>
                      <li>Open Tuesday to Sunday, 10:00 AM to 8:00 PM.</li>
                      <li>Walk-ins welcome; appointments prioritized.</li>
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Extracted Lead Fields:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Client name & callback phone</li>
                      <li>Requested salon services</li>
                      <li>Preferred appointment slot</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedVertical === 'property' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px' }}>Real Estate & Property Consultant</h3>
                  <span className="badge badge-info">Professional Hindi-English</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E4E8F0', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3157D5' }}>DEFAULT AGENT GREETING:</span>
                  <p style={{ fontSize: '14px', color: '#172033', marginTop: '4px' }}>
                    "Namaste! Real Estate consultation desk par swagat hai. Main AI assistant hoon. Aap rent ya purchase ke baare mein enquiry karna chahte hain?"
                  </p>
                </div>
                <div className="grid-2">
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Verified Facts & Rules:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Residential apartments, floors & commercial spaces.</li>
                      <li>Free complimentary site visits.</li>
                      <li>Never negotiate token or property prices on phone.</li>
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Extracted Lead Fields:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Property type (Rent / Buy)</li>
                      <li>Target budget & preferred sectors</li>
                      <li>Site visit date & time</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedVertical === 'clinic' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px' }}>Clinic & Healthcare Practice</h3>
                  <span className="badge badge-info">Concise Hindi-English</span>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E4E8F0', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3157D5' }}>DEFAULT AGENT GREETING:</span>
                  <p style={{ fontSize: '14px', color: '#172033', marginTop: '4px' }}>
                    "Namaste, clinic desk par swagat hai. Main AI appointment assistant hoon. Kya main aapke liye doctor consultation slot note karoon?"
                  </p>
                </div>
                <div className="grid-2">
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Safety Constraints:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Consultation timings: Mon-Sat 9 AM-1 PM & 5 PM-8:30 PM.</li>
                      <li>NEVER provide medical prescription or diagnoses.</li>
                      <li>Directs severe medical emergencies to nearest hospital ER.</li>
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Extracted Lead Fields:</span>
                    <ul style={{ fontSize: '13px', color: '#667085', marginTop: '8px', paddingLeft: '18px' }}>
                      <li>Patient name & contact number</li>
                      <li>Consultation department</li>
                      <li>Preferred consultation slot</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. PRICING PLANS */}
      <section
        id="pricing"
        style={{
          padding: '72px 0',
          backgroundColor: '#F6F8FC',
          borderBottom: '1px solid #E4E8F0',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <h2 style={{ fontSize: '30px', marginBottom: '12px' }}>Transparent monthly plans</h2>
            <p style={{ fontSize: '16px' }}>
              Every plan includes real-time AI voice answering, WhatsApp summary notifications, and access to both web portal and Android app.
            </p>
          </div>

          <div className="grid-4">
            {STANDARD_PLANS.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '28px 20px',
                  border: p.id === 'personal' ? '2px solid #3157D5' : '1px solid #E4E8F0',
                  position: 'relative',
                }}
              >
                {p.id === 'personal' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#3157D5',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 700, color: '#172033' }}>
                      {p.priceMonthlyInr === 0 ? '₹0' : `₹${p.priceMonthlyInr}`}
                    </span>
                    <span style={{ fontSize: '13px', color: '#667085' }}>/ month</span>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#EEF2FC',
                      borderRadius: '6px',
                      marginBottom: '20px',
                      fontSize: '13px',
                      color: '#3157D5',
                      fontWeight: 500,
                    }}
                  >
                    {p.includedMinutes} included call minutes
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {p.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#172033' }}>
                        <Check size={16} color="#15803D" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={p.id === 'personal' ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ width: '100%' }}
                  onClick={() => onOpenAuth('signup')}
                >
                  {p.id === 'trial' ? 'Get Started' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '13px', color: '#667085' }}>
            <span>Need customized call volume or enterprise integration? </span>
            <a href="mailto:support@callivaan.demo" style={{ color: '#3157D5', textDecoration: 'none', fontWeight: 500 }}>
              Contact our sales desk
            </a>
          </div>
        </div>
      </section>

      {/* 5. DIRECT ANDROID APK DOWNLOAD SECTION (T-028 & T-029) */}
      <section
        id="apk"
        style={{
          padding: '72px 0',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E4E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '860px' }}>
          <div className="card" style={{ padding: '40px', border: '1px solid #3157D5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#3157D5',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Smartphone size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '24px' }}>Direct Android APK Distribution</h2>
                <span style={{ fontSize: '13px', color: '#667085' }}>
                  Release v1.0.0 (Official Signed Production Build)
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#172033', marginBottom: '24px' }}>
              Callivaan is distributed directly through our official website. The Android app acts as your control surface to test your agent, review call summaries, configure routing, and view usage. PSTN live voice media is processed securely in cloud telephony.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#F6F8FC',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: '#667085', display: 'block' }}>Package File:</span>
                <strong style={{ color: '#172033' }}>callivaan-v1.0.0.apk</strong>
              </div>
              <div>
                <span style={{ color: '#667085', display: 'block' }}>File Size:</span>
                <strong style={{ color: '#172033' }}>24.8 MB</strong>
              </div>
              <div>
                <span style={{ color: '#667085', display: 'block' }}>SHA-256 Checksum:</span>
                <code style={{ fontSize: '11px', color: '#3157D5' }}>e3b0c44298fc1c14...</code>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#172033', display: 'block', marginBottom: '8px' }}>
                How to install on your Android device:
              </span>
              <ol style={{ fontSize: '13px', color: '#667085', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Tap the button below to download the APK file directly to your phone.</li>
                <li>When prompted by Android, allow install from this source (Chrome/Browser).</li>
                <li>Open the downloaded package, tap Install, and launch Callivaan.</li>
                <li>Sign in with your registered account credentials to start managing calls.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a
                href="/downloads/callivaan-v1.0.0.apk"
                download="callivaan-v1.0.0.apk"
                className="btn btn-primary btn-lg"
                style={{ textDecoration: 'none' }}
              >
                <Download size={18} />
                Download callivaan-v1.0.0.apk
              </a>
              <span style={{ fontSize: '12px', color: '#8A94A6' }}>
                Compatible with Android 10.0 and above.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ & POLICIES */}
      <section
        id="faq"
        style={{
          padding: '72px 0',
          backgroundColor: '#F6F8FC',
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Frequently asked questions</h2>
            <p style={{ fontSize: '15px' }}>Clear answers on telephony, WhatsApp setup, and billing rules.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>Does Callivaan answer ordinary SIM calls directly on my handset?</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                No. Calls must reach a configured cloud telephony route. You can forward unanswered or busy calls from your SIM to your assigned Callivaan virtual number using standard carrier call forwarding (*21*).
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>Are raw audio recordings stored?</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                No. In accordance with privacy rules, raw audio recording and full transcripts are disabled by default. Callivaan extracts only factual lead details and concise summaries for your follow-up.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>How do WhatsApp instructions work?</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Once paired with a 6-digit code, you can message instructions like "Hindi mein baat karo" or "naam pucho". Callivaan proposes a typed change and asks for explicit confirmation ("CONFIRM") before updating your live agent.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>What happens if included call minutes run out?</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                You will receive a warning when reaching 80% usage. Depending on your plan, you can purchase top-ups at your plan's standard overage rate (e.g. ₹3.50/min), or calls will gracefully route to your configured announcement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
