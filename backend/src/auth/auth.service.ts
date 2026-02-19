import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private roleForEmail(email: string): 'admin' | 'customer' {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.toLowerCase();
    return adminEmail && email.toLowerCase() === adminEmail ? 'admin' : 'customer';
  }

  async register(email: string, password: string) {
    const user = await this.users.create(email, password, 'customer');
    const role = user.role ?? this.roleForEmail(user.email);
    const token = this.jwt.sign({ sub: user.id, email: user.email, role });
    return { user: { id: user.id, email: user.email, role }, access_token: token };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const valid = await this.users.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    const role = user.role ?? this.roleForEmail(user.email);
    const token = this.jwt.sign({ sub: user.id, email: user.email, role });
    return { user: { id: user.id, email: user.email, role }, access_token: token };
  }

  async validateUserById(userId: string) {
    return this.users.findById(userId);
  }
}
