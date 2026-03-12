import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== BRANCHES ====================
  const headOfficeBranch = await prisma.branch.upsert({
    where: { code: 'HO' },
    update: {},
    create: {
      name: 'Head Office',
      code: 'HO',
      address: '123 Banking Street, Financial District',
      phone: '+94 11 234 5678',
    },
  });

  const northBranch = await prisma.branch.upsert({
    where: { code: 'NORTH' },
    update: {},
    create: {
      name: 'North Branch',
      code: 'NORTH',
      address: '45 Commercial Road, Jaffna',
      phone: '+94 21 234 5678',
    },
  });

  const southBranch = await prisma.branch.upsert({
    where: { code: 'SOUTH' },
    update: {},
    create: {
      name: 'South Branch',
      code: 'SOUTH',
      address: '78 Galle Road, Matara',
      phone: '+94 41 234 5678',
    },
  });

  console.log('✅ Branches created');

  // ==================== USERS ====================
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cobanking.com' },
    update: {},
    create: {
      email: 'admin@cobanking.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      branchId: headOfficeBranch.id,
    },
  });

  const branchManager = await prisma.user.upsert({
    where: { email: 'manager@cobanking.com' },
    update: {},
    create: {
      email: 'manager@cobanking.com',
      password: await bcrypt.hash('Manager@123', 10),
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'BRANCH_MANAGER',
      branchId: headOfficeBranch.id,
    },
  });

  const loanOfficer = await prisma.user.upsert({
    where: { email: 'loanoffice@cobanking.com' },
    update: {},
    create: {
      email: 'loanoffice@cobanking.com',
      password: await bcrypt.hash('Loan@123', 10),
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'LOAN_OFFICER',
      branchId: headOfficeBranch.id,
    },
  });

  const teller = await prisma.user.upsert({
    where: { email: 'teller@cobanking.com' },
    update: {},
    create: {
      email: 'teller@cobanking.com',
      password: await bcrypt.hash('Teller@123', 10),
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'TELLER',
      branchId: northBranch.id,
    },
  });

  const recoveryOfficer = await prisma.user.upsert({
    where: { email: 'recovery@cobanking.com' },
    update: {},
    create: {
      email: 'recovery@cobanking.com',
      password: await bcrypt.hash('Recovery@123', 10),
      firstName: 'James',
      lastName: 'Wilson',
      role: 'RECOVERY_OFFICER',
      branchId: headOfficeBranch.id,
    },
  });

  console.log('✅ Users created');

  // ==================== CHART OF ACCOUNTS ====================
  // Assets
  const cashAccount = await prisma.account.upsert({
    where: { code: '1001' },
    update: {},
    create: { code: '1001', name: 'Cash and Cash Equivalents', type: 'ASSET', normalBalance: 'DEBIT', description: 'Physical cash and bank balances' },
  });
  const loansReceivable = await prisma.account.upsert({
    where: { code: '1100' },
    update: {},
    create: { code: '1100', name: 'Loans Receivable', type: 'ASSET', normalBalance: 'DEBIT', description: 'Outstanding loan balances' },
  });
  const leaseReceivable = await prisma.account.upsert({
    where: { code: '1200' },
    update: {},
    create: { code: '1200', name: 'Lease Receivable', type: 'ASSET', normalBalance: 'DEBIT', description: 'Outstanding lease balances' },
  });
  const interestReceivable = await prisma.account.upsert({
    where: { code: '1300' },
    update: {},
    create: { code: '1300', name: 'Interest Receivable', type: 'ASSET', normalBalance: 'DEBIT', description: 'Interest earned but not yet collected' },
  });
  const fdAsset = await prisma.account.upsert({
    where: { code: '1400' },
    update: {},
    create: { code: '1400', name: 'Fixed Deposits (Invested)', type: 'ASSET', normalBalance: 'DEBIT' },
  });

  // Liabilities
  const fdLiability = await prisma.account.upsert({
    where: { code: '2001' },
    update: {},
    create: { code: '2001', name: 'Fixed Deposits Payable', type: 'LIABILITY', normalBalance: 'CREDIT', description: 'Customer FD balances' },
  });
  const interestPayable = await prisma.account.upsert({
    where: { code: '2100' },
    update: {},
    create: { code: '2100', name: 'Interest Payable on FD', type: 'LIABILITY', normalBalance: 'CREDIT' },
  });

  // Equity
  await prisma.account.upsert({
    where: { code: '3001' },
    update: {},
    create: { code: '3001', name: 'Share Capital', type: 'EQUITY', normalBalance: 'CREDIT' },
  });
  await prisma.account.upsert({
    where: { code: '3002' },
    update: {},
    create: { code: '3002', name: 'Retained Earnings', type: 'EQUITY', normalBalance: 'CREDIT' },
  });

  // Income
  const loanInterestIncome = await prisma.account.upsert({
    where: { code: '4001' },
    update: {},
    create: { code: '4001', name: 'Loan Interest Income', type: 'INCOME', normalBalance: 'CREDIT', description: 'Interest earned on loans' },
  });
  const leaseIncome = await prisma.account.upsert({
    where: { code: '4002' },
    update: {},
    create: { code: '4002', name: 'Lease Finance Income', type: 'INCOME', normalBalance: 'CREDIT' },
  });
  const penaltyIncome = await prisma.account.upsert({
    where: { code: '4003' },
    update: {},
    create: { code: '4003', name: 'Penalty / Late Fee Income', type: 'INCOME', normalBalance: 'CREDIT' },
  });
  const fdWithdrawalPenalty = await prisma.account.upsert({
    where: { code: '4004' },
    update: {},
    create: { code: '4004', name: 'FD Premature Withdrawal Penalty', type: 'INCOME', normalBalance: 'CREDIT' },
  });

  // Expenses
  const fdInterestExpense = await prisma.account.upsert({
    where: { code: '5001' },
    update: {},
    create: { code: '5001', name: 'FD Interest Expense', type: 'EXPENSE', normalBalance: 'DEBIT', description: 'Interest paid on fixed deposits' },
  });
  const provisionExpense = await prisma.account.upsert({
    where: { code: '5002' },
    update: {},
    create: { code: '5002', name: 'Loan Loss Provision', type: 'EXPENSE', normalBalance: 'DEBIT' },
  });
  const operatingExpense = await prisma.account.upsert({
    where: { code: '5100' },
    update: {},
    create: { code: '5100', name: 'Operating Expenses', type: 'EXPENSE', normalBalance: 'DEBIT' },
  });

  console.log('✅ Chart of accounts created');

  // ==================== CUSTOMERS ====================
  const customer1 = await prisma.customer.upsert({
    where: { nationalId: 'NID001234567' },
    update: {},
    create: {
      customerNumber: 'CUS-2024-001',
      firstName: 'Rajan',
      lastName: 'Perera',
      email: 'rajan.perera@email.com',
      phone: '+94 77 123 4567',
      nationalId: 'NID001234567',
      dateOfBirth: new Date('1985-03-15'),
      address: '12 Flower Road',
      city: 'Colombo',
      occupation: 'Engineer',
      monthlyIncome: 150000,
      kycStatus: 'VERIFIED',
      riskLevel: 'LOW',
      riskScore: 78,
      creditLimit: 2000000,
      branchId: headOfficeBranch.id,
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { nationalId: 'NID009876543' },
    update: {},
    create: {
      customerNumber: 'CUS-2024-002',
      firstName: 'Amara',
      lastName: 'Silva',
      email: 'amara.silva@email.com',
      phone: '+94 71 987 6543',
      nationalId: 'NID009876543',
      dateOfBirth: new Date('1990-07-22'),
      address: '45 Marine Drive',
      city: 'Galle',
      occupation: 'Business Owner',
      monthlyIncome: 300000,
      kycStatus: 'VERIFIED',
      riskLevel: 'MEDIUM',
      riskScore: 62,
      creditLimit: 5000000,
      branchId: southBranch.id,
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: { nationalId: 'NID005678901' },
    update: {},
    create: {
      customerNumber: 'CUS-2024-003',
      firstName: 'Kasun',
      lastName: 'Fernando',
      email: 'kasun.fernando@email.com',
      phone: '+94 76 567 8901',
      nationalId: 'NID005678901',
      dateOfBirth: new Date('1978-11-08'),
      address: '89 Church Road',
      city: 'Kandy',
      occupation: 'Farmer',
      monthlyIncome: 80000,
      kycStatus: 'VERIFIED',
      riskLevel: 'HIGH',
      riskScore: 38,
      creditLimit: 500000,
      branchId: northBranch.id,
    },
  });

  console.log('✅ Customers created');

  // ==================== ASSETS ====================
  const vehicleAsset = await prisma.asset.upsert({
    where: { assetCode: 'VEH-001' },
    update: {},
    create: {
      assetCode: 'VEH-001',
      name: 'Toyota Hilux 2023',
      description: 'Double Cab Pickup Truck',
      purchaseValue: 8500000,
      currentValue: 8500000,
      usefulLifeYears: 10,
      depreciationRate: 0.10,
      category: 'Vehicle',
      isAvailable: false,
    },
  });

  const machineryAsset = await prisma.asset.upsert({
    where: { assetCode: 'MCH-001' },
    update: {},
    create: {
      assetCode: 'MCH-001',
      name: 'Industrial Generator 50KVA',
      description: 'Diesel powered industrial generator',
      purchaseValue: 1200000,
      currentValue: 1200000,
      usefulLifeYears: 15,
      depreciationRate: 0.067,
      category: 'Machinery',
      isAvailable: false,
    },
  });

  console.log('✅ Assets created');

  // ==================== LOANS ====================
  const loan1 = await prisma.loan.upsert({
    where: { loanNumber: 'LN-2024-001' },
    update: {},
    create: {
      loanNumber: 'LN-2024-001',
      customerId: customer1.id,
      branchId: headOfficeBranch.id,
      loanOfficerId: loanOfficer.id,
      approvedById: branchManager.id,
      loanType: 'Personal',
      principalAmount: 500000,
      interestRate: 0.12,
      termMonths: 24,
      disbursedAmount: 500000,
      disbursedAt: new Date('2024-01-15'),
      purpose: 'Home renovation',
      status: 'ACTIVE',
      emiAmount: 23536.74,
      totalPayable: 564881.76,
      totalPaid: 282440.88,
      outstandingBalance: 282440.88,
      approvedAt: new Date('2024-01-10'),
      maturityDate: new Date('2026-01-15'),
    },
  });

  const loan2 = await prisma.loan.upsert({
    where: { loanNumber: 'LN-2024-002' },
    update: {},
    create: {
      loanNumber: 'LN-2024-002',
      customerId: customer2.id,
      branchId: southBranch.id,
      loanOfficerId: loanOfficer.id,
      approvedById: branchManager.id,
      loanType: 'Business',
      principalAmount: 2000000,
      interestRate: 0.14,
      termMonths: 36,
      disbursedAmount: 2000000,
      disbursedAt: new Date('2024-03-01'),
      purpose: 'Business expansion',
      status: 'ACTIVE',
      emiAmount: 68339.26,
      totalPayable: 2460213.36,
      totalPaid: 410035.56,
      outstandingBalance: 2050177.80,
      approvedAt: new Date('2024-02-25'),
      maturityDate: new Date('2027-03-01'),
    },
  });

  const loan3 = await prisma.loan.upsert({
    where: { loanNumber: 'LN-2023-055' },
    update: {},
    create: {
      loanNumber: 'LN-2023-055',
      customerId: customer3.id,
      branchId: northBranch.id,
      loanOfficerId: loanOfficer.id,
      approvedById: branchManager.id,
      loanType: 'Personal',
      principalAmount: 200000,
      interestRate: 0.16,
      termMonths: 12,
      disbursedAmount: 200000,
      disbursedAt: new Date('2023-06-01'),
      purpose: 'Agricultural equipment',
      status: 'DEFAULTED',
      emiAmount: 18171.67,
      totalPayable: 218060.04,
      totalPaid: 54515.01,
      outstandingBalance: 163545.03,
      penaltyAccrued: 12000,
      approvedAt: new Date('2023-05-28'),
      maturityDate: new Date('2024-06-01'),
    },
  });

  console.log('✅ Loans created');

  // ==================== LEASE ====================
  const lease1 = await prisma.lease.upsert({
    where: { leaseNumber: 'LS-2024-001' },
    update: {},
    create: {
      leaseNumber: 'LS-2024-001',
      customerId: customer2.id,
      assetId: vehicleAsset.id,
      branchId: southBranch.id,
      leaseType: 'Financial',
      leaseAmount: 8500000,
      downPayment: 1700000,
      interestRate: 0.13,
      termMonths: 48,
      monthlyInstallment: 178234.50,
      totalPayable: 8555256,
      totalPaid: 712938,
      outstandingBalance: 7842318,
      status: 'ACTIVE',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2028-02-01'),
    },
  });

  console.log('✅ Leases created');

  // ==================== FIXED DEPOSITS ====================
  const fd1 = await prisma.fixedDeposit.upsert({
    where: { fdNumber: 'FD-2024-001' },
    update: {},
    create: {
      fdNumber: 'FD-2024-001',
      customerId: customer1.id,
      branchId: headOfficeBranch.id,
      principalAmount: 1000000,
      interestRate: 0.10,
      termMonths: 12,
      status: 'ACTIVE',
      startDate: new Date('2024-06-01'),
      maturityDate: new Date('2025-06-01'),
      maturityAmount: 1100000,
      interestAccrued: 54795,
      autoRenew: true,
    },
  });

  const fd2 = await prisma.fixedDeposit.upsert({
    where: { fdNumber: 'FD-2024-002' },
    update: {},
    create: {
      fdNumber: 'FD-2024-002',
      customerId: customer2.id,
      branchId: southBranch.id,
      principalAmount: 3000000,
      interestRate: 0.115,
      termMonths: 24,
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      maturityDate: new Date('2026-01-01'),
      maturityAmount: 3690000,
      interestAccrued: 258123,
      autoRenew: false,
    },
  });

  console.log('✅ Fixed deposits created');

  // ==================== LOAN INSTALLMENTS (for loan1) ====================
  const today = new Date();
  for (let i = 1; i <= 24; i++) {
    const dueDate = new Date('2024-02-15');
    dueDate.setMonth(dueDate.getMonth() + i - 1);
    const isPaid = i <= 12;
    const isOverdue = !isPaid && dueDate < today;

    await prisma.loanInstallment.upsert({
      where: { id: `inst-ln1-${i}` },
      update: {},
      create: {
        id: `inst-ln1-${i}`,
        loanId: loan1.id,
        installmentNo: i,
        dueDate,
        principalAmount: 19036.74,
        interestAmount: 4500,
        totalDue: 23536.74,
        remainingAmount: isPaid ? 0 : 23536.74,
        paidAmount: isPaid ? 23536.74 : 0,
        status: isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING',
        paidAt: isPaid ? dueDate : null,
      },
    });
  }

  console.log('✅ Loan installments created');

  // ==================== RECOVERY CASE ====================
  await prisma.recoveryCase.upsert({
    where: { caseNumber: 'RC-2024-001' },
    update: {},
    create: {
      caseNumber: 'RC-2024-001',
      loanId: loan3.id,
      status: 'ESCALATED',
      overdueAmount: 163545.03,
      overdueDays: 285,
      recoveredAmount: 0,
      notes: 'Customer unresponsive. Escalated to legal.',
      actions: {
        create: [
          {
            actionType: 'REMINDER',
            description: 'SMS reminder sent to customer',
            performedById: recoveryOfficer.id,
            createdAt: new Date('2024-07-01'),
          },
          {
            actionType: 'REMINDER',
            description: 'Email reminder sent',
            performedById: recoveryOfficer.id,
            createdAt: new Date('2024-07-15'),
          },
          {
            actionType: 'VISIT',
            description: 'Field officer visited customer address. Customer absent.',
            performedById: recoveryOfficer.id,
            createdAt: new Date('2024-08-01'),
          },
          {
            actionType: 'LEGAL_NOTICE',
            description: 'Legal notice issued via registered post',
            performedById: recoveryOfficer.id,
            createdAt: new Date('2024-09-01'),
          },
        ],
      },
    },
  });

  console.log('✅ Recovery case created');

  // ==================== JOURNAL ENTRIES ====================
  // Loan disbursement entry
  await prisma.journalEntry.upsert({
    where: { entryNumber: 'JE-2024-001' },
    update: {},
    create: {
      entryNumber: 'JE-2024-001',
      description: 'Loan disbursement - LN-2024-001',
      transactionType: 'LOAN_DISBURSEMENT',
      reference: 'LN-2024-001',
      amount: 500000,
      isPosted: true,
      postedById: admin.id,
      loanId: loan1.id,
      lines: {
        create: [
          { debitAccountId: loansReceivable.id, amount: 500000, description: 'Loan principal disbursed' },
          { creditAccountId: cashAccount.id, amount: 500000, description: 'Cash paid out' },
        ],
      },
    },
  });

  // FD creation entry
  await prisma.journalEntry.upsert({
    where: { entryNumber: 'JE-2024-002' },
    update: {},
    create: {
      entryNumber: 'JE-2024-002',
      description: 'Fixed Deposit creation - FD-2024-001',
      transactionType: 'FD_CREATION',
      reference: 'FD-2024-001',
      amount: 1000000,
      isPosted: true,
      postedById: admin.id,
      fdId: fd1.id,
      lines: {
        create: [
          { debitAccountId: cashAccount.id, amount: 1000000, description: 'FD funds received' },
          { creditAccountId: fdLiability.id, amount: 1000000, description: 'FD balance recorded' },
        ],
      },
    },
  });

  console.log('✅ Journal entries created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin:            admin@cobanking.com     / Admin@123');
  console.log('   Branch Manager:   manager@cobanking.com   / Manager@123');
  console.log('   Loan Officer:     loanoffice@cobanking.com / Loan@123');
  console.log('   Teller:           teller@cobanking.com    / Teller@123');
  console.log('   Recovery Officer: recovery@cobanking.com  / Recovery@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
