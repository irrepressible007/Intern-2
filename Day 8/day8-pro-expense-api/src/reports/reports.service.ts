import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Expense, ExpenseDocument } from 'src/expenses/schemas/expense.schema';
import { Model, Types } from 'mongoose';
import { ReportQueryDto } from './dto/report-query.dto';
import { Budget, BudgetDocument } from 'src/budgets/schemas/budget.schema';
import { TrendQueryDto } from './dto/trend-query.dto';
// Make sure all date-fns functions are imported
import { addMonths, format, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
  ) {}

  /**
   * API: GET /reports/summary
   * Task 6: Advanced Reports
   */
  async getMonthlySummary(queryDto: ReportQueryDto, userId: string) {
    const { month } = queryDto;
    const userObjectId = new Types.ObjectId(userId);

    // --- 1. Calculate Start and End Dates for the Month (UTC) ---
    const year = parseInt(month.substring(0, 4), 10);
    const monthIndex = parseInt(month.substring(5, 7), 10) - 1; // 0-11

    if (isNaN(year) || isNaN(monthIndex)) {
      throw new BadRequestException('Invalid month format');
    }

    const startDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));
    endDate.setUTCMilliseconds(endDate.getUTCMilliseconds() - 1);
    // ---

    // --- 2. Fetch Budgets Concurrently ---
    const budgetQuery = this.budgetModel.find({
      userId: userObjectId,
      month: month,
    }).lean();
    
    // --- 3. Run Main Expense Aggregation ($facet) ---
    const expenseAggregation = this.expenseModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        $facet: {
          // -- Pipeline A: Overall Summary --
          "summary": [
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 },
                daysTracked: { $addToSet: { $dayOfMonth: '$date' } }
              },
            },
            {
              $project: {
                _id: 0,
                total: { $round: ['$total', 2] },
                count: 1,
                daysTracked: { $size: '$daysTracked' },
                averagePerDay: { 
                  $cond: [
                    { $eq: [{ $size: '$daysTracked' }, 0] }, 
                    0, 
                    { $round: [{ $divide: ['$total', { $size: '$daysTracked' }] }, 2] }
                  ]
                },
              },
            },
          ],
          // -- Pipeline B: By Category --
          "byCategory": [
            { $group: { _id: '$categoryId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
            { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 0, categoryId: '$_id', name: '$categoryDetails.name',
                total: { $round: ['$total', 2] }, count: 1,
              },
            },
            { $sort: { total: -1 } },
          ],
          // -- Pipeline C: By Payment Method --
          "byPaymentMethod": [
            { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } },
            { $project: { _id: 0, method: '$_id', total: { $round: ['$total', 2] } } },
            { $sort: { total: -1 } },
          ],
          // -- Pipeline D: Top 5 Items --
          "topItems": [
            { $sort: { amount: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryDetails' } },
            { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
            { $project: {
                _id: 1, title: 1, amount: { $round: ['$amount', 2] },
                date: 1, categoryName: '$categoryDetails.name',
              },
            },
          ],
        },
      },
    ]).exec();

    // --- 4. Wait for both queries to finish ---
    const [budgets, aggResult] = await Promise.all([budgetQuery, expenseAggregation]);
    const results = aggResult[0] || { summary: [], byCategory: [], byPaymentMethod: [], topItems: [] }; // Handle no expenses case

    // --- 5. Process and Combine Data ---
    const alerts: string[] = [];
    
    // Process Overall Budget
    const overallBudget = budgets.find(b => b.categoryId === null);
    const overallSummary = results.summary[0] || { total: 0, count: 0, averagePerDay: 0, daysTracked: 0 };
    
    const overallBudgetInfo = {
      budgetLimit: overallBudget?.limit || 0,
      remaining: (overallBudget?.limit || 0) - overallSummary.total,
      overrun: (overallBudget && overallSummary.total > overallBudget.limit) || false,
    };
    if (overallBudgetInfo.overrun) {
      alerts.push(`You are ${Math.abs(overallBudgetInfo.remaining).toFixed(2)} over your overall budget of ${overallBudgetInfo.budgetLimit.toFixed(2)}!`);
    }

    // Process Category Budgets
    const byCategoryWithBudget = results.byCategory.map(catTotal => {
      const categoryBudget = budgets.find(
        (b: any) => b.categoryId?.toString() === catTotal.categoryId.toString()
      );
      const budgetLimit = categoryBudget?.limit || 0;
      const remaining = budgetLimit - catTotal.total;
      const overrun = (categoryBudget && catTotal.total > budgetLimit) || false;

      if (overrun) {
        alerts.push(`You are ${Math.abs(remaining).toFixed(2)} over your '${catTotal.name}' budget of ${budgetLimit.toFixed(2)}!`);
      }
      
      return { ...catTotal, budget: { budgetLimit, remaining, overrun } };
    });
    
    // --- 6. Return Final Report ---
    return {
      month,
      overall: { ...overallSummary, budget: overallBudgetInfo },
      byCategory: byCategoryWithBudget,
      byPaymentMethod: results.byPaymentMethod,
      topItems: results.topItems,
      alerts,
    };
  }

  /**
   * API: GET /reports/trend
   * Task 6: Advanced Reports (Trend)
   */
  async getMonthlyTrend(queryDto: TrendQueryDto, userId: string) {
    const { from, to } = queryDto;
    const userObjectId = new Types.ObjectId(userId);
    
    // 1. Calculate Start and End Dates
    const fromDate = startOfMonth(new Date(`${from}-01T00:00:00Z`));
    const toDate = endOfMonth(new Date(`${to}-01T00:00:00Z`));

    // 2. Aggregation Pipeline
    const trendData = await this.expenseModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: fromDate, $lte: toDate },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [
                  { $lt: ['$_id.month', 10] }, 
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
              ]},
            ],
          },
          total: { $round: ['$total', 2] },
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    // 3. Fill in missing months (Graceful handling)
    
    // --- THIS IS THE FIX ---
    // Explicitly define the type of the array
    const completeTrend: { month: string; total: number }[] = [];
    // -----------------------

    let currentDate = fromDate;
    while (currentDate <= toDate) {
      const monthString = format(currentDate, 'yyyy-MM');
      // Find data from our aggregation result
      const foundData = trendData.find(d => d.month === monthString);
      
      if (foundData) {
        completeTrend.push(foundData); // <-- No more error
      } else {
        // Add a zero-entry for this month
        completeTrend.push({ month: monthString, total: 0 }); // <-- No more error
      }
      currentDate = addMonths(currentDate, 1);
    }
    
    return completeTrend;
  }
}