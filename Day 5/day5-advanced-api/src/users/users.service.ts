import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, FilterQuery } from 'mongoose';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateBulkUserDto } from './dto/create-bulk-user.dto'; // <-- Import new DTO

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // --- Task 8: CREATE ---
  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  // --- Task 8: Bulk Create ---
  async createBulk(createBulkUserDto: CreateBulkUserDto) {
    const usersToCreate = createBulkUserDto.users;
    const skipped: { email: string; reason: string }[] = [];
    let insertedCount = 0;

    try {
      // insertMany with ordered:false will try to insert all documents
      // and will throw a single error at the end if any failed
      const createdUsers = await this.userModel.insertMany(usersToCreate, {
        ordered: false,
      });
      insertedCount = createdUsers.length;
    } catch (error) {
      // Check if it's the duplicate key error (E11000)
      if (error.code === 11000 && error.writeErrors) {
        // This is a MongoBulkWriteError
        
        // 'insertedCount' tells us how many *did* succeed before/during errors
        insertedCount = error.insertedCount; 
        
        // 'writeErrors' tells us which ones failed
        error.writeErrors.forEach((err) => {
          if (err.code === 11000) {
            // Get the email from the failed operation's document
            // 'err.op' holds the document that failed
            const email = err.op.email; 
            skipped.push({ email, reason: 'Duplicate email' });
          }
        });
      } else {
        // Re-throw any other kind of error
        throw error;
      }
    }

    // Return our custom report
    return {
      insertedCount,
      skipped,
    };
  }
  // --------------------------------

  // --- Task 1, 2, 5, 6: Advanced GET ALL ---
  async findAll(queryDto: QueryUserDto) {
    const {
      page = 1,
      pageSize = 10,
      search,
      minAge,
      maxAge,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isDeleted = false,
    } = queryDto;

    // 1. Build Query Filter (Task 1 & 5)
    const filter: FilterQuery<UserDocument> = {
      isDeleted,
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = minAge;
      if (maxAge) filter.age.$lte = maxAge;
    }

    // 2. Calculate Pagination (Task 2)
    const skip = (page - 1) * pageSize;

    // 3. Build Sort Object (Task 2)
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // 4. Execute Queries
    const data = await this.userModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      // Task 6: Explicitly show hidden fields if 'isDeleted: true' is passed
      .select(isDeleted ? '+isDeleted +deletedAt' : '') 
      .lean(); // Task 6: Use .lean() for performance

    const total = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(total / pageSize);

    // 5. Return paginated response (Task 2 & 7)
    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  // --- Task 6: Advanced GET ONE ---
  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .lean(); // Task 6: Use .lean()
      
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // --- Task 8: UPDATE ---
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateUserDto, { new: true })
      .lean(); // Task 6: Use .lean()

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // --- Task 8 & 5: Soft DELETE ---
  async remove(id: string): Promise<User> {
    const softDeletedUser = await this.userModel
      .findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true })
      .lean(); // Task 6: Use .lean()

    if (!softDeletedUser) {
      throw new NotFoundException('User not found');
    }
    return softDeletedUser;
  }

  // --- Task 9: RESTORE ---
  async restore(id: string): Promise<User> {
    const restoredUser = await this.userModel
      .findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true })
      .lean(); // Task 6: Use .lean()

    if (!restoredUser) {
      throw new NotFoundException('User not found');
    }
    return restoredUser;
  }
}