# Data Flow Diagrams & Sequence Diagrams

## 1. Complete User Self-Exclusion Registration Flow

```mermaid
sequenceDiagram
    participant User as Citizen
    participant Portal as NSER Portal
    participant Auth as Auth Service
    participant Verify as ID Verification
    participant BST as BST Service
    participant NSER as NSER Core
    participant Queue as Message Queue
    participant Ops as Operators (All)
    participant Regulator as Regulator Dashboard
    participant SMS as SMS Gateway
    
    User->>Portal: Access self-exclusion form
    Portal->>User: Display registration form
    
    User->>Portal: Submit (phone, ID, DOB, period)
    Portal->>Auth: Initiate verification
    Auth->>SMS: Send OTP to phone
    SMS-->>User: Receive OTP code
    
    User->>Portal: Enter OTP
    Portal->>Auth: Validate OTP
    Auth->>Verify: Verify ID number
    Verify->>Verify: Check IPRS database
    Verify-->>Auth: ID confirmed
    
    Auth->>BST: Generate BST token
    BST->>BST: Hash(phone+ID+DOB+salt)
    BST->>BST: Check for duplicates
    BST-->>Auth: Return BST-02-xxxxx
    
    Auth->>NSER: Create exclusion record
    NSER->>NSER: Validate exclusion period
    NSER->>NSER: Set effective & expiry dates
    NSER->>NSER: Store encrypted PII
    NSER-->>Auth: Exclusion created (ID: 12345)
    
    NSER->>Queue: Publish "exclusion.created" event
    Queue->>Ops: Notify all operators (webhook)
    Ops->>Ops: Update local blacklist
    Ops-->>Queue: Acknowledge receipt
    
    Queue->>Regulator: Update dashboard
    Regulator->>Regulator: Increment exclusion counter
    Regulator->>Regulator: Update risk distribution
    
    NSER->>SMS: Send confirmation SMS
    SMS-->>User: "Self-exclusion activated for 1 year"
    
    Portal->>User: Display confirmation page
    Note over User,Portal: Exclusion effective immediately
```

---

## 2. Operator Real-Time Lookup Flow

```mermaid
sequenceDiagram
    participant Player as Player
    participant OpApp as Operator App
    participant API as API Gateway
    participant Auth as Auth Service
    participant Cache as Redis Cache
    participant BST as BST Service
    participant NSER as NSER Core
    participant Screen as Screening Service
    participant DB as PostgreSQL
    participant Log as Audit Log
    
    Player->>OpApp: Attempt registration
    OpApp->>API: POST /operators/lookup
    Note over OpApp,API: Headers: API-Key, Content-Type
    
    API->>Auth: Validate API key
    Auth->>Cache: Check key in cache
    alt Key in cache
        Cache-->>Auth: Key valid + operator_id
    else Key not in cache
        Auth->>DB: Query API key
        DB-->>Auth: Return operator details
        Auth->>Cache: Cache key (TTL: 15min)
    end
    Auth-->>API: Authorized (Operator ID: 42)
    
    API->>API: Check rate limit
    Note over API: 100 requests/second per operator
    alt Rate limit exceeded
        API-->>OpApp: 429 Too Many Requests
    end
    
    API->>Cache: Check exclusion cache
    Note over Cache: Key: nser:phone:+254712345678
    alt Cache hit
        Cache-->>API: {excluded: true, expires: 2026-11-04}
        API-->>OpApp: Return cached response
    else Cache miss
        API->>BST: Get or create BST
        BST->>DB: Query BST mapping
        alt BST exists
            DB-->>BST: Return existing BST
        else New user
            BST->>BST: Generate new BST token
            BST->>DB: Store BST mapping
        end
        BST-->>API: BST-02-A7F3E9D2...
        
        API->>NSER: Check exclusion status
        NSER->>DB: SELECT * FROM exclusions WHERE bst=?
        DB-->>NSER: Exclusion record (if exists)
        NSER->>NSER: Check if active
        NSER-->>API: {excluded: false/true, expiry: date}
        
        API->>Screen: Get latest risk score
        Screen->>DB: SELECT risk_level FROM scores
        DB-->>Screen: Risk level: "low"
        Screen->>Screen: Check screening due date
        Screen-->>API: {risk: "low", screening_due: false}
        
        API->>Cache: Cache result (TTL: 5min)
    end
    
    API->>Log: Record lookup event
    Log->>DB: INSERT audit_log (operator, phone_hash, result)
    
    API-->>OpApp: Response JSON
    Note over API,OpApp: {excluded, risk_level, screening_required}
    
    OpApp->>OpApp: Apply business logic
    alt Player excluded
        OpApp->>Player: "Account restricted - Self-excluded"
    else Screening required
        OpApp->>Player: Redirect to assessment
    else Low risk
        OpApp->>Player: Allow registration/betting
    end
```

