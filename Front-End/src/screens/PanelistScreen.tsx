import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
  Modal,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { HeaderBar } from '../components/dashboard/HeaderBar';
import { Sidebar } from '../components/dashboard/Sidebar';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { webViewportHeight } from '../theme/webLayout';

type PanelMemberBooking = {
  id: string;
  initials: string;
  name: string;
  email: string;
  date: string;
  role: 'Panel Chairman' | 'Panel Member';
  time: string;
  duration: string;
  venueType: 'In person' | 'Online';
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  stage: 'Title Defense' | 'Review Defense' | 'Final Defense';
};

const MOCK_BOOKINGS: PanelMemberBooking[] = [
  {
    id: '1',
    initials: 'PN',
    name: 'Priya Nair',
    email: 'priya@acme.io',
    date: 'TUESDAY, JULY 14, 2026',
    role: 'Panel Chairman',
    time: '9:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Title Defense',
  },
  {
    id: '2',
    initials: 'MR',
    name: 'Marcus Rivera',
    email: 'marcus@design.co',
    date: 'TUESDAY, JULY 14, 2026',
    role: 'Panel Member',
    time: '9:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Title Defense',
  },
  {
    id: '3',
    initials: 'MR',
    name: 'John Smith',
    email: 'john@design.co',
    date: 'TUESDAY, JULY 14, 2026',
    role: 'Panel Member',
    time: '9:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Title Defense',
  },
  {
    id: '4',
    initials: 'TW',
    name: 'Tom Weston',
    email: 'tom@weston.dev',
    date: 'WEDNESDAY, JULY 15, 2026',
    role: 'Panel Chairman',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Review Defense',
  },
  {
    id: '5',
    initials: 'TW',
    name: 'Tom Weston',
    email: 'tom@weston.dev',
    date: 'WEDNESDAY, JULY 15, 2026',
    role: 'Panel Member',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Review Defense',
  },
  {
    id: '6',
    initials: 'TW',
    name: 'Tom Weston',
    email: 'tom@weston.dev',
    date: 'WEDNESDAY, JULY 15, 2026',
    role: 'Panel Member',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Review Defense',
  },
  {
    id: '7',
    initials: 'DK',
    name: 'David Kim',
    email: 'dkim@forward.ai',
    date: 'FRIDAY, JULY 17, 2026',
    role: 'Panel Chairman',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Pending',
    stage: 'Final Defense',
  },
  {
    id: '8',
    initials: 'NO',
    name: 'Nadia Okonkwo',
    email: 'nadia@verve.ng',
    date: 'FRIDAY, JULY 17, 2026',
    role: 'Panel Member',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Final Defense',
  },
  {
    id: '9',
    initials: 'SM',
    name: 'Sofia Marchetti',
    email: 'sofia@arch.it',
    date: 'FRIDAY, JULY 17, 2026',
    role: 'Panel Member',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Final Defense',
  },
  {
    id: '10',
    initials: 'NO',
    name: 'Nadia Okonkwo',
    email: 'nadia@verve.ng',
    date: 'TUESDAY, JULY 21, 2026',
    role: 'Panel Member',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Confirmed',
    stage: 'Title Defense',
  },
  {
    id: '11',
    initials: 'JL',
    name: 'James Lau',
    email: 'james@orbit.hk',
    date: 'WEDNESDAY, JULY 22, 2026',
    role: 'Panel Member',
    time: '10:00 AM',
    duration: '2 hr',
    venueType: 'In person',
    status: 'Cancelled',
    stage: 'Review Defense',
  },
];

type Props = {
  onNavPress: (key: string) => void;
};

