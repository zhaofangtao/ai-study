// pages/achievements/achievements.js
const app = getApp();

Page({
  data: {
    learningStats: {},
    achievements: [],
    totalAchievements: 0,
    unlockedAchievements: 0
  },

  onLoad() {
    this.loadAchievements();
  },

  onShow() {
    this.loadAchievements();
  },

  // 加载成就数据
  loadAchievements() {
    const stats = app.globalData.learningStats || {
      totalQuestionsAnswered: 0,
      totalTopicsCompleted: 0,
      streakDays: 0,
      totalStudyTime: 0,
      achievements: []
    };

    const achievements = app.getAchievements().map(achievement => {
      const target = this.getAchievementTarget(achievement);
      return {
        ...achievement,
        target: target,
        progressPercent: Math.min((achievement.progress / target) * 100, 100)
      };
    });
    
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    this.setData({
      learningStats: stats,
      achievements: achievements,
      totalAchievements: achievements.length,
      unlockedAchievements: unlockedCount
    });
  },

  // 格式化学习时间
  formatStudyTime(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}小时${remainingMinutes}分钟`;
    }
  },

  // 获取成就进度百分比
  getProgressPercent(achievement) {
    const target = this.getAchievementTarget(achievement);
    return Math.min((achievement.progress / target) * 100, 100);
  },

  // 获取成就目标值
  getAchievementTarget(achievement) {
    switch (achievement.id) {
      case 'first_question': return 1;
      case 'ten_questions': return 10;
      case 'fifty_questions': return 50;
      case 'hundred_questions': return 100;
      case 'first_topic': return 1;
      case 'five_topics': return 5;
      case 'streak_3': return 3;
      case 'streak_7': return 7;
      case 'streak_30': return 30;
      default: return 1;
    }
  },

  // 分享成就
  shareAchievement(e) {
    const achievementId = e.currentTarget.dataset.id;
    const achievement = this.data.achievements.find(a => a.id === achievementId);
    
    if (achievement && achievement.unlocked) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      
      wx.showToast({
        title: '可以分享给朋友了！',
        icon: 'success'
      });
    }
  },

  // 重置统计数据
  resetStats() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有学习统计和成就吗？此操作不可恢复。',
      confirmText: '确认重置',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          app.globalData.learningStats = {
            totalStudyTime: 0,
            totalQuestionsAnswered: 0,
            totalTopicsCompleted: 0,
            streakDays: 0,
            lastStudyDate: null,
            achievements: []
          };
          app.saveUserData();
          this.loadAchievements();
          wx.showToast({ title: '统计数据已重置', icon: 'success' });
        }
      }
    });
  }
});