---

## 3. Quarterly Automated Screening Flow

```mermaid
sequenceDiagram
    participant Cron as Celery Beat
    participant Worker as Celery Worker
    participant Screen as Screening Service
    participant DB as PostgreSQL
    participant BST as BST Service
    participant SMS as SMS Gateway
    participant Email as Email Service
    participant User as Player
    participant OpAPI as Operator API
    participant ML as ML Engine
    
    Note over Cron: Daily @ 02:00 EAT
    Cron->>Worker: Task: identify_due_screenings()
    
    Worker->>DB: Query users due for screening
    Note over DB: WHERE last_screening < NOW() - INTERVAL '90 days'
    DB-->>Worker: Return user list (10,000 users)
    
    Worker->>Worker: Prioritize by risk level
    Note over Worker: High-risk users first
    
    loop For each user batch (100 users)
        Worker->>Screen: Create assessment sessions
        Screen->>DB: INSERT assessment_session (status: pending)
        Screen->>BST: Get BST tokens
        BST-->>Screen: Return BST list
        
        Screen->>SMS: Send screening invitations
        SMS-->>User: "Complete your quarterly assessment: [assessment link]"
        
        Screen->>Email: Send email invitations
        Email-->>User: Assessment email with link
        
        Note over User: User has 7 days to complete
    end
    
    alt User completes assessment
        User->>Screen: Access assessment link
        Screen->>DB: Validate session token
        Screen->>User: Display Lie/Bet questions
        
        User->>Screen: Submit responses (Q1: Yes, Q2: No)
        Screen->>Screen: Calculate score = 1
        Screen->>DB: Store responses
        
        Screen->>ML: Run behavioral analysis
        ML->>DB: Fetch transaction history
        ML->>ML: Feature engineering
        ML->>ML: Predict risk probability
        ML-->>Screen: Risk score: 0.67 (moderate)
        
        Screen->>DB: Update risk_score table
        Screen->>DB: Mark session complete
        
        alt Score >= 1 (Mild/High risk)
            Screen->>Screen: Trigger PGSI assessment
            Screen->>User: Display PGSI questionnaire
            
            User->>Screen: Complete PGSI (9 questions)
            Screen->>Screen: Calculate PGSI score
            
            alt PGSI score >= 8 (Problem gambler)
                Screen->>NSER: Recommend self-exclusion
                Screen->>User: Display self-exclusion option
                Screen->>OpAPI: Send high-risk alert
                OpAPI->>OpAPI: Apply betting limits
            end
        end
        
        Screen->>User: Display results & resources
        
    else User doesn't complete (after 7 days)
        Worker->>Screen: Check incomplete sessions
        Screen->>SMS: Send reminder SMS
        
        alt After 14 days still incomplete
            Screen->>OpAPI: Notify operator (compliance)
            OpAPI->>OpAPI: Flag account for manual review
        end
    end
```

---

## 4. Financial Settlement Flow

```mermaid
sequenceDiagram
    participant Op as Operator
    participant API as Settlement API
    participant Wallet as Bematore Wallet
    participant MPesa as M-Pesa B2B
    participant Ledger as Double-Entry Ledger
    participant Invoice as Invoice Service
    participant Recon as Reconciliation Engine
    participant Regulator as Regulator Dashboard
    participant Email as Email Service
    
    Note over Op: Monthly settlement cycle
    
    API->>API: Calculate operator charges
    Note over API: Usage-based fees + monthly license
    
    API->>Invoice: Generate invoice
    Invoice->>Ledger: Create ledger entries
    Note over Ledger: Debit: Operator AR<br/>Credit: Revenue
    Invoice->>DB: Store invoice (status: pending)
    Invoice->>Email: Send invoice to operator
    Email-->>Op: Invoice email with payment details
    
    Op->>Wallet: Initiate B2B payment
    Note over Op,Wallet: Amount: [Currency specific]
    Wallet->>Wallet: Transfer funds
    Wallet-->>Op: Payment confirmation
    
    MPesa->>API: Payment callback (webhook)
    API->>API: Validate callback signature
    API->>Recon: Match payment to invoice
    
    Recon->>DB: Query pending invoices
    Recon->>Recon: Match by amount + operator_id
    alt Match found
        Recon->>Ledger: Record payment
        Note over Ledger: Debit: Bank<br/>Credit: Operator AR
        Recon->>Invoice: Update status (paid)
        Recon->>Email: Send payment receipt
        Email-->>Op: Receipt email
    else No match / discrepancy
        Recon->>Recon: Flag for manual review
        Recon->>Email: Alert finance team
    end
    
    Recon->>Regulator: Update settlement dashboard
    Regulator->>Regulator: Display payment status
    Note over Regulator: Real-time financial overview
```

