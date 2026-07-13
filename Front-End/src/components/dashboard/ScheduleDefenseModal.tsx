import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { minTouchTarget } from '../../theme/layout';
import { useSchedules, type DefenseSchedule } from '../../context/ScheduleContext';
import { checkConflicts } from '../../utils/conflictChecker';

/* ─── Placeholder data ─── */
const STAGES = [
  'Title Defense',
  'Review Defense',
  'Final Defense',
];

const TIME_OPTIONS = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM'
];

const PLACEHOLDER = {
  title: '',
  date: '',
  startTime: '3:00 PM',
  endTime: '6:00 PM',
  venue: 'JH 28, University of Nueva Caceres',
  researchers: [
    'Lea Roncesvalles',
    'Janna Mae Asa',
    'Andrey Quintela',
    'Dalia Mae Miralles',
  ],
  panelists: ['Ross Geller', 'Chandler Bing', 'Joey Tribbiani'],
  message: `Dear Panelist,`,
};

function getEmailForStage(
  stage: string,
  startTime: string,
  endTime: string,
  date: string,
  venue: string,
  title: string,
): string {
  const greeting = 'Dear Panelist,';
  const link = 'LINK: https://meet.google.com/';
  const closing = 'We look forward to your participation!';

  return [
    greeting,
    `You are invited to join our <b>${stage}</b> on`,
    `${date} from ${startTime} to ${endTime} at ${venue}.`,
    '',
    `<b>Research Title:</b> ${title}`,
    '',
    'Please review the attached files prior to the defense.',
    link,
    '',
    closing,
  ].join('<br/>');
}

