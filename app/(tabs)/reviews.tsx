import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Search, Star, Plus, User } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import AddReviewModal from '../../components/AddReviewModal';

interface Review {
  id: string;
  book_title: string;
  author: string;
  stars: number;
  content: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export default function ReviewsScreen() {
  const { colors } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('review_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
      setFilteredReviews(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredReviews(reviews);
      return;
    }

    const filtered = reviews.filter((r) => 
      r.book_title.toLowerCase().includes(query.toLowerCase()) ||
      r.author.toLowerCase().includes(query.toLowerCase()) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredReviews(filtered);
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{item.first_name?.[0] || 'U'}</Text>
          </View>
          <View>
            <Text style={[styles.userName, { color: colors.text }]}>{item.first_name} {item.last_name}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.starBadge}>
          <Star color="#f59e0b" fill="#f59e0b" size={14} />
          <Text style={styles.starText}>{item.stars}</Text>
        </View>
      </View>

      <Text style={[styles.bookTitle, { color: colors.text }]}>{item.book_title}</Text>
      <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>by {item.author}</Text>
      {item.content && (
        <Text style={[styles.reviewBody, { color: colors.text }]} numberOfLines={3}>
          "{item.content}"
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchBarContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search color={colors.textSecondary} size={20} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by book, author, or reviewer"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCenter}>
              <Text style={{ color: colors.textSecondary }}>No reviews found</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <AddReviewModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSuccess={fetchReviews}
      />
    </View>
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
  searchBarContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  reviewCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starText: {
    color: '#f59e0b',
    fontWeight: '700',
    marginLeft: 4,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    marginBottom: 12,
  },
  reviewBody: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  emptyCenter: {
    alignItems: 'center',
    marginTop: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 16, // Rounded square/rectangle style
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
});