---

## 5. ML Model Training & Prediction Pipeline

```mermaid
graph TB
    A[Raw Data Sources] --> B[Data Collection]
    B --> C[Data Warehouse]
    
    C --> D[Feature Engineering]
    D --> E[Feature Store]
    
    E --> F[Model Training]
    F --> G[Model Validation]
    
    G --> H{Performance OK?}
    H -->|Yes| I[Model Registry]
    H -->|No| F
    
    I --> J[A/B Testing]
    J --> K{A/B Results}
    K -->|Better| L[Deploy to Production]
    K -->|Worse| I
    
    L --> M[Prediction API]
    M --> N[Real-time Scoring]
    
    N --> O[User Risk Score]
    O --> P[Dashboard Display]
    O --> Q[Alert System]
    
    N --> R[Model Monitoring]
    R --> S{Drift Detected?}
    S -->|Yes| F
    S -->|No| R
    
    style A fill:#e1f5ff
    style C fill:#fff4e1
    style E fill:#e8f5e9
    style I fill:#f3e5f5
    style M fill:#fce4ec
```

### Detailed ML Pipeline Steps

#### 1. Data Collection (Daily)
```python
Sources:
- screening.assessmentresponse (user responses)
- nser.selfexclusionrecord (exclusion history)
- operators.bettingactivity (transaction data)
- users.useractivity (login patterns, device info)
- external.economicdata (unemployment, GDP)

Volume: 1M+ records/day
Storage: S3 Data Lake (Parquet format)
```

#### 2. Feature Engineering (Hourly)
```python
Features (150+):
- Betting frequency (7d, 30d, 90d averages)
- Loss chasing indicators (increasing bet sizes after losses)
- Time-of-day patterns (late-night betting)
- Deposit velocity (sudden increase in deposits)
- Social features (betting with friends)
- Economic stress indicators (payday patterns)
- Assessment scores (historical PGSI, Lie/Bet)
- Demographics (age group, location)

Output: Feature vectors (numpy arrays)
Storage: Redis (hot) + S3 (cold)
```

#### 3. Model Training (Weekly)
```python
Algorithms:
1. XGBoost (primary model)
   - Hyperparameters: 100 trees, max_depth=6, learning_rate=0.1
   - Training data: 500k labeled examples
   - Validation: 5-fold cross-validation
   - Metrics: AUC-ROC=0.94, Precision=0.89, Recall=0.91

2. LSTM (for time-series patterns)
   - Architecture: 2 LSTM layers (128, 64 units) + Dense
   - Sequence length: 90 days
   - Metrics: AUC-ROC=0.92

3. Ensemble (voting classifier)
   - Combines XGBoost + LSTM + Logistic Regression
   - Weights: 0.5, 0.3, 0.2
   - Metrics: AUC-ROC=0.95
```

#### 4. Model Deployment (CI/CD)
```python
Deployment Strategy:
- Canary deployment (5% ΓåÆ 20% ΓåÆ 100%)
- A/B testing (champion vs. challenger)
- Blue-green deployment for rollback
- Model versioning (MLflow)
- API endpoint: /api/v1/ml/predict

Performance:
- Latency: <50ms (P95)
- Throughput: 10,000 predictions/second
- Availability: 99.9%
```

---

## 6. Multi-Operator Exclusion Propagation

