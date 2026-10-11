import { Request, Response } from 'express';
import { inMemStore } from '../services/store.service';
import { SUPPORTED_CITIES } from '@vacantup/shared';

export async function getCities(req: Request, res: Response) {
  try {
    // Gather cities from doctors and hospitals as well as SUPPORTED_CITIES
    const citySet = new Set<string>(SUPPORTED_CITIES);
    inMemStore.hospitals.forEach((h) => citySet.add(h.city));
    inMemStore.doctors.forEach((d) => citySet.add(d.city));

    const cities = Array.from(citySet).map((name) => {
      const doctorCount = inMemStore.doctors.filter((d) => d.city.toLowerCase() === name.toLowerCase()).length;
      const hospitalCount = inMemStore.hospitals.filter((h) => h.city.toLowerCase() === name.toLowerCase()).length;
      return {
        name,
        doctorCount,
        hospitalCount,
      };
    });

    return res.json({ success: true, data: cities });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSpecialties(req: Request, res: Response) {
  try {
    const data = inMemStore.specialties.map((spec) => {
      const doctorCount = inMemStore.doctorSpecialties.filter((ds) => ds.specialtyId === spec.id).length;
      return {
        ...spec,
        doctorCount,
      };
    });

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
