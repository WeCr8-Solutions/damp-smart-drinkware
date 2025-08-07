/**
 * 👤 DAMP Smart Drinkware - Profile Avatar Component
 * User avatar with photo upload and display functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Camera, User, Edit3 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProfileAvatarProps {
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  showName?: boolean;
  onImageUpdate?: (imageUrl: string) => void;
  style?: any;
}

export default function ProfileAvatar({
  size = 'medium',
  editable = true,
  showName = false,
  onImageUpdate,
  style,
}: ProfileAvatarProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );

  const sizeConfig = {
    small: { width: 40, height: 40, fontSize: 14, iconSize: 16 },
    medium: { width: 80, height: 80, fontSize: 24, iconSize: 20 },
    large: { width: 120, height: 120, fontSize: 36, iconSize: 24 },
  };

  const config = sizeConfig[size];

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photo library to update your profile picture.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    if (!editable || uploading) return;

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    Alert.alert(
      'Update Profile Photo',
      'Choose how you\'d like to update your profile photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => takePhoto() },
        { text: 'Choose from Library', onPress: () => chooseFromLibrary() },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const chooseFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing from library:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;

    try {
      setUploading(true);

      // Create form data
      const formData = new FormData();
      const filename = `avatar-${user.id}-${Date.now()}.jpg`;
      
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: filename,
      } as any);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filename, formData, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);

      // Update user profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      onImageUpdate?.(publicUrl);

      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to update profile photo. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!user?.user_metadata?.full_name && !user?.email) return 'U';
    
    const name = user.user_metadata?.full_name || user.email;
    const parts = name.split(' ');
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return name[0].toUpperCase();
  };

  const avatarStyle = [
    styles.avatar,
    {
      width: config.width,
      height: config.height,
      borderRadius: config.width / 2,
    },
    style,
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.avatarContainer, !editable && styles.nonEditable]}
        onPress={editable ? pickImage : undefined}
        disabled={uploading}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={avatarStyle} />
        ) : (
          <View style={[avatarStyle, styles.placeholderAvatar]}>
            <Text style={[styles.initials, { fontSize: config.fontSize }]}>
              {getInitials()}
            </Text>
          </View>
        )}

        {editable && (
          <View style={[styles.editBadge, { 
            width: config.width * 0.3, 
            height: config.width * 0.3,
            borderRadius: (config.width * 0.3) / 2,
          }]}>
            {uploading ? (
              <View style={styles.uploadingIndicator} />
            ) : (
              <Edit3 size={config.iconSize * 0.7} color="#FFF" />
            )}
          </View>
        )}
      </TouchableOpacity>

      {showName && (
        <View style={styles.nameContainer}>
          <Text style={[styles.name, size === 'small' && styles.smallName]}>
            {user?.user_metadata?.full_name || 'Update Name'}
          </Text>
          <Text style={[styles.email, size === 'small' && styles.smallEmail]}>
            {user?.email}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  nonEditable: {
    // No special styling for non-editable state
  },
  avatar: {
    backgroundColor: '#E3F2FD',
  },
  placeholderAvatar: {
    backgroundColor: '#0277BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  uploadingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    opacity: 0.8,
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  smallName: {
    fontSize: 14,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  smallEmail: {
    fontSize: 12,
  },
});

// Preset variants for common use cases
export function SmallProfileAvatar(props: Omit<ProfileAvatarProps, 'size'>) {
  return <ProfileAvatar {...props} size="small" />;
}

export function LargeProfileAvatar(props: Omit<ProfileAvatarProps, 'size'>) {
  return <ProfileAvatar {...props} size="large" />;
}

export function ReadOnlyProfileAvatar(props: Omit<ProfileAvatarProps, 'editable'>) {
  return <ProfileAvatar {...props} editable={false} />;
}