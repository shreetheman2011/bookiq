import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { X, Star } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface AddReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddReviewModal({ visible, onClose, onSuccess }: AddReviewModalProps) {
  const { colors } = useTheme();
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [stars, setStars] = useState(5);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!bookTitle || !author) {
      Alert.alert('Error', 'Please enter book title and author');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        book_title: bookTitle,
        author: author,
        stars: stars,
        content: content,
      });

      if (error) throw error;

      Alert.alert('Success', 'Review submitted successfully!');
      setBookTitle('');
      setAuthor('');
      setStars(5);
      setContent('');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Write a Review</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Book Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. The Great Gatsby"
              placeholderTextColor={colors.textSecondary}
              value={bookTitle}
              onChangeText={setBookTitle}
            />

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Author</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. F. Scott Fitzgerald"
              placeholderTextColor={colors.textSecondary}
              value={author}
              onChangeText={setAuthor}
            />

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Rating</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setStars(s)}>
                  <Star 
                    color={s <= stars ? '#f59e0b' : colors.textSecondary} 
                    fill={s <= stars ? '#f59e0b' : 'none'} 
                    size={32} 
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Review (Optional)</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="What did you think of this book?"
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Review</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textArea: {
    height: 120,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
    paddingTop: 16,
  },
  submitBtn: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
