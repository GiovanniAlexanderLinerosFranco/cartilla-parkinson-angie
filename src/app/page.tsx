'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Activity, ShieldCheck, ClipboardCheck, 
  Layers, X, GraduationCap, Play, Pause, RotateCcw, Save
} from 'lucide-react';

const BBS_ITEMS = [
  'Sedente a bipedestación',
  'Bipedestación sin apoyo',
  'Sedente sin apoyo',
  'Bipedestación a sedente',
  'Transferencias',
  'Bipedestación con ojos cerrados',
  'Bipedestación con pies juntos',
  'Alcance hacia adelante con brazo extendido',
  'Recoger objeto del piso',
  'Giro para mirar atrás',
  'Giro de 360 grados',
  'Colocar un pie sobre escalón',
  'Bipedestación en tándem',
  'Bipedestación a una pierna',
];

const FGA_ITEMS = [
  'Marcha en superficie plana',
  'Cambio de velocidad de marcha',
  'Marcha con giro horizontal de cabeza',
  'Marcha con giro vertical de cabeza',
  'Giro y pivote durante la marcha',
  'Paso sobre obstáculo',
  'Marcha con base estrecha',
  'Marcha con ojos cerrados',
  'Marcha hacia atrás',
  'Subir y bajar escaleras',
];

