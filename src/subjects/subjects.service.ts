import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        name: dto.name,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, userId },
    });

    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(id: string, userId: string, dto: CreateSubjectDto) {
    await this.findOne(id, userId);

    return this.prisma.subject.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
