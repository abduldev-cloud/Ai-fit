import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male'); // 'male' or 'female'
  const [activityLevel, setActivityLevel] = useState('1.2'); // '1.2', '1.375', '1.55', '1.725', '1.9'
  const [goal, setGoal] = useState('maintain'); // 'lose', 'maintain', 'gain'

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getMe();
      setFullName(data.full_name || '');
      setAge(data.age !== null ? String(data.age) : '');
      setHeight(data.height !== null ? String(data.height) : '');
      setWeight(data.weight !== null ? String(data.weight) : '');
      setGender(data.gender || 'male');
      setActivityLevel(data.activity_level !== null ? String(data.activity_level) : '1.2');
      setGoal(data.goal || 'maintain');
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full Name cannot be empty.");
      return;
    }

    setSaving(true);
    const profilePayload = {
      full_name: fullName,
      age: age ? parseInt(age, 10) : null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      gender: gender,
      activity_level: parseFloat(activityLevel),
      goal: goal
    };

    try {
      await userService.updateProfile(profilePayload);
      Alert.alert("Success", "Profile updated and calorie goals recalculated.");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to save profile. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    // Navigate back to the Stack Navigator's Login route
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#8ef9f3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Title */}
        <Text style={styles.title}>Profile Settings</Text>
        <Text style={styles.subtitle}>Manage your body parameters</Text>

        {/* Input Fields */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            placeholderTextColor="#666"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Age (years)</Text>
              <TextInput 
                style={styles.input} 
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.selectorContainer}>
                <TouchableOpacity 
                  style={[styles.selectorBtn, gender === 'male' && styles.selectorActive]} 
                  onPress={() => setGender('male')}
                >
                  <Text style={[styles.selectorBtnText, gender === 'male' && styles.selectorActiveText]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.selectorBtn, gender === 'female' && styles.selectorActive]} 
                  onPress={() => setGender('female')}
                >
                  <Text style={[styles.selectorBtnText, gender === 'female' && styles.selectorActiveText]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput 
                style={styles.input} 
                value={height}
                onChangeText={setHeight}
                placeholder="175"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput 
                style={styles.input} 
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Goals & Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fitness Settings</Text>

          <Text style={styles.label}>Weight Goal</Text>
          <View style={styles.selectorContainer}>
            <TouchableOpacity 
              style={[styles.selectorBtn, goal === 'lose' && styles.selectorActive]} 
              onPress={() => setGoal('lose')}
            >
              <Text style={[styles.selectorBtnText, goal === 'lose' && styles.selectorActiveText]}>Lose</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.selectorBtn, goal === 'maintain' && styles.selectorActive]} 
              onPress={() => setGoal('maintain')}
            >
              <Text style={[styles.selectorBtnText, goal === 'maintain' && styles.selectorActiveText]}>Maintain</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.selectorBtn, goal === 'gain' && styles.selectorActive]} 
              onPress={() => setGoal('gain')}
            >
              <Text style={[styles.selectorBtnText, goal === 'gain' && styles.selectorActiveText]}>Gain</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 15 }]}>Activity Level</Text>
          <View style={styles.activityOptions}>
            {[
              { val: '1.2', label: 'Sedentary (No exercise)' },
              { val: '1.375', label: 'Lightly Active (1-3 days/week)' },
              { val: '1.55', label: 'Moderately Active (3-5 days/week)' },
              { val: '1.725', label: 'Very Active (6-7 days/week)' },
              { val: '1.9', label: 'Extra Active (Intense 2x/day)' }
            ].map((opt) => (
              <TouchableOpacity 
                key={opt.val}
                style={[styles.activityBtn, activityLevel === opt.val && styles.activityActive]}
                onPress={() => setActivityLevel(opt.val)}
              >
                <Text style={[styles.activityText, activityLevel === opt.val && styles.activityActiveText]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save & Recalculate Goal</Text>}
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  title: { color: '#8ef9f3', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 25 },
  
  card: { backgroundColor: '#1a1a1f', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionTitle: { color: '#8ef9f3', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 15 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  
  selectorContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 15 },
  selectorBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  selectorActive: { backgroundColor: '#8ef9f3' },
  selectorBtnText: { color: '#aaa', fontWeight: 'bold' },
  selectorActiveText: { color: '#000' },
  
  activityOptions: { gap: 8 },
  activityBtn: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  activityActive: { borderColor: '#8ef9f3', backgroundColor: 'rgba(142, 249, 243, 0.05)' },
  activityText: { color: '#ccc', fontSize: 14 },
  activityActiveText: { color: '#8ef9f3', fontWeight: 'bold' },

  saveBtn: { backgroundColor: '#8ef9f3', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 12 },
  saveBtnText: { fontWeight: 'bold', fontSize: 16, color: '#000' },

  logoutBtn: { backgroundColor: 'transparent', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ff0054', marginBottom: 30 },
  logoutBtnText: { color: '#ff0054', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;
