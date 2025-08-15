// components/EnhancedInputScreen.tsx
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ProductInfo } from '../types/shipping';
import { validateProductInfo, autoCorrectDestination, ValidationResult } from '../utils/validation';

interface EnhancedInputScreenProps {
  productInfo: ProductInfo;
  onProductInfoChange: (productInfo: ProductInfo) => void;
  onDiagnosis: () => void;
}

export default function EnhancedInputScreen({ 
  productInfo, 
  onProductInfoChange, 
  onDiagnosis 
}: EnhancedInputScreenProps) {
  const [validation, setValidation] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [], 
    warnings: [] 
  });
  const [showValidation, setShowValidation] = useState(false);

  // リアルタイム検証
  useEffect(() => {
    const result = validateProductInfo(productInfo);
    setValidation(result);
  }, [productInfo]);

  const updateField = (field: keyof ProductInfo, value: string) => {
    // プルダウンになったので自動補正は不要
    const updatedInfo = {
      ...productInfo,
      [field]: value
    };
    
    onProductInfoChange(updatedInfo);
  };

  const handleDiagnosis = () => {
    setShowValidation(true);
    
    if (!validation.isValid) {
      Alert.alert(
        '入力エラー',
        validation.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (validation.warnings.length > 0) {
      Alert.alert(
        '確認',
        validation.warnings.join('\n') + '\n\nこのまま診断を続けますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '続行', onPress: onDiagnosis }
        ]
      );
      return;
    }
    
    onDiagnosis();
  };

  const getInputStyle = (field: keyof ProductInfo) => {
    if (!showValidation) return styles.input;
    
    // プルダウンになったdestinationは除外し、数値項目のみチェック
    if (['length', 'width', 'thickness', 'weight'].includes(field)) {
      const value = parseFloat(productInfo[field]);
      return (!isNaN(value) && value > 0) ? styles.inputValid : styles.inputError;
    }
    
    return styles.input;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 発送診断アプリ</Text>
        <Text style={styles.headerSubtitle}>最安・最速の発送方法</Text>
        <Text style={styles.headerDescription}>すぐ見つかる</Text>
      </View>

      {/* メインコンテンツ */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* エラー・警告表示 */}
        {showValidation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
          <View style={styles.validationContainer}>
            {validation.errors.map((error, index) => (
              <Text key={`error-${index}`} style={styles.errorText}>
                ❌ {error}
              </Text>
            ))}
            {validation.warnings.map((warning, index) => (
              <Text key={`warning-${index}`} style={styles.warningText}>
                ⚠️ {warning}
              </Text>
            ))}
          </View>
        )}
        
        {/* カテゴリ選択 */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>📦 カテゴリ</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productInfo.category}
              style={styles.picker}
              onValueChange={(value) => updateField('category', value)}
            >
              <Picker.Item label="衣類" value="衣類" />
              <Picker.Item label="書籍" value="書籍" />
              <Picker.Item label="ゲーム" value="ゲーム" />
              <Picker.Item label="雑貨" value="雑貨" />
              <Picker.Item label="家電" value="家電" />
              <Picker.Item label="食品" value="食品" />
            </Picker>
          </View>
        </View>

        {/* サイズ入力 */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>📏 サイズ (cm)</Text>
          <View style={styles.sizeInputsRow}>
            <TextInput
              style={[getInputStyle('length'), styles.sizeInput]}
              placeholder="長さ"
              value={productInfo.length}
              onChangeText={(value) => updateField('length', value)}
              keyboardType="numeric"
            />
            <TextInput
              style={[getInputStyle('width'), styles.sizeInput]}
              placeholder="幅"
              value={productInfo.width}
              onChangeText={(value) => updateField('width', value)}
              keyboardType="numeric"
            />
          </View>
          <TextInput
            style={[getInputStyle('thickness'), styles.fullWidth]}
            placeholder="厚み"
            value={productInfo.thickness}
            onChangeText={(value) => updateField('thickness', value)}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            💡 厚み3cm以内だと安価な配送方法が利用できます
          </Text>
        </View>

        {/* 重量入力 */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>⚖️ 重量 (g)</Text>
          <TextInput
            style={getInputStyle('weight')}
            placeholder="450"
            value={productInfo.weight}
            onChangeText={(value) => updateField('weight', value)}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            💡 1kg以内だとポスト投函サービスが利用できます
          </Text>
        </View>

        {/* 行き先入力 */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>🏠 行き先</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={productInfo.destination}
              style={styles.picker}
              onValueChange={(value) => updateField('destination', value)}
            >
              <Picker.Item label="都道府県を選択" value="" />
              <Picker.Item label="北海道" value="北海道" />
              <Picker.Item label="青森県" value="青森県" />
              <Picker.Item label="岩手県" value="岩手県" />
              <Picker.Item label="宮城県" value="宮城県" />
              <Picker.Item label="秋田県" value="秋田県" />
              <Picker.Item label="山形県" value="山形県" />
              <Picker.Item label="福島県" value="福島県" />
              <Picker.Item label="茨城県" value="茨城県" />
              <Picker.Item label="栃木県" value="栃木県" />
              <Picker.Item label="群馬県" value="群馬県" />
              <Picker.Item label="埼玉県" value="埼玉県" />
              <Picker.Item label="千葉県" value="千葉県" />
              <Picker.Item label="東京都" value="東京都" />
              <Picker.Item label="神奈川県" value="神奈川県" />
              <Picker.Item label="新潟県" value="新潟県" />
              <Picker.Item label="富山県" value="富山県" />
              <Picker.Item label="石川県" value="石川県" />
              <Picker.Item label="福井県" value="福井県" />
              <Picker.Item label="山梨県" value="山梨県" />
              <Picker.Item label="長野県" value="長野県" />
              <Picker.Item label="岐阜県" value="岐阜県" />
              <Picker.Item label="静岡県" value="静岡県" />
              <Picker.Item label="愛知県" value="愛知県" />
              <Picker.Item label="三重県" value="三重県" />
              <Picker.Item label="滋賀県" value="滋賀県" />
              <Picker.Item label="京都府" value="京都府" />
              <Picker.Item label="大阪府" value="大阪府" />
              <Picker.Item label="兵庫県" value="兵庫県" />
              <Picker.Item label="奈良県" value="奈良県" />
              <Picker.Item label="和歌山県" value="和歌山県" />
              <Picker.Item label="鳥取県" value="鳥取県" />
              <Picker.Item label="島根県" value="島根県" />
              <Picker.Item label="岡山県" value="岡山県" />
              <Picker.Item label="広島県" value="広島県" />
              <Picker.Item label="山口県" value="山口県" />
              <Picker.Item label="徳島県" value="徳島県" />
              <Picker.Item label="香川県" value="香川県" />
              <Picker.Item label="愛媛県" value="愛媛県" />
              <Picker.Item label="高知県" value="高知県" />
              <Picker.Item label="福岡県" value="福岡県" />
              <Picker.Item label="佐賀県" value="佐賀県" />
              <Picker.Item label="長崎県" value="長崎県" />
              <Picker.Item label="熊本県" value="熊本県" />
              <Picker.Item label="大分県" value="大分県" />
              <Picker.Item label="宮崎県" value="宮崎県" />
              <Picker.Item label="鹿児島県" value="鹿児島県" />
              <Picker.Item label="沖縄県" value="沖縄県" />
            </Picker>
          </View>
          <Text style={styles.helperText}>
            💡 距離によって配送料金が変わります
          </Text>
        </View>

        {/* 診断ボタン */}
        <TouchableOpacity 
          style={[
            styles.ctaButton, 
            !validation.isValid && showValidation && styles.ctaButtonDisabled
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
            <Text style={styles.statusText}>✅ 入力完了！診断できます</Text>
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
  validationContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#d63031',
    fontSize: 12,
    marginBottom: 4,
  },
  warningText: {
    color: '#f39c12',
    fontSize: 12,
    marginBottom: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputValid: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00b894',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    backgroundColor: '#fff5f5',
    borderWidth: 2,
    borderColor: '#d63031',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  sizeInputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  sizeInput: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  helperText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  ctaButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  ctaButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
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
});