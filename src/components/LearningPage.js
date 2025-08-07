// 学习页面组件 - 显示问题列表和互动
import { useState, useEffect } from '../web/react-web.js';
const { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } = window;
import { APP_CONFIG, QUESTION_CATEGORIES } from '../config/constants.js';
import { AIService } from '../services/aiService.js';
import { StorageService } from '../services/storageService.js';

export default function LearningPage({ session, onUpdateSession, onBack }) {
  const [questions, setQuestions] = useState(session?.questions || []);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const aiService = new AIService();

  useEffect(() => {
    if (session?.questions) {
      setQuestions(session.questions);
    }
  }, [session]);

  // 按分类筛选问题
  const getFilteredQuestions = () => {
    if (activeCategory === 'all') return questions;
    return questions.filter(q => q.category === activeCategory);
  };

  // 获取分类统计
  const getCategoryStats = () => {
    const stats = {};
    Object.values(QUESTION_CATEGORIES).forEach(cat => {
      stats[cat.key] = questions.filter(q => q.category === cat.key).length;
    });
    return stats;
  };

  // 处理问题点击
  const handleQuestionPress = async (question) => {
    setSelectedQuestion(question);
    setAnswer('');
    setIsAnswering(true);
    setShowAnswerModal(true);

    try {
      let fullResponse = '';
      
      const response = await aiService.answerQuestionStream(
        question.question,
        `学习主题: ${session.topic}`,
        (chunk, fullContent) => {
          // 实时更新答案显示
          setAnswer(fullContent);
          fullResponse = fullContent;
        }
      );
      
      // 确保最终答案完整
      if (fullResponse) {
        setAnswer(fullResponse);
      }
      
      // 更新问题状态
      const updatedQuestions = questions.map(q => 
        q.id === question.id ? { ...q, answered: true, answer: fullResponse || response } : q
      );
      setQuestions(updatedQuestions);
      
      // 更新会话
      const updatedSession = { ...session, questions: updatedQuestions };
      onUpdateSession(updatedSession);
      await StorageService.setCurrentSession(updatedSession);
      
    } catch (error) {
      setAnswer('抱歉，回答问题时出现错误：' + error.message);
    } finally {
      setIsAnswering(false);
    }
  };

  // 处理追问
  const handleFollowUp = async () => {
    if (!followUpQuestion.trim()) return;

    setIsAnswering(true);
    const originalAnswer = answer;
    
    try {
      const context = `
原问题: ${selectedQuestion.question}
原回答: ${originalAnswer}
追问: ${followUpQuestion}
      `;
      
      let followUpResponse = '';
      setAnswer(prev => prev + '\n\n【追问回答】\n');
      
      const response = await aiService.answerQuestionStream(
        followUpQuestion, 
        context,
        (chunk, fullContent) => {
          // 实时更新追问答案
          setAnswer(originalAnswer + '\n\n【追问回答】\n' + fullContent);
          followUpResponse = fullContent;
        }
      );
      
      setFollowUpQuestion('');
    } catch (error) {
      setAnswer(originalAnswer); // 恢复原答案
      alert('追问失败：' + error.message);
    } finally {
      setIsAnswering(false);
    }
  };

  // 收藏问题
  const handleFavorite = async (question) => {
    try {
      const questionWithTopic = { ...question, topic: session.topic };
      await StorageService.addFavorite(questionWithTopic);
      
      const updatedQuestions = questions.map(q => 
        q.id === question.id ? { ...q, favorite: true } : q
      );
      setQuestions(updatedQuestions);
      
      const updatedSession = { ...session, questions: updatedQuestions };
      onUpdateSession(updatedSession);
      
      alert('已添加到收藏夹');
    } catch (error) {
      alert('收藏失败：' + error.message);
    }
  };

  // 渲染分类标签
  const renderCategoryTabs = () => {
    const stats = getCategoryStats();
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
        <TouchableOpacity
          style={[styles.categoryTab, activeCategory === 'all' && styles.categoryTabActive]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.categoryTabText, activeCategory === 'all' && styles.categoryTabTextActive]}>
            全部 ({questions.length})
          </Text>
        </TouchableOpacity>
        
        {Object.values(QUESTION_CATEGORIES).map(category => (
          <TouchableOpacity
            key={category.key}
            style={[styles.categoryTab, activeCategory === category.key && styles.categoryTabActive]}
            onPress={() => setActiveCategory(category.key)}
          >
            <Text style={[styles.categoryTabText, activeCategory === category.key && styles.categoryTabTextActive]}>
              {category.icon} {category.name} ({stats[category.key] || 0})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // 渲染问题卡片
  const renderQuestionCard = (question) => {
    const category = Object.values(QUESTION_CATEGORIES).find(cat => cat.key === question.category);
    
    return (
      <TouchableOpacity
        key={question.id}
        style={[
          styles.questionCard,
          question.answered && styles.questionCardAnswered
        ]}
        onPress={() => handleQuestionPress(question)}
      >
        <View style={styles.questionHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: category?.color + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color: category?.color }]}>
              {category?.icon} {category?.name}
            </Text>
          </View>
          <View style={styles.questionActions}>
            {question.answered && <Text style={styles.answeredBadge}>✓</Text>}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleFavorite(question)}
            >
              <Text style={styles.favoriteIcon}>
                {question.favorite ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.questionText}>{question.question}</Text>
        
        <View style={styles.questionFooter}>
          <Text style={styles.difficultyText}>{question.difficulty}</Text>
          {question.tags && question.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {question.tags.slice(0, 2).map((tag, index) => (
                <Text key={index} style={styles.tag}>#{tag}</Text>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 渲染回答模态框
  const renderAnswerModal = () => {
    if (!showAnswerModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAnswerModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>问题详情</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedQuestion && (
              <>
                <View style={styles.modalQuestionContainer}>
                  <Text style={styles.modalQuestionText}>{selectedQuestion.question}</Text>
                </View>

                <View style={styles.modalAnswerContainer}>
                  <Text style={styles.modalSectionTitle}>AI回答</Text>
                  {isAnswering ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>正在思考中...</Text>
                    </View>
                  ) : (
                    <Text style={styles.modalAnswerText}>{answer}</Text>
                  )}
                </View>

                {!isAnswering && answer && (
                  <View style={styles.followUpContainer}>
                    <Text style={styles.modalSectionTitle}>继续追问</Text>
                    <TextInput
                      style={styles.followUpInput}
                      value={followUpQuestion}
                      onChangeText={setFollowUpQuestion}
                      placeholder="对这个回答还有什么疑问？"
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.followUpButton}
                      onPress={handleFollowUp}
                      disabled={!followUpQuestion.trim()}
                    >
                      <Text style={styles.followUpButtonText}>追问</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  const filteredQuestions = getFilteredQuestions();
  const answeredCount = questions.filter(q => q.answered).length;

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.topicTitle}>{session?.topic}</Text>
          <Text style={styles.progressText}>
            {answeredCount}/{questions.length} 个问题已回答
          </Text>
        </View>
      </View>

      {/* 分类标签 */}
      {renderCategoryTabs()}

      {/* 问题列表 */}
      <ScrollView style={styles.questionsContainer}>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(renderQuestionCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>该分类下暂无问题</Text>
          </View>
        )}
      </ScrollView>

      {/* 回答模态框 */}
      {renderAnswerModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONFIG.colors.background,
  },
  header: {
    backgroundColor: APP_CONFIG.colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: APP_CONFIG.colors.secondary,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: APP_CONFIG.colors.primary,
    fontSize: 16,
  },
  headerContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text.primary,
  },
  progressText: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
    marginTop: 2,
  },
  categoryTabs: {
    backgroundColor: APP_CONFIG.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: APP_CONFIG.colors.background,
  },
  categoryTabActive: {
    backgroundColor: APP_CONFIG.colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
  },
  categoryTabTextActive: {
    color: APP_CONFIG.colors.white,
    fontWeight: '600',
  },
  questionsContainer: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: APP_CONFIG.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionCardAnswered: {
    borderLeftWidth: 4,
    borderLeftColor: APP_CONFIG.colors.accent,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answeredBadge: {
    color: APP_CONFIG.colors.accent,
    fontSize: 16,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  questionText: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.primary,
    lineHeight: 24,
    marginBottom: 12,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    color: APP_CONFIG.colors.text.light,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    fontSize: 12,
    color: APP_CONFIG.colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.secondary,
  },
  // 模态框样式
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: APP_CONFIG.colors.background,
  },
  modalHeader: {
    backgroundColor: APP_CONFIG.colors.white,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: APP_CONFIG.colors.secondary,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 18,
    color: APP_CONFIG.colors.text.secondary,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text.primary,
    textAlign: 'center',
  },
  modalHeaderSpacer: {
    width: 34,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalQuestionContainer: {
    backgroundColor: APP_CONFIG.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalQuestionText: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.primary,
    lineHeight: 24,
  },
  modalAnswerContainer: {
    backgroundColor: APP_CONFIG.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
  },
  modalAnswerText: {
    fontSize: 15,
    color: APP_CONFIG.colors.text.primary,
    lineHeight: 22,
  },
  followUpContainer: {
    backgroundColor: APP_CONFIG.colors.white,
    padding: 16,
    borderRadius: 12,
  },
  followUpInput: {
    borderWidth: 1,
    borderColor: APP_CONFIG.colors.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  followUpButton: {
    backgroundColor: APP_CONFIG.colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  followUpButtonText: {
    color: APP_CONFIG.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});