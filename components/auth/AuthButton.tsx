import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface AuthButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary';
    loading?: boolean;
}

export function AuthButton({ title, variant = 'primary', loading = false, disabled, ...props }: AuthButtonProps) {
    const isPrimary = variant === 'primary';
    const containerStyle = isPrimary ? styles.primaryButton : styles.secondaryButton;
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[containerStyle, isDisabled && styles.disabledButton]}
            activeOpacity={0.8}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator size="small" color={Colors.light.white} />
            ) : (
                <Text style={styles.buttonText}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonText: {
        fontFamily: FontFamily.inter.semibold,
        fontSize: FontSize.md,
        color: Colors.light.white,
    },
    primaryButton: {
        backgroundColor: Colors.light.success,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        shadowColor: Colors.light.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: Colors.light.textSecondary,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
        shadowColor: Colors.light.textSecondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
});
