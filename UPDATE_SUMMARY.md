# Frontend Updates Summary - NSER Rebranding

## Date: November 11, 2025

All frontends have been successfully updated to remove country-specific (Kenya/GRAK) references and now display "National Self-Exclusion Register" to allow multi-country testing.

---

## Frontend-Public (Homepage)

✅ **Header Component**
- Updated subtitle from "GRAK Kenya" to "National Self-Exclusion Register"

✅ **Footer Component**
- Updated branding from "GRAK Kenya" to "National Self-Exclusion Register"
- Updated copyright from "© 2025 Gambling Regulatory Authority of Kenya (GRAK)" to "© 2025 National Self-Exclusion Register"
- Changed headquarters info from "GRAK Headquarters, Nairobi, Kenya" to "NSER Headquarters, Regional Office"

✅ **Layout (Metadata)**
- Title: "NSER - National Self-Exclusion Register"
- Description: Removed Kenya-specific language

✅ **Homepage Content**
- Hero text updated from "Kenya's official self-exclusion program" to "the official self-exclusion program"
- Features updated to remove GRAK and Kenya references

✅ **Content Data File (content.ts)**
- Mission updated to "protect citizens" instead of "Kenyan citizens"
- About section: Removed GRAK management reference
- Self-Exclude intro: Removed "in Kenya" reference
- Resources: Updated helpline names from GRAK/Kenya specific to generic NSER names
- FAQ: Updated to generic language (applicable data protection laws, government ID)
- Contact: Changed from GRAK offices to NSER regional offices
- Social Media: Changed handles from @GRAKKenya to @NSER
- Email addresses: Changed from grak.go.ke to nser.go.ke

---

## Frontend-Regulator (Admin Portal)

✅ **Layout (Metadata)**
- Title: "Admin Portal - National Self-Exclusion Register"
- Description: "Admin Portal for National Self-Exclusion Register"

✅ **Login Page**
- Alert message: "Access denied. Admin staff only" (was "GRAK staff only")
- Portal title: "Admin Portal" (was "GRAK Admin Portal")
- Subtitle: "National Self-Exclusion Register"

✅ **Dashboard Layout**
- Header: "NSER Admin" (was "GRAK Admin")
- Subtitle: "National Self-Exclusion Register" (was "NSER Portal")
- Comment updated: "Admin Dashboard Navigation" (was "GRAK Dashboard Navigation")

✅ **Dashboard Pages**
- Dashboard page title: "Admin Dashboard" (was "GRAK Dashboard")
- Analytics page title: "Analytics Dashboard" (was "GRAK Analytics Dashboard")
- Reports page title: "Reports & Analytics" (was "GRAK Reports & Analytics")

✅ **README.md**
- Title: "Admin Portal - NSER"
- Subtitle: "National Self-Exclusion Register - Admin Portal"
- Features: Changed "GRAK admin/officer only" to "Admin staff only"
- Login credentials: Updated descriptions to generic admin/officer terminology
- Security: Updated RBAC roles from GRAK-specific to generic

---

## Frontend-Citizen (Citizen Portal)

✅ **README.md**
- Updated subtitle from "Self-Exclusion Registration Portal for Kenyan Citizens" to "Self-Exclusion Registration Portal"

✅ **Settings Page**
- Data Privacy: "applicable data protection laws" (was "Kenya Data Protection Act 2019")
- Account deletion: "contacting NSER support" (was "GRAK support")
- Account deletion timeline: Generic 30-day processing (removed GRAK reference)

✅ **Self-Exclude Page**
- Warning text: Removed "in Kenya" reference

✅ **Account Page**
- BST Token description: "across all licensed operators" (removed "in Kenya")

---

## Frontend-Operator (Operator Portal)

✅ **README.md**
- Support contact: "Contact NSER support" (was "Contact GRAK support")

---

## Summary of Changes

### Removed/Replaced Terms:
- ❌ "GRAK" → ✅ "NSER" or "National Self-Exclusion Register"
- ❌ "Gambling Regulatory Authority of Kenya" → ✅ "National Self-Exclusion Register"
- ❌ "Kenyan citizens" → ✅ "citizens"
- ❌ "in Kenya" → ✅ Removed (generic language)
- ❌ "Kenya Data Protection Act 2019" → ✅ "applicable data protection laws"
- ❌ "GRAK staff" → ✅ "Admin staff"
- ❌ "grak.go.ke" → ✅ "nser.go.ke"
- ❌ "@GRAKKenya" → ✅ "@NSER"
- ❌ "Nairobi, Kenya" → ✅ "Regional Office"

### Status:
✅ All frontends updated
✅ No GRAK/Kenya references remain in frontend code
✅ Ready for multi-country testing

### Files Modified:
- frontend-public/src/components/Header.tsx
- frontend-public/src/components/Footer.tsx
- frontend-public/src/app/layout.tsx
- frontend-public/src/app/page.tsx
- frontend-public/src/data/content.ts
- frontend-public/README.md

- frontend-regulator/src/app/layout.tsx
- frontend-regulator/src/app/auth/login/page.tsx
- frontend-regulator/src/app/dashboard/layout.tsx
- frontend-regulator/src/app/dashboard/page.tsx
- frontend-regulator/src/app/dashboard/analytics/page.tsx
- frontend-regulator/src/app/dashboard/reports/page.tsx
- frontend-regulator/README.md

- frontend-citizen/src/app/dashboard/settings/page.tsx
- frontend-citizen/src/app/dashboard/self-exclude/page.tsx
- frontend-citizen/src/app/dashboard/account/page.tsx
- frontend-citizen/README.md

- frontend-operator/README.md

---

**Next Steps:**
1. Rebuild all frontends
2. Test multi-country functionality
3. Deploy to staging for testing
