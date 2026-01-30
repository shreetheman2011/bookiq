import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Camera, BookOpen, ChevronRight, Star, User, Book } from 'lucide-react-native';
import { BookScan, Recommendation } from '../../types/database';
import { formatGrade } from '../../lib/utils';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userGrade, setUserGrade] = useState('');
  const [recentScans, setRecentScans] = useState<BookScan[]>([]);
  const [latestRecommendations, setLatestRecommendations] = useState<Recommendation[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchRecentScans();
    }, [])
  );

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('first_name, last_name, school_grade').eq('id', user.id).single();
      if (data) {
        setUserName(data.first_name || 'Reader');
        setUserGrade(formatGrade(data.school_grade));
      }
    }
  };

  const fetchRecentScans = async () => {
    const { data } = await supabase
      .from('book_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) {
      setRecentScans(data);
      if (data.length > 0 && data[0].recommendations) {
        setLatestRecommendations(data[0].recommendations);
      }
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.topBranding}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoBook, { color: colors.primary }]}>Book</Text>
          <Text style={[styles.logoIQ, { color: colors.text }]}>IQ</Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <User color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: colors.text }]}>{userName}</Text>
          <Text style={[styles.gradeBadge, { color: colors.primary }]}>{userGrade}</Text>
        </View>
      </View>

      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>One scan. Every detail.</Text>
          <Text style={styles.heroSubtitle}>Identify any book by scanning its cover with AI.</Text>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => router.push('/scan/camera')}
          >
            <Camera color={colors.primary} size={20} style={{ marginRight: 8 }} />
            <Text style={[styles.heroButtonText, { color: colors.primary }]}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
        <BookOpen color="rgba(255,255,255,0.2)" size={120} style={styles.heroIcon} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Scans</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentScans.length > 0 ? (
          recentScans.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.scanCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push({ pathname: '/scan/result', params: { id: item.id } })}
            >
              <View style={styles.scanInfo}>
                <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{item.title || 'Unknown Book'}</Text>
                <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>{item.author || 'Unknown Author'}</Text>
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{item.genre || 'Analysis'}</Text>
                  </View>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No scans yet. Try scanning a book!</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personalized for You</Text>
        {latestRecommendations.length > 0 ? (
          <View style={[styles.recommendationList, { backgroundColor: colors.surface }]}>
            <Text style={[styles.recHighlightTitle, { color: colors.primary }]}>Based on your last scan:</Text>
            {latestRecommendations.map((rec, index) => (
              <View key={index} style={styles.recListItem}>
                <View style={[styles.recDot, { backgroundColor: colors.primary }]} />
                <View style={styles.recItemText}>
                  <Text style={[styles.recItemTitle, { color: colors.text }]}>{rec.title}</Text>
                  <Text style={[styles.recItemAuthor, { color: colors.textSecondary }]}>{rec.author}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.recommendationBox, { backgroundColor: colors.surface }]}>
            <Star color="#f59e0b" size={24} fill="#f59e0b" style={{ marginBottom: 12 }} />
            <Text style={[styles.recTitle, { color: colors.text }]}>Start Scanning</Text>
            <Text style={[styles.recSubtitle, { color: colors.textSecondary }]}>
              Scan a book to get personalized recommendations based on your preferences.
            </Text>
            <TouchableOpacity 
              style={[styles.recButton, { borderColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={[styles.recButtonText, { color: colors.primary }]}>Setup Preferences</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  topBranding: {
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
    fontSize: 28,
    fontWeight: '900', // Note: User said weight might not work with some fonts, but using it as default for now
  },
  logoIQ: {
    fontSize: 28,
    fontWeight: '900',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  gradeBadge: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    height: 200,
    justifyContent: 'center',
  },
  heroContent: {
    zIndex: 1,
    maxWidth: '70%',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  heroButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  heroIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  scanInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  recommendationList: {
    padding: 20,
    borderRadius: 24,
  },
  recHighlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  recItemText: {
    flex: 1,
  },
  recItemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  recItemAuthor: {
    fontSize: 13,
  },
  recommendationBox: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  recSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  recButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  recButtonText: {
    fontWeight: '700',
  },
});
