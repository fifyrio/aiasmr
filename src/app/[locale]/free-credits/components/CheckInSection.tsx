'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

interface CheckInData {
  canCheckIn: boolean;
  checkedInToday: boolean;
  consecutiveDays: number;
  longestStreak: number;
  totalCheckIns: number;
  todayReward: number;
  calendar: Array<{
    date: string;
    checked: boolean;
    reward: number;
  }>;
  nextRewards: Array<{
    day: number;
    reward: number;
    isSpecial: boolean;
  }>;
}

interface CheckInSectionProps {
  data: CheckInData | null;
  onCheckInSuccess: (credits: number) => void;
  loading: boolean;
}

export default function CheckInSection({ data, onCheckInSuccess, loading }: CheckInSectionProps) {
  const t = useTranslations('freeCredits.checkIn');
  const [checkingIn, setCheckingIn] = useState(false);

  const handleCheckIn = async () => {
    if (!data?.canCheckIn || checkingIn) return;

    try {
      setCheckingIn(true);
      const response = await fetch('/api/free-credits/check-in', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        onCheckInSuccess(result.data.creditsEarned);
      } else {
        toast.error(result.error?.message || t('errors.checkInFailed'));
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(t('errors.checkInFailed'));
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-400">
        {t('noData')}
      </div>
    );
  }

  // Generate current month calendar
  const generateCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const calendar = [];
    const current = new Date(startDate);

    // Generate 6 weeks (42 days) to cover full month view
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === now.toDateString();
      const checkInRecord = data.calendar.find(c => c.date === dateStr);
      
      calendar.push({
        date: current.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
        checkedIn: checkInRecord?.checked || false,
        reward: checkInRecord?.reward || 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return calendar;
  };

  const calendarDays = generateCalendar();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">
            {data.consecutiveDays}
          </div>
          <div className="text-sm text-gray-400">
            {t('consecutiveDays')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400">
            {data.todayReward}
          </div>
          <div className="text-sm text-gray-400">
            {t('todayReward')}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="text-center font-semibold text-white mb-4">
          {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                relative aspect-square p-1 text-center text-sm flex items-center justify-center rounded-lg
                ${!day.isCurrentMonth ? 'text-gray-500' : 'text-gray-300'}
                ${day.isToday ? 'ring-2 ring-purple-400' : ''}
                ${day.checkedIn ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'}
              `}
            >
              <span className="relative z-10">{day.date}</span>
              {day.checkedIn && (
                <div className="absolute inset-0 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Check-in Button */}
      <div className="text-center">
        {data.checkedInToday ? (
          <div className="bg-green-600/20 text-green-400 py-3 px-6 rounded-lg font-semibold border border-green-600/30">
            <span className="mr-2">✅</span>
            {t('checkedInToday')}
          </div>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={!data.canCheckIn || checkingIn}
            className={`
              py-3 px-8 rounded-lg font-semibold text-white text-lg min-w-[200px]
              ${data.canCheckIn && !checkingIn
                ? 'bg-purple-600 hover:bg-purple-700 transform hover:scale-105'
                : 'bg-gray-600 cursor-not-allowed'
              }
              transition-all duration-200 shadow-lg
            `}
          >
            {checkingIn ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('checkingIn')}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🎁</span>
                {t('checkInButton')}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Next Rewards Preview */}
      {data.nextRewards && data.nextRewards.length > 0 && (
        <div className="bg-purple-600/10 rounded-lg p-4 border border-purple-600/20">
          <div className="text-sm font-semibold text-purple-400 mb-3">
            {t('upcomingRewards')}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.nextRewards.slice(0, 3).map((reward) => (
              <div 
                key={reward.day}
                className={`
                  text-center p-2 rounded-lg
                  ${reward.isSpecial 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white' 
                    : 'bg-gray-700 text-gray-300'
                  }
                `}
              >
                <div className="text-xs font-medium">
                  {t('day')} {reward.day}
                </div>
                <div className="text-sm font-bold">
                  {reward.reward} {t('credits')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Stats */}
      <div className="border-t border-gray-600 pt-4 text-center space-y-2">
        <div className="text-sm text-gray-400">
          {t('totalCheckIns')}: <span className="font-semibold text-white">{data.totalCheckIns}</span>
        </div>
        <div className="text-sm text-gray-400">
          {t('longestStreak')}: <span className="font-semibold text-white">{data.longestStreak} {t('days')}</span>
        </div>
      </div>
    </div>
  );
}