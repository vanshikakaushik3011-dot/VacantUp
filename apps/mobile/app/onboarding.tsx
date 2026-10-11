import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMobileAuth } from '../context/AuthContext';
import { CalendarCheck2, Search, Clock, ShieldCheck, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Find Doctors Instantly',
    description: 'Discover top certified medical specialists in your city across clinics and hospitals.',
    icon: Search,
    color: '#0284c7',
  },
  {
    id: 2,
    title: 'Real-Time Availability',
    description: 'Check live OPD slot vacancies, break periods, and avoid unneeded hospital travel.',
    icon: Clock,
    color: '#0d9488',
  },
  {
    id: 3,
    title: 'Instant Booking Pass',
    description: 'Reserve your appointment in seconds and receive an official booking reference code.',
    icon: CalendarCheck2,
    color: '#0284c7',
  },
  {
    id: 4,
    title: 'Manage Your Care',
    description: 'Reschedule, cancel, or review past consultations with cross-device sync.',
    icon: ShieldCheck,
    color: '#0d9488',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useMobileAuth();
  const router = useRouter();

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Skip */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandVacant}>Vacant</Text>
          <Text style={styles.brandUp}>Up</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: `${slide.color}15` }]}>
          <IconComponent size={64} color={slide.color} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        {/* Indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? [styles.activeDot, { backgroundColor: slide.color }] : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: slide.color }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <ChevronRight size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  brandRow: {
    flexDirection: 'row',
  },
  brandVacant: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  brandUp: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0284c7',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 130,
    height: 130,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#e2e8f0',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    gap: 6,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
