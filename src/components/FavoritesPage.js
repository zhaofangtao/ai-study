// 收藏夹页面组件
import { useState, useEffect } from '../web/react-web.js';
const { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } = window;
import { APP_CONFIG, QUESTION_CATEGORIES } from '../config/constants.js';
import { StorageService } from '../services/storageService.js';
import { formatDate } from '../utils/helpers.js';

export default function FavoritesPage({ onBack }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await StorageService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('加载收藏失败:', error);
      Alert.alert('错误', '加载收藏失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = (favoriteId) => {
    Alert.alert(
      '确认删除',
      '确定要从收藏夹中移除这个问题吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeFavorite(favoriteId);
              setFavorites(prev => prev.filter(item => item.id !== favoriteId));
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          }
        }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      '确认清空',
      '确定要清空所有收藏吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearFavorites();
              setFavorites([]);
            } catch (error) {
              Alert.alert('错误', '清空失败');
            }
          }
        }
      ]
    );
  };

  const renderFavoriteItem = (favorite) => {
    const category = Object.values(QUESTION_CATEGORIES).find(cat => cat.key === favorite.category);

    return (
      <View key={favorite.id} style={styles.favoriteCard}>
        <View style={styles.favoriteHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: category?.color + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color: category?.color }]}>
              {category?.icon} {category?.name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(favorite.id)}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.questionText}>{favorite.question}</Text>

        {favorite.topic && (
          <Text style={styles.topicText}>主题: {favorite.topic}</Text>
        )}

        {favorite.answer && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>回答:</Text>
            <Text style={styles.answerText} numberOfLines={3}>
              {favorite.answer}
            </Text>
          </View>
        )}

        <Text style={styles.timeText}>
          收藏于 {formatDate(favorite.timestamp)}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⭐</Text>
      <Text style={styles.emptyTitle}>暂无收藏</Text>
      <Text style={styles.emptyText}>
        在学习过程中点击星星图标即可收藏重要问题
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>我的收藏</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的收藏</Text>
        {favorites.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {favorites.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                共收藏了 {favorites.length} 个问题
              </Text>
            </View>
            {favorites.map(renderFavoriteItem)}
          </>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text.primary,
    textAlign: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  clearButtonText: {
    color: APP_CONFIG.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.secondary,
  },
  statsContainer: {
    backgroundColor: APP_CONFIG.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.primary,
    fontWeight: '600',
  },
  favoriteCard: {
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
  favoriteHeader: {
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
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: APP_CONFIG.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
    marginBottom: 8,
  },
  answerContainer: {
    backgroundColor: APP_CONFIG.colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 12,
    color: APP_CONFIG.colors.text.light,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: APP_CONFIG.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});