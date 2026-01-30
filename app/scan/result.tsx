import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { BookScan, Recommendation } from '../../types/database';
import { ChevronLeft, Info, Share2, Film, BookOpen, Star, AlertCircle } from 'lucide-react-native';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [scan, setScan] = useState<BookScan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScan();
    console.log(scan?.is_movie);
  }, [id]);

  const fetchScan = async () => {
    if (!id) return;
    const { data, error } = await supabase.from('book_scans').select('*').eq('id', id).single();
    if (data) setScan(data);
    setLoading(false);
  };

  const handleShare = async () => {
    if (!scan) return;
    try {
      const message = `Check out this book I found on BookIQ!\n\n${scan.title} by ${scan.author}\n\nGenre: ${scan.genre}\nReading Level: ${scan.reading_level}\n\n"One scan. Every detail."`;
      await Share.share({
        message,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share results');
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analyzing your book...</Text>
      </View>
    );
  }

  if (!scan) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Scan not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={[styles.logoBook, { color: colors.primary }]}>Book</Text>
          <Text style={[styles.logoIQ, { color: colors.text }]}>IQ</Text>
        </View>

        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={handleShare}
        >
          <Share2 color={colors.text} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.bookInfoCard}>
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
          <BookOpen color={colors.primary} size={64} />
          {scan.image_url && <Image source={{ uri: scan.image_url }} style={styles.bookImage} />}
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{scan.title}</Text>
        <Text style={[styles.author, { color: colors.textSecondary }]}>by {scan.author}</Text>
        
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{scan.genre}</Text>
          </View>
          {scan.is_movie ? (
            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Film color={colors.success} size={14} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: colors.success }]}>Movie Adaptation</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Film color={colors.success} size={14} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: colors.success }]}>No Movie Adaptation Made</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.grid}>
          <View style={[styles.gridItem, { backgroundColor: colors.surface }]}>
            <Info color={colors.primary} size={20} style={{ marginBottom: 8 }} />
            <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>READING LEVEL</Text>
            <Text style={[styles.gridValue, { color: colors.text }]}>{scan.reading_level}</Text>
          </View>
          <View style={[styles.gridItem, { backgroundColor: colors.surface }]}>
            <AlertCircle color={colors.primary} size={20} style={{ marginBottom: 8 }} />
            <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>MATURITY</Text>
            <Text style={[styles.gridValue, { color: colors.text }]}>{scan.maturity_level}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personalized Analysis</Text>
        <View style={[styles.analysisCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
          <Star color={colors.primary} size={24} fill={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={[styles.analysisText, { color: colors.text }]}>{scan.ai_analysis}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Future Recommendations</Text>
        {scan.recommendations && (scan.recommendations as Recommendation[]).map((rec, index) => (
          <View key={index} style={[styles.recCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.recNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.recNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.recContent}>
              <Text style={[styles.recTitle, { color: colors.text }]}>{rec.title}</Text>
              <Text style={[styles.recAuthor, { color: colors.textSecondary }]}>{rec.author}</Text>
              <Text style={[styles.recReason, { color: colors.textSecondary }]}>{rec.reason}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBook: {
    fontSize: 22,
    fontWeight: '900',
  },
  logoIQ: {
    fontSize: 22,
    fontWeight: '900',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfoCard: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  imagePlaceholder: {
    width: 180,
    height: 260,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'absolute',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  analysisCard: {
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 22,
  },
  recCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  recNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  recNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  recAuthor: {
    fontSize: 13,
    marginBottom: 8,
  },
  recReason: {
    fontSize: 13,
    lineHeight: 18,
  },
});
