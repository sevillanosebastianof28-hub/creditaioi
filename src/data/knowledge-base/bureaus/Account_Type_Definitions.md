# Account Type Definitions

**Document Priority: HIGH**
**Last Updated: 2025-01-29**

---

## 1. REVOLVING ACCOUNTS

### 1.1 Definition
Credit accounts with:
- Flexible borrowing up to credit limit
- Variable monthly payments
- Ongoing availability to re-borrow
- Interest charged on outstanding balance

### 1.2 Common Examples
- Credit cards
- Store cards
- Lines of credit
- Home equity lines of credit (HELOC)

### 1.3 Key Metrics
| Metric | Description | Impact |
|--------|-------------|--------|
| Credit Limit | Maximum borrowing allowed | Utilization calculation |
| Current Balance | Amount currently owed | Utilization calculation |
| Utilization Rate | Balance ÷ Limit | Major score factor |
| Payment History | On-time payment record | Largest score factor |
| Age of Account | Time since opened | Credit age factor |

### 1.4 Dispute Considerations
- Balance accuracy critical for utilization
- Credit limit reporting affects utilization
- Payment history disputes common
- Status (open/closed) must be accurate

---

## 2. INSTALLMENT ACCOUNTS

### 2.1 Definition
Loans with:
- Fixed loan amount
- Fixed monthly payments
- Set repayment term
- Account closes when paid

### 2.2 Common Examples
- Auto loans
- Mortgages
- Personal loans
- Student loans
- Furniture financing

### 2.3 Key Metrics
| Metric | Description | Impact |
|--------|-------------|--------|
| Original Amount | Initial loan amount | Credit mix |
| Current Balance | Remaining balance | Shows progress |
| Monthly Payment | Required payment | DTI ratio |
| Term | Length of loan | Account age |
| Payment History | On-time record | Score factor |

### 2.4 Dispute Considerations
- Payment history accuracy
- Balance should decrease over time
- Status after payoff (should show "Paid")
- Late payment coding accuracy

---

## 3. COLLECTIONS

### 3.1 Definition
Delinquent debts transferred to:
- Third-party collection agency
- Internal collection department
- Debt buyer

### 3.2 Reporting Requirements
- Must include original creditor (K1 segment)
- Must maintain original DOFD
- Must accurately reflect current balance
- Status should reflect collection status

### 3.3 Key Data Points
| Field | Requirement |
|-------|-------------|
| Original Creditor | Must be reported |
| Original DOFD | Cannot be changed |
| Current Balance | Must be accurate |
| Status | Must reflect current state |
| Ownership | Current owner identified |

### 3.4 Dispute Considerations
- DOFD accuracy (most common issue)
- Original creditor information required
- Balance including only valid amounts
- Duplicate reporting (original + collection)
- Proper validation under FDCPA

### 3.5 Special Rules
- 7-year reporting from original DOFD
- Cannot re-age when sold
- Must cease reporting after limit
- Paid collections still reportable

---

## 4. CHARGE-OFFS

### 4.1 Definition
Creditor classification when:
- Account severely delinquent (180+ days)
- Creditor deems uncollectible
- Written off as business loss
- May be sold to collection agency

### 4.2 Key Characteristics
- Status code: 97 (unpaid) or similar
- Original creditor still owns (usually)
- May be sold to debt buyer
- Continues reporting until 7-year limit

### 4.3 Reporting Elements
| Element | Description |
|---------|-------------|
| Charge-off Date | When account was charged off |
| Charge-off Amount | Balance at charge-off |
| Current Balance | May decrease with payments |
| Status | Should reflect charge-off |
| DOFD | Original date, not charge-off date |

### 4.4 Dispute Considerations
- DOFD is NOT the charge-off date
- Balance should be accurate
- Status should update if settled
- Cannot report beyond 7 years from DOFD
- Settled charge-offs may report as "$0 balance"

---

## 5. PUBLIC RECORDS

### 5.1 Definition
Information from public court records:
- Bankruptcies
- Civil judgments (no longer reported as of 2017)
- Tax liens (no longer reported as of 2017)

### 5.2 Bankruptcy Types
| Type | Reporting Period |
|------|------------------|
| Chapter 7 | 10 years from filing |
| Chapter 11 | 10 years from filing |
| Chapter 13 | 7 years from filing |
| Chapter 12 | 7 years from filing |

### 5.3 Bankruptcy Reporting Elements
- Filing date
- Discharge date (if applicable)
- Case number
- Court jurisdiction
- Type of bankruptcy

### 5.4 Dispute Considerations
- Verify dates are accurate
- Confirm discharge is reflected
- Check included accounts show proper status
- Removed judgments/liens shouldn't appear

---

## 6. INQUIRIES

### 6.1 Hard Inquiries
**Definition**: Credit checks that affect score
- Occur when applying for credit
- Remain on report for 2 years
- Affect score for approximately 12 months
- Multiple similar inquiries may count as one

**Examples**:
- Credit card applications
- Loan applications
- Mortgage applications
- Auto financing
- Apartment rental checks

### 6.2 Soft Inquiries
**Definition**: Credit checks that do NOT affect score
- Background checks
- Pre-approved offers
- Personal credit checks
- Account reviews by existing creditors
- Employment verification

### 6.3 Dispute Considerations
- Hard inquiries require permissible purpose
- Unauthorized hard inquiries can be disputed
- Must prove inquiry was not authorized
- Cannot dispute own authorized applications

### 6.4 Permissible Purposes (FCRA § 1681b)
- Consumer-initiated credit application
- Insurance underwriting
- Employment (with consumer consent)
- Existing account review
- Court order
- Child support determination

---

## 7. ACCOUNT STATUS DEFINITIONS

### 7.1 Current Statuses
| Status | Description |
|--------|-------------|
| Current | Paying as agreed |
| Open | Active account |
| Paid | Fully paid, may be open or closed |
| Closed | Account closed |

### 7.2 Delinquent Statuses
| Status | Meaning |
|--------|---------|
| 30 Days Late | 30-59 days past due |
| 60 Days Late | 60-89 days past due |
| 90 Days Late | 90-119 days past due |
| 120 Days Late | 120-149 days past due |
| 150 Days Late | 150-179 days past due |
| 180 Days Late | 180+ days past due |

### 7.3 Negative Statuses
| Status | Description |
|--------|-------------|
| Charge-off | Written off as loss |
| Collection | Sent to collections |
| Foreclosure | Property reclaimed |
| Repossession | Asset reclaimed |
| Settlement | Paid less than owed |

---

## 8. INTEGRATION NOTES

This document supports:
- Account classification logic
- Dispute eligibility by account type
- Status validation
- Reporting timeline enforcement

Required companion documents:
- Metro2_Reporting_Standards.md
- FCRA_Summary.md
- Dispute playbooks by account type
