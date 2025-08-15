// components/QRCodeComponent.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ProductInfo, ShippingOption } from '../types/shipping';
import { generateShippingQR, ShippingQRResult } from '../utils/qrCodeService';

interface QRCodeComponentProps {
  productInfo: ProductInfo;
  selectedOption: ShippingOption;
  onClose: () => void;
}

export default function QRCodeComponent({ 
  productInfo, 
  selectedOption, 
  onClose 
}: QRCodeComponentProps) {
  const [qrResult, setQrResult] = useState<ShippingQRResult>(() => 
    generateShippingQR(productInfo, selectedOption)
  );

  const handleSaveQR = () => {
    // Web版ではダウンロード、モバイル版では保存
    Alert.alert(
      'QRコード保存',
      'QRコードを保存しました！\n（実際の保存機能は今後実装予定）',
      [{ text: 'OK' }]
    );
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `【発送用QRコード】\n${qrResult.displayText}\n\n手順:\n${qrResult.instructions.join('\n')}`,
        title: '発送用QRコード',
      });
    } catch (error) {
      Alert.alert('エラー', '共有に失敗しました');
    }
  };

  const handleCopyInstructions = () => {
    const instructionsText = qrResult.instructions.join('\n');
    Clipboard.setString(instructionsText);
    Alert.alert('コピー完了', '発送手順をクリップボードにコピーしました');
  };

  const handleRegenerateQR = () => {
    const newQrResult = generateShippingQR(productInfo, selectedOption);
    setQrResult(newQrResult);
    Alert.alert('更新完了', '新しいQRコードを生成しました');
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>× 閉じる</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>発送用QRコード</Text>
        <Text style={styles.headerSubtitle}>{selectedOption.name}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* QRコード表示 */}
        <View style={styles.qrContainer}>
          <View style={styles.qrCodeWrapper}>
            <QRCode
              value={qrResult.qrData}
              size={200}
              color="#333"
              backgroundColor="#fff"
              logo={undefined}
              logoSize={30}
              logoBackgroundColor="transparent"
            />
          </View>
          
          <Text style={styles.qrLabel}>📱 店員にこのQRコードを提示</Text>
          
          {/* QR情報表示 */}
          <View style={styles.qrInfo}>
            <Text style={styles.qrInfoText}>{qrResult.displayText}</Text>
          </View>
        </View>

        {/* 対応店舗 */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>🏪 対応店舗</Text>
          <Text style={styles.supportText}>{qrResult.supportedBy}</Text>
        </View>

        {/* 発送手順 */}
        <View style={styles.instructionsSection}>
          <View style={styles.instructionsHeader}>
            <Text style={styles.sectionTitle}>📋 発送手順</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyInstructions}>
              <Text style={styles.copyButtonText}>📋 コピー</Text>
            </TouchableOpacity>
          </View>
          
          {qrResult.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* 注意事項 */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>⚠️ 注意事項</Text>
          <Text style={styles.noteText}>
            • QRコードは発送時にのみ有効です{'\n'}
            • 営業時間内に対応店舗へお持ちください{'\n'}
            • 梱包材料は別途購入が必要な場合があります{'\n'}
            • サイズ・重量制限を必ず確認してください
          </Text>
        </View>

        {/* アクションボタン */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSaveQR}>
            <Text style={styles.actionButtonText}>💾 QRコード保存</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
            <Text style={styles.actionButtonText}>📤 共有</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerateQR}>
            <Text style={styles.regenerateButtonText}>🔄 QR再生成</Text>
          </TouchableOpacity>
        </View>

        {/* フッター情報 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            生成日時: {new Date().toLocaleString('ja-JP')}
          </Text>
          <Text style={styles.footerText}>
            💡 このQRコードで配送料 ¥{selectedOption.price} の発送が可能です
          </Text>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  qrInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  qrInfoText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    lineHeight: 16,
  },
  supportSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  instructionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '500',
  },
  instructionItem: {
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  notesSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noteText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  regenerateButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  regenerateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
});