```mermaid
graph TD
    A[User Self-Excludes] --> B[NSER Creates Record]
    B --> C[Generate Event: exclusion.created]
    
    C --> D[Message Queue: RabbitMQ]
    
    D --> E1[Operator 1 Webhook]
    D --> E2[Operator 2 Webhook]
    D --> E3[Operator 3 Webhook]
    D --> EN[Operator N Webhook]
    
    E1 --> F1[Operator 1 Processes]
    E2 --> F2[Operator 2 Processes]
    E3 --> F3[Operator 3 Processes]
    EN --> FN[Operator N Processes]
    
    F1 --> G1{Success?}
    F2 --> G2{Success?}
    F3 --> G3{Success?}
    FN --> GN{Success?}
    
    G1 -->|Yes| H1[Update Local DB]
    G1 -->|No| I1[Retry Queue]
    
    G2 -->|Yes| H2[Update Local DB]
    G2 -->|No| I2[Retry Queue]
    
    G3 -->|Yes| H3[Update Local DB]
    G3 -->|No| I3[Retry Queue]
    
    GN -->|Yes| HN[Update Local DB]
    GN -->|No| IN[Retry Queue]
    
    I1 --> J1[Exponential Backoff]
    I2 --> J2[Exponential Backoff]
    I3 --> J3[Exponential Backoff]
    IN --> JN[Exponential Backoff]
    
    J1 --> K{Max Retries?}
    J2 --> K
    J3 --> K
    JN --> K
    
    K -->|No| E1
    K -->|Yes| L[Alert Admin]
    
    H1 --> M[Send ACK]
    H2 --> M
    H3 --> M
    HN --> M
    
    M --> N[Update Propagation Status]
    N --> O[NSER Audit Log]
    
    style A fill:#ffebee
    style D fill:#e1f5fe
    style M fill:#e8f5e9
    style L fill:#fff9c4
```

### Propagation Details

**Webhook Payload**:
```json
{
  "event_id": "evt_7a8b9c0d1e2f3g4h",
  "event_type": "exclusion.created",
  "timestamp": "2025-11-04T09:18:00Z",
  "version": "1.0",
  "data": {
    "bst": "BST-02-A7F3E9D2C1B8F4A6E3D9C7B2F1A8E5D3-C4B9",
    "exclusion_type": "self_exclusion",
    "period": "1_year",
    "effective_date": "2025-11-04T09:18:00Z",
    "expiry_date": "2026-11-04T09:18:00Z",
    "revocable": false
  },
  "signature": "sha256=abcdef123456..." // HMAC signature
}
```

**Retry Policy**:
```python
retry_delays = [1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s]
max_retries = 9
total_time = ~8.5 minutes

After max retries:
- Log failure to database
- Alert compliance team
- Display in Regulator dashboard (operator non-compliance)
- Escalate to manual intervention

**Propagation Status Tracking**:
- Real-time webhook delivery status in operator dashboard
- Audit trail of all failed propagations
- Manual retry capability for compliance team
- Notifications to operator support for troubleshooting

**Propagation Metrics**:
- Target: <5 seconds to all operators
- Success Rate: 99.95%
- Failed Propagations: <0.05% (manual follow-up)

---

## 7. Dashboard Real-Time Update Flow

```mermaid
sequenceDiagram
    participant Event as System Event
    participant Queue as Message Queue
    participant Worker as Dashboard Worker
    participant Cache as Redis Cache
    participant DB as TimescaleDB
    participant WS as WebSocket Server
    participant Client as Dashboard UI
    
    Event->>Queue: Publish event
    Note over Event,Queue: E.g., new exclusion, screening complete
    
    Queue->>Worker: Consume event
    Worker->>Worker: Transform event data
    
    Worker->>Cache: Update real-time metrics
    Note over Cache: INCR exclusions_today<br/>ZADD recent_events
    
    Worker->>DB: Store time-series data
    Note over DB: INSERT INTO metrics (timestamp, type, value)
    
    Worker->>WS: Broadcast to clients
    Note over WS: Send to all connected dashboards
    
    WS->>Client: WebSocket message
    Note over Client: {type: "metric_update", data: {...}}
    
    Client->>Client: Update UI components
    Note over Client: Animated counter, chart update
    
    alt Client requests historical data
        Client->>WS: Request: get_historical
        WS->>Cache: Try cache first
        alt Cache hit
            Cache-->>WS: Return cached data
        else Cache miss
            WS->>DB: Query TimescaleDB
            DB-->>WS: Return aggregated data
            WS->>Cache: Cache result (TTL: 1min)
        end
        WS-->>Client: Historical data response
    end
