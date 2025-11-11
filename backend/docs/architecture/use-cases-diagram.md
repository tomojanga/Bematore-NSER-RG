# NSER-RG System Use Cases & Architecture

## Complete Use Cases Diagram

```mermaid
graph TB
    subgraph Actors
        Citizen[👤 Citizen/Gambler]
        Operator[🎰 Gambling Operator]
        Regulator[👨‍💼 Regulator Officer]
        Admin[👨‍💻 System Admin]
        Counselor[👨‍⚕️ Counselor]
    end
    
    subgraph "Self-Exclusion Use Cases"
        UC1[Register Self-Exclusion]
        UC2[Check Exclusion Status]
        UC3[Extend Exclusion Period]
        UC4[View Exclusion History]
        UC5[Lift Exclusion Early Admin]
    end
    
    subgraph "Screening Use Cases"
        UC6[Complete Lie/Bet Assessment]
        UC7[Complete PGSI Assessment]
        UC8[Complete DSM-5 Assessment]
        UC9[View Risk Score]
        UC10[Schedule Quarterly Screening]
        UC11[View Assessment History]
    end
    
    subgraph "Operator Integration Use Cases"
        UC12[Register New Operator]
        UC13[Lookup User Exclusion]
        UC14[Batch Lookup Users]
        UC15[Receive Webhook Notifications]
        UC16[View Compliance Report]
        UC17[Manage API Keys]
    end
    
    subgraph "User Management Use Cases"
        UC18[Register Account]
        UC19[Login with 2FA]
        UC20[Update Profile]
        UC21[Verify Identity Phone/ID]
        UC22[Change Password]
        UC23[Request Data Export]
        UC24[Delete Account]
    end
    
    subgraph "Dashboard & Reporting Use Cases"
        UC25[View Regulator Dashboard]
        UC26[View Operator Dashboard]
        UC27[Generate Compliance Report]
        UC28[View Real-time Analytics]
        UC29[Export Statistical Data]
        UC30[Configure Alerts]
    end
    
    subgraph "BST Token Use Cases"
        UC31[Generate BST Token]
        UC32[Validate BST Token]
        UC33[View Token History]
        UC34[Rotate Compromised Token]
    end
    
    subgraph "Settlement & Financial Use Cases"
        UC35[Process Operator Payment]
        UC36[View Transaction History]
        UC37[Generate Invoice]
        UC38[Reconcile Payments]
        UC39[View Financial Reports]
    end
    
    subgraph "Administration Use Cases"
        UC40[Manage Users]
        UC41[Configure System Settings]
        UC42[View Audit Logs]
        UC43[Manage Permissions]
        UC44[Monitor System Health]
        UC45[Handle Data Breach]
    end
    
    Citizen --> UC1
    Citizen --> UC6
    Citizen --> UC7
    Citizen --> UC8
    Citizen --> UC9
    Citizen --> UC11
    Citizen --> UC18
    Citizen --> UC19
    Citizen --> UC20
    Citizen --> UC21
    Citizen --> UC22
    Citizen --> UC23
    Citizen --> UC24
    Citizen --> UC4
    
    Operator --> UC12
    Operator --> UC13
    Operator --> UC14
    Operator --> UC15
    Operator --> UC16
    Operator --> UC17
    Operator --> UC26
    Operator --> UC35
    Operator --> UC36
    
    Regulator --> UC2
    Regulator --> UC3
    Regulator --> UC5
    Regulator --> UC25
    Regulator --> UC27
    Regulator --> UC28
    Regulator --> UC29
    Regulator --> UC30
    Regulator --> UC16
    
    Admin --> UC40
    Admin --> UC41
    Admin --> UC42
    Admin --> UC43
    Admin --> UC44
    Admin --> UC45
    Admin --> UC38
    Admin --> UC39
    
    Counselor --> UC9
    Counselor --> UC11
    Counselor --> UC7
    Counselor --> UC8
    
    style UC1 fill:#ffebee
    style UC6 fill:#e3f2fd
    style UC13 fill:#f3e5f5
    style UC25 fill:#e8f5e9
    style UC35 fill:#fff9c4
```

---

## Detailed Use Case Flow Diagrams

### 1. Complete User Journey: Registration to Self-Exclusion

