import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
    isPassword?: boolean;
    error?: string;
}

export function AuthInput({ isPassword, error, ...props }: AuthInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={[
                    styles.input,
                    error ? { borderColor: Colors.light.error } : null
                ]}
                placeholderTextColor={Colors.light.textSecondary}
                secureTextEntry={isPassword && !showPassword}
                {...props}
            />
            {isPassword && (
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    testID="toggle-password"
                >
                    <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color={Colors.light.textSecondary}
                    />
                </TouchableOpacity>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',
        marginBottom: Spacing.md,
        position: 'relative',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.light.background,
        borderWidth: 1.5,
        borderColor: Colors.light.success,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        fontFamily: FontFamily.inter.regular,
        fontSize: FontSize.md,
        color: Colors.light.text,
    },
    eyeIcon: {
        position: 'absolute',
        right: Spacing.md,
        top: 14,
    },
    errorText: {
        color: Colors.light.error,
        fontFamily: FontFamily.inter.regular,
        fontSize: FontSize.sm,
        marginTop: 4,
        marginLeft: 4,
    },
});
