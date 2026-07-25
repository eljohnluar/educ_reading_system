// src/components/admin/AdminDashboardNew.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services/adminService'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const COLORS = {
  cream: '#E5DCCD',
  gold: '#E9D8A9',
  creamLight: '#E5DCCD20',
  creamMedium: '#E5DCCD40',
  goldLight: '#E9D8A920',
}

export default function AdminDashboardNew() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const statsData = await adminService.getDashboardStats()
      setStats(statsData)

      const activity = await adminService.getActivityLogs(10)
      setRecentActivity(activity || [])

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(5)

      if (!error) {
        setTopPerformers(data || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '384px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: `2px solid ${COLORS.gold}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: '' },
    { label: 'Levels Completed', value: stats?.total_completions || 0, icon: '' },
    { label: 'Average Score', value: stats?.avg_score || 0, icon: '' },
    { label: 'Perfect Scores', value: stats?.perfect_scores || 0, icon: '' },
    { label: "Today's Logins", value: stats?.today_logins || 0, icon: '' },
  ]

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${COLORS.creamMedium}`
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 300, color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>
            Welcome back, {profile?.username || 'Admin'}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = COLORS.gold}
          onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '20px 16px',
              border: `1px solid ${COLORS.creamMedium}`,
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.gold}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.creamMedium}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{stat.icon}</span>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 300, color: '#111827', margin: 0 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Recent Activity */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            border: `1px solid ${COLORS.creamMedium}`,
            padding: '20px',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.gold}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.creamMedium}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 500, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
              Recent Activity
            </h2>
            <Link
              to="/admin/activity"
              style={{
                fontSize: '12px',
                color: '#9CA3AF',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = COLORS.gold}
              onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
            >
              View all →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>No activity</p>
            ) : (
              recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: `1px solid ${COLORS.creamLight}`,
                  }}
                >
                  <span style={{ fontSize: '14px' }}>
                    {activity.action_type === 'login' ? '' :
                     activity.action_type === 'register' ? '' :
                     activity.action_type === 'level_complete' ? '' :
                     '📌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activity.profiles?.username || 'Unknown'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activity.action}
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#D1D5DB', whiteSpace: 'nowrap' }}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div
          style={{
            background: 'white',
            borderRadius: '8px',
            border: `1px solid ${COLORS.creamMedium}`,
            padding: '20px',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.gold}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.creamMedium}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 500, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
              Top Performers
            </h2>
            <Link
              to="/leadership"
              style={{
                fontSize: '12px',
                color: '#9CA3AF',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = COLORS.gold}
              onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
            >
              View all →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topPerformers.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>No data yet</p>
            ) : (
              topPerformers.slice(0, 5).map((user, index) => (
                <div
                  key={user.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: `1px solid ${COLORS.creamLight}`,
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    width: '20px',
                    color: index === 0 ? COLORS.gold : '#9CA3AF'
                  }}>
                    #{index + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', color: '#374151', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.username}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                      {user.completed_levels || 0} levels • {user.total_score || 0} pts
                    </p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 300, color: COLORS.gold }}>
                    {user.total_score || 0}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <Link
          to="/admin/users"
          style={{
            background: 'white',
            borderRadius: '8px',
            border: `1px solid ${COLORS.creamMedium}`,
            padding: '12px 16px',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = COLORS.gold
            e.currentTarget.style.background = `${COLORS.creamLight}`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLORS.creamMedium
            e.currentTarget.style.background = 'white'
          }}
        >
          <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}></span>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Manage Users</span>
        </Link>
        <Link
          to="/admin/statistics"
          style={{
            background: 'white',
            borderRadius: '8px',
            border: `1px solid ${COLORS.creamMedium}`,
            padding: '12px 16px',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = COLORS.gold
            e.currentTarget.style.background = `${COLORS.creamLight}`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLORS.creamMedium
            e.currentTarget.style.background = 'white'
          }}
        >
          <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}></span>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Statistics</span>
        </Link>
      </div>
    </div>
  )
}