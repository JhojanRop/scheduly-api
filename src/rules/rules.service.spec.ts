import { Test, TestingModule } from '@nestjs/testing';
import { RulesService } from './rules.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  rule: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('RulesService', () => {
  let service: RulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a rule', async () => {
      mockPrismaService.rule.create.mockResolvedValue({
        id: '1',
        type: 'NO_GAPS',
        priorityOrder: 1,
        userId: 'user1',
      });

      const result = await service.create('user1', {
        type: 'NO_GAPS',
        priorityOrder: 1,
      });

      expect(result).toEqual({
        id: '1',
        type: 'NO_GAPS',
        priorityOrder: 1,
        userId: 'user1',
      });
      expect(mockPrismaService.rule.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all rules ordered by priorityOrder', async () => {
      mockPrismaService.rule.findMany.mockResolvedValue([
        { id: '1', type: 'NO_GAPS', priorityOrder: 1, userId: 'user1' },
        {
          id: '2',
          type: 'NO_EARLY_MORNINGS',
          priorityOrder: 2,
          userId: 'user1',
        },
      ]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(2);
      expect(mockPrismaService.rule.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { priorityOrder: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a rule if found', async () => {
      mockPrismaService.rule.findFirst.mockResolvedValue({
        id: '1',
        type: 'NO_GAPS',
        priorityOrder: 1,
        userId: 'user1',
      });

      const result = await service.findOne('1', 'user1');

      expect(result.type).toBe('NO_GAPS');
    });

    it('should throw NotFoundException if rule not found', async () => {
      mockPrismaService.rule.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a rule', async () => {
      mockPrismaService.rule.findFirst.mockResolvedValue({
        id: '1',
        type: 'NO_GAPS',
        priorityOrder: 1,
        userId: 'user1',
      });
      mockPrismaService.rule.update.mockResolvedValue({
        id: '1',
        type: 'NO_EARLY_MORNINGS',
        priorityOrder: 1,
        userId: 'user1',
      });

      const result = await service.update('1', 'user1', {
        type: 'NO_EARLY_MORNINGS',
        priorityOrder: 1,
      });

      expect(result.type).toBe('NO_EARLY_MORNINGS');
    });

    it('should throw NotFoundException if rule not found', async () => {
      mockPrismaService.rule.findFirst.mockResolvedValue(null);

      await expect(
        service.update('1', 'user1', { type: 'NO_GAPS', priorityOrder: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a rule', async () => {
      mockPrismaService.rule.findFirst.mockResolvedValue({
        id: '1',
        type: 'NO_GAPS',
        priorityOrder: 1,
        userId: 'user1',
      });
      mockPrismaService.rule.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'user1');

      expect(mockPrismaService.rule.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if rule not found', async () => {
      mockPrismaService.rule.findFirst.mockResolvedValue(null);

      await expect(service.remove('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
