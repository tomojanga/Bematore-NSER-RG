# Data Protection Compliance Guide

## Overview

This document outlines how the NSER platform complies with applicable data protection legislation and responsible gambling regulations across multiple jurisdictions.

**Compliance Framework**: Multi-jurisdiction compatible  
**Last Updated**: November 2025

---

## Key Definitions

### Personal Data
Information relating to an identified or identifiable natural person, including:
- National ID numbers
- Phone numbers
- Email addresses
- IP addresses
- Location data
- Financial information
- Gambling behavior data

### Sensitive Personal Data
Data requiring enhanced protection, including:
- Health data (problem gambling assessments)
- Financial data (transactions, deposits, withdrawals)
- Biometric data (if used for verification)

### Data Processing
Any operation performed on personal data, including:
- Collection
- Recording
- Storage
- Retrieval
- Use
- Disclosure
- Deletion

---

## Legal Basis for Processing

### 1. Consent (Primary Basis)
- **Implementation**: Users provide explicit consent during registration
- **Withdrawal**: Users can withdraw consent at any time via account settings
- **Documentation**: Consent records stored in `auth_user_consent` table

### 2. Legal Obligation
- **Basis**: Gambling regulatory authority regulations
- **Purpose**: Self-exclusion enforcement, problem gambling prevention
- **Authority**: Responsible gambling legislation

### 3. Public Interest
- **Purpose**: Protection of vulnerable individuals from gambling harm
- **Justification**: Public health and social welfare

### 4. Legitimate Interest
- **Purpose**: Fraud prevention, platform security
- **Balancing Test**: Documented in Privacy Impact Assessment (PIA)

---

## Data Protection Principles

### 1. Lawfulness, Fairness, and Transparency

**Compliance Measures**:
- ✅ Privacy Policy published and accessible
- ✅ Terms of Service clearly state data processing purposes
- ✅ User-friendly privacy dashboard
- ✅ Transparent data processing notices

**Implementation**:
```python
# src/users/views.py
class PrivacyDashboardView(LoginRequiredMixin, TemplateView):
    """User privacy dashboard showing all data processing"""
    template_name = 'users/privacy_dashboard.html'
    
    def get_context_data(self, **kwargs):
        return {
            'personal_data': self.request.user.get_personal_data(),
            'processing_activities': self.request.user.get_processing_log(),
            'consent_records': self.request.user.consents.all(),
            'data_sharing': self.request.user.get_data_sharing_records()
        }
```

### 2. Purpose Limitation

**Defined Purposes**:
1. User authentication and authorization
2. Self-exclusion enforcement
3. Problem gambling screening
4. Regulatory reporting to authorities
5. Financial transaction processing
6. Security and fraud prevention

**Enforcement**:
- Data only used for stated purposes
- New purposes require additional consent
- Purpose documented in data processing register

### 3. Data Minimization

**Practices**:
- Only collect data necessary for specified purposes
- Optional fields clearly marked
- Regular data audits to identify unnecessary data

**Example**:
```python
# src/users/serializers.py
class UserRegistrationSerializer(serializers.ModelSerializer):
    """Minimal data collection for registration"""
    class Meta:
        model = User
        fields = [
            'phone_number',      # Required for authentication
            'national_id',       # Required for identity verification
            'date_of_birth',     # Required for age verification
            'region',            # Required for jurisdiction
            # Optional fields
            'email',             # Optional for notifications
        ]
```

### 4. Accuracy

**Measures**:
- Users can update their information at any time
- Verification mechanisms for critical data (phone, ID)
- Regular data validation and cleansing

### 5. Storage Limitation

**Retention Periods**:

| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| User account data | 5 years after account closure | Regulatory requirement |
| Screening assessments | 5 years | Regulatory requirement |
| Financial transactions | 7 years | Tax law |
| Audit logs | 7 years | Security requirement |
| Session data | 30 days | Operational need |
| Temporary tokens | 24 hours | Security best practice |

**Implementation**:
```python
# src/core/tasks/data_retention.py
@shared_task
def enforce_data_retention_policy():
    """Automated data retention enforcement"""
    
    # Delete old sessions (>30 days)
    Session.objects.filter(
        expire_date__lt=timezone.now() - timedelta(days=30)
    ).delete()
    
    # Archive old screenings (>5 years)
    old_screenings = AssessmentSession.objects.filter(
        created_at__lt=timezone.now() - timedelta(days=1825)
    )
    archive_to_cold_storage(old_screenings)
    old_screenings.delete()
    
    # Archive transactions (>7 years) 
    old_transactions = Transaction.objects.filter(
        timestamp__lt=timezone.now() - timedelta(days=2555)
    )
    archive_to_compliance_storage(old_transactions)
```