```mermaid
sequenceDiagram
    actor Citizen
    participant Portal as Citizen Portal
    participant Auth as Authentication Service
    participant BST as BST Service
    participant Screening as Screening Service
    participant NSER as NSER Service
    participant Notify as Notification Service
    participant Operators as Operator Systems
    
    Note over Citizen,Operators: Phase 1: Registration & Identity Verification
    Citizen->>Portal: Access Registration Page
    Portal->>Citizen: Display Registration Form
    Citizen->>Portal: Submit Details (Phone, ID, DOB)
    Portal->>Auth: Verify Identity
    Auth->>Citizen: Send OTP via SMS
    Citizen->>Auth: Enter OTP
    Auth->>Portal: Identity Verified ✓
    
    Note over Citizen,Operators: Phase 2: Initial Risk Screening
    Portal->>Screening: Trigger Lie/Bet Assessment
    Screening->>Citizen: Display 2 Questions
    Citizen->>Screening: Submit Answers
    Screening->>Screening: Calculate Risk Score
    
    alt Risk Score >= 1
        Screening->>Citizen: Trigger Full PGSI Assessment
        Citizen->>Screening: Complete PGSI (9 Questions)
        Screening->>Screening: Calculate PGSI Score
        
        alt PGSI Score >= 8
            Screening->>Citizen: Recommend Self-Exclusion
        end
    end
    
    Note over Citizen,Operators: Phase 3: BST Token Generation
    Portal->>BST: Generate BST Token
    BST->>BST: Hash(Phone + ID + DOB + Salt)
    BST->>Portal: Return BST Token
    
    Note over Citizen,Operators: Phase 4: Self-Exclusion Registration
    Citizen->>Portal: Choose to Self-Exclude
    Portal->>Citizen: Select Period (6mo/1yr/5yr/Permanent)
    Citizen->>Portal: Confirm Exclusion
    Portal->>NSER: Register Exclusion
    NSER->>NSER: Create Exclusion Record
    
    Note over Citizen,Operators: Phase 5: Multi-Operator Propagation
    NSER->>Operators: Webhook: exclusion.created
    loop For Each Operator
        Operators->>Operators: Update Local Exclusion List
        Operators->>NSER: ACK Received
    end
    
    Note over Citizen,Operators: Phase 6: Confirmation & Monitoring
    NSER->>Notify: Send Confirmation
    Notify->>Citizen: SMS: "Self-Exclusion Active"
    NSER->>Screening: Schedule Quarterly Checks
    
    Note over Citizen,Operators: Ongoing: Quarterly Screening
    loop Every 3 Months
        Screening->>Citizen: SMS: Assessment Link
        Citizen->>Screening: Complete Assessment
        Screening->>NSER: Update Risk Profile
    end
```

---

### 2. Operator Lookup & Validation Flow

```mermaid
sequenceDiagram
    actor User
    participant OpPlatform as Operator Platform
    participant API as API Gateway
    participant Auth as Auth Service
    participant BST as BST Service
    participant NSER as NSER Service
    participant Cache as Redis Cache
    participant DB as PostgreSQL
    participant ML as ML Engine
    
    User->>OpPlatform: Attempt Registration/Bet
    OpPlatform->>API: POST /api/v1/operators/lookup
    Note over OpPlatform,API: Headers: Authorization: Bearer {api_key}
    
    API->>Auth: Validate API Key
    Auth->>API: ✓ Valid Operator
    
    API->>API: Check Rate Limit (100 req/s)
    
    alt Rate Limit Exceeded
        API->>OpPlatform: 429 Too Many Requests
    else Within Limit
        API->>BST: Lookup/Generate BST
        BST->>Cache: Check BST Cache
        
        alt BST Exists in Cache
            Cache->>BST: Return Cached BST
        else Generate New BST
            BST->>BST: Generate BST Token
            BST->>DB: Store BST Mapping
            BST->>Cache: Cache BST (TTL: 1hr)
        end
        
        BST->>API: Return BST Token
        
        API->>NSER: Check Exclusion Status
        NSER->>Cache: Check Exclusion Cache
        
        alt Cache Hit
            Cache->>NSER: Return Cached Status
        else Cache Miss
            NSER->>DB: Query Exclusion Table
            DB->>NSER: Exclusion Record
            NSER->>Cache: Cache Result (TTL: 5min)
        end
        
        NSER->>ML: Get Risk Score
        ML->>Cache: Check Risk Cache
        
        alt Risk Score Cached
            Cache->>ML: Return Risk Score
        else Calculate Risk
            ML->>DB: Fetch Behavioral Data
            ML->>ML: Run Prediction Model
            ML->>Cache: Cache Risk Score
        end
        
        ML->>NSER: Risk Score
        NSER->>API: Compiled Response
        
        API->>OpPlatform: Response JSON
        Note over API,OpPlatform: {excluded: false, risk_level: "low",<br/>requires_screening: false}
        
        OpPlatform->>OpPlatform: Apply Business Rules
        
        alt User Excluded
            OpPlatform->>User: ❌ Block Registration/Betting
        else High Risk
            OpPlatform->>User: ⚠️ Trigger Mandatory Screening
        else Low Risk
            OpPlatform->>User: ✓ Allow with Monitoring
        end
    end
```

