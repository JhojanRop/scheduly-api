import { CreateRuleDto } from './dto/create-rule.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateRuleDto) {
    return this.prisma.rule.create({
      data: {
        type: dto.type,
        priorityOrder: dto.priorityOrder,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.rule.findMany({
      where: { userId },
      orderBy: { priorityOrder: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const rule = await this.prisma.rule.findFirst({
      where: { id, userId },
    });

    if (!rule) throw new NotFoundException('Rule not found');
    return rule;
  }

  async update(id: string, userId: string, dto: CreateRuleDto) {
    await this.findOne(id, userId);

    return this.prisma.rule.update({
      where: { id },
      data: {
        type: dto.type,
        priorityOrder: dto.priorityOrder,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.rule.delete({
      where: { id },
    });
  }
}
