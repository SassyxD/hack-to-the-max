import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return colors.secondary;
        switch (variant) {
            case 'primary':
                return colors.accent;
            case 'secondary':
                return colors.surface;
            case 'outline':
                return 'transparent';
            default:
                return colors.accent;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.text.inverse;
        switch (variant) {
            case 'primary':
                return colors.text.inverse;
            case 'secondary':
                return colors.text.primary;
            case 'outline':
                return colors.accent;
            default:
                return colors.text.inverse;
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return spacing.sm;
            case 'large':
                return spacing.lg;
            default:
                return spacing.md;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    padding: getPadding(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                    borderColor: colors.accent,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        {
                            color: getTextColor(),
                            fontSize: size === 'small' ? 14 : 16,
                        },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
    },
    text: {
        ...typography.body1,
        fontWeight: '600',
    },
}); 