---

### 3. Regulator Compliance Monitoring Flow

```mermaid
graph TD
    Start[Regulator Officer Login] --> Dashboard[Access Regulator Dashboard]
    
    Dashboard --> View1[View National Statistics]
    Dashboard --> View2[Monitor Operator Compliance]
    Dashboard --> View3[Review Real-time Alerts]
    Dashboard --> View4[Generate Reports]
    
    View1 --> Stats1[Total Exclusions by Period]
    View1 --> Stats2[Risk Distribution Heat Map]
    View1 --> Stats3[Geographic Breakdown]
    View1 --> Stats4[Trend Analysis]
    
    View2 --> Comp1[Operator Scorecard]
    View2 --> Comp2[API Response Times]
    View2 --> Comp3[Webhook Delivery Success]
    View2 --> Comp4[Screening Completion Rates]
    
    Comp1 --> Check{Compliance Score}
    Check -->|Score < 70%| Alert1[Generate Warning]
    Check -->|Score < 50%| Alert2[Escalate to Legal]
    Check -->|Score >= 70%| Status1[Compliant Status]
    
    Alert1 --> Action1[Send Notice to Operator]
    Alert2 --> Action2[Initiate License Review]
    
    View3 --> Alert3[System Anomalies]
    View3 --> Alert4[Suspicious Patterns]
    View3 --> Alert5[Security Incidents]
    
    Alert3 --> Investigate[Investigate Issue]
    Alert4 --> MLReview[ML Model Review]
    Alert5 --> Security[Security Protocol]
    
    View4 --> Report1[Monthly Compliance Report]
    View4 --> Report2[Operator Performance Report]
    View4 --> Report3[Public Statistics Report]
    
    Report1 --> Export[Export to PDF/Excel]
    Report2 --> Export
    Report3 --> Publish[Publish to Website]
    
    style Check fill:#fff3e0
    style Alert2 fill:#ffebee
    style Status1 fill:#e8f5e9
```

---

### 4. ML-Powered Risk Assessment Architecture

```mermaid
graph TB
    subgraph "Data Sources"
        Trans[Transaction History]
        Assess[Assessment Scores]
        Behavior[Behavioral Patterns]
        Demo[Demographics]
        Social[Social Indicators]
    end
    
    subgraph "Feature Engineering"
        FE1[Time-Series Features]
        FE2[Behavioral Features]
        FE3[Demographic Features]
        FE4[Risk Indicators]
    end
    
    subgraph "ML Models"
        Model1[XGBoost<br/>Risk Classifier]
        Model2[LSTM<br/>Pattern Detector]
        Model3[Random Forest<br/>Relapse Predictor]
        Model4[Siamese NN<br/>Duplicate Detector]
    end
    
    subgraph "Ensemble & Prediction"
        Ensemble[Voting Ensemble<br/>Weights: 0.5, 0.3, 0.2]
        Threshold[Threshold Decision<br/>Low: 0-0.3<br/>Medium: 0.3-0.7<br/>High: 0.7-1.0]
    end
    
    subgraph "Action & Monitoring"
        Alert[Generate Alerts]
        Screen[Trigger Screening]
        Notify[Notify Stakeholders]
        Log[Log Prediction]
    end
    
    Trans --> FE1
    Trans --> FE2
    Assess --> FE4
    Behavior --> FE2
    Demo --> FE3
    Social --> FE3
    
    FE1 --> Model2
    FE2 --> Model1
    FE2 --> Model2
    FE3 --> Model1
    FE3 --> Model3
    FE4 --> Model1
    FE4 --> Model3
    
    Model1 --> Ensemble
    Model2 --> Ensemble
    Model3 --> Ensemble
    
    Ensemble --> Threshold
    
    Threshold -->|High Risk| Alert
    Threshold -->|High Risk| Screen
    Threshold -->|Medium Risk| Notify
    Threshold --> Log
    
    Alert --> Dashboard[Update Dashboard]
    Screen --> User[Trigger User Assessment]
    Notify --> Operator[Notify Operator]
    
    style Model1 fill:#e3f2fd
    style Model2 fill:#f3e5f5
    style Model3 fill:#fff3e0
    style Model4 fill:#e0f2f1
    style Alert fill:#ffebee
    style Screen fill:#fff9c4
```

