import { Request, Response } from 'express';
import { inMemStore, DbHospital } from '../services/store.service';

export async function getAllHospitals(req: Request, res: Response) {
  try {
    const { city, query } = req.query;

    let hospitals = inMemStore.hospitals;

    if (city && typeof city === 'string' && city.trim() !== '' && city.toLowerCase() !== 'all') {
      hospitals = hospitals.filter((h) => h.city.toLowerCase() === city.toLowerCase());
    }

    if (query && typeof query === 'string' && query.trim() !== '') {
      const q = query.toLowerCase();
      hospitals = hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.departments?.some((d) => d.toLowerCase().includes(q))
      );
    }

    const data = hospitals.map((h) => {
      const affiliatedDoctors = inMemStore.affiliations
        .filter((aff) => aff.hospitalId === h.id)
        .map((aff) => {
          const doc = inMemStore.doctors.find((d) => d.id === aff.doctorId);
          const user = doc ? inMemStore.users.find((u) => u.id === doc.userId) : null;
          return doc && user ? { id: doc.id, name: user.name, fee: aff.consultationFee } : null;
        })
        .filter(Boolean);

      return {
        ...h,
        doctorCount: affiliatedDoctors.length,
        doctors: affiliatedDoctors,
      };
    });

    return res.json({ success: true, count: data.length, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getHospitalById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const hospital = inMemStore.hospitals.find((h) => h.id === id || h.slug === id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    const doctors = inMemStore.affiliations
      .filter((aff) => aff.hospitalId === hospital.id)
      .map((aff) => {
        const doc = inMemStore.doctors.find((d) => d.id === aff.doctorId);
        if (!doc) return null;
        const user = inMemStore.users.find((u) => u.id === doc.userId);
        const docSpecs = inMemStore.doctorSpecialties
          .filter((ds) => ds.doctorId === doc.id)
          .map((ds) => inMemStore.specialties.find((s) => s.id === ds.specialtyId))
          .filter(Boolean);

        return {
          id: doc.id,
          name: user?.name,
          avatarUrl: user?.avatarUrl,
          qualifications: doc.qualifications,
          experienceYears: doc.experienceYears,
          specialty: docSpecs[0]?.name || 'General',
          consultationFee: aff.consultationFee,
        };
      })
      .filter(Boolean);

    return res.json({
      success: true,
      data: {
        ...hospital,
        doctors,
        doctorCount: doctors.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createHospital(req: Request, res: Response) {
  try {
    const { name, address, city, state, pincode, phone, email, departments } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newHospital: DbHospital = {
      id: `hosp-${Date.now()}`,
      name,
      slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
      address,
      city,
      state: state || 'Haryana',
      pincode,
      phone,
      email,
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      isVerified: false,
      isDemo: false,
      departments: Array.isArray(departments) ? departments : ['General Medicine'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemStore.hospitals.push(newHospital);

    return res.status(201).json({ success: true, data: newHospital });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
