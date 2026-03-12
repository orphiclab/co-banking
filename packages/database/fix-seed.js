const fs = require('fs');
let seed = fs.readFileSync('prisma/seed.ts', 'utf8');

// 1. Remove enum imports from PrismaClient import
seed = seed.replace(/import\s*\{\s*PrismaClient.*?\}\s*from\s*\'@prisma\/client\'\;/, 'import { PrismaClient } from \'@prisma/client\';');

// 2. Replace enum usages with string literals
const replacements = [
  [/Role\.ADMIN/g, "'ADMIN'"],
  [/Role\.BRANCH_MANAGER/g, "'BRANCH_MANAGER'"],
  [/Role\.LOAN_OFFICER/g, "'LOAN_OFFICER'"],
  [/Role\.TELLER/g, "'TELLER'"],
  [/Role\.RECOVERY_OFFICER/g, "'RECOVERY_OFFICER'"],
  
  [/AccountType\.ASSET/g, "'ASSET'"],
  [/AccountType\.LIABILITY/g, "'LIABILITY'"],
  [/AccountType\.EQUITY/g, "'EQUITY'"],
  [/AccountType\.INCOME/g, "'INCOME'"],
  [/AccountType\.EXPENSE/g, "'EXPENSE'"],

  [/KycStatus\.VERIFIED/g, "'VERIFIED'"],
  [/KycStatus\.PENDING/g, "'PENDING'"],
  [/KycStatus\.REJECTED/g, "'REJECTED'"],

  [/RiskLevel\.LOW/g, "'LOW'"],
  [/RiskLevel\.MEDIUM/g, "'MEDIUM'"],
  [/RiskLevel\.HIGH/g, "'HIGH'"],
  
  [/LoanStatus\.ACTIVE/g, "'ACTIVE'"],
  [/LoanStatus\.DEFAULTED/g, "'DEFAULTED'"],

  [/LeaseStatus\.ACTIVE/g, "'ACTIVE'"],

  [/FdStatus\.ACTIVE/g, "'ACTIVE'"]
];

replacements.forEach(([regex, replacement]) => {
  seed = seed.replace(regex, replacement);
});

fs.writeFileSync('prisma/seed.ts', seed);
console.log('Done');
