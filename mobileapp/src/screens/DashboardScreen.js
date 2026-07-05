import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { userService, foodService } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foodText, setFoodText] = useState('');
  const [logging, setLogging] = useState(false);
  const [estimatedData, setEstimatedData] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const userData = await userService.getMe();
      const historyData = await foodService.getHistory();
      setUser(userData);
      setHistory(historyData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toDateString();
  const todayLogs = history.filter(log => new Date(log.logged_at).toDateString() === today);

  const totals = todayLogs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    protein: acc.protein + log.protein,
    carbs: acc.carbs + log.carbs,
    fat: acc.fat + log.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const remainingParams = Math.max(0, (user?.daily_calorie_goal || 2000) - totals.calories);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login');
  };

  const handleEstimateFood = async () => {
    if (!foodText.trim()) return;
    setLogging(true);
    try {
      const data = await foodService.estimateFood(foodText);
      setEstimatedData(data);
    } catch (err) {
      Alert.alert("Error", "Failed to calculate food via AI.");
    } finally {
      setLogging(false);
    }
  };

  const handleImagePick = async (useCamera = false) => {
    let result;
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
    };
    
    if (useCamera) {
      // Need permissions for real device
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Refused", "You've refused to allow this app to access your camera!");
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setLogging(true);
      try {
        const data = await foodService.estimateFoodImage(result.assets[0].base64);
        setEstimatedData(data);
      } catch (err) {
        Alert.alert("Error", "Failed to estimate food from image.");
      } finally {
        setLogging(false);
      }
    }
  };

  const handleConfirmFood = async () => {
    if (!estimatedData) return;
    setLogging(true);
    try {
      await foodService.logFoodDirect(estimatedData);
      setFoodText('');
      setEstimatedData(null);
      await fetchData(); // Refresh data
    } catch (err) {
      Alert.alert("Error", "Failed to log food.");
    } finally {
      setLogging(false);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your entire food logging history? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await foodService.clearHistory();
              await fetchData();
            } catch (err) {
              Alert.alert("Error", "Failed to clear history.");
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FitMind AI</Text>
            <Text style={styles.subtitle}>Welcome back, {user?.full_name}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Goal</Text>
            <Text style={styles.statValue}>{user?.daily_calorie_goal || '--'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Consumed</Text>
            <Text style={styles.statValue}>{totals.calories}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: remainingParams < 200 ? '#ff0054' : '#8ef9f3' }]}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={styles.statValue}>{remainingParams}</Text>
          </View>
        </View>

        {/* AI Logger */}
        <View style={styles.loggerCard}>
          <Text style={styles.loggerTitle}>AI Food Logger</Text>
          
          {!estimatedData ? (
            <>
              <TextInput 
                style={styles.input} 
                placeholder="What did you eat? (e.g., 2 idlis)" 
                placeholderTextColor="#666" 
                value={foodText}
                onChangeText={setFoodText}
              />
              <View style={{flexDirection: 'row', gap: 10, marginBottom: 15}}>
                <TouchableOpacity style={[styles.logBtn, {flex: 1, backgroundColor: 'rgba(255,255,255,0.1)'}]} onPress={() => handleImagePick(true)} disabled={logging}>
                  <Camera color="#fff" size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.logBtn, {flex: 1, backgroundColor: 'rgba(255,255,255,0.1)'}]} onPress={() => handleImagePick(false)} disabled={logging}>
                  <ImageIcon color="#fff" size={20} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.logBtn} onPress={handleEstimateFood} disabled={logging}>
                {logging ? <ActivityIndicator color="#000" /> : <Text style={styles.logBtnText}>Calculate Nutrients</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.previewCard}>
              <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>{estimatedData.food_name}</Text>
              <Text style={{color: '#8ef9f3', fontSize: 24, marginVertical: 10}}>{estimatedData.calories} kcal</Text>
              <Text style={{color: '#aaa', marginBottom: 10}}>Protein: {estimatedData.protein}g | Carbs: {estimatedData.carbs}g | Fat: {estimatedData.fat}g</Text>
              
              {estimatedData.micronutrients && Object.keys(estimatedData.micronutrients).length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 15 }}>
                  {Object.entries(estimatedData.micronutrients).map(([key, val]) => (
                    <View key={key} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ color: '#aaa', fontSize: 11 }}>
                        <Text style={{ fontWeight: 'bold', color: '#ccc' }}>{key}:</Text> {val}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={{flexDirection: 'row', gap: 10}}>
                <TouchableOpacity style={[styles.logBtn, {flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#888'}]} onPress={() => setEstimatedData(null)} disabled={logging}>
                  <Text style={[styles.logBtnText, {color: '#888'}]}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.logBtn, {flex: 1}]} onPress={handleConfirmFood} disabled={logging}>
                  {logging ? <ActivityIndicator color="#000" /> : <Text style={styles.logBtnText}>Add to Goal</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* History List */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <Text style={[styles.historyTitle, { marginBottom: 0 }]}>Recent History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear History</Text>
            </TouchableOpacity>
          )}
        </View>
        {history.map((log) => (
          <TouchableOpacity key={log.id} style={styles.historyCard} onPress={() => setSelectedLog(log)}>
            <View>
              <Text style={styles.foodName}>{log.food_name}</Text>
              <Text style={styles.foodTime}>{new Date(log.logged_at).toLocaleTimeString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.foodCals}>{log.calories} kcal</Text>
              <Text style={styles.foodMacros}>P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={!!selectedLog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedLog(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => setSelectedLog(null)}
            >
              <X color="#888" size={24} />
            </TouchableOpacity>

            <Text style={styles.modalTag}>Meal Details</Text>
            <Text style={styles.modalTitle}>{selectedLog?.food_name}</Text>

            {/* Macros Grid */}
            <View style={styles.modalMacrosGrid}>
              <View style={styles.modalMacroBox}>
                <Text style={styles.modalMacroLabel}>Calories</Text>
                <Text style={styles.modalMacroVal}>{selectedLog?.calories} kcal</Text>
              </View>
              <View style={styles.modalMacroBox}>
                <Text style={[styles.modalMacroLabel, { color: '#8ef9f3' }]}>Protein</Text>
                <Text style={styles.modalMacroVal}>{selectedLog?.protein}g</Text>
              </View>
              <View style={styles.modalMacroBox}>
                <Text style={[styles.modalMacroLabel, { color: '#ffd166' }]}>Carbs</Text>
                <Text style={styles.modalMacroVal}>{selectedLog?.carbs}g</Text>
              </View>
              <View style={styles.modalMacroBox}>
                <Text style={[styles.modalMacroLabel, { color: '#ff0054' }]}>Fat</Text>
                <Text style={styles.modalMacroVal}>{selectedLog?.fat}g</Text>
              </View>
            </View>

            {/* Micronutrients */}
            <Text style={styles.modalSectionTitle}>Micronutrients & Details</Text>
            <ScrollView style={{ maxHeight: 200, marginBottom: 15 }}>
              {selectedLog?.micronutrients && Object.keys(selectedLog.micronutrients).length > 0 ? (
                Object.entries(selectedLog.micronutrients).map(([key, val]) => (
                  <View key={key} style={styles.microRow}>
                    <Text style={styles.microKey}>{key}</Text>
                    <Text style={styles.microVal}>{val}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noMicroText}>No additional micronutrients recorded for this entry.</Text>
              )}
            </ScrollView>

            <Text style={styles.modalFooterText}>
              Logged at {selectedLog ? new Date(selectedLog.logged_at).toLocaleString() : ''}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { color: '#8ef9f3', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16 },
  logoutBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ff0054', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8 },
  logoutText: { color: '#ff0054', fontWeight: 'bold', fontSize: 14 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: '#1a1a1f', borderRadius: 12, padding: 15, marginHorizontal: 5, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  statLabel: { color: '#888', fontSize: 12, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  loggerCard: { backgroundColor: '#1a1a1f', borderRadius: 16, padding: 20, marginBottom: 30 },
  loggerTitle: { color: '#8ef9f3', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 15, color: '#fff', marginBottom: 15 },
  logBtn: { backgroundColor: '#8ef9f3', borderRadius: 12, padding: 15, alignItems: 'center' },
  logBtnText: { fontWeight: 'bold', fontSize: 16 },
  previewCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, alignItems: 'center' },

  historyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1a1f', borderRadius: 12, padding: 15, marginBottom: 10 },
  clearBtn: { backgroundColor: 'rgba(255, 0, 84, 0.08)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255, 0, 84, 0.2)' },
  clearBtnText: { color: '#ff0054', fontWeight: 'bold', fontSize: 13 },
  foodName: { color: '#8ef9f3', fontSize: 16, fontWeight: 'bold' },
  foodTime: { color: '#888', fontSize: 12, marginTop: 4 },
  foodCals: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  foodMacros: { color: '#888', fontSize: 12, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a1f', borderRadius: 20, width: '100%', maxWidth: 400, padding: 25, borderWidth: 1, borderColor: 'rgba(142, 249, 243, 0.2)', position: 'relative' },
  modalCloseBtn: { position: 'absolute', top: 15, right: 15 },
  modalTag: { color: '#8ef9f3', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20, marginRight: 25 },
  modalMacrosGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  modalMacroBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8, marginHorizontal: 3, alignItems: 'center' },
  modalMacroLabel: { color: '#888', fontSize: 10, marginBottom: 3 },
  modalMacroVal: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  modalSectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', paddingBottom: 6 },
  microRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  microKey: { color: '#888', fontSize: 14 },
  microVal: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  noMicroText: { color: '#666', fontSize: 14, fontStyle: 'italic', paddingVertical: 10 },
  modalFooterText: { color: '#555', fontSize: 11, textAlign: 'right', marginTop: 10 },
});

export default DashboardScreen;
