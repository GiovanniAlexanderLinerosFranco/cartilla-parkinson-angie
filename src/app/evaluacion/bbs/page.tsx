'use client';
import React, { useState } from 'react';
import { ArrowLeft, Calculator, Save, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function BbsPage() {
  const [puntajes, setPuntajes] = useState<number[]>(new Array(14).fill(0));
  const total = puntajes.reduce((a, b) => a + b, 0);

  const items = [
    "1. De sedestación a bipedestación", "2. Bipedestación sin apoyo",
    "3. Sentado sin apoyo dorsal", "4. De bipedestación a sedestación",
    "5. Transferencias", "6. Bipedestación con ojos cerrados",
    "7. Bipedestación con pies juntos", "8. Alcanzar hacia delante con brazo extendido",
    "9. Recoger objeto del suelo", "10. Girar para mirar atrás",
    "11. Girar 360 grados", "12. Situar pies alternativamente en un escalón",
    "13. Bipedestación con un pie adelantado", "14. Bipedestación sobre un solo pie"
  ];

  const manejarCambio = (index: number, valor: number) => {
    const nuevosPuntajes = [...puntajes];
    nuevosPuntajes[index] = valor;
    setPuntajes(nuevosPuntajes);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <Link href="/" className="flex items-center gap-2 text-blue-600 mb-8 hover:underline font-bold">
        <ArrowLeft size={20} /> Volver al Inicio
      </Link>

      <div className="max-w-4xl mx-auto bg-white rounded-[40px] p-8 shadow-xl border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Escala de Berg (BBS)</h1>
            <p className="text-slate-500 italic">Evaluación de equilibrio estático y dinámico.</p>
          </div>
          <div className="bg-blue-600 text-white px-8 py-4 rounded-3xl text-center shadow-lg">
            <span className="block text-xs uppercase font-bold opacity-80">Puntaje Total</span>
            <span className="text-4xl font-black">{total}/56</span>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl gap-4">
              <span className="text-sm font-bold text-slate-700">{item}</span>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((v) => (
                  <button
                    key={v}
                    onClick={() => manejarCambio(idx, v)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${puntajes[idx] === v ? 'bg-blue-600 text-white scale-110 shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white flex justify-between items-center">
          <div>
            <h4 className="font-bold text-blue-400">Interpretación:</h4>
            <p className="text-sm text-slate-300">
              {total <= 20 ? "Riesgo alto de caída (Silla de ruedas)" : total <= 40 ? "Riesgo medio de caída (Asistencia)" : "Riesgo bajo de caída (Independiente)"}
            </p>
          </div>
          <button className="bg-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700">
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}