### 6. Integrity and Confidentiality

**Security Measures**:

#### Encryption
- **At Rest**: AES-256-GCM encryption for all databases
- **In Transit**: TLS 1.3 for all communications
- **Backups**: Encrypted before storage

```python
# src/core/encryption.py
from cryptography.fernet import Fernet
from django.conf import settings

class FieldEncryption:
    """Encrypt sensitive fields in database"""
    
    def __init__(self):
        self.cipher = Fernet(settings.FIELD_ENCRYPTION_KEY)
    
    def encrypt(self, value: str) -> str:
        return self.cipher.encrypt(value.encode()).decode()
    
    def decrypt(self, value: str) -> str:
        return self.cipher.decrypt(value.encode()).decode()
```

#### Access Control
- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Multi-Factor Authentication (MFA)
- API key authentication for operators

#### Audit Logging
- All data access logged
- Immutable audit trail
- Regular security audits

```python
# src/audit/middleware.py
class AuditMiddleware:
    """Log all data access for compliance"""
    
    def __call__(self, request):
        audit_log = AuditLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            ip_address=get_client_ip(request),
            action=f"{request.method} {request.path}",
            timestamp=timezone.now(),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            request_data=self._sanitize(request.POST or request.body)
        )
        
        response = self.get_response(request)
        audit_log.response_status = response.status_code
        audit_log.save()
        
        return response
```

---

## Data Subject Rights

### 1. Right to Access

**Implementation**:
- Users can download all their data in machine-readable format (JSON)
- Response within 30 days

```python
# src/users/views.py
class DataExportView(LoginRequiredMixin, View):
    """Export all user data (DPA compliance)"""
    
    def post(self, request):
        # Collect all user data
        data = {
            'personal_info': UserSerializer(request.user).data,
            'screening_history': AssessmentSerializer(
                request.user.assessments.all(), many=True
            ).data,
            'exclusions': SelfExclusionSerializer(
                request.user.exclusions.all(), many=True
            ).data,
            'transactions': TransactionSerializer(
                request.user.transactions.all(), many=True
            ).data,
            'audit_log': AuditLogSerializer(
                request.user.audit_logs.all(), many=True
            ).data,
        }
        
        # Create export file
        filename = f"data_export_{request.user.id}_{timezone.now().strftime('%Y%m%d')}.json"
        response = JsonResponse(data)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Log export request
        DataExportLog.objects.create(user=request.user)
        
        return response
```

### 2. Right to Rectification

**Implementation**:
- Users can update their information via profile settings
- Verification for critical changes (phone, ID)

### 3. Right to Erasure/"Right to be Forgotten"

**Limitations**:
- Cannot delete if legal obligation exists (active self-exclusion)
- Cannot delete financial records (retention requirement)
- Can anonymize non-essential data

```python
# src/users/views.py
class AccountDeletionView(LoginRequiredMixin, View):
    """Handle account deletion requests"""
    
    def post(self, request):
        user = request.user
        
        # Check for legal obligations
        active_exclusions = user.exclusions.filter(
            expiry_date__gt=timezone.now()
        )
        
        if active_exclusions.exists():
            return JsonResponse({
                'error': 'Cannot delete account with active self-exclusion',
                'expiry_date': active_exclusions.first().expiry_date
            }, status=400)
        
        # Anonymize instead of delete
        user.phone_number = f"deleted_{user.id}"
        user.email = f"deleted_{user.id}@anonymized.local"
        user.first_name = "Deleted"
        user.last_name = "User"
        user.is_active = False
        user.deleted_at = timezone.now()
        user.save()
        
        # Log deletion
        DeletionLog.objects.create(
            user_id=user.id,
            deleted_at=timezone.now(),
            reason=request.POST.get('reason')
        )
        
        return JsonResponse({'success': True})
```

### 4. Right to Data Portability

**Implementation**:
- Export in JSON format (machine-readable)
- Can transfer to another system

### 5. Right to Object

**Implementation**:
- Users can object to processing for direct marketing
- Users can object to automated decision-making

### 6. Right to Restrict Processing

**Implementation**:
- Users can request processing restriction while disputes are resolved
- Data marked but not processed

---

## Cross-Border Data Transfer

### Assessment
- **Primary Data Location**: Regional data centers
- **Backup Location**: Secondary region
- **Compliance**: Adequate protection standards

