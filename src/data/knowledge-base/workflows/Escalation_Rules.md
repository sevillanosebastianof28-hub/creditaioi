# Escalation Rules

**Document Priority: HIGH**
**Last Updated: 2025-01-29**
**Type: Workflow Logic**

---

## 1. WHEN ESCALATION IS ALLOWED

### 1.1 Eligible Escalation Scenarios
✅ **Previous dispute verified but evidence supports inaccuracy**
- Consumer provided documentation
- Bureau verified without apparent review
- Clear discrepancy remains

✅ **Bureau failed to respond within timeline**
- 30/45 day deadline passed
- No response received
- Item not updated

✅ **New evidence obtained**
- Documentation acquired after first dispute
- Information from original creditor
- Court records or settlements

✅ **Clear compliance failure**
- Bureau didn't investigate
- Furnisher didn't respond to bureau
- Automated response without review

✅ **Multiple bureau inconsistencies persist**
- Same item, different data across bureaus
- One bureau corrected, others didn't
- Fundamental discrepancy remains

---

## 2. WHEN ESCALATION IS FORBIDDEN

### 2.1 Prohibited Escalation Scenarios
❌ **Information is accurate**
- Dispute verified and consumer acknowledges accuracy
- No evidence of inaccuracy
- Multiple investigations confirmed accuracy

❌ **No new information or arguments**
- Same dispute, same evidence
- Already escalated on same basis
- Consumer simply disagrees with outcome

❌ **Frivolous dispute history**
- Pattern of disputing accurate information
- Multiple rounds with same claims
- No factual basis for continued dispute

❌ **Previous CFPB complaint on same issue**
- Already filed CFPB complaint
- Received final response
- No new material facts

❌ **Legal action pending**
- Consumer has attorney involved
- Active litigation
- Credit AI should not interfere

---

## 3. REQUIRED WAITING PERIODS

### 3.1 Between Dispute Rounds
| Situation | Minimum Wait |
|-----------|--------------|
| After bureau response | 30 days recommended |
| After verification | Immediately if new evidence |
| After CFPB response | 60 days before re-filing |
| After correction | N/A - no further action needed |

### 3.2 Before CFPB Complaint
Requirements before CFPB escalation:
- [ ] At least one bureau dispute completed
- [ ] Verification response received
- [ ] Good faith effort made with bureau
- [ ] Documentation of all attempts

### 3.3 Rate Limiting
To avoid frivolous flag:
- Maximum 3 disputes on same item per 12 months
- 30-day minimum between similar disputes
- New evidence required after 2nd verification

---

## 4. ESCALATION PATH

### 4.1 Standard Escalation Ladder
```
ROUND 1: Standard Bureau Dispute
    ↓ (if verified/unsatisfied)
ROUND 2: Bureau Dispute with Documentation
    ↓ (if verified/unsatisfied)
ROUND 3: Direct Furnisher Dispute + Bureau Escalation
    ↓ (if verified/unsatisfied)
ROUND 4: Bureau Executive Escalation
    ↓ (if verified/unsatisfied)
ROUND 5: CFPB Complaint
    ↓ (if unresolved)
RECOMMENDATION: Legal Consultation
```

### 4.2 Escalation Addresses

**Experian Escalation (NCAC)**
```
Experian NCAC
P.O. Box 9701
Allen, TX 75013
```

**Equifax Executive Escalation**
```
Equifax Information Services LLC
Office of Consumer Affairs
P.O. Box 740256
Atlanta, GA 30374
```

**TransUnion Escalation**
```
TransUnion Consumer Solutions
P.O. Box 2000
Chester, PA 19016-2000
```

**CFPB Complaint**
```
Online: consumerfinance.gov/complaint
Phone: (855) 411-2372
```

---

## 5. COMPLIANCE-SAFE ESCALATION LANGUAGE

### 5.1 Approved Phrases
- ✅ "I am requesting a reinvestigation of this item"
- ✅ "Enclosed please find documentation supporting my dispute"
- ✅ "This information appears to be inaccurate because..."
- ✅ "I am exercising my rights under the Fair Credit Reporting Act"
- ✅ "Please conduct a reasonable investigation"
- ✅ "I request that you review the attached evidence"

### 5.2 Forbidden Phrases
- ❌ "I will sue you"
- ❌ "This is illegal and you will pay"
- ❌ "I demand immediate deletion or else"
- ❌ "My lawyer will be in touch"
- ❌ "I know my rights and you're breaking the law"
- ❌ Profanity or aggressive language

### 5.3 Tone Requirements
All escalation communications must be:
- Professional and factual
- Clear about specific inaccuracy
- Supported by evidence
- Requesting specific action
- Non-threatening

---

## 6. ESCALATION DOCUMENTATION REQUIREMENTS

### 6.1 Required for Each Round
| Round | Required Documentation |
|-------|----------------------|
| Round 1 | Dispute reason, item identification |
| Round 2 | Round 1 response, supporting evidence |
| Round 3 | All previous correspondence, furnisher communication |
| Round 4 | Complete dispute history, evidence summary |
| Round 5 (CFPB) | All of above, clear timeline |

### 6.2 Record Keeping
Consumer should maintain:
- Copies of all dispute letters
- Certified mail receipts
- Bureau response letters
- Supporting documentation
- Timeline of all communications
- Screenshots of online disputes

---

## 7. CFPB COMPLAINT GUIDELINES

### 7.1 When CFPB is Appropriate
- Bureau failed to investigate properly
- Furnisher ignored bureau notification
- Clear FCRA violation occurred
- Multiple good-faith attempts failed
- Documentation supports consumer position

### 7.2 When CFPB is NOT Appropriate
- First dispute (go through bureau first)
- Information is accurate
- Consumer wants to bypass normal process
- No documentation of attempts
- Frivolous or abusive claims

### 7.3 CFPB Complaint Elements
- Clear description of issue
- Timeline of events
- Documentation of previous attempts
- Specific resolution requested
- All relevant account information

### 7.4 Expected CFPB Outcomes
| Outcome | Meaning |
|---------|---------|
| Closed with explanation | Bureau/furnisher explained position |
| Closed with relief | Some correction or action taken |
| Closed with monetary relief | Rare - damages paid |
| In progress | Under investigation |
| Company responded | Awaiting consumer review |

---

## 8. CREDIT AI LIMITATIONS

### 8.1 What Credit AI Can Do
- ✅ Explain escalation process
- ✅ Identify when escalation is appropriate
- ✅ Provide template escalation language
- ✅ Guide on documentation needs
- ✅ Explain CFPB process

### 8.2 What Credit AI Cannot Do
- ❌ File complaints on behalf of consumers
- ❌ Guarantee escalation success
- ❌ Provide legal advice about remedies
- ❌ Recommend litigation
- ❌ Calculate damages

---

## 9. DOCUMENT DEPENDENCIES

Required companion documents:
- Compliance_Restrictions.md
- FCRA_Summary.md
- All dispute strategy playbooks
- Dispute_Letter_Templates.md
- Tone_Guidelines.md
