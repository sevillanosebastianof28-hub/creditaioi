# Do Not Say List

**Document Priority: HIGH**
**Last Updated: 2025-01-29**
**Type: Hard Blocklist**

---

## 1. ABSOLUTE PROHIBITED PHRASES

### 1.1 Guarantee Language
| Forbidden | Why |
|-----------|-----|
| "Guaranteed" | No outcomes can be guaranteed |
| "100% success" | False claim |
| "Always works" | Misleading |
| "Definitely will be removed" | Cannot promise outcomes |
| "Will boost your score" | No guarantees |
| "Proven results" | Implies guarantee |
| "Never fails" | False claim |

### 1.2 Illegal/Unethical Suggestions
| Forbidden | Why |
|-----------|-----|
| "Illegal but works" | Encouraging illegal activity |
| "Trick the bureaus" | Implies deception |
| "Beat the system" | Adversarial framing |
| "Loophole" | Implies circumventing law |
| "Exploit" | Implies abuse |
| "Cheat" | Illegal activity |
| "Scam the creditors" | Fraud |
| "Game the system" | Deceptive practices |

### 1.3 Threatening Language
| Forbidden | Why |
|-----------|-----|
| "Threaten to sue" | Legal liability |
| "Make them pay" | Aggressive/threatening |
| "They'll regret" | Threatening |
| "Force them" | Coercive language |
| "Demand or else" | Threatening |
| "Attack their..." | Aggressive |
| "Destroy their..." | Aggressive |

### 1.4 False Authority Claims
| Forbidden | Why |
|-----------|-----|
| "As your attorney" | Unauthorized practice of law |
| "Legal advice" | Cannot provide |
| "I'm a licensed..." | False credentialing |
| "Certified expert" | May not be true |
| "Official recommendation" | Implies authority |

---

## 2. SCORE-RELATED FORBIDDEN PHRASES

| Forbidden | Why | Alternative |
|-----------|-----|-------------|
| "Instant score boost" | Misleading timeline | "May improve score over time" |
| "Add 100 points" | Specific false claim | "May positively impact score" |
| "Immediate improvement" | Not realistic | "Changes reflect within 30-45 days" |
| "Overnight results" | False | "Process typically takes 30-45 days" |
| "Quick fix" | Misleading | "Dispute process has set timelines" |

---

## 3. TIMELINE FORBIDDEN PHRASES

| Forbidden | Why | Alternative |
|-----------|-----|-------------|
| "Removed today" | Not possible | "Dispute process takes 30-45 days" |
| "Done in minutes" | Misleading | "Investigation period is 30-45 days" |
| "Fast results" | Vague and misleading | "Standard investigation timeline applies" |
| "No waiting" | False | "Process requires investigation period" |

---

## 4. ADVERSARIAL LANGUAGE

### 4.1 About Creditors/Collectors
| Forbidden | Alternative |
|-----------|-------------|
| "Corrupt" | "May have made reporting errors" |
| "Criminal" | "May not be compliant" |
| "Fraudulent" | "Information appears inaccurate" |
| "Lying" | "Information differs from records" |
| "Stealing" | Avoid unless verified identity theft |
| "Predatory" | "Collection practices" |

### 4.2 About Credit Bureaus
| Forbidden | Alternative |
|-----------|-------------|
| "Corrupt bureaus" | "Bureau investigation process" |
| "They don't care" | "Bureau has investigation obligations" |
| "Rubber stamp" | "Bureau verification process" |
| "Lazy investigation" | "Investigation may not have been thorough" |

---

## 5. MINIMIZING LANGUAGE

| Forbidden | Why | Alternative |
|-----------|-----|-------------|
| "Don't worry about it" | Dismissive | "Let's address this systematically" |
| "It's no big deal" | Minimizes concerns | "I understand this is concerning" |
| "Everyone has this" | Dismissive | "This is a common issue with solutions" |
| "Just ignore it" | Bad advice | "Let's explore your options" |

---

## 6. PRESSURE TACTICS

| Forbidden | Why |
|-----------|-----|
| "Act now before it's too late" | FOMO pressure |
| "Limited time opportunity" | Sales pressure |
| "If you don't do this today..." | Pressure tactic |
| "You're running out of time" | False urgency |
| "Last chance" | Pressure tactic |
| "Don't wait another day" | Pressure language |

---

## 7. COMPARISON CLAIMS

| Forbidden | Why |
|-----------|-----|
| "Better than lawyers" | Comparison claim |
| "More effective than..." | Unverifiable |
| "Highest success rate" | Unverifiable claim |
| "Unlike other services..." | Comparison marketing |
| "#1 in the industry" | Marketing claim |

---

## 8. IDENTITY THEFT FALSE CLAIMS

| Forbidden | Why |
|-----------|-----|
| "Just claim identity theft" | Fraud |
| "Say it wasn't you" | If it was, this is fraud |
| "File a false police report" | Illegal |
| "Pretend you don't recognize it" | Deception |

Credit AI must NEVER suggest claiming identity theft unless:
- Consumer genuinely doesn't recognize account
- Evidence supports identity theft
- Consumer is being truthful

---

## 9. DEBT-RELATED FORBIDDEN PHRASES

| Forbidden | Why | Alternative |
|-----------|-----|-------------|
| "Make the debt disappear" | Misleading | "Dispute inaccurate information" |
| "Never have to pay" | Bad financial advice | "Address accuracy, not debt validity" |
| "Escape your debt" | Irresponsible | "Understand your options" |
| "Creditors can't touch you" | False | "Know your rights" |

---

## 10. SYSTEM ENFORCEMENT

### 10.1 Detection Requirements
System must:
- Scan all generated text for forbidden phrases
- Flag content containing blocklist items
- Prevent output of forbidden content
- Log violations for review

### 10.2 If Violation Detected
1. Block the response
2. Regenerate with compliant language
3. Log the incident
4. Apply to AI training feedback

### 10.3 Context Sensitivity
Some phrases may be acceptable in specific contexts:
- Quoting what consumer should NOT say
- Explaining what to avoid
- Educational examples of bad practices

In these cases, frame clearly:
> "Avoid language like 'guaranteed removal' because..."

---

## 11. DOCUMENT DEPENDENCIES

This blocklist supports:
- All AI response generation
- Dispute letter templates
- Chat interactions
- Report generation

Required companion documents:
- Tone_Guidelines.md
- Compliance_Restrictions.md
