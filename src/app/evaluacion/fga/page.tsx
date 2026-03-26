'use client';
import React, { useState } from 'react';
import { ArrowLeft, Activity, Info } from 'lucide-react';
import Link from 'next/link';

export default function FgaPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <Link href="/" className="flex items-center gap-2 text-blue-600 mb-8 font-bold">
        <ArrowLeft size={20} /> Volver
      </Link>

      <div className="max-w-3xl mx-auto bg-white rounded-[32px] p-8 shadow-sm border">
        <h1 className="text-3xl font-black mb-4">Functional Gait Assessment (FGA)</h1>
        <div className="bg-indigo-50 p-4 rounded-2xl mb-8 flex items-start gap-3 border border-indigo-100">
          <Info className="text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-800">Esta prueba evalúa el control postural durante la marcha. Incluye caminar con ojos cerrados, giros y pasos sobre obstáculos.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 transition-colors">
            <h3 className="font-bold mb-4 text-slate-800 italic">"Caminar 6 metros con cambios en la velocidad de la marcha..."</h3>
            <div className="grid grid-cols-4 gap-2">
              {[0,1,2,3].map(n => (
                <button key={n} className="py-3 border rounded-xl font-bold text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">Nivel {n}</button>
              ))}
            </div>
          </div>
          <p className="text-center text-slate-400 text-sm">Componentes del FGA habilitados para el prototipo digital.</p>
        </div>
      </div>
    </div>
  );
}