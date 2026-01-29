# Dispute Strategy: Collection Accounts

**Document Priority: HIGH**
**Last Updated: 2025-01-29**
**Account Type: Collections**

---

## 1. WHEN DISPUTE IS ALLOWED

### 1.1 Eligible Dispute Scenarios
✅ **Date of First Delinquency (DOFD) is incorrect**
- DOFD has been re-aged
- DOFD doesn't match original creditor's records
- DOFD has changed since last report

✅ **Balance is inaccurate**
- Balance includes unauthorized fees
- Balance doesn't reflect payments made
- Balance is inflated beyond original debt

✅ **Account is past 7-year reporting limit**
- More than 7 years from true DOFD
- Still appearing when should have aged off

✅ **Not your debt**
- Identity theft
- Mixed file (another consumer's debt)
- Paid to original creditor before collection

✅ **Original creditor information missing**
- K1 segment data not present
- Cannot identify source of debt

✅ **Duplicate reporting**
- Same debt from original creditor AND collection agency
- Multiple collection agencies reporting same debt

✅ **Validation was never provided**
- Requested validation under FDCPA
- Collector failed to provide
- Collector continued collection during validation period

---

## 2. WHEN DISPUTE IS NOT ALLOWED

### 2.1 Ineligible Dispute Scenarios
❌ **Accurate collection within reporting period**
- Debt is yours
- Amount is correct
- DOFD is accurate
- Within 7-year window

❌ **Disputing because balance is high**
- High balance alone is not inaccuracy

❌ **Disputing because it hurts score**
- Negative impact is not grounds for dispute

❌ **Disputing debt you know is valid**
- This is potentially fraudulent
- Credit AI must NOT assist with this

---

## 3. RISK INDICATORS

### 3.1 High Risk (Extra Verification Needed)
⚠️ Consumer claims debt isn't theirs but can't explain
⚠️ Consumer has history of opening accounts with creditor
⚠️ Address on collection matches consumer's known address
⚠️ Debt is recent (within last 2 years)
⚠️ Amount matches consumer's spending patterns

### 3.2 Fraud Risk Indicators
🚨 Consumer wants to dispute all collections simultaneously
🚨 Consumer cannot explain why debts are inaccurate
🚨 Consumer uses template language suggesting scheme
🚨 Pattern of disputing then re-incurring same debts

---

## 4. REQUIRED EVIDENCE

### 4.1 For DOFD Disputes
- Credit reports from all 3 bureaus (showing different dates)
- Original creditor statements (if available)
- Documentation of payment history

### 4.2 For Balance Disputes
- Payment receipts
- Original creditor statements
- Settlement agreement (if applicable)
- Bank statements showing payments

### 4.3 For "Not My Debt" Disputes
- Police report (for identity theft)
- FTC Identity Theft Report
- Dispute letters to all parties
- Documentation of how identity theft occurred

### 4.4 For Validation Disputes
- Copy of validation request letter
- Certified mail receipt
- Documentation of collector's failure to validate
- Record of continued collection activity

---

## 5. EXPECTED BUREAU RESPONSE TYPES

### 5.1 Possible Outcomes
| Response | Meaning | Next Steps |
|----------|---------|------------|
| Deleted | Collection removed from report | Success - monitor for re-insertion |
| Updated | Information changed | Verify changes are correct |
| Verified | Collector confirmed accuracy | Consider escalation |
| Information Provided | Consumer given data | Review for further disputes |
| Reinvestigation in Progress | Still being investigated | Wait for final response |

### 5.2 Common "Verified" Scenarios
- Collector responded within deadline
- Information matches collector's records
- No inaccuracy found by furnisher

### 5.3 When "Verified" May Be Challengeable
- Bureau didn't conduct reasonable investigation
- Consumer provided evidence not considered
- Verification was clearly automated
- K1 data still missing after dispute

---

## 6. ESCALATION RULES

### 6.1 When to Escalate
Escalation appropriate when:
- First dispute verified but evidence supports inaccuracy
- Bureau failed to investigate
- New evidence obtained
- CFPB complaint warranted

### 6.2 Escalation Path
1. **Round 1**: Standard bureau dispute
2. **Round 2**: Dispute with documentation + collector dispute
3. **Round 3**: Bureau escalation (Experian NCAC, executive offices)
4. **Round 4**: CFPB complaint
5. **Beyond**: Legal consultation recommendation

### 6.3 Escalation NOT Appropriate
- Accurate information was verified
- No new evidence or arguments
- Consumer cannot articulate inaccuracy
- Previous CFPB complaint on same issue

---

## 7. COMPLIANCE WARNINGS

### 7.1 Credit AI Must
- ✅ Only suggest disputes for actual inaccuracies
- ✅ Explain realistic outcomes
- ✅ Document basis for dispute
- ✅ Recommend validation for recent collections
- ✅ Advise on documentation needs

### 7.2 Credit AI Must NOT
- ❌ Guarantee collection removal
- ❌ Advise disputing known-valid debts
- ❌ Promise score increases
- ❌ Use threatening language toward collectors
- ❌ Advise ignoring legitimate debts

### 7.3 Required Disclaimers
Every collection dispute recommendation must include:
> "Disputes should only be filed for inaccurate information. Disputing accurate debt may be considered fraudulent. Results cannot be guaranteed."

---

## 8. STRATEGY RECOMMENDATIONS

### 8.1 For Recent Collections (< 2 years)
1. Request FDCPA validation first
2. Compare data across all 3 bureaus
3. Identify specific inaccuracies
4. Dispute with evidence

### 8.2 For Older Collections (2-7 years)
1. Verify DOFD accuracy
2. Check for reporting limit violations
3. Look for duplicate reporting
4. Consider pay-for-delete negotiation (not guaranteed)

### 8.3 For Near-Limit Collections (6-7 years)
1. Document DOFD carefully
2. Monitor for automatic aging off
3. Dispute if past 7-year limit
4. Do NOT pay (resets SOL in some states)

---

## 9. DOCUMENT DEPENDENCIES

Required companion documents:
- FCRA_Summary.md
- FDCPA_Guidelines.md
- Metro2_Reporting_Standards.md
- Compliance_Restrictions.md
