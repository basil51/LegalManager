import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/tenant-context.decorator';
import { CaseStatus, CaseType } from './case.entity';

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Body() createCaseDto: CreateCaseDto, @CurrentTenant() tenantId: string) {
    return this.casesService.create(createCaseDto, tenantId);
  }
 
  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.casesService.findAll(tenantId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: CaseStatus, @CurrentTenant() tenantId: string) {
    return this.casesService.findByStatus(status, tenantId);
  }

  @Get('type/:type')
  findByType(@Param('type') type: CaseType, @CurrentTenant() tenantId: string) {
    return this.casesService.findByType(type, tenantId);
  }

  @Get('lawyer/:lawyerId')
  findByLawyer(@Param('lawyerId') lawyerId: string, @CurrentTenant() tenantId: string) {
    return this.casesService.findByLawyer(lawyerId, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.casesService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto, @CurrentTenant() tenantId: string) {
    return this.casesService.update(id, updateCaseDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.casesService.remove(id, tenantId);
  }
}
