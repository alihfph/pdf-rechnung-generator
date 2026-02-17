import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const user = await this.users.create(email, password);
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, access_token: token };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const valid = await this.users.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, access_token: token };
  }

  async validateUserById(userId: string) {
    return this.users.findById(userId);
  }
}
