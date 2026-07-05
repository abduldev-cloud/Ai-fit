import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { authService } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.register(email, password, fullName);
        await authService.login(email, password); // Auto login after register
      }
      navigation.navigate('Dashboard');
    } catch (err) {
      // If it's a network error from Axios, show it
      const errorMsg = err.response?.data?.detail || err.message || "An error occurred";
      Alert.alert("Error", "Could not connect! Reason: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitMind AI</Text>
      <Text style={styles.subtitle}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
      
      {!isLogin && (
        <TextInput 
          style={styles.input} 
          placeholder="Full Name" 
          placeholderTextColor="#666" 
          value={fullName}
          onChangeText={setFullName}
        />
      )}
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#666" 
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        placeholderTextColor="#666" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{isLogin ? "Login" : "Register"}</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
        <Text style={{ color: '#8ef9f3', textAlign: 'center' }}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b', justifyContent: 'center', padding: 20 },
  title: { color: '#8ef9f3', fontSize: 40, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 15, color: '#fff', marginBottom: 15 },
  button: { backgroundColor: '#8ef9f3', borderRadius: 12, padding: 18, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 18 }
});

export default LoginScreen;