export default function CartillaInteractiva() {
  const [mostrarEscudoAcceso, setMostrarEscudoAcceso] = useState(true);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(2700);
  const [timerActivo, setTimerActivo] = useState(false);
  const [tugCorriendo, setTugCorriendo] = useState(false);
  const [tugTiempoMs, setTugTiempoMs] = useState(0);
  const [tugRegistradoMs, setTugRegistradoMs] = useState<number | null>(null);
  const [progreso, setProgreso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [perfilPaciente, setPerfilPaciente] = useState({
    nombre: '',
    estadio: '',
    evaluacionSocioAmbiental: '',
  });
  const [updrs, setUpdrs] = useState('');
  const [puntajesBbs, setPuntajesBbs] = useState<number[]>(Array(14).fill(-1));
  const [puntajesFga, setPuntajesFga] = useState<number[]>(Array(10).fill(-1));
  const [resultadosClinicos, setResultadosClinicos] = useState({
    tugCognitivo: '',
    berg: '',
    fga: '',
    updrs: '',
  });
  const [bpm, setBpm] = useState(60);
  const [metronomoActivo, setMetronomoActivo] = useState(false);
  const [pulsoVisual, setPulsoVisual] = useState(false);
  const tugInicioRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervaloMetronomoRef = useRef<number | null>(null);

  useEffect(() => {
    let intervalo: any;
    if (timerActivo && segundos > 0) {
      intervalo = setInterval(() => setSegundos((s) => s - 1), 1000);
    } else {
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [timerActivo, segundos]);

  useEffect(() => {
    let frameId = 0;
    const actualizarTug = () => {
      if (tugInicioRef.current !== null) {
        setTugTiempoMs(Date.now() - tugInicioRef.current);
        frameId = requestAnimationFrame(actualizarTug);
      }
    };

    if (tugCorriendo) {
      tugInicioRef.current = Date.now() - tugTiempoMs;
      frameId = requestAnimationFrame(actualizarTug);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [tugCorriendo, tugTiempoMs]);

  useEffect(() => {
    const reproducirPulso = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (!ctx) {
        return;
      }

      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.08);

      setPulsoVisual(true);
      window.setTimeout(() => setPulsoVisual(false), 120);
    };

    if (metronomoActivo) {
      const intervalo = Math.round(60000 / bpm);
      reproducirPulso();
      intervaloMetronomoRef.current = window.setInterval(reproducirPulso, intervalo);
    } else if (intervaloMetronomoRef.current !== null) {
      window.clearInterval(intervaloMetronomoRef.current);
      intervaloMetronomoRef.current = null;
    }

    return () => {
      if (intervaloMetronomoRef.current !== null) {
        window.clearInterval(intervaloMetronomoRef.current);
        intervaloMetronomoRef.current = null;
      }
    };
  }, [metronomoActivo, bpm]);

  useEffect(() => {
    return () => {
      if (intervaloMetronomoRef.current !== null) {
        window.clearInterval(intervaloMetronomoRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const formatearTiempo = (s: number) => {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  const formatearCronometroMs = (milisegundos: number) => {
    const min = Math.floor(milisegundos / 60000);
    const seg = Math.floor((milisegundos % 60000) / 1000);
    const ms = milisegundos % 1000;
    return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
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

  const handlePerfilChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setPerfilPaciente((current) => ({ ...current, [name]: value }));
  };

  const bbsTotal = useMemo(
    () => puntajesBbs.filter((v) => v >= 0).reduce((acc, curr) => acc + curr, 0),
    [puntajesBbs]
  );

  const fgaTotal = useMemo(
    () => puntajesFga.filter((v) => v >= 0).reduce((acc, curr) => acc + curr, 0),
    [puntajesFga]
  );

  const bbsItemsCompletos = useMemo(
    () => puntajesBbs.filter((v) => v >= 0).length,
    [puntajesBbs]
  );

  const fgaItemsCompletos = useMemo(
    () => puntajesFga.filter((v) => v >= 0).length,
    [puntajesFga]
  );

  const tugSegundos = useMemo(
    () => (tugRegistradoMs !== null ? tugRegistradoMs / 1000 : null),
    [tugRegistradoMs]
  );

  const riesgoTug = useMemo(() => {
    if (tugSegundos === null) {
      return null;
    }
    return tugSegundos > 12.6
      ? '⚠️ ALTO RIESGO DE CAÍDA (Sensibilidad 80%)'
      : '✅ Riesgo Bajo';
  }, [tugSegundos]);

  const interpretacionBbs = useMemo(() => {
    if (bbsItemsCompletos === 0) {
      return 'Sin datos de Berg';
    }
    if (bbsTotal >= 41 && bbsTotal <= 56) {
      return 'Riesgo Bajo';
    }
    if (bbsTotal >= 21 && bbsTotal <= 40) {
      return 'Riesgo Medio (Requiere asistencia)';
    }
    return 'Riesgo Alto (Inminencia de caída)';
  }, [bbsItemsCompletos, bbsTotal]);

  const resumenFga = useMemo(() => {
    if (fgaItemsCompletos === 0) {
      return 'Sin datos de marcha';
    }

    if (puntajesFga[9] >= 0 && puntajesFga[9] <= 1) {
      return 'Inestabilidad en escaleras';
    }

    if (puntajesFga[4] >= 0 && puntajesFga[4] <= 1) {
      return 'Alteración en giros';
    }

    return 'Marcha estable';
  }, [fgaItemsCompletos, puntajesFga]);

  const pruebasConDatos = useMemo(() => {
    let total = 0;
    if (tugRegistradoMs !== null) total += 1;
    if (bbsItemsCompletos > 0) total += 1;
    if (fgaItemsCompletos > 0) total += 1;
    if (updrs.trim() !== '') total += 1;
    return total;
  }, [tugRegistradoMs, bbsItemsCompletos, fgaItemsCompletos, updrs]);

  useEffect(() => {
    setResultadosClinicos((prev) => ({
      ...prev,
      tugCognitivo:
        tugRegistradoMs !== null
          ? `${(tugRegistradoMs / 1000).toFixed(3)} s | ${riesgoTug ?? ''}`
          : '',
      berg:
        bbsItemsCompletos > 0
          ? `${bbsTotal}/56 | ${interpretacionBbs}`
          : '',
      fga:
        fgaItemsCompletos > 0
          ? `${fgaTotal}/30 | ${resumenFga}`
          : '',
      updrs: updrs.trim(),
    }));
  }, [
    tugRegistradoMs,
    riesgoTug,
    bbsItemsCompletos,
    bbsTotal,
    interpretacionBbs,
    fgaItemsCompletos,
    fgaTotal,
    resumenFga,
    updrs,
  ]);

  const guardarBbsItem = (indice: number, valor: number) => {
    setPuntajesBbs((actual) => {
      const copia = [...actual];
      copia[indice] = valor;
      return copia;
    });
  };

  const guardarFgaItem = (indice: number, valor: number) => {
    setPuntajesFga((actual) => {
      const copia = [...actual];
      copia[indice] = valor;
      return copia;
    });
  };

  const iniciarTug = () => {
    setTugCorriendo(true);
  };

  const detenerTug = () => {
    setTugCorriendo(false);
    setTugRegistradoMs(tugTiempoMs);
  };

  const reiniciarTug = () => {
    setTugCorriendo(false);
    setTugTiempoMs(0);
    setTugRegistradoMs(null);
  };

  const handleGuardar = async () => {
    if (!perfilPaciente.nombre || !perfilPaciente.estadio) {
      alert('Completa el nombre del paciente y el estadio clínico antes de guardar.');
      return;
    }

    if (pruebasConDatos < 2) {
      alert('Debes completar al menos 2 pruebas clínicas antes de guardar la valoración.');
      return;
    }

    try {
      setGuardando(true);
      const datosValoracion = {
        nombre_paciente: perfilPaciente.nombre,
        estadio_parkinson: perfilPaciente.estadio,
        evaluacion_entorno: perfilPaciente.evaluacionSocioAmbiental,
        resultado_tug_cognitivo: resultadosClinicos.tugCognitivo,
        resultado_berg: resultadosClinicos.berg,
        resultado_fga: resultadosClinicos.fga,
        resultado_updrs: resultadosClinicos.updrs,
        observaciones_clinicas: progreso,
      };
      
      console.log('Enviando datos a Supabase:', datosValoracion);
      
      const { error } = await supabase.from('valoraciones_parkinson').insert([datosValoracion]);

      if (error) {
        console.error('Error detallado de Supabase:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('Valoración guardada exitosamente');
      alert('La valoración clínica se guardó correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible guardar la valoración.';
      console.error('Error completo:', error);
      alert(`Error al guardar la valoración: ${message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-red-100 px-6 py-10 text-center shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center gap-2 mb-2 text-red-800">
            <GraduationCap size={20} />
            <span className="font-bold tracking-widest uppercase text-[10px]">Universidad Manuela Beltrán</span>
          </div>
          <h1 className="text-3xl font-extrabold text-red-800">Prevención de Caídas en Parkinson</h1>
          <p className="text-slate-500 italic text-sm mt-2">"Diseño y validación de herramienta RV" — Angie Alejandra Amado Téllez</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Fila 1: Perfil y Tecnologías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario Perfil del Paciente */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-800">
              <ShieldCheck /> Perfil del Paciente
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                name="nombre"
                value={perfilPaciente.nombre}
                onChange={handlePerfilChange}
                placeholder="Nombre Completo"
                className="w-full p-2 border rounded-lg text-sm border-red-100 focus:border-red-800 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="estadio"
                  value={perfilPaciente.estadio}
                  onChange={handlePerfilChange}
                  className="p-2 border rounded-lg text-sm border-red-100 focus:border-red-800 focus:outline-none"
                >
                  <option value="">Estadio Hoehn y Yahr (I-III)</option>
                  <option value="Estadio I">Estadio I</option>
                  <option value="Estadio II">Estadio II</option>
                  <option value="Estadio III">Estadio III</option>
                </select>
                <input type="number" placeholder="Puntaje MMSE" className="p-2 border rounded-lg text-sm border-red-100 focus:border-red-800 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Evaluación Socio-Ambiental (Red de Apoyo / Barreras en Hogar)
                </label>
                <input
                  type="text"
                  name="evaluacionSocioAmbiental"
                  value={perfilPaciente.evaluacionSocioAmbiental}
                  onChange={handlePerfilChange}
                  placeholder="Describa la red de apoyo y barreras identificadas en el entorno del paciente"
                  className="w-full p-2 border rounded-lg text-sm border-red-100 focus:border-red-800 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400">Requisito: Estadios I-III y MMSE ≥ 24.</p>
            </div>
          </section>

          {/* Estimulación Rítmica Sensorial (Cueing) */}
          <section className="bg-gradient-to-br from-red-700 to-red-900 p-6 rounded-3xl shadow-lg text-white transition-all duration-300 hover:-translate-y-0.5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Layers /> Estimulación Rítmica Sensorial (Cueing)
            </h3>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
              <p className="text-xs text-red-100">
                Metrónomo clínico para sincronizar la marcha y favorecer la regularidad del patrón motor.
              </p>

              <div className="mt-4">
                <label className="text-xs font-bold uppercase tracking-wide text-red-100">BPM (40-120)</label>
                <input
                  type="range"
                  min={40}
                  max={120}
                  value={bpm}
                  onChange={(event) => setBpm(Number(event.target.value))}
                  className="mt-2 w-full accent-red-800"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-red-100">40</span>
                  <span className="text-2xl font-black text-white">{bpm} BPM</span>
                  <span className="text-[11px] text-red-100">120</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`h-5 w-5 rounded-full border-2 transition-all duration-100 ${pulsoVisual ? 'bg-white border-white scale-125' : 'bg-red-200 border-red-100'}`}
                />
                <span className="text-xs text-red-100">Indicador de pulso sincronizado</span>
              </div>

              <button
                onClick={() => setMetronomoActivo((prev) => !prev)}
                className="mt-5 w-full py-4 bg-red-800 text-white rounded-xl font-extrabold text-sm hover:bg-red-900 transition-colors"
              >
                {metronomoActivo ? 'Detener' : 'Iniciar Estimulación'}
              </button>
            </div>
          </section>
        </div>

        {/* Fila 2: Seguimiento Meta Terapéutica */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-800">
            <Activity /> Seguimiento Meta Terapéutica
          </h3>
          <div className="flex gap-4">
            <textarea
              value={progreso}
              onChange={(e) => setProgreso(e.target.value)}
              placeholder="Registro diario del progreso del paciente..."
              className="flex-1 p-3 border rounded-xl text-sm h-24 border-red-100 focus:border-red-800 focus:outline-none"
            />
            <button
              onClick={handleGuardar}
              disabled={guardando || pruebasConDatos < 2}
              className="min-w-40 bg-red-800 text-white p-4 rounded-xl flex flex-col items-center justify-center text-sm font-bold hover:bg-red-900 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span className="text-[10px] font-bold mt-1 uppercase">
                {guardando ? 'Guardando...' : 'Guardar Valoración'}
              </span>
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Integridad clínica: completa al menos 2 pruebas de batería para habilitar el guardado ({pruebasConDatos}/4).
          </p>
        </section>

        {/* Fila 3: Protocolo con Timer */}
        <section className="bg-slate-900 text-white rounded-[40px] p-8 relative overflow-hidden transition-all duration-300">
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
        <section className="space-y-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ClipboardCheck className="text-red-800" /> Batería de Evaluación Clínica
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(detallesPruebas).map((test) => (
              <button
                key={test}
                onClick={() => setPruebaSeleccionada(test)}
                className={`p-8 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 min-h-32 ${
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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-red-100 rounded-2xl p-4 transition-all duration-300">
              <label className="block text-xs font-bold uppercase tracking-wide text-red-800 mb-2">
                Resultado TUG Cognitivo
              </label>
              <p className="text-sm text-slate-700">{resultadosClinicos.tugCognitivo || 'Sin registrar'}</p>
            </div>
            <div className="bg-white border border-red-100 rounded-2xl p-4 transition-all duration-300">
              <label className="block text-xs font-bold uppercase tracking-wide text-red-800 mb-2">
                Resultado Berg
              </label>
              <p className="text-sm text-slate-700">{resultadosClinicos.berg || 'Sin registrar'}</p>
            </div>
            <div className="bg-white border border-red-100 rounded-2xl p-4 transition-all duration-300">
              <label className="block text-xs font-bold uppercase tracking-wide text-red-800 mb-2">
                Resultado FGA
              </label>
              <p className="text-sm text-slate-700">{resultadosClinicos.fga || 'Sin registrar'}</p>
            </div>
            <div className="bg-white border border-red-100 rounded-2xl p-4 transition-all duration-300">
              <label className="block text-xs font-bold uppercase tracking-wide text-red-800 mb-2">
                Resultado UPDRS
              </label>
              <input
                type="text"
                value={updrs}
                onChange={(event) => setUpdrs(event.target.value)}
                placeholder="Ej. 22 puntos"
                className="w-full p-3 border rounded-xl text-sm border-red-100 focus:border-red-800 focus:outline-none"
              />
            </div>
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

              {pruebaSeleccionada === 'TUG' && (
                <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 space-y-4 transition-all duration-300">
                  <h4 className="text-red-800 font-bold text-base">TUG Cognitivo con Cronómetro Integrado</h4>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <span className="text-4xl font-mono font-black text-red-800">{formatearCronometroMs(tugTiempoMs)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={iniciarTug}
                        disabled={tugCorriendo}
                        className="px-6 py-3 rounded-xl bg-red-800 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start
                      </button>
                      <button
                        onClick={detenerTug}
                        disabled={!tugCorriendo}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Stop
                      </button>
                      <button
                        onClick={reiniciarTug}
                        className="px-6 py-3 rounded-xl bg-white border border-red-200 text-red-800 font-bold text-sm"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  {riesgoTug && (
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${riesgoTug.includes('ALTO') ? 'bg-red-800 text-white animate-pulse' : 'bg-green-100 text-green-700'}`}>
                      {riesgoTug}
                    </div>
                  )}
                </div>
              )}

              {pruebaSeleccionada === 'BBS' && (
                <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 space-y-4 transition-all duration-300">
                  <h4 className="text-red-800 font-bold text-base">Escala de Berg (BBS) Dinámica</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {BBS_ITEMS.map((item, indice) => (
                      <div key={item} className="bg-white rounded-xl border border-red-100 p-3">
                        <p className="text-sm font-semibold text-slate-800 mb-2">{indice + 1}. {item}</p>
                        <div className="flex gap-2 flex-wrap">
                          {[0, 1, 2, 3, 4].map((valor) => (
                            <button
                              key={valor}
                              onClick={() => guardarBbsItem(indice, valor)}
                              className={`h-10 w-12 rounded-lg text-sm font-bold transition-all duration-200 ${puntajesBbs[indice] === valor ? 'bg-red-800 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                            >
                              {valor}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white border border-red-100 rounded-xl p-3">
                    <p className="font-bold text-red-800">Score total: {bbsTotal}/56</p>
                    <span className="text-xs font-bold text-slate-600">{interpretacionBbs}</span>
                  </div>
                </div>
              )}

              {pruebaSeleccionada === 'FGA' && (
                <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 space-y-4 transition-all duration-300">
                  <h4 className="text-red-800 font-bold text-base">FGA Inteligente</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {FGA_ITEMS.map((item, indice) => (
                      <div key={item} className="bg-white rounded-xl border border-red-100 p-3">
                        <p className="text-sm font-semibold text-slate-800 mb-2">{indice + 1}. {item}</p>
                        <div className="flex gap-2 flex-wrap">
                          {[0, 1, 2, 3].map((valor) => (
                            <button
                              key={valor}
                              onClick={() => guardarFgaItem(indice, valor)}
                              className={`h-10 w-12 rounded-lg text-sm font-bold transition-all duration-200 ${puntajesFga[indice] === valor ? 'bg-red-800 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                            >
                              {valor}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white border border-red-100 rounded-xl p-3">
                    <p className="font-bold text-red-800">Score total: {fgaTotal}/30</p>
                    <span className="text-xs font-bold text-slate-600">Resumen: {resumenFga}</span>
                  </div>
                </div>
              )}

              {pruebaSeleccionada === 'UPDRS' && (
                <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 transition-all duration-300">
                  <h4 className="text-red-800 font-bold text-base mb-3">UPDRS - Progresión Motora</h4>
                  <input
                    type="text"
                    value={updrs}
                    onChange={(event) => setUpdrs(event.target.value)}
                    placeholder="Registrar puntaje o hallazgo motor relevante"
                    className="w-full p-3 border rounded-xl text-sm border-red-100 focus:border-red-800 focus:outline-none"
                  />
                </div>
              )}
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

      {mostrarEscudoAcceso && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white border border-red-100 rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-red-800 text-xl md:text-2xl font-black mb-4 uppercase tracking-wide">
              Escudo de Acceso Profesional
            </h2>
            <p className="font-bold text-slate-900 text-sm md:text-base leading-relaxed">
              SISTEMA DE USO RESTRINGIDO. Esta plataforma es una herramienta de soporte a la decisión clínica para uso exclusivo de profesionales de la fisioterapia y salud debidamente acreditados.
            </p>
            <p className="mt-4 text-slate-700 text-sm leading-relaxed">
              Al continuar, usted declara poseer la tarjeta profesional vigente y asume la responsabilidad total sobre la integridad del paciente y la confidencialidad de los datos ingresados bajo las leyes de protección de datos vigentes (Ley 1581 de 2012).
            </p>
            <button
              type="button"
              onClick={() => setMostrarEscudoAcceso(false)}
              className="mt-6 w-full md:w-auto px-8 py-4 rounded-xl bg-red-800 text-white text-sm md:text-base font-bold hover:bg-red-900 transition-all duration-300 shadow-lg"
            >
              Declaro ser profesional y acepto los términos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}