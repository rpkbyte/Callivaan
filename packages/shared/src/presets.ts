/**
 * Starter Vertical Templates for Callivaan
 * Provides pre-configured, tested prompt & settings templates for the primary verticals.
 */
import { AgentSettings, PlanDefinition } from './types.js';

export const STARTER_PRESETS: Record<string, { label: string; settings: AgentSettings }> = {
  repair_service: {
    label: 'Home & Appliance Repair Services',
    settings: {
      greeting: 'Namaste! Callivaan Repair Services mein aapka swagat hai. Main AI assistant hoon. Main aapki kya madad kar sakta hoon?',
      language: 'hi-en',
      tone: 'warm',
      businessFacts: [
        'Hum AC, refrigerator, washing machine, aur microwave repair ki service provide karte hain.',
        'Regular service hours subah 9 baje se shaam 8 baje tak hain.',
        'Visiting charges technician ke visit par confirm hote hain, minimum inspection charge ₹199 hai.',
        'Emergency repairs ke liye priority slots available rehte hain.',
      ],
      faqs: [
        {
          question: 'Kya aap warranty dete hain?',
          answer: 'Haan, sabhi spare parts aur repairs par 30 din ki service warranty milti hai.',
        },
        {
          question: 'Technician kitni der mein aayega?',
          answer: 'Slot confirm hone ke baad technician aam taur par 2 se 4 ghante ke andar pahunchta hai.',
        },
      ],
      collectFields: {
        callerName: true,
        callbackNumber: true,
        serviceNeeded: true,
        preferredTime: true,
        urgency: true,
      },
      prohibitedCommitments: [
        'Do not confirm final repair bill without technician diagnosis.',
        'Do not promise exact minute arrival without technician schedule confirmation.',
        'Do not process refunds or cash settlements over the call.',
      ],
      fallbackMessage: 'Hamari team ka representative jald hi aapse sampark karega. Call karne ke liye dhanyavaad.',
      aiDisclosureEnabled: true,
      maxCallDurationSeconds: 240,
    },
  },

  salon_spa: {
    label: 'Salon, Spa & Beauty Wellness',
    settings: {
      greeting: 'Hello and welcome! Thank you for calling. I am your AI assistant. How may I help you today?',
      language: 'en',
      tone: 'warm',
      businessFacts: [
        'We offer hair styling, coloring, facials, pedicures, and spa treatments.',
        'We are open Tuesday through Sunday from 10:00 AM to 8:00 PM.',
        'Appointments are recommended to avoid waiting time.',
        'We use premium dermatologically tested organic products.',
      ],
      faqs: [
        {
          question: 'Do you take walk-ins?',
          answer: 'Yes, walk-ins are welcome based on stylist availability, but appointments are prioritized.',
        },
        {
          question: 'Where is the salon located?',
          answer: 'Our salon is centrally located with dedicated parking available for clients.',
        },
      ],
      collectFields: {
        callerName: true,
        callbackNumber: true,
        serviceNeeded: true,
        preferredTime: true,
        urgency: false,
      },
      prohibitedCommitments: [
        'Do not confirm bridal packages pricing without senior stylist consultation.',
        'Do not promise specific staff availability without checking the salon schedule.',
      ],
      fallbackMessage: 'Our front desk coordinator will call you back shortly with available slot options. Have a great day!',
      aiDisclosureEnabled: true,
      maxCallDurationSeconds: 180,
    },
  },

  property_agent: {
    label: 'Real Estate & Property Consultant',
    settings: {
      greeting: 'Namaste! Real Estate consultation mein aapka swagat hai. Main AI assistant hoon. Aap rent ya purchase ke baare mein baat karna chahte hain?',
      language: 'hi-en',
      tone: 'professional',
      businessFacts: [
        'Hum residential apartments, independent floors, aur commercial office spaces deal karte hain.',
        'Key locations: City Center, Sector 42, Green Park, aur Cyber Valley.',
        'Property site visits weekend aur weekdays dono din organize kiye jaate hain.',
      ],
      faqs: [
        {
          question: 'Site visit ka charge kya hai?',
          answer: 'Site visits bilkul complimentary aur free of charge hain.',
        },
        {
          question: 'Brokerage kitni hoti hai?',
          answer: 'Standard market brokerage apply hoti hai, details property meeting par discuss hoti hain.',
        },
      ],
      collectFields: {
        callerName: true,
        callbackNumber: true,
        serviceNeeded: true,
        preferredTime: true,
        urgency: true,
      },
      prohibitedCommitments: [
        'Do not commit on negotiated property prices or token amounts over phone.',
        'Do not guarantee lease terms without owner consent.',
      ],
      fallbackMessage: 'Hamare property advisor aapse details ke sath call back karenge. Shubh din!',
      aiDisclosureEnabled: true,
      maxCallDurationSeconds: 300,
    },
  },

  clinic_healthcare: {
    label: 'Clinic & Healthcare Practice',
    settings: {
      greeting: 'Namaste, clinic desk par swagat hai. Main AI appointment assistant hoon. Kya main aapke liye doctor consultation slot note karoon?',
      language: 'hi-en',
      tone: 'concise',
      businessFacts: [
        'Doctor consultation timings: Monday to Saturday, 9:00 AM to 1:00 PM and 5:00 PM to 8:30 PM.',
        'General medicine, pediatrics aur dental consultation available hai.',
        'Emergency cases ke liye please nearest hospital emergency room sampark karein.',
      ],
      faqs: [
        {
          question: 'Consultation fee kitni hai?',
          answer: 'Standard consultation fee ₹500 hai, which includes 7 days follow-up.',
        },
      ],
      collectFields: {
        callerName: true,
        callbackNumber: true,
        serviceNeeded: true,
        preferredTime: true,
        urgency: true,
      },
      prohibitedCommitments: [
        'NEVER provide medical prescription, dosage, or medical diagnoses.',
        'Never handle severe life-threatening emergencies over voice call without emergency referral.',
      ],
      fallbackMessage: 'Clinic reception desk jald hi aapse sampark karegi.',
      aiDisclosureEnabled: true,
      maxCallDurationSeconds: 180,
    },
  },
};

