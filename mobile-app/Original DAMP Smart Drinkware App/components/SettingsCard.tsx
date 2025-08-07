/**
 * ⚙️ DAMP Smart Drinkware - Settings Card Component
 * Reusable card component for settings screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SettingsCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  disabled?: boolean;
  showChevron?: boolean;
  badge?: string;
  badgeColor?: string;
  customStyle?: any;
}

export function SettingsCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = '#0277BD',
  onPress,
  rightElement,
  disabled = false,
  showChevron = true,
  badge,
  badgeColor = '#FF6B35',
  customStyle,
}: SettingsCardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        disabled && styles.disabledCard,
        customStyle,
      ]}
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon size={20} color={disabled ? '#CCC' : iconColor} />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, disabled && styles.disabledText]}>
              {title}
            </Text>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={[styles.subtitle, disabled && styles.disabledText]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContent}>
        {rightElement}
        {showChevron && onPress && (
          <View style={styles.chevron}>
            <Text style={[styles.chevronText, disabled && styles.disabledText]}>
              ›
            </Text>
          </View>
        )}
      </View>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  disabledText: {
    color: '#CCC',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 18,
    color: '#CCC',
    fontWeight: '300',
  },
});

// Additional preset variants
export function AccountSettingsCard(props: Omit<SettingsCardProps, 'iconColor'>) {
  return <SettingsCard {...props} iconColor="#4CAF50" />;
}

export function SecuritySettingsCard(props: Omit<SettingsCardProps, 'iconColor'>) {
  return <SettingsCard {...props} iconColor="#FF6B35" />;
}

export function PremiumSettingsCard(props: Omit<SettingsCardProps, 'iconColor' | 'badge'>) {
  return <SettingsCard {...props} iconColor="#FFD700" badge="Premium" badgeColor="#FFD700" />;
}

export default SettingsCard;