'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { X, Upload, Trash2, Image as ImageIcon, AlertCircle, Type, Save } from 'lucide-react';

export default function DisplaySettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State untuk Running Text
  const [runningText, setRunningText] = useState('');
  const [savingText, setSavingText] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      fetchRunningText();
    }
  }, [isOpen]);

  const fetchRunningText = async () => {
    const { data } = await supabase.from('app_settings').select('running_text').eq('id', 1).single();
    if (data && data.running_text) {
      setRunningText(data.running_text);
    }
  };

  const handleSaveText = async () => {
    setSavingText(true);
    await supabase.from('app_settings').update({ running_text: runningText }).eq('id', 1);
    setSavingText(false);
    alert('Teks berjalan berhasil disimpan!');
  };

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('display_media').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setMediaList(data);
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

    if (!isImage && !isVideo) {
      alert('Format file tidak didukung! Harap pilih gambar atau video.');
      return;
    }

    if (file.size > maxSize) {
      alert(`Ukuran file terlalu besar! Maksimal ukuran adalah ${isVideo ? '50MB untuk video' : '5MB untuk gambar'}.`);
      return;
    }

    setSelectedFile(file);
    setShowConfirm(true);
  };

  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses gambar untuk konversi.'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const webpFile = new File([blob], newFileName, { type: 'image/webp' });
              resolve(webpFile);
            } else {
              reject(new Error('Gagal mengkonversi ke format WebP.'));
            }
          },
          'image/webp',
          0.9 
        );
      };
      img.onerror = () => reject(new Error('Gagal memuat file gambar.'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setShowConfirm(false);

    try {
      let fileToUpload = selectedFile;
      const isImage = selectedFile.type.startsWith('image/');

      if (isImage && selectedFile.type !== 'image/webp' && selectedFile.type !== 'image/gif' && selectedFile.type !== 'image/svg+xml') {
        try {
          fileToUpload = await convertToWebP(selectedFile);
        } catch (convertError) {
          console.warn('Konversi WebP gagal, menggunakan file asli.', convertError);
        }
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('display-media').upload(filePath, fileToUpload);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('display-media').getPublicUrl(filePath);
      const mediaType = fileToUpload.type.startsWith('video/') ? 'video' : 'image';

      const { error: dbError } = await supabase.from('display_media').insert([
        {
          title: selectedFile.name,
          url: publicUrlData.publicUrl,
          media_type: mediaType,
          is_active: true
        }
      ]);

      if (dbError) throw dbError;

      alert('Media berhasil diunggah!');
      setSelectedFile(null);
      fetchMedia();
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunggah media: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus media ini dari daftar display?')) return;

    try {
      const { error } = await supabase.from('display_media').delete().eq('id', id);
      if (error) throw error;
      fetchMedia();
    } catch (err: any) {
      alert('Gagal menghapus media: ' + err.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('display_media').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      fetchMedia();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-sm max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Pengaturan Display TV</h3>
            <p className="text-[11px] text-slate-500">Atur teks berjalan dan daftar media slideshow.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Form Edit Running Text */}
        <div className="py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
              <Type size={14} /> Teks Berjalan (Running Text)
            </label>
            <button
              onClick={handleSaveText}
              disabled={savingText}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-70 shadow-sm"
            >
              {savingText ? 'Menyimpan...' : <><Save size={12} /> Simpan Teks</>}
            </button>
          </div>
          <textarea
            value={runningText}
            onChange={(e) => setRunningText(e.target.value)}
            placeholder="Masukkan teks pengumuman untuk layar display TV..."
            className="w-full bg-slate-50 border border-slate-300 rounded-sm p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 min-h-[60px] resize-none"
          />
        </div>

        <div className="py-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white gap-3">
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase">Kelola Media Slideshow</p>
            <p className="text-[10px] text-slate-500">Maks. Gambar: 5MB (Jadi WebP) | Maks. Video: 50MB</p>
          </div>
          <label className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm flex items-center gap-1.5">
            <Upload size={14} /> {uploading ? 'Memproses...' : 'Upload File'}
            <input type="file" accept="image/*,video/*" onChange={handleFileSelect} disabled={uploading} className="hidden" />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400 uppercase font-bold">Memuat data media...</div>
          ) : mediaList.length > 0 ? (
            mediaList.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 border border-slate-200 rounded-sm shadow-xs gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-sm overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                    {item.media_type === 'image' ? (
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-600 uppercase">VIDEO</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 uppercase truncate">{item.title}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.is_active ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-500 border border-slate-300'}`}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors ${item.is_active ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                  >
                    {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Hapus Media"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-sm">
              <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase">Belum ada media tersimpan</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase rounded-sm transition-colors">
            Tutup
          </button>
        </div>
      </div>

      {showConfirm && selectedFile && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-sm max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <AlertCircle size={40} className="mx-auto text-amber-500 mb-2" />
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-1">Konfirmasi Upload</h4>
            <p className="text-xs text-slate-600 mb-4 break-all">
              File: <span className="font-bold">{selectedFile.name}</span> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => { setShowConfirm(false); setSelectedFile(null); }}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-sm hover:bg-slate-300 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmUpload}
                className="px-4 py-2 bg-blue-900 text-white text-xs font-bold uppercase rounded-sm hover:bg-blue-800 transition-colors"
              >
                Ya, Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}