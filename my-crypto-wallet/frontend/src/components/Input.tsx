import React from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TextInputProps,
} from 'react-native';
import { colors, typography, spacing } from '../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    labelStyle?: TextStyle;
    inputStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    labelStyle,
    inputStyle,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, labelStyle]}>
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    inputStyle,
                ]}
                placeholderTextColor={colors.text.secondary}
                {...props}
            />
            {error && (
                <Text style={styles.error}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.body2,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.background,
        color: colors.text.primary,
        ...typography.body1,
    },
    inputError: {
        borderColor: colors.error,
    },
    error: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
    },
}); 