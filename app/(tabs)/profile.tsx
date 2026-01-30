import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { LogOut, User, Moon, Sun, Settings, Heart } from 'lucide-react-native';
import { Profile } from '../../types/database';
import { formatGrade } from '../../lib/utils';

export default function ProfileScreen() {
  const { colors, theme, toggleTheme, isDark } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  const [schoolGrade, setSchoolGrade] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setFavoriteGenre(data.favorite_genre || '');
        setSchoolGrade(data.school_grade || '');
      }
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        favorite_genre: favoriteGenre,
        school_grade: schoolGrade,
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditing(false);
      fetchProfile();
      Alert.alert('Success', 'Profile updated!');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
          <User color={colors.primary} size={40} />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {profile?.first_name} {profile?.last_name}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {profile?.school_grade ? formatGrade(profile.school_grade) : 'Reader Enthusiast'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              {isDark ? <Moon color={colors.primary} size={20} /> : <Sun color={colors.primary} size={20} />}
              <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => setEditing(!editing)}>
            <View style={styles.rowLeft}>
              <Settings color={colors.primary} size={20} />
              <Text style={[styles.rowText, { color: colors.text }]}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        {editing && (
          <View style={[styles.card, { backgroundColor: colors.surface, marginTop: 12, padding: 16 }]}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>First Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Last Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
            
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Favorite Genre</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={favoriteGenre}
                onChangeText={setFavoriteGenre}
                placeholder="e.g. Fantasy, Mystery, Sci-Fi"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>School Grade</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={schoolGrade}
                onChangeText={setSchoolGrade}
                placeholder="e.g. 5, 8, 12, College"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleUpdate}
            >
              <Text style={styles.saveButtonText}>Save Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <LogOut color={colors.error} size={20} />
              <Text style={[styles.rowText, { color: colors.error }]}>Sign Out</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.textSecondary }]}>BookIQ v1.0.0</Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>One scan. Every detail.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 48,
    marginBottom: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
