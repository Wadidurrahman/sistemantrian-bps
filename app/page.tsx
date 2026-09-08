'use client';

import { useState } from 'react';
import MenuUtama from '@/components/tamu/MenuUtama';
import FormAntrean from '@/components/tamu/FormAntrean';
import LayananRegistrasi from '@/components/tamu/LayananRegistrasi';
import BukuTamu from '@/components/tamu/BukuTamu';

type ViewState = 'menu' | 'antrean' | 'registrasi' | 'bukutamu';

export default function Home() {
  const [view, setView] = useState<ViewState>('menu');

  if (view === 'antrean') {
    return <FormAntrean onBack={() => setView('menu')} />;
  }

  if (view === 'bukutamu') {
    return <BukuTamu onBack={() => setView('menu')} />;
  }

  if (view === 'registrasi') {
    return <LayananRegistrasi type={view} onBack={() => setView('menu')} />;
  }
  return <MenuUtama onNavigate={(selectedView) => setView(selectedView as ViewState)} />;
}