import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { X, Zap, ZapOff, Image as ImageIcon, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { analyzeBookCover } from '../../services/ai';
import { supabase } from '../../lib/supabase';

export default function CameraScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.message, { color: colors.text }]}>We need your permission to show the camera</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });
      processImage(photo.base64);
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setLoading(true);
      processImage(result.assets[0].base64);
    }
  };

  const processImage = async (base64: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase.from('profiles').select('favorite_genre, school_grade').eq('id', user.id).single();
      const genre = profile?.favorite_genre || 'Any';
      const grade = profile?.school_grade || 'All ages';

      const analysis = await analyzeBookCover(base64, genre, grade);

      // Save to database
      const { data, error } = await supabase.from('book_scans').insert({
        user_id: user.id,
        title: analysis.title,
        author: analysis.author,
        genre: analysis.genre,
        reading_level: analysis.reading_level,
        maturity_level: analysis.maturity_level,
        is_movie: analysis.is_movie,
        recommendations: analysis.future_recommendations,
        ai_analysis: analysis.analysis_summary,
      }).select();

      if (error) throw error;

      router.replace({ pathname: '/scan/result', params: { id: data[0].id } });
    } catch (error: any) {
      Alert.alert('Analysis Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} flash={flash}>
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <X color="#fff" size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFlash(flash === 'on' ? 'off' : 'on')} style={styles.iconButton}>
              {flash === 'on' ? <Zap color="#fbbf24" size={28} /> : <ZapOff color="#fff" size={28} />}
            </TouchableOpacity>
          </View>

          <View style={styles.guideContainer}>
            <View style={styles.guideFrame} />
            <Text style={styles.guideText}>Center the book cover within the frame</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={handlePickImage} style={styles.secondaryButton}>
              <ImageIcon color="#fff" size={24} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleCapture} 
              style={styles.captureButton}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.primary} /> : <View style={styles.captureInner} />}
            </TouchableOpacity>

            <View style={styles.secondaryButton}>
              {/* Empty view for balance */}
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    alignItems: 'center',
  },
  guideFrame: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  guideText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
