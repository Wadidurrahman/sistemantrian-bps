'use client';

import { useState } from 'react';
import MenuUtama from './../components/tamu/MenuUtama';
import FormAntrean from './../components/tamu/FormAntrean';
import LayananRegistrasi from './../components/tamu/LayananRegistrasi';
import FormBukuTamu from './../components/tamu/FormAntrean';

export default function PortalTamu() {
  const [view, setView] = useState<'menu' | 'antrean' | 'registrasi' | 'bukutamu'>('menu');

  if (view === 'antrean') return <FormAntrean onBack={() => setView('menu')} />;
  if (view === 'registrasi') return <LayananRegistrasi onBack={() => setView('menu')} />;
  if (view === 'bukutamu') return <FormBukuTamu onBack={() => setView('menu')} />;
  return <MenuUtama onNavigate={setView} />;
}