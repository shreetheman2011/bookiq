import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ChevronRight, Search } from 'lucide-react-native';
import { BookScan } from '../../types/database';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [scans, setScans] = useState<BookScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('book_scans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setScans(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Search color={colors.textSecondary} size={48} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No history yet. Your scanned books will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => router.push({ pathname: '/scan/result', params: { id: item.id } })}
          >
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title || 'Unknown Title'}</Text>
              <Text style={[styles.author, { color: colors.textSecondary }]}>{item.author || 'Unknown Author'}</Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        )}
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
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    maxWidth: 250,
  },
});