### Safeguards
- Standard Contractual Clauses (SCCs) with cloud providers
- Encryption in transit and at rest
- Data localization where required

---

## Data Protection Impact Assessment (DPIA)

### When Required
- Processing sensitive personal data (health, financial)
- Automated decision-making (risk scoring)
- Large-scale monitoring

### DPIA Process
1. **Identify**: Processing activities requiring DPIA
2. **Assess**: Privacy risks and impacts
3. **Mitigate**: Implement controls to reduce risks
4. **Review**: Annually or when significant changes occur

**Last DPIA**: November 2025  
**Next Review**: November 2026

---

## Data Breach Notification

### Timeline
- **Discovery to Authority**: Within 72 hours
- **Authority to Data Subject**: Without undue delay (if high risk)

### Breach Response Plan

```python
# src/security/incident_response.py
class DataBreachHandler:
    """Handle data breach incidents"""
    
    def handle_breach(self, breach_details):
        # 1. Contain the breach
        self.contain_breach(breach_details)
        
        # 2. Assess severity
        severity = self.assess_severity(breach_details)
        
        # 3. Notify authorities if required (within 72 hours)
        if severity in ['HIGH', 'CRITICAL']:
            self.notify_authorities(breach_details)
        
        # 4. Notify affected users
        affected_users = self.identify_affected_users(breach_details)
        self.notify_users(affected_users)
        
        # 5. Document incident
        IncidentLog.objects.create(
            type='DATA_BREACH',
            severity=severity,
            details=breach_details,
            timestamp=timezone.now()
        )
        
        # 6. Post-incident review
        self.schedule_review(breach_details)
```

### Notification Template
```
Subject: Data Security Incident Notification

Dear [User],

We are writing to inform you of a data security incident that may have affected your personal information.

What Happened: [Brief description]
Data Affected: [Types of data]
Actions Taken: [Response measures]
Your Actions: [Recommended steps]

For more information: security@nser.io

Sincerely,
NSER Security Team
```

---

## Accountability and Governance

### Data Protection Officer (DPO)
- **Email**: dpo@bematore.com
- **Responsibilities**:
  - Monitor compliance
  - Advise on data protection
  - Cooperate with authorities
  - Point of contact for data subjects

### Data Processing Register
Maintained in accordance with applicable regulations:

| Processing Activity | Purpose | Legal Basis | Data Categories | Retention |
|---------------------|---------|-------------|-----------------|-----------|
| User Registration | Account creation | Consent | Name, ID, Phone | 5 years |
| Self-Exclusion | Gambling prevention | Legal obligation | BST, exclusion data | 5 years |
| Screening | Risk assessment | Public interest | Assessment scores | 5 years |
| Financial Transactions | Payment processing | Contract | Transaction data | 7 years |
| Audit Logging | Security | Legitimate interest | Access logs | 7 years |

### Staff Training
- Annual data protection training for all staff
- Specialized training for developers and security team
- Awareness campaigns

---

## Third-Party Data Processors

### Processor Agreements
All third parties sign Data Processing Agreements (DPAs) with:
- Processing instructions
- Security requirements
- Breach notification obligations
- Sub-processor restrictions

### Current Processors
1. **Cloud Provider** - Cloud hosting
2. **SMS Provider** - Notifications
3. **Email Provider** - Email delivery
4. **Payment Provider** - Payments

All processors vetted for compliance.

---

## Compliance Checklist

- [x] Privacy Policy published
- [x] Terms of Service include data processing clauses
- [x] Consent mechanisms implemented
- [x] Data subject rights functionality built
- [x] Encryption at rest and in transit
- [x] Access controls and audit logging
- [x] Data retention policies automated
- [x] Breach notification procedures documented
- [x] DPO appointed
- [x] Data processing register maintained
- [x] DPIA conducted
- [x] Staff training completed
- [x] DPAs signed with all processors

---

## Contact Information

### Internal
- **Data Protection Officer**: dpo@bematore.com
- **Security Team**: security@bematore.com
- **Legal**: legal@bematore.com

### External
- **Regulatory Authority Contact**: [To be configured per jurisdiction]

---

## References

1. **Responsible Gambling Legislation** - Multi-jurisdiction framework
2. **Data Protection Standards** - ISO 27001, ISO 27701
3. **Privacy Best Practices** - Industry standards compliance

---

**Document Version**: 2.0  
**Last Updated**: November 2025  
**Next Review**: November 2026  
**Owner**: Legal & Compliance Team
