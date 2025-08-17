// components/EnhancedInputScreen.tsx - カスタムドロップダウン版
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { ProductInfo } from '../types/shipping';

interface EnhancedInputScreenProps {
  productInfo: ProductInfo;
  onProductInfoChange: (productInfo: ProductInfo) => void;
  onDiagnosis: () => void;
}

// カスタムドロップダウンコンポーネント
interface DropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onValueChange: (value: string) => void;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  value,
  placeholder,
  options,
  onValueChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsVisible(false);
  };

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={[styles.dropdownText, !selectedOption && styles.placeholderText]}>
          {displayText}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default function EnhancedInputScreen({ 
  productInfo, 
  onProductInfoChange, 
  onDiagnosis 
}: EnhancedInputScreenProps) {
  const [validation, setValidation] = useState({ isValid: true, errors: [] as string[] });

  // バリデーション
  useEffect(() => {
    const errors: string[] = [];
    
    if (!productInfo.category) errors.push('カテゴリを選択してください');
    if (!productInfo.length || parseFloat(productInfo.length) <= 0) errors.push('長さを正しく入力してください');
    if (!productInfo.width || parseFloat(productInfo.width) <= 0) errors.push('幅を正しく入力してください'); 
    if (!productInfo.thickness || parseFloat(productInfo.thickness) <= 0) errors.push('厚みを正しく入力してください');
    if (!productInfo.weight || parseFloat(productInfo.weight) <= 0) errors.push('重量を正しく入力してください');
    if (!productInfo.destination) errors.push('配送先を選択してください');
    if (!productInfo.senderLocation) errors.push('発送元を選択してください');
    
    if (productInfo.salePrice && parseFloat(productInfo.salePrice) <= 0) {
      errors.push('販売価格は0円より大きい値を入力してください');
    }
    
    setValidation({ isValid: errors.length === 0, errors });
  }, [productInfo]);

  const updateField = (field: keyof ProductInfo, value: string) => {
    onProductInfoChange({
      ...productInfo,
      [field]: value
    });
  };

  const handleDiagnosis = () => {
    if (!validation.isValid) {
      Alert.alert('入力エラー', validation.errors.join('\n'));
      return;
    }
    onDiagnosis();
  };

  // カテゴリオプション
  const categoryOptions = [
    { label: 'カテゴリを選択してください', value: '' },
    { label: '衣類', value: '衣類' },
    { label: '書籍', value: '書籍' },
    { label: 'ゲーム', value: 'ゲーム' },
    { label: '雑貨', value: '雑貨' },
    { label: '家電', value: '家電' },
    { label: '食品', value: '食品' },
  ];

  // 都道府県オプション
  const prefectureOptions = [
    { label: '都道府県を選択', value: '' },
    { label: '北海道', value: '北海道' },
    { label: '青森県', value: '青森県' },
    { label: '岩手県', value: '岩手県' },
    { label: '宮城県', value: '宮城県' },
    { label: '秋田県', value: '秋田県' },
    { label: '山形県', value: '山形県' },
    { label: '福島県', value: '福島県' },
    { label: '茨城県', value: '茨城県' },
    { label: '栃木県', value: '栃木県' },
    { label: '群馬県', value: '群馬県' },
    { label: '埼玉県', value: '埼玉県' },
    { label: '千葉県', value: '千葉県' },
    { label: '東京都', value: '東京都' },
    { label: '神奈川県', value: '神奈川県' },
    { label: '新潟県', value: '新潟県' },
    { label: '富山県', value: '富山県' },
    { label: '石川県', value: '石川県' },
    { label: '福井県', value: '福井県' },
    { label: '山梨県', value: '山梨県' },
    { label: '長野県', value: '長野県' },
    { label: '岐阜県', value: '岐阜県' },
    { label: '静岡県', value: '静岡県' },
    { label: '愛知県', value: '愛知県' },
    { label: '三重県', value: '三重県' },
    { label: '滋賀県', value: '滋賀県' },
    { label: '京都府', value: '京都府' },
    { label: '大阪府', value: '大阪府' },
    { label: '兵庫県', value: '兵庫県' },
    { label: '奈良県', value: '奈良県' },
    { label: '和歌山県', value: '和歌山県' },
    { label: '鳥取県', value: '鳥取県' },
    { label: '島根県', value: '島根県' },
    { label: '岡山県', value: '岡山県' },
    { label: '広島県', value: '広島県' },
    { label: '山口県', value: '山口県' },
    { label: '徳島県', value: '徳島県' },
    { label: '香川県', value: '香川県' },
    { label: '愛媛県', value: '愛媛県' },
    { label: '高知県', value: '高知県' },
    { label: '福岡県', value: '福岡県' },
    { label: '佐賀県', value: '佐賀県' },
    { label: '長崎県', value: '長崎県' },
    { label: '熊本県', value: '熊本県' },
    { label: '大分県', value: '大分県' },
    { label: '宮崎県', value: '宮崎県' },
    { label: '鹿児島県', value: '鹿児島県' },
    { label: '沖縄県', value: '沖縄県' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 発送診断アプリ</Text>
        <Text style={styles.headerSubtitle}>最安・最速の発送方法</Text>
        <Text style={styles.headerDescription}>すぐ見つかる</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* カテゴリ選択 */}
        <CustomDropdown
          label="📦 カテゴリ"
          value={productInfo.category}
          placeholder="カテゴリを選択してください"
          options={categoryOptions}
          onValueChange={(value) => updateField('category', value)}
        />

        {/* 発送元・配送先セクション */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>🗺️ 発送情報</Text>

          {/* 発送元選択 */}
          <CustomDropdown
            label="📍 発送元"
            value={productInfo.senderLocation || ''}
            placeholder="都道府県を選択"
            options={prefectureOptions}
            onValueChange={(value) => updateField('senderLocation', value)}
          />

          {/* 配送先選択 */}
          <CustomDropdown
            label="🏠 配送先"
            value={productInfo.destination}
            placeholder="都道府県を選択"
            options={prefectureOptions}
            onValueChange={(value) => updateField('destination', value)}
          />
          
          <Text style={styles.helperText}>
            💡 距離によって配送料金が変わります
          </Text>
        </View>

        {/* 商品情報セクション */}
        <View style={styles.productSection}>
          <Text style={styles.sectionTitle}>📏 商品情報</Text>

          {/* サイズ入力 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>📏 サイズ (cm)</Text>
            
            <View style={styles.sizeInputWithLabel}>
              <Text style={styles.sizeInputLabel}>長さ（縦）</Text>
              <TextInput
                style={styles.sizeInput}
                placeholder="例: 25"
                value={productInfo.length}
                onChangeText={(value) => updateField('length', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.sizeInputWithLabel}>
              <Text style={styles.sizeInputLabel}>幅（横）</Text>
              <TextInput
                style={styles.sizeInput}
                placeholder="例: 18"
                value={productInfo.width}
                onChangeText={(value) => updateField('width', value)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.sizeInputWithLabel}>
              <Text style={styles.sizeInputLabel}>厚み（高さ）</Text>
              <TextInput
                style={styles.sizeInput}
                placeholder="例: 2.8"
                value={productInfo.thickness}
                onChangeText={(value) => updateField('thickness', value)}
                keyboardType="numeric"
              />
            </View>
            
            <Text style={styles.helperText}>
              💡 厚み3cm以内だと安価な配送方法が利用できます
            </Text>
          </View>

          {/* 重量入力 */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>⚖️ 重量 (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="450"
              value={productInfo.weight}
              onChangeText={(value) => updateField('weight', value)}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              💡 1kg以内だとポスト投函サービスが利用できます
            </Text>
          </View>
        </View>

        {/* 販売情報セクション */}
        <View style={styles.salesSection}>
          <Text style={styles.sectionTitle}>💰 販売情報</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>💵 販売予定価格 (円)</Text>
            <TextInput
              style={styles.input}
              placeholder="2000"
              value={productInfo.salePrice || ''}
              onChangeText={(value) => updateField('salePrice', value)}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              💡 販売価格を入力すると利益の詳細分析ができます
            </Text>
          </View>
        </View>

        {/* 診断ボタン */}
        <TouchableOpacity 
          style={[
            styles.ctaButton, 
            !validation.isValid && styles.ctaButtonDisabled
          ]} 
          onPress={handleDiagnosis}
        >
          <Text style={styles.ctaButtonText}>
            {validation.isValid ? 'おすすめを診断する' : '入力内容を確認してください'}
          </Text>
        </TouchableOpacity>

        {/* 入力状況の表示 */}
        {validation.isValid && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>✅ 入力完了！詳細AI分析が可能です</Text>
          </View>
        )}

        {/* エラー表示 */}
        {!validation.isValid && validation.errors.length > 0 && (
          <View style={styles.errorContainer}>
            {validation.errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>❌ {error}</Text>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#1E88E5',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salesSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    minHeight: 56,
  },
  
  // カスタムドロップダウンのスタイル
  dropdownButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  dropdownText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  
  // モーダルのスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  
  sizeInputWithLabel: {
    marginBottom: 12,
  },
  sizeInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
    paddingLeft: 4,
  },
  sizeInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    minHeight: 56,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  ctaButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    minHeight: 56,
  },
  ctaButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  statusText: {
    color: '#155724',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 40,
  },
  errorText: {
    color: '#721c24',
    fontSize: 12,
    marginBottom: 4,
  },
});