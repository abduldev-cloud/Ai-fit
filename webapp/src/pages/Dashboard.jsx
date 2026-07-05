import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Target, Flame, LogOut, User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, foodService } from '../services/api';
import FoodLogger from '../components/FoodLogger';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, historyData] = await Promise.all([
        userService.getMe(),
        foodService.getHistory()
      ]);
      setUser(userData);
      setHistory(historyData);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
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

  const chartData = [
    { name: 'Consumed', value: totals.calories, color: 'var(--primary)' },
    { name: 'Remaining', value: Math.max(0, (user?.daily_calorie_goal || 2000) - totals.calories), color: 'rgba(255,255,255,0.1)' }
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Initializing Engine...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem' }}>FitMind AI</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.full_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/profile')} className="glass-card" style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', cursor: 'pointer', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <UserIcon size={20} />
             <span>Profile</span>
          </button>
          <button onClick={() => {localStorage.removeItem('token'); window.location.href='/';}} className="glass-card" style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', cursor: 'pointer', border: 'none', color: 'var(--accent)' }}>
             <LogOut size={20} />
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Main Content */}
        <main>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Daily Goal</span>
              <h2 style={{ margin: '0.5rem 0' }}>{user?.daily_calorie_goal || '---'} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span></h2>
              <Target size={20} color="var(--primary)" />
            </div>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Consumed</span>
              <h2 style={{ margin: '0.5rem 0' }}>{totals.calories} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span></h2>
              <Flame size={20} color="var(--accent)" />
            </div>
            <div className="glass-card">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Remaining</span>
              <h2 style={{ margin: '0.5rem 0' }}>{Math.max(0, (user?.daily_calorie_goal || 2000) - totals.calories)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span></h2>
              <Zap size={20} color="var(--primary)" />
            </div>
          </div>

          {/* AI Logger */}
          <FoodLogger onLogSuccess={fetchData} />

          {/* History */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>Recent History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {history.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ 
                      padding: '1rem', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div>
                      <h4 style={{ color: 'var(--primary)' }}>{log.food_name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log.logged_at).toLocaleTimeString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold' }}>{log.calories} kcal</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside>
          <div className="glass-card" style={{ height: '300px', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Daily Balance</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ background: '#1a1a1f', border: '1px solid var(--glass-border)', borderRadius: '8px' }} 
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default Dashboard;
