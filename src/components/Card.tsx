import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useDarkMode } from '../contexts/DarkModeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  padding?: number;
  margin?: number;
  shadow?: boolean;
  border?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  title,
  subtitle,
  icon,
  iconColor = '#3b82f6',
  padding = 16,
  margin = 0,
  shadow = true,
  border = false,
}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <View
      style={[
        styles.card,
        isDarkMode && styles.darkCard,
        shadow && styles.shadow,
        border && styles.border,
        { padding, margin },
        style,
      ]}
    >
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
            </View>
          )}
          <View style={styles.headerText}>
            {title && (
              <Text style={[styles.title, isDarkMode && styles.darkTitle]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  darkCard: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  border: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  darkTitle: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  darkSubtitle: {
    color: '#9ca3af',
  },
  content: {
    flex: 1,
  },
});

export default Card;

