# Metro 2 Reporting Standards

**Document Priority: HIGHEST**
**Last Updated: 2025-01-29**
**Reference: Consumer Data Industry Association (CDIA) Metro 2 Format**

---

## 1. PURPOSE & OVERVIEW

Metro 2 is the standardized format for reporting consumer credit information:
- Used by all major credit bureaus (Experian, Equifax, TransUnion)
- Defines how account data is structured and transmitted
- Establishes field requirements and validation rules
- Enables consistent reporting across the industry

### 1.1 Why Metro 2 Matters for Disputes
- Reporting errors often occur due to incorrect Metro 2 coding
- Understanding format helps identify inaccuracies
- Many disputes involve Metro 2 compliance violations
- Furnishers are required to report per Metro 2 standards

---

## 2. METRO 2 FORMAT STRUCTURE

### 2.1 Record Types
| Type | Description |
|------|-------------|
| Header | Identifies reporting entity |
| Base Segment | Primary account information |
| J1 Segment | Associated consumer (joint) |
| J2 Segment | Additional consumer |
| K1 Segment | Original creditor info (for collections) |
| K2 Segment | Purchased portfolio info |
| K3 Segment | Agency ID for seller |
| K4 Segment | Specialized agency info |
| L1 Segment | Address information |
| N1 Segment | Employment information |
| Trailer | Record count and control totals |

### 2.2 Key Base Segment Fields
| Field | Description | Dispute Relevance |
|-------|-------------|-------------------|
| Account Number | Unique identifier | Must match records |
| Account Type | Revolving, installment, etc. | Must be accurate |
| Date Opened | When account opened | Often misreported |
| Date Closed | When account closed | Affects status |
| Date of Last Payment | Last payment received | Can affect DOFD |
| Date of First Delinquency | Critical for 7-year limit | Common error |
| Account Status | Current condition | Must reflect reality |
| Payment Rating | Payment history code | High dispute area |
| Current Balance | Amount owed | Must be accurate |
| Amount Past Due | Delinquent amount | Must be accurate |
| Original Charge-off Amount | For charge-offs | Must match |
| Credit Limit/Loan Amount | For utilization | Should be accurate |

---

## 3. COMMON REPORTING ERRORS

### 3.1 Date-Related Errors
| Error Type | Description | Impact |
|------------|-------------|--------|
| Wrong DOFD | Incorrect Date of First Delinquency | Extends reporting period |
| Future dates | Dates that haven't occurred | Invalid reporting |
| Date inconsistency | Different dates across bureaus | Indicates error |
| Re-aged dates | DOFD changed after sale/transfer | FCRA violation |

### 3.2 Status Code Errors
| Error | Description |
|-------|-------------|
| Wrong current status | Account shows incorrect state |
| Inconsistent payment history | Different history per bureau |
| Missing status updates | Account not updated when paid |
| Duplicate status | Same account with different statuses |

### 3.3 Balance and Amount Errors
| Error Type | Potential Issue |
|------------|-----------------|
| Wrong current balance | Doesn't reflect payments |
| Inflated balance | Includes unauthorized fees |
| Wrong original amount | Affects credit utilization |
| Past due doesn't match | Calculation errors |

### 3.4 Identity-Related Errors
| Error | Description |
|-------|-------------|
| Wrong SSN | Different consumer's debt |
| Name variation | Minor spelling issues |
| Wrong address | May indicate mixed file |
| Wrong DOB | Identity mismatch |

---

## 4. DATE CONSISTENCY REQUIREMENTS

### 4.1 Date of First Delinquency (DOFD) Rules
- DOFD is the date account first became delinquent
- AND remained delinquent until charged off/collected
- DOFD CANNOT change after initial establishment
- Transfer to collector does NOT reset DOFD
- Sale of debt does NOT reset DOFD

### 4.2 Required Date Relationships
```
Date Opened ≤ Date of First Delinquency
Date of First Delinquency ≤ Date Closed
Date of First Delinquency ≤ Date Reported
Date of Last Payment may be before or after DOFD
```

### 4.3 Date Verification Points
When reviewing dates:
- Compare across all three bureaus
- Verify DOFD hasn't changed over time
- Check Date Opened is reasonable
- Confirm Date Closed (if applicable) is accurate
- Verify Date of Last Activity

---

## 5. STATUS CODE MISMATCHES

### 5.1 Account Status Codes
| Code | Meaning | When Used |
|------|---------|-----------|
| 11 | Current | Account paid as agreed |
| 13 | Paid | Account paid in full |
| 61 | 30 days late | 30-59 days past due |
| 71 | 60 days late | 60-89 days past due |
| 78 | 90 days late | 90-119 days past due |
| 80 | 120 days late | 120-149 days past due |
| 82 | 150 days late | 150-179 days past due |
| 83 | 180 days late | 180+ days past due |
| 93 | Charge-off | Deemed uncollectible |
| 64 | Collection | In collection |
| 97 | Unpaid | Discharged in bankruptcy |

### 5.2 Common Status Mismatches
| Mismatch Type | Example |
|---------------|---------|
| Paid shows delinquent | Paid account still showing late |
| Wrong severity | Shows 60 late when was only 30 |
| Status not updated | Paid in full still shows balance |
| Conflicting across bureaus | Current on one, late on another |

---

## 6. WHEN REPORTING IS INACCURATE

### 6.1 Definite Inaccuracies
- ❌ Wrong consumer's debt on report
- ❌ Incorrect DOFD extending reporting
- ❌ Balance doesn't match actual amount
- ❌ Status doesn't reflect current state
- ❌ Account reported beyond 7-year limit
- ❌ Duplicate reporting of same debt

### 6.2 Potential Inaccuracies
- ⚠️ Dates inconsistent across bureaus
- ⚠️ Status codes don't match account history
- ⚠️ Original creditor info missing on collections
- ⚠️ Payment history has unexplained gaps

### 6.3 Not Inaccuracies (Even if Harmful)
- ✅ Accurately reported late payments
- ✅ Correct charge-off within reporting period
- ✅ Valid collection with proper DOFD
- ✅ Accurate balance and status

---

## 7. K1 SEGMENT (ORIGINAL CREDITOR) REQUIREMENTS

### 7.1 When K1 is Required
For accounts transferred to collection:
- Original creditor name MUST be reported
- Original creditor address SHOULD be reported
- Account number from original creditor

### 7.2 Common K1 Errors
| Error | Consequence |
|-------|-------------|
| Missing original creditor | Consumer can't identify debt |
| Wrong original creditor | Causes confusion |
| Missing original account number | Verification difficulty |

---

## 8. DISPUTE APPLICATIONS

### 8.1 Using Metro 2 Knowledge in Disputes
When analyzing accounts:
1. Compare dates across all bureaus
2. Verify status codes match account history
3. Check balance accuracy
4. Confirm DOFD hasn't been re-aged
5. Verify K1 data for collections
6. Check for missing required fields

### 8.2 Specific Metro 2-Based Dispute Reasons
- "DOFD reported as [X] but should be [Y]"
- "Status code does not reflect account paid in full"
- "Balance reported does not match records"
- "Original creditor information is missing"
- "Dates are inconsistent with account history"

---

## 9. INTEGRATION NOTES

This document supports:
- Dispute letter generation with specific reasons
- Accuracy analysis algorithms
- Bureau comparison logic
- Eligibility determination

Required companion documents:
- FCRA_Summary.md
- Account_Type_Definitions.md
- Dispute strategy playbooks
