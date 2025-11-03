import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Expense, ExpenseDocument } from 'src/expenses/schemas/expense.schema';
import { Model } from 'mongoose';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
  ) {}

  async getMonthlySummary(queryDto: ReportQueryDto) {
    const { month } = queryDto;

    // --- Calculate Start and End Dates for the Month (UTC) ---
    // This is the same logic from your expenses.service.ts
    const year = parseInt(month.substring(0, 4), 10);
    const monthIndex = parseInt(month.substring(5, 7), 10) - 1; // 0-11

    if (isNaN(year) || isNaN(monthIndex)) {
      throw new BadRequestException('Invalid month format');
    }

    const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));
    endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() - 1);
    // ---

    // --- MongoDB Aggregation Pipeline ---
    // We use $facet to run two aggregations in parallel: one for the overall total
    // and one for the category-by-category breakdown.
    const aggregationResult = await this.expenseModel.aggregate([
      {
        // 1. Find all non-deleted expenses within the date range
        $match: {
          date: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        // 2. Run two parallel calculations
        $facet: {
          // --- Branch A: Calculate Overall Total ---
          "overallTotal": [
            {
              $group: {
                _id: null, // Group all documents into one
                total: { $sum: '$amount' },
              },
            },
          ],
          // --- Branch B: Calculate Totals by Category ---
          "categoryTotals": [
            {
              $group: {
                _id: '$categoryId', // Group by the category ObjectId
                totalAmount: { $sum: '$amount' }, // Sum amounts for each category
              },
            },
            {
              // 3. Join with the 'categories' collection
              $lookup: {
                from: 'categories', // The name of the categories collection in MongoDB
                localField: '_id', // The _id from the $group stage (which is categoryId)
                foreignField: '_id', // The _id field in the categories collection
                as: 'categoryDetails', // The name of the new array field
              },
            },
            {
              // 4. Deconstruct the categoryDetails array (it will have 0 or 1 element)
              $unwind: {
                 path: '$categoryDetails', 
                 preserveNullAndEmptyArrays: true // Keep results even if category was deleted
              }
            },
            {
              // 5. Format the output
              $project: {
                _id: 0, // Exclude the default _id (which was categoryId)
                categoryId: '$_id',
                categoryName: '$categoryDetails.name', // Get name from populated details
                categorySlug: '$categoryDetails.slug', // Get slug
                totalAmount: { $round: ['$totalAmount', 2] }, // Round to 2 decimal places
              },
            },
            // 6. Sort by total amount descending (optional)
            { $sort: { totalAmount: -1 } }
          ]
        }
      }
    ]).exec();
    // --- End Aggregation ---

    // Extract the results from the $facet output
    const overallTotal = aggregationResult[0]?.overallTotal[0]?.total || 0;
    const categoryTotals = aggregationResult[0]?.categoryTotals || [];

    return {
      month: month,
      overallTotal: overallTotal,
      categoryTotals: categoryTotals,
    };
  }
}