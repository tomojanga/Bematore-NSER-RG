export const portalLinks = {
  citizen: "http://localhost:3001",
  operator: "http://localhost:3002",
  grak: "http://localhost:3003"
}

export const aboutData = {
  title: "About NSER",
  subtitle: "National Self-Exclusion Register",
  mission: "To protect Kenyan citizens from gambling-related harm through a comprehensive, technology-driven self-exclusion system.",
  sections: [
    {
      title: "What is NSER?",
      content: "The National Self-Exclusion Register (NSER) is Kenya's official platform for responsible gambling. Managed by GRAK (Gambling Regulatory Authority of Kenya), it allows individuals to voluntarily exclude themselves from all licensed gambling operators nationwide."
    },
    {
      title: "How It Works",
      content: "When you register for self-exclusion, your details are securely stored and shared with all licensed gambling operators in Kenya. This prevents you from accessing gambling services across all platforms for your chosen period."
    },
    {
      title: "Our Technology",
      content: "NSER uses enterprise-grade technology including real-time exclusion lookups (<50ms), BST token system for cross-operator tracking, and ML-powered risk assessment to ensure comprehensive protection."
    }
  ],
  stats: [
    { label: "Active Exclusions", value: "50,000+" },
    { label: "Licensed Operators", value: "200+" },
    { label: "Response Time", value: "<50ms" },
    { label: "Success Rate", value: "99.9%" }
  ]
}

export const selfExcludeData = {
  title: "Self-Exclusion Information",
  subtitle: "Take control of your gambling habits",
  intro: "Self-exclusion is a voluntary program that allows you to restrict your access to gambling services. Once registered, you will be blocked from all licensed gambling operators in Kenya.",
  periods: [
    { duration: "6 Months", description: "Short-term break from gambling", value: "6_months" },
    { duration: "1 Year", description: "Medium-term exclusion period", value: "1_year" },
    { duration: "3 Years", description: "Extended protection period", value: "3_years" },
    { duration: "5 Years", description: "Long-term commitment", value: "5_years" },
    { duration: "Permanent", description: "Lifetime exclusion", value: "permanent" }
  ],
  process: [
    { step: 1, title: "Register", description: "Create account with phone and ID verification" },
    { step: 2, title: "Assessment", description: "Complete brief risk assessment questionnaire" },
    { step: 3, title: "Choose Period", description: "Select your exclusion duration" },
    { step: 4, title: "Confirm", description: "Exclusion activated across all operators instantly" }
  ],
  benefits: [
    "Immediate blocking across all licensed operators",
    "Confidential and secure process",
    "Free support and counseling resources",
    "Quarterly check-ins and monitoring"
  ]
}

export const resourcesData = {
  title: "Support Resources",
  subtitle: "Help is available",
  helplines: [
    { name: "GRAK Helpline", phone: "0800-123-456", hours: "24/7", description: "Gambling support and information" },
    { name: "Mental Health Kenya", phone: "0800-789-012", hours: "Mon-Fri 8AM-6PM", description: "Mental health counseling" },
    { name: "Gamblers Anonymous Kenya", phone: "0722-345-678", hours: "Daily 9AM-9PM", description: "Peer support groups" }
  ],
  counseling: [
    { name: "Nairobi Counseling Center", location: "Nairobi CBD", contact: "020-123-4567" },
    { name: "Mombasa Support Services", location: "Mombasa", contact: "041-234-5678" },
    { name: "Kisumu Wellness Center", location: "Kisumu", contact: "057-345-6789" }
  ],
  onlineResources: [
    { title: "Understanding Gambling Addiction", url: "#", type: "Guide" },
    { title: "Financial Recovery Planning", url: "#", type: "Toolkit" },
    { title: "Family Support Resources", url: "#", type: "Guide" },
    { title: "Relapse Prevention Strategies", url: "#", type: "Video Series" }
  ],
  assessmentTools: [
    { name: "Lie/Bet Screening", description: "Quick 2-question assessment", duration: "1 min" },
    { name: "PGSI Assessment", description: "Problem Gambling Severity Index", duration: "5 min" },
    { name: "DSM-5 Screening", description: "Clinical diagnostic criteria", duration: "10 min" }
  ]
}