/* ─── Mini Calendar date picker ─── */
const MINI_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function MiniCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSame = (d: number) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === d;

  const isToday = (d: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  const isPast = (d: number) => {
    const cellDate = new Date(viewYear, viewMonth, d);
    return cellDate.getTime() < today.getTime();
  };

  return (
    <View style={styles.miniCal}>
      <View style={styles.miniCalNav}>
        <TouchableOpacity onPress={goPrev} accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.miniCalTitle}>{monthLabel}</Text>
        <TouchableOpacity onPress={goNext} accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.miniCalRow}>
        {MINI_WEEKDAYS.map((w) => (
          <Text key={w} style={styles.miniCalWeekday}>{w}</Text>
        ))}
      </View>

      <View style={styles.miniCalGrid}>
        {cells.map((day, i) => (
          <TouchableOpacity
            key={i}
            disabled={day === null || isPast(day)}
            onPress={() => day && onSelect(new Date(viewYear, viewMonth, day))}
            style={[
              styles.miniCalCell,
              day !== null && isSame(day) && styles.miniCalCellSelected,
              day !== null && isToday(day) && !isSame(day) && styles.miniCalCellToday,
            ]}
          >
            <Text
              style={[
                styles.miniCalDay,
                day !== null && isSame(day) && styles.miniCalDaySelected,
                day !== null && isPast(day) && styles.miniCalDayPast,
              ]}
            >
              {day ?? ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ─── Generic Dropdown Select ─── */
function Dropdown({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'select',
      {
        value,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
        'aria-label': ariaLabel,
        style: {
          width: '100%',
          padding: '10px 12px',
          border: '1.5px solid #E0E0E0',
          borderRadius: 8,
          fontSize: 14,
          color: '#1A1A1A',
          backgroundColor: '#fff',
          cursor: 'pointer',
          outline: 'none',
          appearance: 'auto' as const,
        },
      },
      options.map((opt) =>
        React.createElement('option', { key: opt, value: opt }, opt),
      ),
    );
  }
  return (
    <TouchableOpacity
      style={styles.selectNative}
      onPress={() => {
        const idx = options.indexOf(value);
        onChange(options[(idx + 1) % options.length]);
      }}
      accessibilityRole="combobox"
      accessibilityLabel={ariaLabel}
    >
      <Text style={styles.selectNativeText}>{value}</Text>
      <Ionicons name="chevron-down" size={16} color="#525252" />
    </TouchableOpacity>
  );
}

/* ─── Custom Responsive Switch ─── */
function CustomSwitch({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.customSwitchTrack,
        value ? styles.customSwitchTrackOn : styles.customSwitchTrackOff,
        disabled && styles.customSwitchTrackDisabled,
      ]}
    >
      <View
        style={[
          styles.customSwitchThumb,
          value ? styles.customSwitchThumbOn : styles.customSwitchThumbOff,
        ]}
      />
    </TouchableOpacity>
  );
}

/* ─── Main Responsive Modal ─── */
type Props = {
  visible: boolean;
  editSchedule?: DefenseSchedule | null;
  onClose: () => void;
};

export function ScheduleDefenseModal({ visible, editSchedule, onClose }: Props) {
  const { schedules, addSchedule, updateSchedule } = useSchedules();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  // Success state tracking
  const [isSent, setIsSent] = useState(false);

  // Form State Values
  const [stage, setStage] = useState('Title Defense');
  const [duration, setDuration] = useState<'45m' | '1hr' | '1:30m' | '2h'>('2h');
  const [locationType, setLocationType] = useState<'Meet' | 'JH Building'>('JH Building');

  // Custom Room Allocations per Card
  const [cardRooms, setCardRooms] = useState<{ [key: string]: string }>({});

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 13);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const [workingHoursStart, setWorkingHoursStart] = useState('8:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('5:00 PM');

  const [lunchBreakEnabled, setLunchBreakEnabled] = useState(true);
  const [lunchBreakStart, setLunchBreakStart] = useState('12:00 PM');
  const [lunchBreakEnd, setLunchBreakEnd] = useState('1:00 PM');

  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludeSundaysOnly, setExcludeSundaysOnly] = useState(false);

  const [conflictError, setConflictError] = useState<string | null>(null);

  // Sync state when editSchedule changes
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      if (editSchedule) {
        setStage(editSchedule.stage);
        setStartDate(new Date(editSchedule.dateObj));
        setWorkingHoursStart(editSchedule.startTime);
        setWorkingHoursEnd(editSchedule.endTime);
        const hasMeet = editSchedule.venue.includes('Online') || editSchedule.venue.includes('Meet');
        setLocationType(hasMeet ? 'Meet' : 'JH Building');

        // Store pre-existing room edit into cardRooms
        const venueParts = editSchedule.venue.split(',');
        const roomName = venueParts[0] ? venueParts[0].trim() : 'JH 32';
        const dateKey = `${new Date(editSchedule.dateObj).getFullYear()}-${new Date(editSchedule.dateObj).getMonth()}-${new Date(editSchedule.dateObj).getDate()}_0`;
        setCardRooms({ [dateKey]: roomName });
      } else {
        resetForm();
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, editSchedule, fadeAnim]);

  const resetForm = () => {
    setStage('Title Defense');
    setDuration('2h');
    setLocationType('JH Building');
    setCardRooms({});
    const dStart = new Date();
    dStart.setHours(0, 0, 0, 0);
    setStartDate(dStart);
    const dEnd = new Date();
    dEnd.setDate(dEnd.getDate() + 13);
    dEnd.setHours(0, 0, 0, 0);
    setEndDate(dEnd);
    setShowStartCalendar(false);
    setShowEndCalendar(false);
    setWorkingHoursStart('8:00 AM');
    setWorkingHoursEnd('5:00 PM');
    setLunchBreakEnabled(true);
    setLunchBreakStart('12:00 PM');
    setLunchBreakEnd('1:00 PM');
    setExcludeWeekends(true);
    setExcludeSundaysOnly(false);
    setConflictError(null);
    setIsSent(false);
  };

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Helper calculation functions
  const parseTimeToMinutes = (t: string): number => {
    const match = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return 480;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (m: number): string => {
    let hours = Math.floor(m / 60);
    const minutes = m % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minStr = minutes.toString().padStart(2, '0');
    return `${hours}:${minStr} ${ampm}`;
  };

  const getDaysDifference = (d1: Date, d2: Date): number => {
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDateRange = (d1: Date, d2: Date): string => {
    const optionsShort: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const s1 = d1.toLocaleDateString('en-US', optionsShort);
    const s2 = d2.toLocaleDateString('en-US', optionsShort);
    return `${s1} - ${s2}`;
  };

  // Card Room Name State Helpers
  const getRoomName = useCallback((date: Date, roomIndex: number): string => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${roomIndex}`;
    if (cardRooms[dateKey] !== undefined) {
      return cardRooms[dateKey];
    }
    if (locationType === 'Meet') {
      return `Online Room ${roomIndex + 1}`;
    }
    return `JH ${32 + roomIndex}`;
  }, [cardRooms, locationType]);

  const setRoomName = (date: Date, roomIndex: number, newName: string) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${roomIndex}`;
    setCardRooms((prev) => ({
      ...prev,
      [dateKey]: newName,
    }));
  };

  // Generate Slots dynamically for preview (capping at exactly 5 slots per day max)
  const previewDays = useMemo(() => {
    const days: { date: Date; roomIndex: number; slots: string[] }[] = [];
    let curr = new Date(startDate);

    // Safety break to prevent infinite loops
    for (let i = 0; i < 30 && days.length < 12; i++) {
      const dayOfWeek = curr.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isSunday = dayOfWeek === 0;

      let skip = false;
      if (excludeWeekends && isWeekend) skip = true;
      if (excludeSundaysOnly && isSunday) skip = true;

      if (!skip) {
        const daySlots: string[] = [];
        const durationMinutes =
          duration === '45m' ? 45 :
            duration === '1hr' ? 60 :
              duration === '1:30m' ? 90 : 120;

        const startMin = parseTimeToMinutes(workingHoursStart);
        const endMin = parseTimeToMinutes(workingHoursEnd);
        const lunchStartMin = parseTimeToMinutes(lunchBreakStart);
        const lunchEndMin = parseTimeToMinutes(lunchBreakEnd);

        let slotTime = startMin;
        let count = 0;
        while (slotTime + durationMinutes <= endMin && count < 5) {
          let inLunch = false;
          if (lunchBreakEnabled) {
            if (slotTime < lunchEndMin && slotTime + durationMinutes > lunchStartMin) {
              inLunch = true;
            }
          }

          if (!inLunch) {
            daySlots.push(formatMinutesToTime(slotTime));
            count++;
          }
          // Increment start time by 30-minute intervals
          slotTime += 30;
        }

        // Render at least 3 room allocation options per date
        [0, 1, 2].forEach((roomIndex) => {
          days.push({
            date: new Date(curr),
            roomIndex,
            slots: daySlots,
          });
        });
      }

      curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
    }
    return days;
  }, [startDate, excludeWeekends, excludeSundaysOnly, duration, workingHoursStart, workingHoursEnd, lunchBreakEnabled, lunchBreakStart, lunchBreakEnd]);

  const totalSlotsPerDay = previewDays[0]?.slots.length || 0;

  const handleSubmit = () => {
    // Set successfully sent state to show success screen (only share availability, do not create booked schedule)
    setIsSent(true);
  };

  if (!shouldRender) return null;

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />

        <Animated.View style={[styles.dialog, { opacity: fadeAnim }]}>
          {isSent ? (
            /* ─── Success Layout Screen ─── */
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark" size={36} color="#2E7D32" />
              </View>
              <Text style={styles.successTitle}>Schedule sent!</Text>
              <Text style={styles.successSubtitle}>
                The available slots has been sent to the Researchers.
              </Text>

              {/* Summary Details Box */}
              <View style={styles.successCard}>
                <View style={styles.successRow}>
                  <View style={styles.successRowIconWrapperBlue}>
                    <Ionicons name="calendar-outline" size={18} color="#1565C0" />
                  </View>
                  <View style={styles.successRowTextWrapper}>
                    <Text style={styles.successCardRowTitle}>
                      {duration === '2h' ? '2 hour' : duration === '1hr' ? '1 hour' : duration === '1:30m' ? '1.5 hour' : '45 minute'} Presentation
                    </Text>
                    <Text style={styles.successCardRowSubtitle}>
                      {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.successRow}>
                  <View style={styles.successRowIconWrapperBlue}>
                    <Ionicons name="help-buoy-outline" size={18} color="#1565C0" />
                  </View>
                  <View style={styles.successRowTextWrapper}>
                    <Text style={styles.successCardRowTitleTextOnly}>{stage}</Text>
                  </View>
                </View>

                <View style={styles.successRow}>
                  <View style={styles.successRowIconWrapperRed}>
                    <Ionicons name="location-outline" size={18} color="#E53935" />
                  </View>
                  <View style={styles.successRowTextWrapper}>
                    <Text style={styles.successCardRowTitleTextOnly}>
                      {locationType === 'JH Building' ? 'JH BUILDING' : 'ONLINE MEET'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.returnBtn} onPress={handleDismiss}>
                <Text style={styles.returnBtnText}>Return to Calendar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ─── Scheduling Layout Form ─── */
            <>
              {/* Header row */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIconWrapper}>
                    <Ionicons name="calendar" size={16} color={colors.white} />
                  </View>
                  <Text style={styles.headerTitle}>Defense Schedule</Text>
                </View>
                <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
                <View style={styles.titleSection}>
                  <Text style={styles.mainTitle}>Calendar Availability</Text>
                  <Text style={styles.subtitle}>
                    Configure the open time window and send the invite with your department.
                  </Text>
                </View>

                <View style={styles.columnsContainer}>

                  {/* Column 1: MEETING INFO */}
                  <View style={styles.columnCard}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.cardHeaderText}>MEETING INFO</Text>
                    </View>

                    {/* Defense Type */}
                    <View style={styles.formGroup}>
                      <Text style={styles.fieldLabel}>Defense Type</Text>
                      <Dropdown value={stage} options={STAGES} onChange={setStage} />
                    </View>

                    {/* Duration */}
                    <View style={styles.formGroup}>
                      <Text style={styles.fieldLabel}>Duration</Text>
                      <View style={styles.pillsRow}>
                        {(['45m', '1hr', '1:30m', '2h'] as const).map((d) => {
                          const isActive = duration === d;
                          return (
                            <TouchableOpacity
                              key={d}
                              style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                              onPress={() => setDuration(d)}
                            >
                              <Text style={[styles.pillBtnText, isActive && styles.pillBtnTextActive]}>
                                {d}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Location */}
                    <View style={styles.formGroup}>
                      <Text style={styles.fieldLabel}>Location</Text>
                      <View style={styles.locationRow}>
                        <TouchableOpacity
                          style={[styles.locBtn, locationType === 'Meet' && styles.locBtnActive]}
                          onPress={() => setLocationType('Meet')}
                        >
                          <Ionicons
                            name="videocam-outline"
                            size={16}
                            color={locationType === 'Meet' ? colors.white : colors.textSecondary}
                          />
                          <Text style={[styles.locBtnText, locationType === 'Meet' && styles.locBtnTextActive]}>
                            Meet
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.locBtn, locationType === 'JH Building' && styles.locBtnActive]}
                          onPress={() => setLocationType('JH Building')}
                        >
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color={locationType === 'JH Building' ? colors.white : colors.textSecondary}
                          />
                          <Text style={[styles.locBtnText, locationType === 'JH Building' && styles.locBtnTextActive]}>
                            JH Building
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Column 2: AVAILABILITY WINDOW */}
                  <View style={styles.columnCard}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.cardHeaderText}>AVAILABILITY WINDOW</Text>
                    </View>

                    {/* Start Date / End Date */}
                    <View style={styles.datesGrid}>
                      <View style={styles.dateBlock}>
                        <Text style={styles.fieldLabel}>Start date</Text>
                        <TouchableOpacity
                          style={styles.dateSelector}
                          onPress={() => setShowStartCalendar(true)}
                        >
                          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                          <Text style={styles.dateSelectorText}>
                            {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.dateBlock}>
                        <Text style={styles.fieldLabel}>End date</Text>
                        <TouchableOpacity
                          style={styles.dateSelector}
                          onPress={() => setShowEndCalendar(true)}
                        >
                          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                          <Text style={styles.dateSelectorText}>
                            {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Range Badge */}
                    <View style={styles.rangeBadge}>
                      <Text style={styles.rangeBadgeDays}>{getDaysDifference(startDate, endDate)} days total</Text>
                      <Text style={styles.rangeBadgeDates}>{formatDateRange(startDate, endDate)}</Text>
                    </View>

                    {/* Working Hours */}
                    <View style={styles.formGroup}>
                      <Text style={styles.fieldLabel}>Working hours</Text>
                      <View style={styles.hoursRow}>
                        <View style={{ flex: 1 }}>
                          <Dropdown value={workingHoursStart} options={TIME_OPTIONS} onChange={setWorkingHoursStart} />
                        </View>
                        <Text style={styles.hoursTo}>to</Text>
                        <View style={{ flex: 1 }}>
                          <Dropdown value={workingHoursEnd} options={TIME_OPTIONS} onChange={setWorkingHoursEnd} />
                        </View>
                      </View>
                    </View>

                    {/* Lunch Break */}
                    <View style={[styles.formGroup, styles.toggleRow]}>
                      <View style={styles.toggleLabelRow}>
                        <Ionicons name="cafe-outline" size={16} color="#C25100" style={{ marginRight: 6 }} />
                        <Text style={styles.toggleLabel}>Lunch break</Text>
                      </View>
                      <CustomSwitch
                        value={lunchBreakEnabled}
                        onValueChange={setLunchBreakEnabled}
                      />
                    </View>
                    {lunchBreakEnabled && (
                      <View style={styles.lunchHoursRow}>
                        <View style={{ flex: 1 }}>
                          <Dropdown value={lunchBreakStart} options={TIME_OPTIONS} onChange={setLunchBreakStart} />
                        </View>
                        <Text style={styles.hoursTo}>to</Text>
                        <View style={{ flex: 1 }}>
                          <Dropdown value={lunchBreakEnd} options={TIME_OPTIONS} onChange={setLunchBreakEnd} />
                        </View>
                      </View>
                    )}

                    {/* Exclude Weekends */}
                    <View style={[styles.formGroup, styles.toggleRow]}>
                      <Text style={styles.toggleLabel}>Exclude weekends</Text>
                      <CustomSwitch
                        value={excludeWeekends}
                        onValueChange={(val) => {
                          setExcludeWeekends(val);
                          if (val) setExcludeSundaysOnly(false);
                        }}
                      />
                    </View>

                    {/* Exclude Sundays Only */}
                    <View style={[styles.formGroup, styles.toggleRow]}>
                      <Text style={styles.toggleLabel}>Exclude Sundays only</Text>
                      <CustomSwitch
                        value={excludeSundaysOnly}
                        onValueChange={(val) => {
                          setExcludeSundaysOnly(val);
                          if (val) setExcludeWeekends(false);
                        }}
                      />
                    </View>
                  </View>

                  {/* Column 3: SHARE */}
                  <View style={styles.columnCard}>
                    <View style={styles.cardHeader}>
                      <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
                      <Text style={styles.cardHeaderText}>SHARE</Text>
                    </View>
                    <Text style={styles.shareSubtitle}>Available slots your students will see:</Text>

                    {/* Slots display */}
                    <ScrollView style={styles.slotsScroll} nestedScrollEnabled>
                      {previewDays.map((d, index) => {
                        const roomName = getRoomName(d.date, d.roomIndex);
                        const dayName = d.date.toLocaleDateString('en-US', { weekday: 'short' });
                        const monthName = d.date.toLocaleDateString('en-US', { month: 'short' });
                        const dateNum = d.date.getDate();
                        const dateSuffix = `, ${dayName}, ${monthName} ${dateNum}`;

                        return (
                          <View key={index} style={styles.slotDayCard}>
                            <View style={styles.slotDayTitleRow}>
                              <TextInput
                                style={styles.slotDayRoomInput}
                                value={roomName}
                                onChangeText={(text) => setRoomName(d.date, d.roomIndex, text)}
                                placeholder="Room"
                              />
                              <Text style={styles.slotDayTitleDate}>{dateSuffix}</Text>
                            </View>
                            <View style={styles.slotPillsGrid}>
                              {d.slots.map((s, idx) => (
                                <View key={idx} style={styles.slotPill}>
                                  <Text style={styles.slotPillText}>{s}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>

                    {/* Slots info alert */}
                    <View style={styles.slotsAlert}>
                      <Text style={styles.slotsAlertText}>
                        {totalSlotsPerDay} time slots/day {lunchBreakEnabled ? `- lunch ${lunchBreakStart}–${lunchBreakEnd} blocked` : ''}
                      </Text>
                    </View>

                    {/* Conflict error feedback */}
                    {conflictError && (
                      <View style={styles.errorFeedback}>
                        <Ionicons name="alert-circle" size={16} color={colors.brandRed} />
                        <Text style={styles.errorFeedbackText}>{conflictError}</Text>
                      </View>
                    )}

                    {/* Send Button */}
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSubmit}>
                      <Text style={styles.sendBtnText}>Send</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.white} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>

                </View>
              </ScrollView>
            </>
          )}
        </Animated.View>
      </Animated.View>

      {/* Start Date Picker Modal Overlay */}
      {showStartCalendar && (
        <Modal
          transparent
          visible={showStartCalendar}
          animationType="fade"
          onRequestClose={() => setShowStartCalendar(false)}
        >
          <Pressable style={styles.calModalOverlay} onPress={() => setShowStartCalendar(false)}>
            <Pressable style={styles.calModalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.calModalHeader}>
                <Text style={styles.calModalTitle}>Select Start Date</Text>
                <TouchableOpacity onPress={() => setShowStartCalendar(false)}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <MiniCalendar
                selectedDate={startDate}
                onSelect={(d) => {
                  setStartDate(d);
                  setShowStartCalendar(false);
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* End Date Picker Modal Overlay */}
      {showEndCalendar && (
        <Modal
          transparent
          visible={showEndCalendar}
          animationType="fade"
          onRequestClose={() => setShowEndCalendar(false)}
        >
          <Pressable style={styles.calModalOverlay} onPress={() => setShowEndCalendar(false)}>
            <Pressable style={styles.calModalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.calModalHeader}>
                <Text style={styles.calModalTitle}>Select End Date</Text>
                <TouchableOpacity onPress={() => setShowEndCalendar(false)}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <MiniCalendar
                selectedDate={endDate}
                onSelect={(d) => {
                  setEndDate(d);
                  setShowEndCalendar(false);
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.77)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    maxWidth: 1040,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconWrapper: {
    backgroundColor: '#1e61cd',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  /* ─── Responsive Grid ─── */
  columnsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  columnCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
    marginBottom: 16,
  },
  cardHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },

  /* ─── Form Elements ─── */
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  selectNative: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  selectNativeText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
    backgroundColor: '#fff',
  },

  /* Pills (Duration) */
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#1e61cd',
    borderColor: '#1e61cd',
  },
  pillBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  pillBtnTextActive: {
    color: colors.white,
  },

  /* Location */
  locationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  locBtnActive: {
    backgroundColor: '#1e61cd',
    borderColor: '#1e61cd',
  },
  locBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  locBtnTextActive: {
    color: colors.white,
  },

  /* Availability window dates */
  datesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    zIndex: 2,
  },
  dateBlock: {
    flex: 1,
    position: 'relative',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dateSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },

  /* Range badge */
  rangeBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  rangeBadgeDays: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  rangeBadgeDates: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },

  /* Hours row */
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hoursTo: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  /* Toggles */
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32,
    marginBottom: 12,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  lunchHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -4,
    marginBottom: 12,
    paddingLeft: 22,
  },

  /* Column 3: Share slots list */
  shareSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  slotsScroll: {
    maxHeight: 280,
    marginBottom: 12,
  },
  slotDayCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  slotDayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotDayRoomInput: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 0,
    paddingHorizontal: 2,
    width: 50,
    marginRight: 0,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  slotDayTitleDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#525252',
  },
  slotPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotPill: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FAFAFA',
  },
  slotPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
  },
  slotsAlert: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  slotsAlertText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
    textAlign: 'center',
  },

  /* Error feedback */
  errorFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorFeedbackText: {
    color: colors.brandRed,
    fontWeight: '600',
    fontSize: 12,
    flex: 1,
  },

  /* Send Button */
  sendBtn: {
    backgroundColor: '#1e61cd',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1e61cd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ─── Calendar Modals ─── */
  calModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  calModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  calModalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  /* ─── Mini Calendar ─── */
  miniCal: {
    backgroundColor: '#fff',
    width: '100%',
  },
  miniCalNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  miniCalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  miniCalRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  miniCalWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
  },
  miniCalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniCalCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  miniCalCellSelected: {
    backgroundColor: '#1e61cd',
    borderRadius: 14,
  },
  miniCalCellToday: {
    borderWidth: 1,
    borderColor: '#1e61cd',
    borderRadius: 14,
  },
  miniCalDay: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  miniCalDaySelected: {
    color: '#fff',
    fontWeight: '700',
  },
  miniCalDayPast: {
    color: '#CCCCCC',
  },

  /* Custom Switch */
  customSwitchTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  customSwitchTrackOn: {
    backgroundColor: '#1A73E8',
  },
  customSwitchTrackOff: {
    backgroundColor: '#D1D5DB',
  },
  customSwitchTrackDisabled: {
    opacity: 0.5,
    backgroundColor: '#E5E7EB',
  },
  customSwitchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  customSwitchThumbOn: {
    alignSelf: 'flex-end',
  },
  customSwitchThumbOff: {
    alignSelf: 'flex-start',
  },

  /* ─── Success View Styling ─── */
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#525252',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  successCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    width: '100%',
    padding: 20,
    gap: 16,
    marginBottom: 32,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successRowIconWrapperBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successRowIconWrapperRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successRowTextWrapper: {
    flex: 1,
  },
  successCardRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  successCardRowSubtitle: {
    fontSize: 12,
    color: '#525252',
    marginTop: 2,
  },
  successCardRowTitleTextOnly: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  returnBtn: {
    backgroundColor: '#1A73E8',
    width: '100%',
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  returnBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
