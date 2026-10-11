import { Request, Response } from 'express';
import { inMemStore } from '../services/store.service';
import { calculateDoctorAvailability } from '../services/availability.service';

export async function getAllDoctors(req: Request, res: Response) {
  try {
    const { city, specialty, query, hospitalId, maxFee, date } = req.query;

    const targetDate = (date as string) || new Date().toISOString().split('T')[0];

    const results = await Promise.all(
      inMemStore.doctors.map(async (doc) => {
        const user = inMemStore.users.find((u) => u.id === doc.userId);
        if (!user) return null;

        // Specialties
        const docSpecs = inMemStore.doctorSpecialties
          .filter((ds) => ds.doctorId === doc.id)
          .map((ds) => inMemStore.specialties.find((s) => s.id === ds.specialtyId))
          .filter(Boolean);

        // Hospitals
        const docHospitals = inMemStore.affiliations
          .filter((aff) => aff.doctorId === doc.id)
          .map((aff) => {
            const h = inMemStore.hospitals.find((hosp) => hosp.id === aff.hospitalId);
            return h ? { ...h, consultationFee: aff.consultationFee } : null;
          })
          .filter(Boolean);

        // Filter: City
        if (city && typeof city === 'string' && city.trim() !== '' && city.toLowerCase() !== 'all') {
          const matchDocCity = doc.city.toLowerCase() === city.toLowerCase();
          const matchHospCity = docHospitals.some((h) => h?.city.toLowerCase() === city.toLowerCase());
          if (!matchDocCity && !matchHospCity) return null;
        }

        // Filter: Specialty
        if (specialty && typeof specialty === 'string' && specialty.trim() !== '' && specialty.toLowerCase() !== 'all') {
          const matchSpec = docSpecs.some(
            (s) => s?.slug.toLowerCase() === specialty.toLowerCase() || s?.name.toLowerCase() === specialty.toLowerCase()
          );
          if (!matchSpec) return null;
        }

        // Filter: Hospital
        if (hospitalId && typeof hospitalId === 'string' && hospitalId.trim() !== '') {
          const matchHosp = docHospitals.some((h) => h?.id === hospitalId);
          if (!matchHosp) return null;
        }

        // Filter: Max Fee
        if (maxFee) {
          const numFee = Number(maxFee);
          if (doc.consultationFee > numFee) return null;
        }

        // Filter: Query (name, bio, qualifications, hospital name)
        if (query && typeof query === 'string' && query.trim() !== '') {
          const q = query.toLowerCase();
          const matchName = user.name.toLowerCase().includes(q);
          const matchBio = doc.bio.toLowerCase().includes(q);
          const matchQual = doc.qualifications.toLowerCase().includes(q);
          const matchHosp = docHospitals.some((h) => h?.name.toLowerCase().includes(q));
          const matchSpec = docSpecs.some((s) => s?.name.toLowerCase().includes(q));
          if (!matchName && !matchBio && !matchQual && !matchHosp && !matchSpec) return null;
        }

        // Calculate availability for targetDate
        const availability = await calculateDoctorAvailability(doc.id, targetDate);

        return {
          id: doc.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          specialty: docSpecs[0]?.name || 'General Practice',
          specialties: docSpecs,
          qualifications: doc.qualifications,
          experienceYears: doc.experienceYears,
          bio: doc.bio,
          city: doc.city,
          state: doc.state,
          consultationFee: doc.consultationFee,
          isVerified: doc.isVerified,
          isDemo: doc.isDemo,
          hospitals: docHospitals,
          availabilityStatus: availability.status,
          availabilityStatusLabel: availability.statusLabel,
          availableSlotsCount: availability.availableSlots,
          totalSlotsCount: availability.totalSlots,
          targetDate,
        };
      })
    );

    const filtered = results.filter(Boolean);
    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getDoctorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doc = inMemStore.doctors.find((d) => d.id === id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    const user = inMemStore.users.find((u) => u.id === doc.userId);
    const docSpecs = inMemStore.doctorSpecialties
      .filter((ds) => ds.doctorId === doc.id)
      .map((ds) => inMemStore.specialties.find((s) => s.id === ds.specialtyId))
      .filter(Boolean);

    const docHospitals = inMemStore.affiliations
      .filter((aff) => aff.doctorId === doc.id)
      .map((aff) => {
        const h = inMemStore.hospitals.find((hosp) => hosp.id === aff.hospitalId);
        return h ? { ...h, consultationFee: aff.consultationFee } : null;
      })
      .filter(Boolean);

    const schedules = inMemStore.schedules.filter((s) => s.doctorId === doc.id);
    const exceptions = inMemStore.exceptions.filter((e) => e.doctorId === doc.id);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAvailability = await calculateDoctorAvailability(doc.id, todayStr);

    return res.json({
      success: true,
      data: {
        id: doc.id,
        userId: user?.id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        avatarUrl: user?.avatarUrl,
        specialty: docSpecs[0]?.name || 'General Practice',
        specialties: docSpecs,
        qualifications: doc.qualifications,
        experienceYears: doc.experienceYears,
        bio: doc.bio,
        city: doc.city,
        state: doc.state,
        consultationFee: doc.consultationFee,
        isVerified: doc.isVerified,
        isDemo: doc.isDemo,
        hospitals: docHospitals,
        schedules,
        exceptions,
        todayAvailability,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getDoctorAvailability(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const doc = inMemStore.doctors.find((d) => d.id === id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    const targetDate = (date as string) || new Date().toISOString().split('T')[0];
    const availability = await calculateDoctorAvailability(id, targetDate);

    return res.json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
