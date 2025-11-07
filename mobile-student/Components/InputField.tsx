import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// On définit le type des noms d'icônes autorisés
type IoniconName = keyof typeof Ionicons.glyphMap;

interface InputFieldProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: TextInputProps['keyboardType'];
  isPassword?: boolean;
  rightIconName?: IoniconName; 
  onRightIconPress?: () => void;
  editable?: boolean;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  isPassword = false,
  rightIconName,
  onRightIconPress,
  autoCapitalize = 'none',
  autoCorrect = false,
  editable = true,
  maxLength = 100,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <View
      style={[
        styles.inputContainer,
        { borderColor: isFocused ? '#000000ff' : '#E0E0E0' },
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A1A1A1"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={isPassword && !showPassword}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        editable={editable}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />

      {isPassword ? (
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={togglePasswordVisibility}
          accessibilityLabel="Afficher ou masquer le mot de passe"
        >
          <Ionicons
            name={showPassword ? 'eye-outline':'eye-off-outline'}
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      ) : (
        rightIconName && (
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={onRightIconPress}
            accessibilityLabel="Icône d’action"
          >
            <Ionicons name={rightIconName} size={22} color="#666" />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1.2,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  iconWrapper: {
    paddingRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InputField;
