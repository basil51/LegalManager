import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CurrentTenant } from '../tenants/tenant-context.decorator';
import { TrustAccountsService } from './trust-accounts.service';
import { CreateTrustAccountDto } from './dto/create-trust-account.dto';
import { UpdateTrustAccountDto } from './dto/update-trust-account.dto';
import { CreateTrustTransactionDto } from './dto/create-trust-transaction.dto';
import { TrustAccount } from './trust-account.entity';
import { TrustTransaction } from './trust-transaction.entity';

@ApiTags('trust-accounts')
@Controller('trust-accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrustAccountsController {
  constructor(private readonly trustAccountsService: TrustAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trust account' })
  @ApiResponse({ status: 201, description: 'Trust account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createDto: CreateTrustAccountDto,
    @CurrentTenant() tenantId: string,
  ): Promise<TrustAccount> {
    return this.trustAccountsService.create(createDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trust accounts with optional filtering' })
  @ApiResponse({ status: 200, description: 'Trust accounts retrieved successfully' })
  async findAll(@Query() filters: any, @CurrentTenant() tenantId: string): Promise<TrustAccount[]> {
    return this.trustAccountsService.findAll(tenantId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trust account by ID' })
  @ApiResponse({ status: 200, description: 'Trust account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Trust account not found' })
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string): Promise<TrustAccount> {
    return this.trustAccountsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a trust account' })
  @ApiResponse({ status: 200, description: 'Trust account updated successfully' })
  @ApiResponse({ status: 404, description: 'Trust account not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTrustAccountDto,
    @CurrentTenant() tenantId: string,
  ): Promise<TrustAccount> {
    return this.trustAccountsService.update(id, updateDto, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a trust account (soft delete)' })
  @ApiResponse({ status: 200, description: 'Trust account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trust account not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete account with non-zero balance' })
  async remove(@Param('id') id: string, @CurrentTenant() tenantId: string): Promise<void> {
    return this.trustAccountsService.remove(id, tenantId);
  }

  @Post(':id/transactions')
  @ApiOperation({ summary: 'Create a trust transaction' })
  @ApiResponse({ status: 201, description: 'Trust transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or insufficient balance' })
  async createTransaction(
    @Param('id') trustAccountId: string,
    @Body() createDto: CreateTrustTransactionDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<TrustTransaction> {
    // Override trust_account_id from URL param
    createDto.trust_account_id = trustAccountId;
    return this.trustAccountsService.createTransaction(createDto, tenantId, user.id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get all transactions for a trust account' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @Param('id') trustAccountId: string,
    @Query() filters: any,
    @CurrentTenant() tenantId: string,
  ): Promise<TrustTransaction[]> {
    return this.trustAccountsService.findAllTransactions(tenantId, {
      ...filters,
      trust_account_id: trustAccountId,
    });
  }

  @Post(':id/reconcile')
  @ApiOperation({ summary: 'Reconcile trust account with bank statement' })
  @ApiResponse({ status: 200, description: 'Reconciliation completed' })
  @ApiResponse({ status: 404, description: 'Trust account not found' })
  async reconcile(
    @Param('id') id: string,
    @Body('statement_balance') statementBalance: number,
    @CurrentTenant() tenantId: string,
  ): Promise<{ accountBalance: number; statementBalance: number; difference: number; reconciled: boolean }> {
    return this.trustAccountsService.reconcile(id, tenantId, statementBalance);
  }

  @Get('transactions/all')
  @ApiOperation({ summary: 'Get all trust transactions with optional filtering' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getAllTransactions(@Query() filters: any, @CurrentTenant() tenantId: string): Promise<TrustTransaction[]> {
    return this.trustAccountsService.findAllTransactions(tenantId, filters);
  }
}
