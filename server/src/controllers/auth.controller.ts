import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { inMemStore, DbUser } from '../services/store.service';
import { ENV } from '../config/env';
import { UserRole } from '@vacantup/shared';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role = 'PATIENT', phone } = req.body;

    const existingUser = inMemStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: DbUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: role as UserRole,
      phone: phone || null,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemStore.users.push(newUser);

    // If registered as DOCTOR, also create doctor profile stub
    if (role === 'DOCTOR') {
      inMemStore.doctors.push({
        id: `doc-${Date.now()}`,
        userId: newUser.id,
        qualifications: 'MBBS',
        experienceYears: 1,
        bio: 'Practicing doctor on VacantUp platform',
        consultationFee: 500,
        isVerified: false,
        isDemo: false,
        city: 'Karnal',
        state: 'Haryana',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = inMemStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const user = inMemStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let doctorProfile = null;
    if (user.role === 'DOCTOR') {
      doctorProfile = inMemStore.doctors.find((d) => d.userId === user.id) || null;
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        doctorProfile,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function logout(req: Request, res: Response) {
  return res.json({ success: true, message: 'Logged out successfully' });
}