```

---

## 8. Operator Onboarding Flow

```mermaid
graph TD
    A[Operator Applies] --> B[Regulator Reviews Application]
    B --> C{Approved?}
    
    C -->|No| D[Rejection Notice]
    C -->|Yes| E[Create Operator Account]
    
    E --> F[Generate API Credentials]
    F --> G[API Key + Secret]
    
    G --> H[Setup Webhook Endpoints]
    H --> I[Validate Webhook URLs]
    
    I --> J[Test Integration]
    J --> K{Tests Pass?}
    
    K -->|No| L[Integration Support]
    L --> J
    
    K -->|Yes| M[Activate License]
    
    M --> N[Configure Compliance Rules]
    N --> O[Set Screening Frequency]
    O --> P[Define Limits & Thresholds]
    
    P --> Q[Go Live]
    
    Q --> R[Monitor Compliance]
    R --> S[Generate Monthly Reports]
    
    S --> T{Compliance OK?}
    T -->|Yes| R
    T -->|No| U[Issue Warning]
    
    U --> V{Resolved?}
    V -->|Yes| R
    V -->|No| W[Revoke License]
    
    style A fill:#e3f2fd
    style M fill:#e8f5e9
    style Q fill:#c8e6c9
    style W fill:#ffcdd2
```

---

## 9. Data Retention & Archival Flow

```mermaid
graph TD
    A[Daily Retention Job] --> B{Data Age Check}
    
    B -->|< 90 days| C[Keep in Hot Storage]
    B -->|90-365 days| D[Move to Warm Storage]
    B -->|1-5 years| E[Move to Cold Storage]
    B -->|> 5 years| F{Type Check}
    
    F -->|Screening Data| G[Archive to Glacier]
    F -->|Financial| H[Keep 7 years]
    F -->|Audit Logs| I[Keep 7 years]
    F -->|Session Data| J[Delete]
    
    C --> K[PostgreSQL Primary]
    D --> L[PostgreSQL Replica + S3]
    E --> M[S3 Standard]
    
    G --> N[S3 Glacier Deep Archive]
    H --> O[Compliance Storage]
    I --> O
    J --> P[Purge]
    
    O --> Q[Encrypted + Immutable]
    Q --> R[Annual Compliance Audit]
    
    style K fill:#4caf50
    style L fill:#8bc34a
    style M fill:#cddc39
    style N fill:#ffeb3b
    style P fill:#f44336
```

---

## 10. Security Incident Response Flow

```mermaid
graph TD
    A[Security Event Detected] --> B{Severity Level}
    
    B -->|Low| C[Log to SIEM]
    B -->|Medium| D[Alert Security Team]
    B -->|High| E[Trigger Incident Response]
    B -->|Critical| F[Activate Emergency Protocol]
    
    E --> G[Assemble Response Team]
    F --> G
    
    G --> H[Isolate Affected Systems]
    H --> I[Preserve Evidence]
    I --> J[Root Cause Analysis]
    
    J --> K[Containment Strategy]
    K --> L[Implement Fix]
    L --> M[Verify Resolution]
    
    M --> N{Fixed?}
    N -->|No| L
    N -->|Yes| O[Document Incident]
    
    O --> P[Post-Incident Review]
    P --> Q[Update Security Controls]
    Q --> R[Compliance Notification]
    
    R --> S{Breach?}
    S -->|Yes| T[Notify Data Protection Commissioner]
    S -->|No| U[Internal Report Only]
    
    T --> V[User Notification Within 72 Hours]
    V --> W[Public Disclosure if Required]
    
    style A fill:#ffebee
    style F fill:#f44336
    style T fill:#ff5722
    style W fill:#ff9800
```

---

## Data Flow Summary

### High-Volume Flows
1. **Operator Lookups**: 10,000 req/s ΓåÆ Cache ΓåÆ NSER ΓåÆ Response (<50ms)
2. **Screening Events**: 100,000/day ΓåÆ Queue ΓåÆ ML ΓåÆ Database
3. **Dashboard Updates**: Real-time WebSocket ΓåÆ 1000 concurrent connections
4. **Transaction Logs**: 5M/day ΓåÆ TimescaleDB ΓåÆ Archival

### Low-Latency Flows
- Exclusion lookup: <50ms (P99)
- BST generation: <30ms
- Risk score retrieval: <20ms (cached)
- Dashboard metric: <100ms

### High-Reliability Flows
- Exclusion propagation: 99.95% success rate
- Webhook delivery: 99.9% with retries
- Payment processing: 100% reconciliation

### Compliance-Critical Flows
- Audit logging: Write-once, immutable
- Data retention: Automated with compliance checks
- Incident response: <15 min to containment
