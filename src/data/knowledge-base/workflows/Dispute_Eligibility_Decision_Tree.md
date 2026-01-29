# Dispute Eligibility Decision Tree

**Document Priority: HIGH**
**Last Updated: 2025-01-29**
**Type: Decision Logic**

---

## 1. OUTPUT STATES

### 1.1 Possible Classifications
| State | Definition | Action |
|-------|------------|--------|
| **ELIGIBLE** | Clear inaccuracy with evidence | Proceed with dispute |
| **CONDITIONALLY_ELIGIBLE** | Possible inaccuracy, needs verification | Gather more info |
| **NOT_ELIGIBLE** | Accurate information or no basis | Do not dispute |
| **INSUFFICIENT_INFORMATION** | Cannot determine eligibility | Request more data |

---

## 2. MASTER DECISION TREE

```
START: Is this item on the consumer's credit report?
│
├── NO → NOT_ELIGIBLE (Cannot dispute non-existent item)
│
└── YES → Does consumer claim this item is inaccurate?
    │
    ├── NO → NOT_ELIGIBLE (No basis for dispute)
    │
    └── YES → What type of inaccuracy is claimed?
        │
        ├── [A] "Not my account" → IDENTITY TREE
        ├── [B] "Wrong balance" → BALANCE TREE
        ├── [C] "Wrong dates" → DATE TREE
        ├── [D] "Wrong status" → STATUS TREE
        ├── [E] "Duplicate" → DUPLICATE TREE
        ├── [F] "Past reporting limit" → TIMING TREE
        ├── [G] "Unauthorized inquiry" → INQUIRY TREE
        └── [H] "Other" → GENERAL TREE
```

---

## 3. IDENTITY TREE (Not My Account)

```
IDENTITY: Consumer claims account is not theirs
│
├── Is there evidence of identity theft?
│   ├── YES (Police report, FTC report) → ELIGIBLE
│   └── NO → Continue
│
├── Does consumer have accounts with this creditor?
│   ├── YES → CONDITIONALLY_ELIGIBLE (May be their account)
│   │         Note: "Verify this isn't a forgotten account"
│   └── NO → Continue
│
├── Does address/phone on account match consumer?
│   ├── YES → CONDITIONALLY_ELIGIBLE
│   │         Note: "Strong connection to consumer"
│   └── NO → Continue
│
├── Is this a common name situation?
│   ├── YES → ELIGIBLE (Possible mixed file)
│   └── NO → Continue
│
└── DEFAULT → CONDITIONALLY_ELIGIBLE
    Note: "Cannot verify ownership without more info"
```

---

## 4. BALANCE TREE (Wrong Balance)

```
BALANCE: Consumer claims balance is incorrect
│
├── Is account a collection?
│   ├── YES → Has consumer requested validation?
│   │   ├── YES, validation not provided → ELIGIBLE
│   │   ├── YES, validation provided → Check if balance matches
│   │   │   ├── Balance doesn't match → ELIGIBLE
│   │   │   └── Balance matches → NOT_ELIGIBLE
│   │   └── NO → CONDITIONALLY_ELIGIBLE
│   │           Note: "Recommend requesting validation first"
│   └── NO → Continue
│
├── Does consumer have payment proof?
│   ├── YES → Does proof show different balance?
│   │   ├── YES → ELIGIBLE
│   │   └── NO → NOT_ELIGIBLE (Proof confirms reported balance)
│   └── NO → Continue
│
├── Does balance differ between bureaus?
│   ├── YES (Significant difference) → ELIGIBLE
│   └── NO → Continue
│
├── Is balance showing on settled account?
│   ├── YES → ELIGIBLE (Should show $0 or settlement amount)
│   └── NO → Continue
│
└── DEFAULT → CONDITIONALLY_ELIGIBLE
    Note: "Need documentation to verify claimed balance"
```

---

## 5. DATE TREE (Wrong Dates)

