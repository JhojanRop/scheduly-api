import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked_token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if username already exists', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        id: '1',
        username: 'testUser',
      });

      await expect(
        service.register({
          username: 'testUser',
          password: '12345678',
          fullName: 'Test',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a user and return it without password', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: '1',
        username: 'testUser',
        fullName: 'Test User',
      });

      const result = await service.register({
        username: 'testUser',
        password: '12345678',
        fullName: 'Test User',
      });

      expect(result).toEqual({
        id: '1',
        username: 'testUser',
        fullName: 'Test User',
      });
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(
        service.login({ username: 'testUser', password: '12345678' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        id: '1',
        username: 'testUser',
        password: await bcrypt.hash('correctpassword', 10),
      });

      await expect(
        service.login({ username: 'testUser', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken and refreshToken on valid credentials', async () => {
      mockUsersService.findByUsername.mockResolvedValue({
        id: '1',
        username: 'testUser',
        password: await bcrypt.hash('12345678', 10),
      });

      const result = await service.login({
        username: 'testUser',
        password: '12345678',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refreshTokens('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens if refresh token is valid', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', username: 'testUser' });
      mockUsersService.findById.mockResolvedValue({
        id: '1',
        username: 'testUser',
      });

      const result = await service.refreshTokens('valid_token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
