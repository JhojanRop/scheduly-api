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
import { CreateSectionDto } from './dto/create-section.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SectionsService } from './sections.service';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sections')
@ApiBearerAuth()
@Controller('sections')
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @ApiOperation({ summary: 'Create a section' })
  @Post()
  create(@Body() dto: CreateSectionDto, @CurrentUser() user: User) {
    return this.sectionsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Get all sections' })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.sectionsService.findAll(user.id);
  }

  @ApiOperation({ summary: 'Get a section by ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.sectionsService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Update a section' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: User,
  ) {
    return this.sectionsService.update(id, user.id, dto);
  }

  @ApiOperation({ summary: 'Delete a section' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.sectionsService.remove(id, user.id);
  }
}
