'use client';
import React from 'react';
import { ArrowLeft, Zap, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function UpdrsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12">
      <Link href="/" className="flex items-center gap-2 text-blue-400 mb-8 font-bold">
        <ArrowLeft size={20} /> Volver a la Consola
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-blue-600 rounded-3xl"><Zap size={32} /></div>
          <div>
            <h1 className="text-4xl font-black">Escala UPDRS</h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mt-1">Monitoreo de Síntomas Motores</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ClipboardList className="text-blue-400" /> Parte III: Examen Motor</h3>
            <ul className="space-y-4">
              {["Temblor en reposo", "Bradicinesia", "Rigidez", "Estabilidad Postural"].map(sintoma => (
                <li key={sintoma} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-sm font-medium">{sintoma}</span>
                  <select className="bg-slate-800 text-xs p-2 rounded-lg border-none">
                    <option>0 - Normal</option>
                    <option>1 - Leve</option>
                    <option>2 - Moderado</option>
                    <option>3 - Grave</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-600 p-8 rounded-[40px] flex flex-col justify-center text-center">
            <h4 className="text-2xl font-black mb-2">Validación de Datos</h4>
            <p className="text-blue-100 text-sm mb-6">El registro de síntomas motoras permite ajustar el nivel de dificultad de los Exergames de Realidad Virtual.</p>
            <button className="py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-wider hover:bg-blue-50 transition-all">Generar Reporte Clínico</button>
          </div>
        </div>
      </div>
    </div>
  );
}