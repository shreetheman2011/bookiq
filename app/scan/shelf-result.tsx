import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { BookScan, Recommendation } from '../../types/database';
import { ChevronLeft, Share2, Star, Library } from 'lucide-react-native';

export default function ShelfResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [scan, setScan] = useState<BookScan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScan();
  }, [id]);

  const fetchScan = async () => {
    if (!id) return;
    const { data, error } = await supabase.from('book_scans').select('*').eq('id', id).single();
    if (data) setScan(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analyzing your bookshelf...</Text>
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
          <Text style={[styles.logoBook, { color: colors.primary }]}>Shelf</Text>
          <Text style={[styles.logoIQ, { color: colors.text }]}>Scan</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.bookInfoCard}>
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
          <Library color={colors.primary} size={64} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Bookshelf Analzyed</Text>
        <Text style={[styles.author, { color: colors.textSecondary }]}>Found matches for your genre: {scan.genre}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Shelf Overview</Text>
        <View style={[styles.analysisCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
          <Star color={colors.primary} size={24} fill={colors.primary} style={{ marginBottom: 12 }} />
          <Text style={[styles.analysisText, { color: colors.text }]}>{scan.ai_analysis}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Recommendations For You</Text>
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
        {(!scan.recommendations || (scan.recommendations as Recommendation[]).length === 0) && (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
            No strong matches found on this shelf for {scan.genre}.
          </Text>
        )}
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
    marginTop: 10,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
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
