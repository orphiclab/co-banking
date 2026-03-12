const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Remove enum blocks
schema = schema.replace(/enum \w+ \{[\s\S]*?\}/g, '');

// Replace specific enum types in models with String
const mappings = [
  { from: 'Role', to: 'String' },
  { from: 'KycStatus', to: 'String' },
  { from: 'RiskLevel', to: 'String' },
  { from: 'LoanStatus', to: 'String' },
  { from: 'LeaseStatus', to: 'String' },
  { from: 'FdStatus', to: 'String' },
  { from: 'InstallmentStatus', to: 'String' },
  { from: 'RecoveryStatus', to: 'String' },
  { from: 'AccountType', to: 'String' },
  { from: 'NotificationType', to: 'String' },
  { from: 'NotificationStatus', to: 'String' },
  { from: 'NotificationTrigger', to: 'String' },
  { from: 'TransactionType', to: 'String' }
];

mappings.forEach(m => {
  // Replace EXACT type declarations e.g. `role Role @default(TELLER)` -> `role String @default("TELLER")`
  // And `role Role?` -> `role String?`
  const regex = new RegExp(`(\\w+)\\s+${m.from}(\\s*\\@default\\((\\w+)\\))?`, 'g');
  schema = schema.replace(regex, (match, fieldName, defaultBlock, defaultValue) => {
    if (defaultBlock) {
      return `${fieldName} String @default("${defaultValue}")`;
    }
    return `${fieldName} String`;
  });
});

// Also replace `String?` when it was an optional enum (e.g. `role Role?`)
mappings.forEach(m => {
  const regex2 = new RegExp(`(\\w+)\\s+${m.from}\\?`, 'g');
  schema = schema.replace(regex2, `$1 String?`);
});

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Done');