---

### 5. Settlement & Financial Reconciliation Flow

```mermaid
sequenceDiagram
    participant Operator
    participant API as Settlement API
    participant Ledger as Double-Entry Ledger
    participant Invoice as Invoice Engine
    participant Wallet as Payment Wallet
    participant Recon as Reconciliation Engine
    participant Regulator as Regulator Dashboard
    
    Note over Operator,Regulator: Monthly Settlement Cycle
    
    Operator->>API: API Usage (Lookups, Screenings)
    API->>Ledger: Record Transaction
    Ledger->>Ledger: Debit: Operator Account<br/>Credit: Revenue Account
    
    Note over Operator,Regulator: End of Month
    
    Invoice->>Ledger: Fetch Monthly Transactions
    Ledger->>Invoice: Transaction Summary
    Invoice->>Invoice: Calculate Total Amount
    Invoice->>Invoice: Apply Tax (16% VAT)
    Invoice->>Invoice: Generate Invoice PDF
    
    Invoice->>Operator: Email Invoice
    Invoice->>API: Store Invoice Record
    
    Operator->>Wallet: Initiate B2B Payment
    Wallet->>API: Webhook: Payment Received
    API->>Ledger: Record Payment
    Ledger->>Ledger: Debit: Bank Account<br/>Credit: Operator Account
    
    API->>Recon: Trigger Reconciliation
    Recon->>Recon: Match Invoice to Payment
    
    alt Payment Matches
        Recon->>Recon: Status: Reconciled ✓
        Recon->>Operator: SMS: Payment Confirmed
    else Payment Mismatch
        Recon->>Recon: Status: Pending Review
        Recon->>Admin: Alert: Manual Review Required
    end
    
    Recon->>Regulator: Update Financial Dashboard
    Regulator->>Regulator: Display Revenue Metrics
    
    Note over Operator,Regulator: Quarterly Tax Reporting
    
    Invoice->>Invoice: Generate Tax Report
    Invoice->>Regulator: Submit Tax Report
```

---

## System Integration Architecture

```mermaid
graph TB
    subgraph External_Systems["External Systems"]
        SMS[Africa's Talking SMS]
        Email[SendGrid Email]
        MPesa[Safaricom M-Pesa]
        Firebase[Firebase FCM]
        OAuth[OAuth Providers]
    end
    
    subgraph NSER_Platform["NSER-RG Platform"]
        direction TB
        API_GW[API Gateway]
        
        subgraph Core_Services["Core Services"]
            NSER_S[NSER Service]
            BST_S[BST Service]
            Screen_S[Screening Service]
            Op_S[Operator Service]
            Dash_S[Dashboard Service]
            Settle_S[Settlement Service]
        end
        
        subgraph Data_Storage["Data Storage"]
            PG[(PostgreSQL)]
            RD[(Redis)]
            ES[(Elasticsearch)]
            S3[(S3 Backups)]
        end
        
        subgraph Processing["Background Processing"]
            Celery_W[Celery Workers]
            RMQ[RabbitMQ]
            Scheduler[Beat Scheduler]
        end
        
        subgraph Security["Security Layer"]
            Auth_S[Authentication]
            Encryption[Encryption Service]
            Audit[Audit Logger]
        end
    end
    
    subgraph Operator_Systems["Operator Systems"]
        Op1[SportPesa API]
        Op2[Betika API]
        Op3[Mozzart Bet API]
        OpN[Other Operators]
    end
    
    subgraph Monitoring["Monitoring & Observability"]
        Prom[Prometheus]
        Graf[Grafana]
        ELK[ELK Stack]
        Sentry[Sentry]
    end
    
    SMS -.->|SMS Notifications| API_GW
    Email -.->|Email Delivery| API_GW
    MPesa -.->|Payment Webhook| API_GW
    Firebase -.->|Push Notifications| API_GW
    OAuth -.->|Social Login| API_GW
    
    API_GW --> Core_Services
    Core_Services --> Data_Storage
    Core_Services --> Processing
    Core_Services --> Security
    
    RMQ --> Celery_W
    Scheduler --> RMQ
    
    API_GW <--> Op1
    API_GW <--> Op2
    API_GW <--> Op3
    API_GW <--> OpN
    
    Core_Services -.->|Metrics| Prom
    Prom --> Graf
    Core_Services -.->|Logs| ELK
    Core_Services -.->|Errors| Sentry
    
    Data_Storage -.->|Backup| S3
    
    style Core_Services fill:#e3f2fd
    style Data_Storage fill:#f3e5f5
    style Processing fill:#fff3e0
    style Security fill:#ffebee
    style Monitoring fill:#e8f5e9
```

