// 设置页面组件
import { useState, useEffect } from '../web/react-web.js';
const { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } = window;
import { APP_CONFIG, API_PROVIDERS } from '../config/constants.js';
import { StorageService } from '../services/storageService.js';
import { AIService } from '../services/aiService.js';

export default function SettingsPage({ onBack }) {
  const [apiConfig, setApiConfig] = useState({
    provider: 'deepseek',
    apiKey: '',
    baseUrl: '',
    model: ''
  });
  const [userPreferences, setUserPreferences] = useState({
    questionCount: 12,
    autoSave: true,
    theme: 'light',
    language: 'zh-CN'
  });
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await StorageService.getApiConfig();
      const preferences = await StorageService.getUserPreferences();
      
      setApiConfig(config);
      setUserPreferences(preferences);
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const handleProviderChange = (provider) => {
    const providerConfig = API_PROVIDERS[provider.toUpperCase()];
    setApiConfig({
      ...apiConfig,
      provider,
      baseUrl: providerConfig.baseUrl,
      model: providerConfig.model
    });
  };

  const handleSaveApiConfig = async () => {
    if (!apiConfig.apiKey.trim()) {
      Alert.alert('错误', '请输入API密钥');
      return;
    }

    try {
      await StorageService.setApiConfig(apiConfig);
      Alert.alert('成功', 'API配置已保存');
    } catch (error) {
      Alert.alert('错误', '保存配置失败：' + error.message);
    }
  };

  const handleTestApi = async () => {
    if (!apiConfig.apiKey.trim()) {
      Alert.alert('错误', '请先输入API密钥');
      return;
    }

    setIsTestingApi(true);
    try {
      const aiService = new AIService();
      await aiService.setConfig(apiConfig);
      
      // 测试简单问题生成
      const result = await aiService.generateQuestions('测试主题');
      
      if (result && result.questions && result.questions.length > 0) {
        Alert.alert('成功', `API连接正常，生成了${result.questions.length}个测试问题`);
      } else {
        Alert.alert('警告', 'API连接成功，但返回结果异常');
      }
    } catch (error) {
      Alert.alert('失败', 'API测试失败：' + error.message);
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await StorageService.setUserPreferences(userPreferences);
      Alert.alert('成功', '偏好设置已保存');
    } catch (error) {
      Alert.alert('错误', '保存偏好失败：' + error.message);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '确认清除',
      '这将清除所有学习历史和收藏，但不会删除API配置。确定继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearLearningHistory();
              await StorageService.clearFavorites();
              await StorageService.clearCurrentSession();
              Alert.alert('成功', '数据已清除');
            } catch (error) {
              Alert.alert('错误', '清除数据失败：' + error.message);
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await StorageService.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      
      // 这里可以根据平台实现不同的导出方式
      // 微信小程序可以使用 wx.setClipboardData
      // React Native可以使用 Clipboard 或文件系统
      
      Alert.alert(
        '导出成功',
        '数据已准备就绪。在实际应用中，这里会提供下载或分享功能。',
        [{ text: '确定' }]
      );
    } catch (error) {
      Alert.alert('错误', '导出数据失败：' + error.message);
    }
  };

  const renderApiConfigSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔧 AI API 配置</Text>
      
      {/* API提供商选择 */}
      <Text style={styles.fieldLabel}>API提供商</Text>
      <View style={styles.providerButtons}>
        {Object.entries(API_PROVIDERS).map(([key, provider]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.providerButton,
              apiConfig.provider === key.toLowerCase() && styles.providerButtonActive
            ]}
            onPress={() => handleProviderChange(key.toLowerCase())}
          >
            <Text style={[
              styles.providerButtonText,
              apiConfig.provider === key.toLowerCase() && styles.providerButtonTextActive
            ]}>
              {provider.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* API密钥 */}
      <Text style={styles.fieldLabel}>API密钥</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.textInput, styles.passwordInput]}
          value={apiConfig.apiKey}
          onChangeText={(text) => setApiConfig({...apiConfig, apiKey: text})}
          placeholder="请输入API密钥"
          secureTextEntry={!showApiKey}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowApiKey(!showApiKey)}
        >
          <Text style={styles.eyeButtonText}>{showApiKey ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {/* 基础URL */}
      <Text style={styles.fieldLabel}>基础URL</Text>
      <TextInput
        style={styles.textInput}
        value={apiConfig.baseUrl}
        onChangeText={(text) => setApiConfig({...apiConfig, baseUrl: text})}
        placeholder="API基础URL"
      />

      {/* 模型 */}
      <Text style={styles.fieldLabel}>模型</Text>
      <TextInput
        style={styles.textInput}
        value={apiConfig.model}
        onChangeText={(text) => setApiConfig({...apiConfig, model: text})}
        placeholder="模型名称"
      />

      {/* 操作按钮 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTestApi}
          disabled={isTestingApi}
        >
          <Text style={styles.buttonText}>
            {isTestingApi ? '测试中...' : '🧪 测试连接'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveApiConfig}
        >
          <Text style={styles.buttonText}>💾 保存配置</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ 个人偏好</Text>
      
      {/* 问题数量 */}
      <Text style={styles.fieldLabel}>默认生成问题数量</Text>
      <View style={styles.numberInputContainer}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => setUserPreferences({
            ...userPreferences,
            questionCount: Math.max(5, userPreferences.questionCount - 1)
          })}
        >
          <Text style={styles.numberButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.numberDisplay}>{userPreferences.questionCount}</Text>
        
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => setUserPreferences({
            ...userPreferences,
            questionCount: Math.min(20, userPreferences.questionCount + 1)
          })}
        >
          <Text style={styles.numberButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 自动保存 */}
      <View style={styles.switchRow}>
        <Text style={styles.fieldLabel}>自动保存学习记录</Text>
        <TouchableOpacity
          style={[styles.switch, userPreferences.autoSave && styles.switchActive]}
          onPress={() => setUserPreferences({
            ...userPreferences,
            autoSave: !userPreferences.autoSave
          })}
        >
          <View style={[styles.switchThumb, userPreferences.autoSave && styles.switchThumbActive]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={handleSavePreferences}
      >
        <Text style={styles.buttonText}>💾 保存偏好</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDataSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 数据管理</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.exportButton]}
        onPress={handleExportData}
      >
        <Text style={styles.buttonText}>📤 导出数据</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.dangerButton]}
        onPress={handleClearData}
      >
        <Text style={styles.buttonText}>🗑️ 清除数据</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>设置</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {renderApiConfigSection()}
        {renderPreferencesSection()}
        {renderDataSection()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {APP_CONFIG.name} v{APP_CONFIG.version}
          </Text>
          <Text style={styles.footerText}>
            💡 配置完成后即可开始智能学习之旅
          </Text>
        </View>
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
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: APP_CONFIG.colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_CONFIG.colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: APP_CONFIG.colors.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: APP_CONFIG.colors.text.primary,
    backgroundColor: APP_CONFIG.colors.background,
  },
  providerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  providerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: APP_CONFIG.colors.background,
    borderWidth: 1,
    borderColor: APP_CONFIG.colors.secondary,
  },
  providerButtonActive: {
    backgroundColor: APP_CONFIG.colors.primary,
    borderColor: APP_CONFIG.colors.primary,
  },
  providerButtonText: {
    fontSize: 14,
    color: APP_CONFIG.colors.text.secondary,
  },
  providerButtonTextActive: {
    color: APP_CONFIG.colors.white,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginRight: 8,
  },
  eyeButton: {
    padding: 12,
  },
  eyeButtonText: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: APP_CONFIG.colors.accent,
  },
  saveButton: {
    backgroundColor: APP_CONFIG.colors.primary,
  },
  exportButton: {
    backgroundColor: APP_CONFIG.colors.neutral,
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: APP_CONFIG.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: APP_CONFIG.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    color: APP_CONFIG.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  numberDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: APP_CONFIG.colors.text.primary,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: APP_CONFIG.colors.neutral,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: APP_CONFIG.colors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: APP_CONFIG.colors.white,
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: APP_CONFIG.colors.text.light,
    textAlign: 'center',
    marginBottom: 4,
  },
});