```
DATE: Consumer claims dates are wrong
│
├── Which date is disputed?
│   │
│   ├── [DOFD] Date of First Delinquency
│   │   ├── Does DOFD differ between bureaus?
│   │   │   ├── YES → ELIGIBLE (Inconsistency proves error)
│   │   │   └── NO → Continue
│   │   ├── Has DOFD changed from previous reports?
│   │   │   ├── YES → ELIGIBLE (Re-aging violation)
│   │   │   └── NO → Continue
│   │   ├── Does consumer have records of actual DOFD?
│   │   │   ├── YES, different → ELIGIBLE
│   │   │   └── NO → CONDITIONALLY_ELIGIBLE
│   │   └── DEFAULT → CONDITIONALLY_ELIGIBLE
│   │       Note: "DOFD requires verification"
│   │
│   ├── [OPEN DATE] Account open date
│   │   ├── Does consumer have opening documents?
│   │   │   ├── YES, different → ELIGIBLE
│   │   │   └── NO → CONDITIONALLY_ELIGIBLE
│   │   └── DEFAULT → CONDITIONALLY_ELIGIBLE
│   │
│   ├── [CLOSE DATE] Account close date
│   │   ├── Does consumer have close confirmation?
│   │   │   ├── YES, different → ELIGIBLE
│   │   │   └── NO → CONDITIONALLY_ELIGIBLE
│   │   └── DEFAULT → CONDITIONALLY_ELIGIBLE
│   │
│   └── [LATE PAYMENT DATE] When late payment occurred
│       ├── Does consumer have proof of on-time payment?
│       │   ├── YES → ELIGIBLE
│       │   └── NO → Continue
│       ├── Was consumer on payment arrangement?
│       │   ├── YES → ELIGIBLE (May have been compliant)
│       │   └── NO → Continue
│       └── DEFAULT → CONDITIONALLY_ELIGIBLE
```

---

## 6. STATUS TREE (Wrong Status)

```
STATUS: Consumer claims status is wrong
│
├── What is the claimed correct status?
│   │
│   ├── "Paid" but shows balance
│   │   ├── Consumer has payoff confirmation → ELIGIBLE
│   │   └── No proof → CONDITIONALLY_ELIGIBLE
│   │
│   ├── "Current" but shows late
│   │   ├── Consumer has proof of on-time payment → ELIGIBLE
│   │   └── No proof → CONDITIONALLY_ELIGIBLE
│   │
│   ├── "Closed by consumer" but shows "Closed by creditor"
│   │   ├── Consumer has close request → ELIGIBLE
│   │   └── No documentation → CONDITIONALLY_ELIGIBLE
│   │
│   ├── "Open" but shows closed
│   │   ├── Consumer has recent statement → ELIGIBLE
│   │   └── No proof → CONDITIONALLY_ELIGIBLE
│   │
│   └── "Settled" but shows balance
│       ├── Consumer has settlement letter → ELIGIBLE
│       └── No proof → CONDITIONALLY_ELIGIBLE
│
└── DEFAULT → CONDITIONALLY_ELIGIBLE
    Note: "Need documentation to verify status claim"
```

---

## 7. DUPLICATE TREE

```
DUPLICATE: Consumer claims duplicate reporting
│
├── Is same debt on original creditor AND collection?
│   ├── YES → Do both show a balance?
│   │   ├── YES → ELIGIBLE (Double jeopardy)
│   │   └── NO → Check if appropriate
│   │       ├── Original shows $0, collection shows balance → NOT_ELIGIBLE (Correct)
│   │       └── Both show balance → ELIGIBLE
│   └── NO → Continue
│
├── Are there two collection entries for same debt?
│   ├── YES → ELIGIBLE (Only one should exist)
│   └── NO → Continue
│
├── Is same account appearing twice on same bureau?
│   ├── YES → ELIGIBLE (Clear duplicate)
│   └── NO → Continue
│
└── DEFAULT → CONDITIONALLY_ELIGIBLE
    Note: "Verify if accounts are truly duplicates"
```

