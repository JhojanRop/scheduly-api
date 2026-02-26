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

@Controller('rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  create(@Body() dto: CreateRuleDto, @CurrentUser() user: User) {
    return this.rulesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.rulesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rulesService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateRuleDto,
    @CurrentUser() user: User,
  ) {
    return this.rulesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rulesService.remove(id, user.id);
  }
}