export const faqData = {
  title: "Frequently Asked Questions",
  categories: [
    {
      name: "General",
      questions: [
        {
          q: "What is self-exclusion?",
          a: "Self-exclusion is a voluntary program that allows you to ban yourself from all licensed gambling operators in Kenya for a chosen period."
        },
        {
          q: "Is self-exclusion confidential?",
          a: "Yes, your information is protected under Kenya's Data Protection Act 2019. Only authorized gambling operators receive your exclusion status."
        },
        {
          q: "How long does it take to activate?",
          a: "Exclusion is activated instantly (<50ms) across all licensed operators once you complete registration."
        },
        {
          q: "Is there a cost?",
          a: "No, self-exclusion is completely free for all Kenyan citizens."
        }
      ]
    },
    {
      name: "Registration",
      questions: [
        {
          q: "What do I need to register?",
          a: "You need a valid Kenyan phone number, National ID, and date of birth for verification."
        },
        {
          q: "Can I register for someone else?",
          a: "No, self-exclusion must be voluntary. However, you can encourage someone to register themselves."
        },
        {
          q: "What if I don't have a smartphone?",
          a: "You can register via USSD code *483# or visit any GRAK office for assistance."
        }
      ]
    },
    {
      name: "Exclusion Period",
      questions: [
        {
          q: "Can I cancel my exclusion early?",
          a: "No, exclusions cannot be cancelled before the end date. This protects you during vulnerable moments."
        },
        {
          q: "What happens when my exclusion expires?",
          a: "You'll receive notifications 30, 14, and 7 days before expiry. You can choose to renew or let it expire."
        },
        {
          q: "Can I extend my exclusion period?",
          a: "Yes, you can extend your exclusion at any time before or after it expires."
        }
      ]
    },
    {
      name: "Technical",
      questions: [
        {
          q: "How do operators check my status?",
          a: "Operators use our real-time API to check exclusion status during registration and betting attempts."
        },
        {
          q: "What if an operator lets me gamble?",
          a: "Report violations immediately to GRAK. Operators face penalties for non-compliance."
        },
        {
          q: "Is my data secure?",
          a: "Yes, we use AES-256 encryption, TLS 1.3, and comply with ISO 27001 security standards."
        }
      ]
    }
  ]
}

export const contactData = {
  title: "Contact Us",
  subtitle: "Get in touch with GRAK",
  offices: [
    {
      name: "GRAK Headquarters",
      address: "Anniversary Towers, 15th Floor\nUniversity Way, Nairobi",
      phone: "020-123-4567",
      email: "info@grak.go.ke",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM"
    },
    {
      name: "Mombasa Regional Office",
      address: "Nkrumah Road\nMombasa",
      phone: "041-234-5678",
      email: "mombasa@grak.go.ke",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM"
    },
    {
      name: "Kisumu Regional Office",
      address: "Oginga Odinga Street\nKisumu",
      phone: "057-345-6789",
      email: "kisumu@grak.go.ke",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM"
    }
  ],
  emergencyContacts: [
    { type: "24/7 Helpline", contact: "0800-GAMBLING (0800-426-254)" },
    { type: "Crisis Support", contact: "0800-CRISIS (0800-274-747)" },
    { type: "WhatsApp Support", contact: "+254-700-123-456" }
  ],
  socialMedia: [
    { platform: "Twitter", handle: "@GRAKKenya", url: "#" },
    { platform: "Facebook", handle: "GRAKKenya", url: "#" },
    { platform: "LinkedIn", handle: "GRAK Kenya", url: "#" }
  ],
  departments: [
    { name: "Licensing & Compliance", email: "licensing@grak.go.ke" },
    { name: "Technical Support", email: "support@grak.go.ke" },
    { name: "Media Inquiries", email: "media@grak.go.ke" },
    { name: "Legal Affairs", email: "legal@grak.go.ke" }
  ]
}