---

## 8. TIMING TREE (Past Reporting Limit)

```
TIMING: Consumer claims item is past 7-year limit
│
├── What is the Date of First Delinquency (DOFD)?
│   │
│   ├── DOFD clearly documented
│   │   ├── Calculate: Today - DOFD > 7 years?
│   │   │   ├── YES → ELIGIBLE
│   │   │   └── NO → NOT_ELIGIBLE (Still within limit)
│   │   └── Note: Use 7 years + 180 days for exact limit
│   │
│   ├── DOFD unclear or disputed
│   │   ├── Consumer claims older DOFD → CONDITIONALLY_ELIGIBLE
│   │   │   Note: "Need to verify true DOFD"
│   │   └── Cannot determine → INSUFFICIENT_INFORMATION
│   │
│   └── DOFD missing from report
│       └── CONDITIONALLY_ELIGIBLE
│           Note: "Missing DOFD may itself be violation"
│
└── For bankruptcies:
    ├── Chapter 7/11: 10 years from filing
    └── Chapter 13: 7 years from filing
```

---

## 9. INQUIRY TREE

```
INQUIRY: Consumer claims unauthorized inquiry
│
├── Does consumer recognize the company?
│   ├── YES → Did consumer apply for credit?
│   │   ├── YES → NOT_ELIGIBLE (Authorized inquiry)
│   │   └── NO → What was the purpose?
│   │       ├── Account review (existing creditor) → NOT_ELIGIBLE
│   │       ├── Pre-approved offer check → Check if hard inquiry
│   │       │   ├── Hard inquiry → ELIGIBLE (Should be soft)
│   │       │   └── Soft inquiry → NOT_ELIGIBLE
│   │       └── Unknown purpose → CONDITIONALLY_ELIGIBLE
│   └── NO → Continue
│
├── Is inquiry from unknown company?
│   ├── YES → ELIGIBLE (No identifiable permissible purpose)
│   └── NO → Continue
│
├── Is inquiry > 2 years old?
│   ├── YES → ELIGIBLE (Should have aged off)
│   └── NO → Continue
│
└── DEFAULT → CONDITIONALLY_ELIGIBLE
    Note: "Need to verify authorization status"
```

---

## 10. GENERAL TREE (Other Claims)

```
GENERAL: Consumer has other inaccuracy claim
│
├── Can consumer specifically identify the inaccuracy?
│   ├── NO → INSUFFICIENT_INFORMATION
│   │       Note: "Need specific claim to evaluate"
│   └── YES → Continue
│
├── Does consumer have any supporting evidence?
│   ├── YES → Does evidence support claim?
│   │   ├── YES → ELIGIBLE
│   │   └── NO → NOT_ELIGIBLE (Evidence contradicts claim)
│   └── NO → Continue
│
├── Does information differ between bureaus?
│   ├── YES → ELIGIBLE (Inconsistency suggests error)
│   └── NO → Continue
│
├── Is information verifiable through other means?
│   ├── YES → CONDITIONALLY_ELIGIBLE
│   │       Note: "Recommend gathering verification"
│   └── NO → Continue
│
└── DEFAULT → CONDITIONALLY_ELIGIBLE
    Note: "Cannot determine without more information"
```

---

## 11. REQUIRED DATA CHECKS

Before any classification, verify:
- [ ] Consumer identity confirmed
- [ ] Account/item clearly identified
- [ ] Bureau(s) affected identified
- [ ] Specific claim articulated
- [ ] Available evidence documented

If any check fails → INSUFFICIENT_INFORMATION

---

## 12. DOCUMENT DEPENDENCIES

This decision tree requires:
- Compliance_Restrictions.md
- FCRA_Summary.md
- All dispute strategy playbooks
- Account_Type_Definitions.md