export const STANDARD_PLANS: PlanDefinition[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    priceMonthlyInr: 0,
    includedMinutes: 30,
    overageRatePerMinuteInr: 0,
    maxAgents: 1,
    features: [
      '30 included call minutes',
      'Basic AI voice assistant (Hindi & English)',
      'WhatsApp call summaries',
      'Web portal & Android app access',
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    priceMonthlyInr: 499,
    includedMinutes: 150,
    overageRatePerMinuteInr: 3.5,
    maxAgents: 1,
    features: [
      '150 included monthly call minutes',
      'Hindi, English & Hinglish support',
      'WhatsApp summary notifications',
      'Interactive WhatsApp prompt tuning',
      'Lead capture & export',
      'Extra minutes at ₹3.50/min',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthlyInr: 1499,
    includedMinutes: 600,
    overageRatePerMinuteInr: 2.8,
    maxAgents: 3,
    features: [
      '600 included monthly call minutes',
      'Priority voice processing',
      'Urgent caller alerts on WhatsApp',
      'Custom FAQs and operating hours',
      'Call forwarding setup guidance',
      'Extra minutes at ₹2.80/min',
    ],
  },
  {
    id: 'team',
    name: 'Team & Agency',
    priceMonthlyInr: 3999,
    includedMinutes: 2000,
    overageRatePerMinuteInr: 2.2,
    maxAgents: 10,
    features: [
      '2,000 included monthly call minutes',
      'Multiple phone routes',
      'Multi-agent configurations',
      'Team members with role-based access',
      'Dedicated account onboarding support',
      'Extra minutes at ₹2.20/min',
    ],
  },
];