---

## Use Case Priority Matrix

| Priority | Use Case | Actor | Frequency | Complexity |
|----------|----------|-------|-----------|------------|
| **P0** | Lookup User Exclusion | Operator | Real-time | Low |
| **P0** | Register Self-Exclusion | Citizen | Daily | Medium |
| **P0** | Validate BST Token | System | Real-time | Low |
| **P1** | Complete Lie/Bet Assessment | Citizen | Weekly | Low |
| **P1** | Receive Webhook Notifications | Operator | Real-time | Medium |
| **P1** | View Regulator Dashboard | Regulator Officer | Daily | Medium |
| **P2** | Complete PGSI Assessment | Citizen | Monthly | Medium |
| **P2** | Generate Compliance Report | Regulator Officer | Monthly | High |
| **P2** | Process Operator Payment | System | Monthly | High |
| **P3** | Export Statistical Data | Regulator Officer | Quarterly | Medium |
| **P3** | Rotate Compromised Token | Admin | As needed | Medium |
| **P3** | Handle Data Breach | Admin | Rare | High |

---

## Security Use Cases

```mermaid
graph TD
    Security[Security Use Cases] --> Auth[Authentication & Authorization]
    Security --> Data[Data Protection]
    Security --> Compliance[Compliance & Audit]
    Security --> Incident[Incident Response]
    
    Auth --> UC_Auth1[Multi-Factor Authentication]
    Auth --> UC_Auth2[OAuth2 Integration]
    Auth --> UC_Auth3[API Key Management]
    Auth --> UC_Auth4[Session Management]
    Auth --> UC_Auth5[Role-Based Access Control]
    
    Data --> UC_Data1[Data Encryption at Rest]
    Data --> UC_Data2[TLS 1.3 in Transit]
    Data --> UC_Data3[PII Anonymization]
    Data --> UC_Data4[Secure Key Management]
    Data --> UC_Data5[Data Backup & Recovery]
    
    Compliance --> UC_Comp1[Audit Trail Logging]
    Compliance --> UC_Comp2[Data Protection Compliance]
    Compliance --> UC_Comp3[Data Retention Policy]
    Compliance --> UC_Comp4[Right to be Forgotten]
    Compliance --> UC_Comp5[Data Export Request]
    
    Incident --> UC_Inc1[Intrusion Detection]
    Incident --> UC_Inc2[Breach Notification]
    Incident --> UC_Inc3[Forensic Analysis]
    Incident --> UC_Inc4[Emergency Shutdown]
    Incident --> UC_Inc5[Recovery Procedure]
    
    style Auth fill:#e3f2fd
    style Data fill:#f3e5f5
    style Compliance fill:#e8f5e9
    style Incident fill:#ffebee
```

---

## Performance & Scalability Requirements

| Use Case | SLA Target | Current Performance | Scalability |
|----------|------------|---------------------|-------------|
| Exclusion Lookup | <50ms (P99) | 45ms | Horizontal scaling ready |
| User Registration | <200ms | 187ms | Auto-scaling enabled |
| Risk Prediction | <100ms | 67ms | ML model caching |
| Dashboard Load | <500ms | 234ms | Redis caching |
| Webhook Delivery | <5s to all operators | 3.2s | Async fan-out |
| Payment Processing | <2s | 1.8s | M-Pesa API optimized |
| Report Generation | <10s | 8.5s | Background job |
| Data Export | <30s | 24s | Celery worker |

---

This comprehensive use case documentation covers all major system interactions, flows, and integration points for the NSER-RG platform.
