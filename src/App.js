// 主应用组件
import { useState, useEffect } from './web/react-web.js';
import HomePage from './components/HomePage.js';
import LearningPage from './components/LearningPage.js';
import SettingsPage from './components/SettingsPage.js';
import { AIService } from './services/aiService.js';
import { StorageService } from './services/storageService.js';
import { APP_CONFIG } from './config/constants.js';

// 等待window对象初始化
const { View, StyleSheet, Alert } = window;

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'learning', 'settings'
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const aiService = new AIService();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 检查是否有未完成的学习会话
      const session = await StorageService.getCurrentSession();
      if (session && session.questions && session.questions.length > 0) {
        setCurrentSession(session);
        // 可以选择自动恢复到学习页面
        // setCurrentPage('learning');
      }
    } catch (error) {
      console.error('初始化应用失败:', error);
    }
  };

  const handleStartLearning = async (topic) => {
    setIsLoading(true);
    
    try {
      // 检查API配置
      const apiConfig = await StorageService.getApiConfig();
      if (!apiConfig.apiKey) {
        Alert.alert(
          '需要配置',
          '请先在设置中配置AI API密钥',
          [
            { text: '取消', style: 'cancel' },
            { text: '去设置', onPress: () => setCurrentPage('settings') }
          ]
        );
        return;
      }

      // 生成学习问题
      const result = await aiService.generateQuestions(topic);
      
      if (!result || !result.questions || result.questions.length === 0) {
        throw new Error('未能生成有效的学习问题');
      }

      // 创建新的学习会话
      const newSession = {
        id: Date.now(),
        topic: result.topic,
        questions: result.questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(newSession);
      await StorageService.setCurrentSession(newSession);
      
      // 添加到学习历史
      await StorageService.addLearningHistory(newSession);
      
      // 跳转到学习页面
      setCurrentPage('learning');
      
    } catch (error) {
      console.error('开始学习失败:', error);
      
      let errorMessage = '开始学习失败';
      if (error.message.includes('API')) {
        errorMessage = 'API调用失败，请检查网络连接和API配置';
      } else if (error.message.includes('密钥')) {
        errorMessage = 'API密钥无效，请检查配置';
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert('错误', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSession = async (updatedSession) => {
    try {
      updatedSession.updatedAt = new Date().toISOString();
      setCurrentSession(updatedSession);
      await StorageService.setCurrentSession(updatedSession);
    } catch (error) {
      console.error('更新会话失败:', error);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleGoToSettings = () => {
    setCurrentPage('settings');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onStartLearning={handleStartLearning}
            onGoToSettings={handleGoToSettings}
            isLoading={isLoading}
          />
        );
      
      case 'learning':
        return (
          <LearningPage
            session={currentSession}
            onUpdateSession={handleUpdateSession}
            onBack={handleBackToHome}
          />
        );
      
      case 'settings':
        return (
          <SettingsPage
            onBack={handleBackToHome}
          />
        );
      
      default:
        return (
          <HomePage
            onStartLearning={handleStartLearning}
            onGoToSettings={handleGoToSettings}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentPage()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.colors.background,
  },
});