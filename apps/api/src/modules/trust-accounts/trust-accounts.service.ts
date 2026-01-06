import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TrustAccount } from './trust-account.entity';
import { TrustTransaction, TrustTransactionType } from './trust-transaction.entity';
import { CreateTrustAccountDto } from './dto/create-trust-account.dto';
import { UpdateTrustAccountDto } from './dto/update-trust-account.dto';
import { CreateTrustTransactionDto } from './dto/create-trust-transaction.dto';

@Injectable()
export class TrustAccountsService {
  constructor(
    @InjectRepository(TrustAccount)
    private trustAccountRepository: Repository<TrustAccount>,
    @InjectRepository(TrustTransaction)
    private trustTransactionRepository: Repository<TrustTransaction>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateTrustAccountDto, tenantId: string): Promise<TrustAccount> {
    // Check if account number already exists for this tenant
    const existing = await this.trustAccountRepository.findOne({
      where: {
        account_number: createDto.account_number,
        tenant: { id: tenantId },
      },
    });

    if (existing) {
      throw new BadRequestException('Trust account with this account number already exists');
    }

    const trustAccount = this.trustAccountRepository.create({
      ...createDto,
      tenant: { id: tenantId },
      client: { id: createDto.clientId },
      case: createDto.caseId ? { id: createDto.caseId } : null,
      balance: createDto.initial_balance || 0,
    });

    const saved = await this.trustAccountRepository.save(trustAccount);

    // If initial balance provided, create initial deposit transaction
    if (createDto.initial_balance && createDto.initial_balance > 0) {
      await this.createTransaction(
        {
          trust_account_id: saved.id,
          transaction_type: TrustTransactionType.DEPOSIT,
          amount: createDto.initial_balance,
          description: 'Initial deposit',
          transaction_date: new Date().toISOString().split('T')[0],
        },
        tenantId,
        saved.id,
      );
    }

    return this.findOne(saved.id, tenantId);
  }

  async findAll(tenantId: string, filters?: any): Promise<TrustAccount[]> {
    const queryBuilder = this.trustAccountRepository
      .createQueryBuilder('trustAccount')
      .leftJoinAndSelect('trustAccount.client', 'client')
      .leftJoinAndSelect('trustAccount.case', 'case')
      .where('trustAccount.tenantId = :tenantId', { tenantId })
      .andWhere('trustAccount.is_active = true');

    if (filters?.clientId) {
      queryBuilder.andWhere('trustAccount.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.caseId) {
      queryBuilder.andWhere('trustAccount.caseId = :caseId', { caseId: filters.caseId });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(trustAccount.account_number ILIKE :search OR client.first_name ILIKE :search OR client.last_name ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder.orderBy('trustAccount.created_at', 'DESC').getMany();
  }

  async findOne(id: string, tenantId: string): Promise<TrustAccount> {
    const trustAccount = await this.trustAccountRepository.findOne({
      where: { id, tenant: { id: tenantId } },
      relations: ['client', 'case', 'transactions', 'transactions.created_by'],
      order: { transactions: { transaction_date: 'DESC', created_at: 'DESC' } },
    });

    if (!trustAccount) {
      throw new NotFoundException(`Trust account with ID ${id} not found`);
    }

    return trustAccount;
  }

  async update(id: string, updateDto: UpdateTrustAccountDto, tenantId: string): Promise<TrustAccount> {
    const trustAccount = await this.findOne(id, tenantId);

    Object.assign(trustAccount, updateDto);
    return this.trustAccountRepository.save(trustAccount);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const trustAccount = await this.findOne(id, tenantId);
    
    // Check if account has balance
    if (trustAccount.balance !== 0) {
      throw new BadRequestException('Cannot delete trust account with non-zero balance');
    }

    trustAccount.is_active = false;
    await this.trustAccountRepository.save(trustAccount);
  }

  async createTransaction(
    createDto: CreateTrustTransactionDto,
    tenantId: string,
    userId: string,
  ): Promise<TrustTransaction> {
    const trustAccount = await this.findOne(createDto.trust_account_id, tenantId);

    // Use transaction to ensure balance consistency
    return this.dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(TrustTransaction);
      const accountRepo = manager.getRepository(TrustAccount);

      // Calculate new balance
      let balanceChange = 0;
      if (
        createDto.transaction_type === TrustTransactionType.DEPOSIT ||
        createDto.transaction_type === TrustTransactionType.INTEREST
      ) {
        balanceChange = createDto.amount;
      } else if (
        createDto.transaction_type === TrustTransactionType.WITHDRAWAL ||
        createDto.transaction_type === TrustTransactionType.FEE ||
        createDto.transaction_type === TrustTransactionType.ADJUSTMENT
      ) {
        balanceChange = -createDto.amount;
      }

      const newBalance = Number(trustAccount.balance) + balanceChange;

      // Check for negative balance (not allowed for withdrawals)
      if (
        (createDto.transaction_type === TrustTransactionType.WITHDRAWAL ||
          createDto.transaction_type === TrustTransactionType.FEE) &&
        newBalance < 0
      ) {
        throw new BadRequestException('Insufficient trust account balance');
      }

      // Create transaction
      const transaction = transactionRepo.create({
        ...createDto,
        tenant: { id: tenantId },
        trust_account: { id: trustAccount.id },
        case: createDto.caseId ? { id: createDto.caseId } : null,
        created_by: { id: userId },
        amount: createDto.amount,
      });

      const savedTransaction = await transactionRepo.save(transaction);

      // Update account balance
      await accountRepo.update(trustAccount.id, { balance: newBalance });

      return savedTransaction;
    });
  }

  async findAllTransactions(tenantId: string, filters?: any): Promise<TrustTransaction[]> {
    const queryBuilder = this.trustTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.trust_account', 'trust_account')
      .leftJoinAndSelect('trust_account.client', 'client')
      .leftJoinAndSelect('transaction.case', 'case')
      .leftJoinAndSelect('transaction.created_by', 'created_by')
      .where('transaction.tenantId = :tenantId', { tenantId })
      .andWhere('transaction.is_active = true');

    if (filters?.trust_account_id) {
      queryBuilder.andWhere('transaction.trust_account_id = :trust_account_id', {
        trust_account_id: filters.trust_account_id,
      });
    }

    if (filters?.clientId) {
      queryBuilder.andWhere('trust_account.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.transaction_type) {
      queryBuilder.andWhere('transaction.transaction_type = :transaction_type', {
        transaction_type: filters.transaction_type,
      });
    }

    if (filters?.date_from) {
      queryBuilder.andWhere('transaction.transaction_date >= :date_from', {
        date_from: filters.date_from,
      });
    }

    if (filters?.date_to) {
      queryBuilder.andWhere('transaction.transaction_date <= :date_to', {
        date_to: filters.date_to,
      });
    }

    return queryBuilder
      .orderBy('transaction.transaction_date', 'DESC')
      .addOrderBy('transaction.created_at', 'DESC')
      .getMany();
  }

  async reconcile(trustAccountId: string, tenantId: string, statementBalance: number): Promise<{
    accountBalance: number;
    statementBalance: number;
    difference: number;
    reconciled: boolean;
  }> {
    const trustAccount = await this.findOne(trustAccountId, tenantId);

    const difference = Number(trustAccount.balance) - statementBalance;

    return {
      accountBalance: Number(trustAccount.balance),
      statementBalance,
      difference,
      reconciled: difference === 0,
    };
  }
}
