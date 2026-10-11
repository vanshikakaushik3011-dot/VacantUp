import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

describe('VacantUp Web Application', () => {
  it('renders VacantUp branding and hero header on home page', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify brand title and hero content
    expect(screen.getAllByText(/Vacant/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Healthcare Appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/Without the Wait/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Find Available Doctors/i).length).toBeGreaterThan(0);
  });

  it('renders login page with quick demo accounts', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Sign In to VacantUp/i)).toBeInTheDocument();
    expect(screen.getByText(/patient@vacantup.com/i)).toBeInTheDocument();
    expect(screen.getByText(/doctor@vacantup.com/i)).toBeInTheDocument();
  });
});
