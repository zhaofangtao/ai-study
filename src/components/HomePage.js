// 首页组件
import { useState, useEffect } from '../web/react-web.js';
const { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } = window;
import { APP_CONFIG } from '../config/constants.js';
import { StorageService } from '../services/storageService.js';

export default function HomePage({ navigation, onStartLearning, onGoToSettings }) {
  const [topic, setTopic] = useState('');
  const [learningHistory, setLearningHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLearningHistory();
  }, []);

  const loadLearningHistory = async () => {
    try {
      const history = await StorageService.getLearningHistory();
      setLearningHistory(history.slice(0, 5)); // 显示最近5条
    } catch (error) {
      console.error('加载学习历史失败:', error);
    }
  };

  const handleStartLearning = async () => {
    if (!topic.trim()) {
      alert('请输入学习主题');
      return;
    }

    setIsLoading(true);
    try {
      // 调用父组件的开始学习方法
      await onStartLearning(topic.trim());
    } catch (error) {
      alert(error.message || '开始学习失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemPress = (historyItem) => {
    setTopic(historyItem.topic);
  };

  const renderQuickStartButtons = () => {
    const quickTopics = [
      '🐍 Python编程',
      '🎨 UI设计',
      '📊 数据分析',
      '🚀 创业知识',
      '🍳 烹饪技巧',
      '📸 摄影技术'
    ];

    return (
      <View style={styles.quickStartContainer}>
        <Text style={styles.sectionTitle}>快速开始</Text>
        <View style={styles.quickButtonsGrid}>
          {quickTopics.map((quickTopic, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickButton}
              onPress={() => setTopic(quickTopic.substring(2))} // 移除emoji
            >
              <Text style={styles.quickButtonText}>{quickTopic}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderLearningHistory = () => {
    if (learningHistory.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>最近学习</Text>
        {learningHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyItem}
            onPress={() => handleHistoryItemPress(item)}
          >
            <View style={styles.historyItemContent}>
              <Text style={styles.historyTopic}>{item.topic}</Text>
              <Text style={styles.historyMeta}>
                {item.questionsCount}个问题 · {item.answeredCount}个已回答
              </Text>
              <Text style={styles.historyTime}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onGoToSettings}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{APP_CONFIG.name}</Text>
        <Text style={styles.subtitle}>通过智能问题，深度学习任何知识</Text>
      </View>

      {/* 学习输入区域 */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>我想学习...</Text>
        <TextInput
          style={styles.textInput}
          value={topic}
          onChangeText={setTopic}
          placeholder="例如：Python编程、插花艺术、营养学..."
          placeholderTextColor={APP_CONFIG.colors.text.light}
          multiline
          maxLength={100}
        />

        <TouchableOpacity
          style={[styles.startButton, isLoading && styles.startButtonDisabled]}
          onPress={handleStartLearning}
          disabled={isLoading}
        >
          <Text style={styles.startButtonText}>
            {isLoading ? '生成中...' : '🚀 开始学习'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 快速开始 */}
      {renderQuickStartButtons()}

      {/* 学习历史 */}
      {renderLearningHistory()}

      {/* 底部说明 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 AI将为您生成个性化的学习问题，帮助您系统掌握知识
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.colors.background,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: APP_CONFIG.colors.white,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.secondary,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: APP_CONFIG.colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: APP_CONFIG.colors.secondary,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    color: APP_CONFIG.colors.text.primary,
    backgroundColor: APP_CONFIG.colors.background,
  },
  startButton: {
    backgroundColor: APP_CONFIG.colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonDisabled: {
    backgroundColor: APP_CONFIG.colors.neutral,
  },
  startButtonText: {
    color: APP_CONFIG.colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  quickStartContainer: {
    backgroundColor: APP_CONFIG.colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 16,
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    backgroundColor: APP_CONFIG.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  quickButtonText: {
    color: APP_CONFIG.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  historyContainer: {
    backgroundColor: APP_CONFIG.colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: APP_CONFIG.colors.background,
    paddingVertical: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: APP_CONFIG.colors.text.light,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSpacer: {
    width: 40,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_CONFIG.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});