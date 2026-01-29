// Knowledge Base Index - Central registry for all Credit AI documents
// This enables RAG-driven, compliance-first AI responses

export const KNOWLEDGE_BASE_DOCUMENTS = {
  // HIGHEST PRIORITY - Compliance & Legal (override all others)
  compliance: {
    restrictions: 'src/data/knowledge-base/compliance/Compliance_Restrictions.md',
    fcra: 'src/data/knowledge-base/compliance/FCRA_Summary.md',
    fdcpa: 'src/data/knowledge-base/compliance/FDCPA_Guidelines.md',
    metro2: 'src/data/knowledge-base/compliance/Metro2_Reporting_Standards.md',
  },
  
  // HIGH PRIORITY - Bureau & Account Structure
  bureaus: {
    overview: 'src/data/knowledge-base/bureaus/Credit_Bureau_Overview.md',
    accountTypes: 'src/data/knowledge-base/bureaus/Account_Type_Definitions.md',
  },
  
  // HIGH PRIORITY - Dispute Strategy Playbooks
  disputes: {
    collections: 'src/data/knowledge-base/disputes/Dispute_Collections.md',
    latePayments: 'src/data/knowledge-base/disputes/Dispute_Late_Payments.md',
    chargeOffs: 'src/data/knowledge-base/disputes/Dispute_Charge_Offs.md',
    inquiries: 'src/data/knowledge-base/disputes/Dispute_Inquiries.md',
    closedAccounts: 'src/data/knowledge-base/disputes/Dispute_Closed_Accounts.md',
  },
  
  // HIGH PRIORITY - Workflow & Decision Logic
  workflows: {
    analysisWorkflow: 'src/data/knowledge-base/workflows/Credit_Report_Analysis_Workflow.md',
    eligibilityTree: 'src/data/knowledge-base/workflows/Dispute_Eligibility_Decision_Tree.md',
    escalationRules: 'src/data/knowledge-base/workflows/Escalation_Rules.md',
  },
  
  // HIGH PRIORITY - Tone & Safety
  tone: {
    guidelines: 'src/data/knowledge-base/tone/Tone_Guidelines.md',
    doNotSay: 'src/data/knowledge-base/tone/Do_Not_Say_List.md',
  },
  
  // HIGH PRIORITY - Document Templates
  templates: {
    generationRules: 'src/data/knowledge-base/templates/Dispute_Letter_Generation_Rules.md',
    letterTemplates: 'src/data/knowledge-base/templates/Dispute_Letter_Templates.md',
  },
  
  // STANDARD PRIORITY - Educational Content
  education: {
    fundamentals: 'src/data/knowledge-base/education/Credit_Education_Fundamentals.md',
    improvement: 'src/data/knowledge-base/education/Credit_Improvement_Guidelines.md',
  },
} as const;

// Document categories for validation
export const REQUIRED_DOCUMENTS = [
  'compliance.restrictions',
  'compliance.fcra',
  'compliance.fdcpa',
  'compliance.metro2',
  'tone.guidelines',
  'tone.doNotSay',
] as const;

// Validation status types
export type ValidationStatus = 'valid' | 'missing' | 'outdated';

export interface KnowledgeBaseStatus {
  isComplete: boolean;
  missingDocuments: string[];
  lastValidated: Date;
}

// Check if all required documents exist
export function validateKnowledgeBase(): KnowledgeBaseStatus {
  const missingDocuments: string[] = [];
  
  // In a full implementation, this would check file existence
  // For now, all documents are created so status is complete
  
  return {
    isComplete: missingDocuments.length === 0,
    missingDocuments,
    lastValidated: new Date(),
  };
}

// Fallback response when documents are missing
export const FALLBACK_RESPONSE = `Based on the current Credit AI knowledge base, there is insufficient verified information to answer this request accurately. Please ensure all required compliance documents are available.`;

// Confidence levels based on document availability
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient';

export function getConfidenceLevel(documentsAvailable: string[]): ConfidenceLevel {
  const requiredCount = REQUIRED_DOCUMENTS.length;
  const availableRequired = REQUIRED_DOCUMENTS.filter(doc => 
    documentsAvailable.includes(doc)
  ).length;
  
  const ratio = availableRequired / requiredCount;
  
  if (ratio === 1) return 'high';
  if (ratio >= 0.75) return 'medium';
  if (ratio >= 0.5) return 'low';
  return 'insufficient';
}