/* ─── Detail Modal (Top Right, #000000 25% Opacity, 300ms dissolve ease out) ─── */
function PanelistDetailsModal({
  visible,
  booking,
  onClose,
}: {
  visible: boolean;
  booking: PanelMemberBooking | null;
  onClose: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
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
  }, [visible, fadeAnim]);

  if (!shouldRender || !booking) return null;

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

  const getAvatarColor = (initials: string) => {
    const colorMap: { [key: string]: string } = {
      PN: '#E0F2FE',
      MR: '#EFF6FF',
      TW: '#F0FDF4',
      DK: '#FEF3C7',
      NO: '#ECFDF5',
      SM: '#FDF2F8',
      JL: '#F3F4F6',
    };
    return colorMap[initials] || '#F3F4F6';
  };

  const getAvatarTextColor = (initials: string) => {
    const textColorMap: { [key: string]: string } = {
      PN: '#0369A1',
      MR: '#1D4ED8',
      TW: '#15803D',
      DK: '#B45309',
      NO: '#047857',
      SM: '#BE185D',
      JL: '#4B5563',
    };
    return textColorMap[initials] || '#4B5563';
  };

  const formatShortDate = (dateStr: string): string => {
    try {
      const parts = dateStr.split(',');
      if (parts.length >= 2) {
        const dayPart = parts[0].trim().substring(0, 3);
        const formattedDay = dayPart.charAt(0).toUpperCase() + dayPart.slice(1).toLowerCase();
        
        const monthDayPart = parts[1].trim().split(' ');
        const month = monthDayPart[0].substring(0, 3);
        const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
        const dayNum = monthDayPart[1];
        return `${formattedDay}, ${formattedMonth} ${dayNum}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const getBookedDate = (dateStr: string): string => {
    try {
      const parts = dateStr.split(',');
      if (parts.length >= 3) {
        const monthDayPart = parts[1].trim().split(' ');
        const month = monthDayPart[0].substring(0, 3);
        const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
        const dayNum = parseInt(monthDayPart[1]);
        const year = parts[2].trim();
        return `${formattedMonth} ${dayNum - 2}, ${year}`;
      }
    } catch (e) {}
    return 'Jul 12, 2026';
  };

  const shortDate = formatShortDate(booking.date);
  const bookedDate = getBookedDate(booking.date);
  const durationLabel = booking.duration === '2 hr' ? '2 hours' : booking.duration;

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={handleDismiss}>
      <Animated.View style={[styles.detailOverlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />

        <Animated.View style={[styles.detailDialog, { opacity: fadeAnim }]}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailHeaderTitle}>Schedule Details</Text>
            <TouchableOpacity onPress={handleDismiss} style={styles.detailCloseBtn} accessibilityLabel="Close Details">
              <Ionicons name="close" size={20} color="#525252" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailBody}>
            <View style={styles.detailProfileRow}>
              <View style={[styles.detailAvatar, { backgroundColor: getAvatarColor(booking.initials) }]}>
                <Text style={[styles.detailAvatarText, { color: getAvatarTextColor(booking.initials) }]}>
                  {booking.initials}
                </Text>
              </View>
              <View style={styles.detailUserInfo}>
                <Text style={styles.detailUserName}>{booking.name}</Text>
                <Text style={styles.detailUserEmail}>{booking.email}</Text>
              </View>
            </View>

            <View style={styles.detailBadgeRow}>
              <View
                style={[
                  styles.detailStatusBadge,
                  booking.status === 'Confirmed' && styles.detailStatusBadgeConfirmed,
                  booking.status === 'Pending' && styles.detailStatusBadgePending,
                  booking.status === 'Cancelled' && styles.detailStatusBadgeCancelled,
                ]}
              >
                <Text
                  style={[
                    styles.detailStatusBadgeText,
                    booking.status === 'Confirmed' && styles.detailStatusBadgeTextConfirmed,
                    booking.status === 'Pending' && styles.detailStatusBadgeTextPending,
                    booking.status === 'Cancelled' && styles.detailStatusBadgeTextCancelled,
                  ]}
                >
                  {booking.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailContentRows}>
              <View style={styles.detailInfoItem}>
                <Ionicons name="calendar-outline" size={18} color="#1A73E8" style={styles.detailIcon} />
                <View>
                  <Text style={styles.detailInfoText}>{shortDate} · {booking.time}</Text>
                  <Text style={styles.detailInfoSubtext}>{durationLabel}</Text>
                </View>
              </View>

              <View style={styles.detailInfoItem}>
                <Ionicons name="location-outline" size={18} color="#E53935" style={styles.detailIcon} />
                <Text style={styles.detailInfoText}>{booking.venueType}</Text>
              </View>

              <View style={styles.detailInfoItem}>
                <Ionicons name="people-outline" size={18} color="#1A73E8" style={styles.detailIcon} />
                <Text style={styles.detailInfoText}>{booking.stage}</Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <Text style={styles.detailFooterText}>Booked {bookedDate}, 9:15 AM</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/* ─── Main Panel Members Screen ─── */
export function PanelistScreen({ onNavPress }: Props) {
  const { logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');
  const [selectedBooking, setSelectedBooking] = useState<PanelMemberBooking | null>(null);

  // Colors for Initials Avatar Badges based on Name
  const getAvatarColor = (initials: string) => {
    const colorMap: { [key: string]: string } = {
      PN: '#E0F2FE', // Priya (blueish)
      MR: '#EFF6FF', // Marcus / John (indigoish)
      TW: '#F0FDF4', // Tom (greenish)
      DK: '#FEF3C7', // David (yellowish)
      NO: '#ECFDF5', // Nadia (emerald)
      SM: '#FDF2F8', // Sofia (pinkish)
      JL: '#F3F4F6', // James (greyish)
    };
    return colorMap[initials] || '#F3F4F6';
  };

  const getAvatarTextColor = (initials: string) => {
    const textColorMap: { [key: string]: string } = {
      PN: '#0369A1',
      MR: '#1D4ED8',
      TW: '#15803D',
      DK: '#B45309',
      NO: '#047857',
      SM: '#BE185D',
      JL: '#4B5563',
    };
    return textColorMap[initials] || '#4B5563';
  };

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    return MOCK_BOOKINGS.filter((b) => {
      // 1. Tab Status Filter
      if (activeTab !== 'All' && b.status !== activeTab) {
        return false;
      }
      // 2. Search Query Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(query);
        const matchesEmail = b.email.toLowerCase().includes(query);
        const matchesDate = b.date.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesDate;
      }
      return true;
    });
  }, [searchQuery, activeTab]);

  // Group by Date for display
  const groupedBookings = useMemo(() => {
    const groups: { [date: string]: PanelMemberBooking[] } = {};
    filteredBookings.forEach((b) => {
      if (!groups[b.date]) {
        groups[b.date] = [];
      }
      groups[b.date].push(b);
    });
    return groups;
  }, [filteredBookings]);

  const uniqueDates = useMemo(() => {
    return Object.keys(groupedBookings);
  }, [groupedBookings]);

  return (
    <View style={[styles.root, webViewportHeight()]}>
      <Sidebar activeKey="pending" onNavPress={onNavPress} />

      <View style={styles.mainColumn}>
        <HeaderBar onLogoutPress={logout} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Header block */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Panel members</Text>
              <Text style={styles.subtitle}>Manage and track panel schedules</Text>
            </View>
            <View style={styles.dateHeaderBadge}>
              <Ionicons name="calendar-outline" size={16} color="#1E61CD" style={{ marginRight: 6 }} />
              <Text style={styles.dateHeaderBadgeText}>Monday, January 19, 2026</Text>
            </View>
          </View>

          {/* Stats card banner */}
          <View style={styles.statsBanner}>
            <View style={styles.statCard}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>TOTAL BOOKED</Text>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statMutedText}>This Academic Year</Text>
              </View>
              <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="calendar-outline" size={20} color="#1E61CD" />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>CONFIRMED</Text>
                <Text style={styles.statNumber}>6</Text>
                <Text style={styles.statMutedText}>Next 7 Days</Text>
              </View>
              <View style={[styles.statIconCircle, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#7C3AED" />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>PENDING</Text>
                <Text style={styles.statNumber}>1</Text>
                <Text style={styles.statMutedText}>Awaiting Action</Text>
              </View>
              <View style={[styles.statIconCircle, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="alert-circle-outline" size={20} color="#EA580C" />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>UPCOMING</Text>
                <Text style={styles.statNumber}>4</Text>
                <Text style={styles.statMutedText}>This Semester</Text>
              </View>
              <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="time-outline" size={20} color="#059669" />
              </View>
            </View>
          </View>

          {/* Filter Row */}
          <View style={styles.filterCard}>
            <View style={styles.filterBarContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name, email, or date..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.segmentedControl}>
                {(['All', 'Confirmed', 'Pending', 'Cancelled'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.segTab, isActive && styles.segTabActive]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text style={[styles.segTabText, isActive && styles.segTabTextActive]}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* List entries */}
            <View style={styles.listContainer}>
              <Text style={styles.bookingsCount}>{filteredBookings.length} bookings shown</Text>

              {uniqueDates.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color="#9CA3AF" style={{ marginBottom: 12 }} />
                  <Text style={styles.emptyStateText}>No bookings match the filters.</Text>
                </View>
              ) : (
                uniqueDates.map((dateKey) => {
                  const bookingsForDate = groupedBookings[dateKey];
                  return (
                    <View key={dateKey} style={styles.dateSection}>
                      <View style={styles.dateHeaderRow}>
                        <Text style={styles.dateHeaderTitle}>{dateKey}</Text>
                      </View>

                      {bookingsForDate.map((b) => (
                        <TouchableOpacity
                          key={b.id}
                          style={styles.bookingRow}
                          onPress={() => setSelectedBooking(b)}
                          activeOpacity={0.7}
                        >
                          {/* Profile block */}
                          <View style={styles.profileCol}>
                            <View style={[styles.avatarCircle, { backgroundColor: getAvatarColor(b.initials) }]}>
                              <Text style={[styles.avatarText, { color: getAvatarTextColor(b.initials) }]}>
                                {b.initials}
                              </Text>
                            </View>
                            <View style={styles.userInfo}>
                              <Text style={styles.userName}>{b.name}</Text>
                              <Text style={styles.userEmail}>{b.email}</Text>
                            </View>
                          </View>

                          {/* Role */}
                          <View style={styles.roleCol}>
                            <Text style={styles.roleText}>{b.role}</Text>
                          </View>

                          {/* Time */}
                          <View style={styles.timeCol}>
                            <Ionicons name="time-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.timeText}>{b.time}</Text>
                          </View>

                          {/* Duration */}
                          <View style={styles.durationCol}>
                            <Text style={styles.durationText}>{b.duration}</Text>
                          </View>

                          {/* Location/Venue type */}
                          <View style={styles.venueCol}>
                            <Ionicons name="location-outline" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                            <Text style={styles.venueText}>{b.venueType}</Text>
                          </View>

                          {/* Status Pill */}
                          <View style={styles.statusCol}>
                            <View
                              style={[
                                styles.statusBadge,
                                b.status === 'Confirmed' && styles.statusBadgeConfirmed,
                                b.status === 'Pending' && styles.statusBadgePending,
                                b.status === 'Cancelled' && styles.statusBadgeCancelled,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  b.status === 'Confirmed' && styles.statusBadgeTextConfirmed,
                                  b.status === 'Pending' && styles.statusBadgeTextPending,
                                  b.status === 'Cancelled' && styles.statusBadgeTextCancelled,
                                ]}
                              >
                                {b.status}
                              </Text>
                            </View>
                          </View>

                          {/* Actions trigger */}
                          <View style={styles.optionsBtn}>
                            <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })
              )}
            </View>

          </View>
        </ScrollView>
      </View>

      <PanelistDetailsModal
        visible={selectedBooking !== null}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#525252',
    marginTop: 4,
  },
  dateHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateHeaderBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  /* Stats banner cards row */
  statsBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statInfo: {
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginVertical: 4,
  },
  statMutedText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Listing filter card container */
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  filterBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    minWidth: 280,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    padding: 0,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  segTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  segTabTextActive: {
    color: '#1A1A1A',
  },

  /* List displays */
  listContainer: {
    flexDirection: 'column',
  },
  bookingsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 10,
  },
  dateHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  dateHeaderCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  profileCol: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  roleCol: {
    flex: 2,
    justifyContent: 'center',
  },
  roleText: {
    fontSize: 13,
    color: '#4B5563',
  },
  timeCol: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#374151',
  },
  durationCol: {
    flex: 1,
    justifyContent: 'center',
  },
  durationText: {
    fontSize: 13,
    color: '#374151',
  },
  venueCol: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueText: {
    fontSize: 13,
    color: '#374151',
  },
  statusCol: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeConfirmed: {
    backgroundColor: '#DEF7EC',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FDE8E8',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextConfirmed: {
    color: '#03543F',
  },
  statusBadgeTextPending: {
    color: '#92400E',
  },
  statusBadgeTextCancelled: {
    color: '#9B1C1C',
  },
  optionsBtn: {
    padding: 6,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  /* ─── Detail Modal (Top Right, #000000 25% Opacity, 300ms dissolve ease out) ─── */
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)', // #000000 25% opacity
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 72,
    paddingRight: 24,
  },
  detailDialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detailCloseBtn: {
    padding: 4,
  },
  detailBody: {
    padding: 24,
  },
  detailProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  detailAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailUserInfo: {
    flexDirection: 'column',
  },
  detailUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detailUserEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  detailBadgeRow: {
    marginBottom: 20,
  },
  detailStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailStatusBadgeConfirmed: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  detailStatusBadgePending: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
  },
  detailStatusBadgeCancelled: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  detailStatusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailStatusBadgeTextConfirmed: {
    color: '#2E7D32',
  },
  detailStatusBadgeTextPending: {
    color: '#EF6C00',
  },
  detailStatusBadgeTextCancelled: {
    color: '#C62828',
  },
  detailContentRows: {
    gap: 16,
    marginBottom: 20,
  },
  detailInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 20,
  },
  detailInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  detailInfoSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  detailFooterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
