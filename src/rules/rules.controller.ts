import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RulesService } from './rules.service';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Rules')
@ApiBearerAuth()
@Controller('rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @ApiOperation({ summary: 'Create a rule' })
  @Post()
  create(@Body() dto: CreateRuleDto, @CurrentUser() user: User) {
    return this.rulesService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get all rules' })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.rulesService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Get a rule by ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rulesService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Update a rule' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateRuleDto,
    @CurrentUser() user: User,
  ) {
    return this.rulesService.update(id, user.id, dto);
  }

  @ApiOperation({ summary: 'Delete a rule' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rulesService.remove(id, user.id);
  }
}
