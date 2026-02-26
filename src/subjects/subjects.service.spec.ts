import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  subject: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SubjectsService', () => {
  let service: SubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a subject', async () => {
      mockPrismaService.subject.create.mockResolvedValue({
        id: '1',
        name: 'Matemáticas',
        userId: 'user1',
      });

      const result = await service.create('user1', { name: 'Matemáticas' });

      expect(result).toEqual({ id: '1', name: 'Matemáticas', userId: 'user1' });
      expect(mockPrismaService.subject.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all subjects for a user', async () => {
      mockPrismaService.subject.findMany.mockResolvedValue([
        { id: '1', name: 'Matemáticas', userId: 'user1' },
        { id: '2', name: 'Física', userId: 'user1' },
      ]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(2);
      expect(mockPrismaService.subject.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a subject if found', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue({
        id: '1',
        name: 'Matemáticas',
        userId: 'user1',
      });

      const result = await service.findOne('1', 'user1');

      expect(result).toEqual({ id: '1', name: 'Matemáticas', userId: 'user1' });
    });

    it('should throw NotFoundException if subject not found', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a subject', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue({
        id: '1',
        name: 'Matemáticas',
        userId: 'user1',
      });
      mockPrismaService.subject.update.mockResolvedValue({
        id: '1',
        name: 'Matemáticas Avanzadas',
        userId: 'user1',
      });

      const result = await service.update('1', 'user1', {
        name: 'Matemáticas Avanzadas',
      });

      expect(result.name).toBe('Matemáticas Avanzadas');
    });

    it('should throw NotFoundException if subject not found', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue(null);

      await expect(
        service.update('1', 'user1', { name: 'Matemáticas Avanzadas' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a subject', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue({
        id: '1',
        name: 'Matemáticas',
        userId: 'user1',
      });
      mockPrismaService.subject.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'user1');

      expect(mockPrismaService.subject.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if subject not found', async () => {
      mockPrismaService.subject.findFirst.mockResolvedValue(null);

      await expect(service.remove('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
