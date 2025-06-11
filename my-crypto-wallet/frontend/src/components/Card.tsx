import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows, spacing } from '../theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'flat';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'elevated',
}) => {
    return (
        <View
            style={[
                styles.card,
                variant === 'elevated' && shadows.md,
                variant === 'flat' && styles.flat,
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: spacing.md,
    },
    flat: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
}); 