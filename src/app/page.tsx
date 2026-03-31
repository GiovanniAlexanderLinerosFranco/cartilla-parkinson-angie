'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, Gamepad2, ClipboardCheck, 
  Layers, X, GraduationCap, Play, Pause, RotateCcw, Save
} from 'lucide-react';

export default function CartillaInteractiva() {
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(2700);
  const [timerActivo, setTimerActivo] = useState(false);
  const [progreso, setProgreso] = useState("");

  useEffect(() => {
    let intervalo: any;
    if (timerActivo && segundos > 0) {
      intervalo = setInterval(() => setSegundos((s) => s - 1), 1000);
    } else {
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [timerActivo, segundos]);

  const formatearTiempo = (s: number) => {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  const detallesPruebas: Record<string, { desc: string; obj: string }> = {
    TUG:   { desc: 'Timed Up and Go: El paciente se levanta, camina 3m y regresa.', obj: 'Evaluar riesgo de caídas.' },
    BBS:   { desc: 'Escala de Berg: 14 ítems de equilibrio estático y dinámico.', obj: 'Determinar independencia funcional.' },
    FGA:   { desc: 'Functional Gait Assessment: Evaluación de la marcha avanzada.', obj: 'Detectar fallos en control postural.' },
    UPDRS: { desc: 'Escala unificada para Parkinson: Evaluación de síntomas motores.', obj: 'Monitorizar progresión de la enfermedad.' },
  };

  const infosBotones: Record<string, { titulo: string; subtitulo: string }> = {
    TUG:   { titulo: 'TUG Cognitivo',  subtitulo: 'Movilidad y Doble Tarea' },
    BBS:   { titulo: 'BBS',            subtitulo: 'Equilibrio Estático/Dinámico' },
    FGA:   { titulo: 'FGA',            subtitulo: 'Marcha con Biofeedback' },
    UPDRS: { titulo: 'UPDRS',          subtitulo: 'Progresión Motora' },
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b px-6 py-10 text-center shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-2 mb-2 text-red-800">
            <GraduationCap size={20} />
            <span className="font-bold tracking-widest uppercase text-[10px]">Universidad Manuela Beltrán</span>
          </div>
          <h1 className="text-3xl font-extrabold">Prevención de Caídas en Parkinson</h1>
          <p className="text-slate-500 italic text-sm mt-2">"Diseño y validación de herramienta RV" — Angie Alejandra Amado Téllez</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Fila 1: Perfil y Tecnologías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario Perfil del Paciente */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-800">
              <ShieldCheck /> Perfil del Paciente
            </h3>
            <div className="space-y-3">
              <input type="text" placeholder="Nombre Completo" className="w-full p-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <select className="p-2 border rounded-lg text-sm">
                  <option>Estadio Hoehn y Yahr (I-III)</option>
                  <option>Estadio I</option>
                  <option>Estadio II</option>
                  <option>Estadio III</option>
                </select>
                <input type="number" placeholder="Puntaje MMSE" className="p-2 border rounded-lg text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Evaluación Socio-Ambiental (Red de Apoyo / Barreras en Hogar)
                </label>
                <input
                  type="text"
                  placeholder="Describa la red de apoyo y barreras identificadas en el entorno del paciente"
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-400">Requisito: Estadios I-III y MMSE ≥ 24.</p>
            </div>
          </section>

          {/* Piloto Tecnologías RV */}
          <section className="bg-gradient-to-br from-red-700 to-red-900 p-6 rounded-3xl shadow-lg text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Gamepad2 /> Piloto Tecnologías RV
            </h3>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
              <h4 className="font-bold text-sm">Entorno: Exergames Inmersivos</h4>
              <p className="text-xs text-red-100 mt-1">Simulación de marcha con estímulos multisensoriales para potenciar neuroplasticidad.</p>
              <button className="mt-4 w-full py-2 bg-white text-red-800 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors">
                Lanzar Simulación Piloto
              </button>
            </div>
          </section>
        </div>

        {/* Fila 2: Seguimiento Meta Terapéutica */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-600">
            <Activity /> Seguimiento Meta Terapéutica
          </h3>
          <div className="flex gap-4">
            <textarea
              value={progreso}
              onChange={(e) => setProgreso(e.target.value)}
              placeholder="Registro diario del progreso del paciente..."
              className="flex-1 p-3 border rounded-xl text-sm h-24"
            />
            <button className="bg-emerald-600 text-white p-4 rounded-xl flex flex-col items-center justify-center hover:bg-emerald-700 transition-colors">
              <Save size={20} />
              <span className="text-[10px] font-bold mt-1 uppercase">Guardar</span>
            </button>
          </div>
        </section>

        {/* Fila 3: Protocolo con Timer */}
        <section className="bg-slate-900 text-white rounded-[40px] p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Layers className="text-red-400" /> Monitoreo de Sesión
            </h2>
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-6">
              <span className="text-3xl font-mono font-bold text-red-400">{formatearTiempo(segundos)}</span>
              <div className="flex gap-2">
                <button onClick={() => setTimerActivo(!timerActivo)} className="p-2 bg-red-800 rounded-full">
                  {timerActivo ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={() => { setSegundos(2700); setTimerActivo(false); }} className="p-2 bg-slate-700 rounded-full">
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border ${segundos > 2400 ? 'bg-red-800 border-white' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <h4 className="font-bold text-xs uppercase">1. Calentamiento (5 min)</h4>
              <p className="text-[10px] text-red-100">Movilidad y respiración consciente.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${segundos <= 2400 && segundos > 600 ? 'bg-red-800 border-white' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <h4 className="font-bold text-xs uppercase">2. Intervención RV (30 min)</h4>
              <p className="text-[10px] text-red-100">Estímulos multisensoriales.</p>
            </div>
            <div className={`p-4 rounded-2xl border ${segundos <= 600 && segundos > 0 ? 'bg-red-800 border-white' : 'bg-white/5 border-white/10 opacity-50'}`}>
              <h4 className="font-bold text-xs uppercase">3. Enfriamiento (10 min)</h4>
              <p className="text-[10px] text-red-100">Estiramientos y feedback.</p>
            </div>
          </div>
        </section>

        {/* Batería de Evaluación Clínica Interactiva */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ClipboardCheck className="text-red-800" /> Batería de Evaluación Clínica
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(detallesPruebas).map((test) => (
              <button
                key={test}
                onClick={() => setPruebaSeleccionada(test)}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                  pruebaSeleccionada === test
                    ? 'border-red-800 bg-red-50 text-red-800'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-red-200'
                }`}
              >
                <span className="font-black text-xl">{infosBotones[test].titulo}</span>
                <span className="text-[11px] font-normal opacity-70 text-center leading-tight">
                  {infosBotones[test].subtitulo}
                </span>
              </button>
            ))}
          </div>

          {pruebaSeleccionada && (
            <div className="mt-6 p-6 bg-white border-l-8 border-red-800 rounded-2xl shadow-lg animate-in fade-in slide-in-from-left-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Herramienta: {infosBotones[pruebaSeleccionada].titulo}</h3>
                <button onClick={() => setPruebaSeleccionada(null)} className="text-slate-300 hover:text-red-500"><X /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-red-800 font-bold uppercase text-[10px] mb-1">Descripción</h4>
                  <p>{detallesPruebas[pruebaSeleccionada].desc}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 font-bold uppercase text-[10px] mb-1">Objetivo</h4>
                  <p>{detallesPruebas[pruebaSeleccionada].obj}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Escudo Legal */}
        <footer className="text-center">
          <p className="text-xs text-gray-500">
            * Esta herramienta es un Asistente de Decisión Clínica y no sustituye el criterio profesional del fisioterapeuta. Diseñado para promover el enriquecimiento ambiental en fases tempranas.
          </p>
        </footer>
      </main>

      <footer className="bg-white border-t p-8 text-center text-slate-400 text-[10px]">
        <p>© 2026 Universidad Manuela Beltrán — Facultad de Ciencias de la Salud</p>
      </footer>
    </div>
  );
}