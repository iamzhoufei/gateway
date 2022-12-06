import { User } from './entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: MongoRepository<User>,
  ) {}
  createOrSave(user: User) {
    return this.userRepository.save(user);
  }
  findAll() {
    return this.userRepository.find();
  }
}
