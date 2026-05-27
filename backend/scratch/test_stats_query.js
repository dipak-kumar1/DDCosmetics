const mongoose = require('mongoose');
const connectDB = require('../config/db');
require('dotenv').config({ path: '../.env' });

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const run = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');

    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    // Calculate total revenue (excluding Cancelled orders)
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Aggregation for Daily Revenue (last 7 days)
    const startOf7DaysAgo = new Date();
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);
    startOf7DaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenueAgg = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOf7DaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = dailyRevenueAgg.find(item => item._id === dateStr);
      dailyRevenue.push({
        date: dateStr,
        formattedDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    // Aggregation for Monthly Revenue (last 6 months)
    const startOf6MonthsAgo = new Date();
    startOf6MonthsAgo.setMonth(startOf6MonthsAgo.getMonth() - 5);
    startOf6MonthsAgo.setDate(1);
    startOf6MonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueAgg = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: startOf6MonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      }
    ]);

    const monthlyRevenue = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthVal = d.getMonth() + 1;
      const match = monthlyRevenueAgg.find(item => item._id && item._id.year === year && item._id.month === monthVal);
      monthlyRevenue.push({
        month: `${monthNames[d.getMonth()]} ${year.toString().slice(-2)}`,
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    // Fetch products with low stock (less than 5)
    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $lt: 5 }
    }).select('name stock price images category');

    console.log('\n--- STATS QUERY RESULTS ---');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Pending Orders: ${pendingOrders}`);
    console.log(`Total Revenue: ₹${totalRevenue}`);
    console.log('\nDaily Revenue (Last 7 Days):');
    console.table(dailyRevenue);
    console.log('\nMonthly Revenue (Last 6 Months):');
    console.table(monthlyRevenue);
    console.log('\nLow Stock Products (Count:', lowStockProducts.length, '):');
    console.log(JSON.stringify(lowStockProducts, null, 2));

    await mongoose.disconnect();
    console.log('\nDatabase disconnected.');
  } catch (err) {
    console.error('Error running query:', err);
    process.exit(1);
  }
};

run();
