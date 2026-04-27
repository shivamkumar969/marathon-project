const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Winner = require("../models/Winner");

const getAnalytics = async (req, res) => {
  try {
    const totalUsers =
      await User.countDocuments();

    const totalEvents =
      await Event.countDocuments();

    const totalRegistrations =
      await Registration.countDocuments();

    const totalWinners =
      await Winner.countDocuments();

    // Gender Breakdown
    const genderStats = await User.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);
    
    const genderBreakdown = {
      male: 0,
      female: 0,
      prefer_not_to_say: 0,
      other: 0
    };
    
    genderStats.forEach(stat => {
      if (genderBreakdown[stat._id] !== undefined) {
        genderBreakdown[stat._id] = stat.count;
      } else if (!stat._id) {
        genderBreakdown.prefer_not_to_say += stat.count; // Default if null
      }
    });

    // Team vs Individual Events
    const typeStats = await Event.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    
    const eventTypes = {
      individual: 0,
      team: 0
    };
    
    typeStats.forEach(stat => {
      if (eventTypes[stat._id] !== undefined) {
        eventTypes[stat._id] = stat.count;
      }
    });

    // Registrations Over Time
    const regsOverTime = await Registration.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    // Institute Breakdown
    const instituteStats = await User.aggregate([
      { $group: { _id: "$instituteType", count: { $sum: 1 } } }
    ]);

    const instituteBreakdown = {
      sms: 0,
      outsider: 0
    };

    instituteStats.forEach(stat => {
      if (stat._id === "SMS Varanasi") instituteBreakdown.sms += stat.count;
      if (stat._id === "Outsider") instituteBreakdown.outsider += stat.count;
    });

    // Course Breakdown by Institute
    const courseStats = await User.aggregate([
      { $group: { _id: { instituteType: "$instituteType", course: "$course" }, count: { $sum: 1 } } }
    ]);
    
    const courseBreakdown = { sms: [], outsider: [] };
    const tempSms = {};
    const tempOutsider = {};
    
    courseStats.forEach(stat => {
       const inst = stat._id.instituteType;
       const course = stat._id.course || "Unspecified";
       if (inst === "SMS Varanasi") {
           tempSms[course] = (tempSms[course] || 0) + stat.count;
       } else if (inst === "Outsider") {
           tempOutsider[course] = (tempOutsider[course] || 0) + stat.count;
       }
    });

    Object.keys(tempSms).forEach(k => courseBreakdown.sms.push({ name: k, value: tempSms[k] }));
    Object.keys(tempOutsider).forEach(k => courseBreakdown.outsider.push({ name: k, value: tempOutsider[k] }));

    res.json({
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalWinners,
      genderBreakdown,
      eventTypes,
      regsOverTime,
      instituteBreakdown,
      courseBreakdown
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const { OpenAI } = require("openai");

const getAiInsights = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalWinners = await Winner.countDocuments();

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ insight: "AI insights require an OpenAI API key. Currently, the platform has " + totalEvents + " events and " + totalRegistrations + " registrations. Consider creating more events to boost engagement!" });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `Act as an expert data analyst. I have an event management platform with the following stats: 
    - ${totalUsers} total users
    - ${totalEvents} total events
    - ${totalRegistrations} total event registrations
    - ${totalWinners} winners marked
    
    Give me a very short 2-3 sentence insight on how I can improve engagement or what these numbers mean.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    });

    res.json({ insight: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPredictiveAnalytics = async (req, res) => {
  try {
    // Fetch last 6 months of registrations
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const regData = await Registration.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Format historical data
    let historical = regData.map((data, index) => ({
      name: `${months[data._id.month - 1]} ${data._id.year}`,
      actual: data.count,
      // Only set predicted for the very last historical point so the lines connect
      predicted: index === regData.length - 1 ? data.count : undefined,
      timeIndex: index + 1
    }));

    // If we don't have enough data (need at least 2 points to draw a trend line)
    if (historical.length < 2) {
      return res.json({
        data: historical,
        growthRate: "Neutral",
        trendFactor: "0.00",
        message: "More monthly data required for accurate AI forecasting."
      });
    }

    // Simple Linear Regression AI Model for Time Series
    // y = mx + b
    const n = historical.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    historical.forEach(point => {
      sumX += point.timeIndex;
      sumY += point.actual;
      sumXY += (point.timeIndex * point.actual);
      sumXX += (point.timeIndex * point.timeIndex);
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Predict next 2 months
    const lastHistorical = historical[historical.length - 1];
    const lastMonthStr = lastHistorical.name.split(" ");
    const lastMonthIndex = months.indexOf(lastMonthStr[0]);
    let currentYear = parseInt(lastMonthStr[1]);

    const predictions = [];
    for (let i = 1; i <= 2; i++) {
      let nextMonthIndex = lastMonthIndex + i;
      if (nextMonthIndex > 11) {
        nextMonthIndex -= 12;
        if (i === 1 || nextMonthIndex === 0) currentYear++;
      }
      
      const nextTimeIndex = n + i;
      let predictedValue = Math.round(m * nextTimeIndex + b);
      // Ensure prediction isn't wildly negative
      predictedValue = Math.max(predictedValue, Math.floor(lastHistorical.actual * 0.5));

      predictions.push({
        name: `${months[nextMonthIndex]} ${currentYear}`,
        predicted: predictedValue
      });
    }

    // To make the graph continuous, we need the last historical point to only have 'actual' in its own object, 
    // and the first predicted point to start from there. We handled this by setting predicted = actual on historical.
    
    res.json({
      data: [...historical, ...predictions],
      growthRate: m > 0 ? "Positive" : "Negative",
      trendFactor: m.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getAiInsights,
  getPredictiveAnalytics
};