'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@clerk/react'
import { Clock, Calendar, RefreshCw, Save, Trash2, Plus, Check } from 'lucide-react'

interface ScanSchedule {
  id: string
  scan_id: string
  frequency: 'daily' | 'weekly' | 'monthly'
  day_of_week?: number
  day_of_month?: number
  hour: number
  minute: number
  timezone: string
  enabled: boolean
  next_run_at?: string
  last_run_at?: string
}

interface Scan {
  id: string
  industry: string
  company_name?: string
  company_url?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo'
]

export default function AutomatedScansSettings() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [scans, setScans] = useState<Scan[]>([])
  const [schedules, setSchedules] = useState<Record<string, ScanSchedule>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchScansAndSchedules()
    }
  }, [user])

  const fetchScansAndSchedules = async () => {
    try {
      if (!user?.id) {
        console.error('[AutomatedScans] No user ID available')
        setLoading(false)
        return
      }
      
      console.log('[AutomatedScans] Fetching scans for user:', user.id)
      
      // Get Clerk token for auth
      const token = await getToken({ template: 'supabase' })
      console.log('[AutomatedScans] Token obtained:', token ? 'yes' : 'no')
      
      // Try direct fetch first to debug
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/scans?user_id=eq.${user.id}&status=eq.completed&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${token}`,
          }
        }
      )
      
      console.log('[AutomatedScans] Response status:', response.status)
      const scansData = await response.json()
      console.log('[AutomatedScans] Response data:', scansData)
      
      if (response.ok && Array.isArray(scansData)) {
        console.log('[AutomatedScans] Found scans:', scansData.length)
        console.log('[AutomatedScans] First scan:', scansData[0])
        setScans(scansData)
      } else {
        console.error('[AutomatedScans] Failed to fetch scans:', scansData)
        setScans([])
      }
        
        // Fetch schedules
        const { data: schedulesData, error: schedulesError } = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/scan_schedules?user_id=eq.${user.id}`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${token}`,
            }
          }
        ).then(res => res.json())
        
        console.log('[AutomatedScans] Schedules data:', schedulesData)
        
        if (!schedulesError && schedulesData && Array.isArray(schedulesData)) {
          // Convert schedules to map by scan_id
          const schedulesMap: Record<string, ScanSchedule> = {}
          schedulesData.forEach((schedule: ScanSchedule) => {
            schedulesMap[schedule.scan_id] = schedule
          })
          setSchedules(schedulesMap)
        } else {
          console.log('[AutomatedScans] No schedules found or error')
          setSchedules({})
        }
      
    } catch (error) {
      console.error('[AutomatedScans] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading automated scans...</div>
  }

  if (scans.length === 0) {
    return (
      <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center">
        <Plus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">No profiles yet</h3>
        <p className="text-slate-400 mb-4">
          Create an industry profile first to set up automated scans.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Automated Scans</h2>
          <p className="text-slate-400">Schedule automatic profile refreshes</p>
        </div>
      </div>

      <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
        <p className="text-indigo-300 text-sm">
          ✨ <strong>Pro Feature:</strong> Automated scans keep your competitive intelligence fresh. Upgrade to Pro to enable scheduling.
        </p>
      </div>

      {scans.map((scan) => (
        <ScheduleCard
          key={scan.id}
          scan={scan}
          schedule={schedules[scan.id]}
          userId={user?.id || ''}
          onScheduleUpdate={fetchScansAndSchedules}
        />
      ))}
    </div>
  )
}

function ScheduleCard({ 
  scan, 
  schedule, 
  userId,
  onScheduleUpdate
}: {
  scan: Scan
  schedule?: ScanSchedule
  userId: string
  onScheduleUpdate: () => Promise<void>
}) {
  // Initialize state from existing schedule or defaults
  const [enabled, setEnabled] = useState(schedule?.enabled ?? false)
  const [frequency, setFrequency] = useState(schedule?.frequency || 'weekly')
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.day_of_week ?? 1)
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.day_of_month ?? 1)
  const [hour, setHour] = useState(schedule?.hour ?? 9)
  const [minute, setMinute] = useState(schedule?.minute ?? 0)
  const [timezone, setTimezone] = useState(schedule?.timezone || 'America/New_York')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSavedState, setLastSavedState] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Update local state when schedule prop changes
  useEffect(() => {
    if (schedule) {
      setEnabled(schedule.enabled)
      setFrequency(schedule.frequency)
      setDayOfWeek(schedule.day_of_week ?? 1)
      setDayOfMonth(schedule.day_of_month ?? 1)
      setHour(schedule.hour)
      setMinute(schedule.minute)
      setTimezone(schedule.timezone)
      
      // Save the initial state
      setLastSavedState({
        enabled: schedule.enabled,
        frequency: schedule.frequency,
        day_of_week: schedule.day_of_week,
        day_of_month: schedule.day_of_month,
        hour: schedule.hour,
        minute: schedule.minute,
        timezone: schedule.timezone
      })
    }
  }, [schedule])

  // Check if there are unsaved changes
  useEffect(() => {
    if (lastSavedState) {
      const currentState = {
        enabled,
        frequency,
        day_of_week: frequency === 'weekly' ? dayOfWeek : undefined,
        day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
        hour,
        minute,
        timezone
      }
      
      const hasUnsavedChanges = JSON.stringify(currentState) !== JSON.stringify(lastSavedState)
      setHasChanges(hasUnsavedChanges)
    } else if (!schedule) {
      // If no schedule exists yet, any state is a change
      setHasChanges(true)
    }
  }, [enabled, frequency, dayOfWeek, dayOfMonth, hour, minute, timezone, lastSavedState, schedule])

  const handleToggle = async (newEnabled: boolean) => {
    setEnabled(newEnabled)
    
    // Auto-save toggle changes if schedule exists
    if (schedule) {
      await saveSchedule({ ...getCurrentScheduleData(), enabled: newEnabled })
    }
  }

  const getCurrentScheduleData = () => ({
    enabled,
    frequency,
    day_of_week: frequency === 'weekly' ? dayOfWeek : undefined,
    day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
    hour,
    minute,
    timezone
  })

  const saveSchedule = async (data?: any) => {
    setSaving(true)
    try {
      const scheduleData = data || getCurrentScheduleData()
      
      if (schedule) {
        // Update existing schedule
        console.log('[AutomatedScans] Updating schedule:', schedule.id)
        const { error } = await supabase
          .from('scan_schedules')
          .update({
            ...scheduleData,
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id)

        if (error) throw error
      } else {
        // Create new schedule
        console.log('[AutomatedScans] Creating new schedule for scan:', scan.id)
        const { error } = await supabase
          .from('scan_schedules')
          .insert({
            user_id: userId,
            scan_id: scan.id,
            ...scheduleData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('[AutomatedScans] Insert error details:', error)
          throw error
        }
      }
      
      // Update saved state
      setLastSavedState(scheduleData)
      setHasChanges(false)
      
      // Show success feedback
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Refresh parent data
      await onScheduleUpdate()
      
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const deleteSchedule = async () => {
    if (!schedule) return
    if (!confirm('Delete this automated scan schedule?')) return

    try {
      const { error } = await supabase
        .from('scan_schedules')
        .delete()
        .eq('id', schedule.id)

      if (error) throw error

      await onScheduleUpdate()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Failed to delete schedule')
    }
  }

  const getNextRunText = () => {
    if (!enabled) return 'Disabled'
    
    // If we have a saved schedule with next_run_at, use it
    if (schedule?.next_run_at) {
      return new Date(schedule.next_run_at).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone
      })
    }
    
    // Otherwise, calculate approximate next run
    const now = new Date()
    const next = new Date()
    next.setHours(hour, minute, 0, 0)
    
    if (frequency === 'daily') {
      if (next <= now) next.setDate(next.getDate() + 1)
    } else if (frequency === 'weekly') {
      const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7
      next.setDate(now.getDate() + (daysUntilNext || 7))
      if (next <= now) next.setDate(next.getDate() + 7)
    } else if (frequency === 'monthly') {
      next.setDate(dayOfMonth)
      if (next <= now) next.setMonth(next.getMonth() + 1)
    }
    
    return next.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone
    }) + ' (estimated)'
  }

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {scan.company_name ? `${scan.company_name} — ` : ''}{scan.industry}
          </h3>
          {scan.company_url && (
            <p className="text-xs text-slate-500 mt-1">{scan.company_url}</p>
          )}
        </div>
        
        {/* Toggle with auto-save */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {schedule?.last_run_at && (
        <div className="mb-4 p-3 bg-slate-800 rounded-lg text-sm">
          <span className="text-slate-400">Last run: </span>
          <span className="text-white">
            {new Date(schedule.last_run_at).toLocaleString()}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            disabled={!enabled}
            className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Day selector */}
        {frequency === 'weekly' && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
              disabled={!enabled}
              className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {frequency === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Day of Month
            </label>
            <select
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
              disabled={!enabled}
              className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Time
          </label>
          <div className="flex gap-2">
            <select
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              disabled={!enabled}
              className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>
                  {h.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={!enabled}
            className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status display */}
      <div className={`mb-4 p-3 rounded-lg ${
        enabled 
          ? 'bg-indigo-500/10 border border-indigo-500/30' 
          : 'bg-slate-800 border border-slate-700'
      }`}>
        <p className={`text-sm ${enabled ? 'text-indigo-300' : 'text-slate-400'}`}>
          <Calendar className="w-4 h-4 inline mr-2" />
          Next run: <strong>{getNextRunText()}</strong>
        </p>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <p className="text-green-400 text-sm">Schedule saved successfully!</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {/* Save button - only show when there are changes */}
        {hasChanges && (
          <button
            onClick={() => saveSchedule()}
            disabled={saving || !enabled}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        )}
        
        {/* Delete button - only show if schedule exists */}
        {schedule && (
          <button
            onClick={deleteSchedule}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
        
        {/* Info text when no changes */}
        {!hasChanges && enabled && (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            <Check className="w-4 h-4 text-green-400 mr-2" />
            Schedule is active and saved
          </div>
        )}
        
        {/* Info text when disabled */}
        {!enabled && !hasChanges && (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            Enable the toggle to activate automated scanning
          </div>
        )}
      </div>
    </div>
  )
}