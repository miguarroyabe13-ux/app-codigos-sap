"use client";

import {
    ChevronLeft, Activity, Search, Loader2, Bug, Database,
    CheckCircle2, Clock, XCircle, AlertCircle, Copy, PlusCircle, Package, Pencil, MessageSquare
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Categoria = "referencia" | "cero" | "kits" | "modificaciones" | null;

const categorias = [
    { id: "referencia" as Categoria, label: "Códigos desde referencia", icon: Copy },
    { id: "cero" as Categoria, label: "Códigos desde cero", icon: PlusCircle },
    { id: "kits" as Categoria, label: "Kits", icon: Package },
    { id: "modificaciones" as Categoria, label: "Modificaciones", icon: Pencil },
];

const estadoMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    "APROBADO": { label: "APROBADO", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
    "PENDIENTE": { label: "PENDIENTE", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock className="w-5 h-5 text-amber-500" /> },
    "RECHAZADO": { label: "RECHAZADO", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle className="w-5 h-5 text-red-500" /> },
    "EN REVISIÓN": { label: "EN REVISIÓN", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <AlertCircle className="w-5 h-5 text-blue-500" /> },
};

export default function EstadoPage() {
    const supabase = createClient();
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria>(null);
    const [skuTable, setSkuTable] = useState<string>("SAP_SKU");
    const [connStatus, setConnStatus] = useState<"checking" | "connected" | "error">("checking");
    const [debug, setDebug] = useState(false);

    const [skuInput, setSkuInput] = useState("");
    const [skuResults, setSkuResults] = useState<any[]>([]);
    const [selectedSku, setSelectedSku] = useState<any>(null);
    const [solicitudInfo, setSolicitudInfo] = useState<any>(null); // Datos de la solicitud
    const [activeSearch, setActiveSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [categoriaSolicitudes, setCategoriaSolicitudes] = useState<any[]>([]);
    const [loadingCategoriaSolicitudes, setLoadingCategoriaSolicitudes] = useState(false);

    const skuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { error } = await supabase.from("SAP_SKU").select("*").limit(1);
                if (error) {
                    const { error: e2 } = await supabase.from("SAP SKU").select("*").limit(1);
                    if (!e2) setSkuTable("SAP SKU");
                }
                setConnStatus("connected");
            } catch {
                setConnStatus("error");
            }
        };
        checkConnection();
    }, []);

    // Reset search when switching category
    useEffect(() => {
        setSkuInput("");
        setSkuResults([]);
        setSelectedSku(null);
        setSolicitudInfo(null);
        setActiveSearch(false);
        setCategoriaSolicitudes([]);
    }, [selectedCategoria]);

    // Fetch solicitudes for selected category
    useEffect(() => {
        const fetchSolicitudes = async () => {
            if (!selectedCategoria) return;
            setLoadingCategoriaSolicitudes(true);
            const tipoDb =
                selectedCategoria === "referencia" ? "estructura" :
                    selectedCategoria === "cero" ? "de_cero" :
                        selectedCategoria === "kits" ? "kit" :
                            "modificacion";

            try {
                const { data, error } = await supabase
                    .from("solicitudes")
                    .select("*")
                    .eq("tipo", tipoDb)
                    .order("created_at", { ascending: false });

                if (data && !error) {
                    setCategoriaSolicitudes(data);
                }
            } catch (err) {
                console.error("Error fetching solicitudes", err);
            } finally {
                setLoadingCategoriaSolicitudes(false);
            }
        };

        fetchSolicitudes();
    }, [selectedCategoria]);

    const performSearch = useCallback(async (value: string, isAppending = false) => {
        const offset = isAppending ? skuResults.length : 0;
        const BATCH_SIZE = 100;

        if (isAppending) setLoadingMore(true);
        else setLoading(true);

        try {
            let query = supabase.from(skuTable).select("*");
            if (value.trim().length > 0) {
                const term = `%${value}%`;
                query = query.or(`SKU.ilike.${term},DESCRIPCION.ilike.${term}`);
            }
            const { data, error } = await query.order("SKU", { ascending: true }).range(offset, offset + BATCH_SIZE - 1);
            if (error) throw error;

            const newData = data || [];
            setHasMore(newData.length === BATCH_SIZE);

            if (isAppending) {
                setSkuResults(prev => {
                    const combined = [...prev, ...newData];
                    return Array.from(new Map(combined.map(item => [item.SKU || Math.random(), item])).values());
                });
            } else {
                setSkuResults(Array.from(new Map(newData.map(item => [item.SKU || Math.random(), item])).values()));
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            if (isAppending) setLoadingMore(false);
            else setLoading(false);
        }
    }, [skuTable, skuResults]);

    useEffect(() => {
        if (activeSearch) {
            const timer = setTimeout(() => performSearch(skuInput), 300);
            return () => clearTimeout(timer);
        }
    }, [skuInput, activeSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (skuRef.current && !skuRef.current.contains(event.target as Node)) {
                setSkuResults([]);
                setHasMore(true);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = async (item: any) => {
        setSkuInput(item.SKU);
        setSelectedSku(item);
        setSkuResults([]);
        setActiveSearch(false);
        setSolicitudInfo(null);

        // Map UI category to DB 'tipo'
        const tipoDb =
            selectedCategoria === "referencia" ? "estructura" :
                selectedCategoria === "cero" ? "de_cero" :
                    selectedCategoria === "kits" ? "kit" :
                        "modificacion";

        // Fetch real status from 'solicitudes' table
        try {
            const { data, error } = await supabase
                .from("solicitudes")
                .select("*")
                .eq("tipo", tipoDb)
                .eq("sku_referencia", item.SKU)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data && !error) {
                setSolicitudInfo(data);
            }
        } catch (err: any) {
            console.error("No se encontró solicitud previa para este SKU", err);
        }

        // Fetch description if missing
        if (item.DESCRIPCION === "CARGANDO...") {
            try {
                const { data: skuData } = await supabase
                    .from(skuTable)
                    .select("DESCRIPCION")
                    .eq("SKU", item.SKU)
                    .maybeSingle();

                if (skuData) {
                    setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: skuData.DESCRIPCION } : prev);
                } else if (tipoDb === "kit" || tipoDb === "de_cero") {
                    setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: "CÓDIGO NUEVO O EN PROCESO" } : prev);
                } else {
                    setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: "SIN DESCRIPCIÓN EN SAP" } : prev);
                }
            } catch (err) {
                setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: "ERROR AL CARGAR" } : prev);
            }
        }
    };

    const handleSelectFromHistory = async (sol: any) => {
        setSkuInput(sol.sku_referencia || sol.kit_nombre || "CÓDIGO NUEVO");
        setSelectedSku({
            SKU: sol.sku_referencia || (sol.tipo === "kit" ? "KIT CREADO" : "CÓDIGO NUEVO"),
            DESCRIPCION: "CARGANDO..."
        });
        setSkuResults([]);
        setActiveSearch(false);
        setSolicitudInfo(sol);

        if (sol.sku_referencia && (sol.tipo === 'estructura' || sol.tipo === 'modificacion')) {
            try {
                const { data: skuData } = await supabase
                    .from(skuTable)
                    .select("DESCRIPCION")
                    .eq("SKU", sol.sku_referencia)
                    .maybeSingle();

                if (skuData) {
                    setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: skuData.DESCRIPCION } : prev);
                } else {
                    setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: "SIN DESCRIPCIÓN EN SAP" } : prev);
                }
            } catch (err) {
                setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: "ERROR AL CARGAR" } : prev);
            }
        } else if (sol.tipo === "kit") {
            setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: sol.kit_nombre || "KIT NUEVO" } : prev);
        } else if (sol.tipo === "de_cero") {
            setSelectedSku((prev: any) => prev ? { ...prev, DESCRIPCION: "CÓDIGO DE CERO" } : prev);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!solicitudInfo || !solicitudInfo.id) return;
        try {
            const { error } = await supabase
                .from("solicitudes")
                .update({ estado: newStatus })
                .eq("id", solicitudInfo.id);
            if (error) throw error;

            setSolicitudInfo({ ...solicitudInfo, estado: newStatus });
            // Update in the listing as well
            setCategoriaSolicitudes(prev => prev.map(s => s.id === solicitudInfo.id ? { ...s, estado: newStatus } : s));
        } catch (err: any) {
            console.error("Error updating status", err);
            alert("Hubo un error al actualizar el estado");
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loadingMore && hasMore) {
            performSearch(skuInput, true);
        }
    };

    // Real status from Supabase (defaults to PENDIENTE if not found, but indicates it's purely a mockup)
    const estadoReal = solicitudInfo?.estado || null; // Si es null, no hay solicitud real
    const badge = estadoReal ? estadoMap[estadoReal] : null;

    return (
        <div className="flex-1 w-full flex flex-col items-center justify-start min-h-screen bg-[#F8FAFC] p-8 pt-12 font-sans overflow-x-hidden">

            {/* Header */}
            <div className="w-full max-w-6xl mb-12 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-1000">
                <button
                    onClick={() => selectedCategoria ? setSelectedCategoria(null) : (window.location.href = "/protected")}
                    className="flex items-center gap-5 text-[#0F172A] font-black text-4xl tracking-tighter hover:opacity-80 transition-all group"
                >
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:bg-[#F1F5F9] transition-all">
                        <ChevronLeft className="w-8 h-8 stroke-[4px]" />
                    </div>
                    <span className="uppercase italic relative">
                        {selectedCategoria
                            ? categorias.find(c => c.id === selectedCategoria)?.label
                            : "Estado de Solicitudes"}
                        <div className={`absolute -bottom-2 left-0 h-1.5 bg-[#3499CD] rounded-full transition-all duration-500 ${selectedCategoria ? 'w-full' : 'w-48'}`} />
                    </span>
                </button>

                <div className="flex items-center gap-6">
                    {connStatus === "connected" && (
                        <div className="px-6 py-3 bg-white text-green-600 rounded-full border border-green-100 font-black text-[0.7rem] uppercase tracking-widest flex items-center gap-3 shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            SAP Business One OK
                        </div>
                    )}
                    <button onClick={() => setDebug(!debug)} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                        <Bug className={`w-6 h-6 ${debug ? 'text-[#3499CD]' : 'text-slate-300'}`} />
                    </button>
                </div>
            </div>

            {debug && (
                <div className="w-full max-w-5xl mb-10 p-10 bg-[#0F172A] text-blue-300 font-mono text-[0.8rem] rounded-[2.5rem] border border-white/10 animate-in zoom-in duration-500">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <div className="text-white/20 text-[0.6rem] font-bold tracking-[0.3em] uppercase">Categoría</div>
                            <div className="text-white font-bold text-lg tracking-tight">{selectedCategoria ?? "—"}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-white/20 text-[0.6rem] font-bold tracking-[0.3em] uppercase">Resultados</div>
                            <div className="text-green-400 font-bold">{skuResults.length} registros</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SELECCIÓN DE CATEGORÍA ── */}
            {!selectedCategoria ? (
                <div className="w-full max-w-2xl flex flex-col gap-5 mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {categorias.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoria(cat.id)}
                            className="group w-full flex items-center justify-between px-10 py-7 rounded-[1.2rem] bg-[#0F364B] hover:bg-[#0A2432] text-white font-black text-xl tracking-wide transition-all duration-500 shadow-lg hover:shadow-[0_20px_40px_rgba(15,54,75,0.3)] hover:-translate-y-1 active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-5">
                                <cat.icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                                <span>{cat.label}</span>
                            </div>
                            <ChevronLeft className="w-6 h-6 rotate-180 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>

            ) : (
                /* ── DETALLE DE CATEGORÍA ── */
                <div className="w-full max-w-4xl bg-white rounded-[2rem] p-16 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 space-y-12 relative animate-in zoom-in duration-700 overflow-visible">

                    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">

                        {/* Buscar artículo */}
                        <div className="relative space-y-4" ref={skuRef}>
                            <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Consultar Estado de Artículo</label>
                            <div className={`relative transition-all duration-700 ${activeSearch ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                <input
                                    type="text"
                                    value={skuInput}
                                    onFocus={() => { setActiveSearch(true); performSearch(skuInput); }}
                                    onChange={(e) => setSkuInput(e.target.value)}
                                    placeholder="Ingrese SKU o descripción..."
                                    className="w-full h-20 pl-10 pr-16 rounded-3xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm text-center"
                                />
                                <Search className={`absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeSearch ? 'text-[#3499CD]' : 'text-[#334155]'}`} />
                            </div>

                            {/* Artículo seleccionado + badge estado */}
                            {selectedSku && !activeSearch && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="w-full h-20 border-2 border-[#3499CD] rounded-2xl flex items-center justify-center bg-white">
                                        <span className="text-[#3499CD] font-black text-2xl tracking-tighter uppercase">
                                            SKU: {selectedSku.SKU}
                                        </span>
                                    </div>
                                    <div className="space-y-1 pl-4">
                                        <div className="text-[#64748B] text-[0.8rem] font-bold uppercase tracking-wider">Descripción Referencia</div>
                                        <div className="text-[#0F364B] text-xl font-black uppercase leading-tight">{selectedSku.DESCRIPCION}</div>
                                    </div>

                                    {/* Mostrar Usuario */}
                                    {solicitudInfo?.usuario_email && (
                                        <div className="space-y-1 pl-4 pt-2">
                                            <div className="text-[#64748B] text-[0.8rem] font-bold uppercase tracking-wider">Solicitado por</div>
                                            <div className="text-[#0F364B] text-lg font-bold">{solicitudInfo.usuario_email}</div>
                                        </div>
                                    )}

                                    {/* Mostrar Elementos de Estructura de Referencia o Creación de Cero */}
                                    {(solicitudInfo?.tipo === 'estructura' || solicitudInfo?.tipo === 'de_cero') && (solicitudInfo.color_codigo || solicitudInfo.version_codigo) && (
                                        <div className="space-y-3 mt-4 border border-slate-200 rounded-2xl p-6 bg-slate-50">
                                            <h4 className="text-[#64748B] text-[0.8rem] font-bold uppercase tracking-wider">Detalles de la Estructura (Color y Versión)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {solicitudInfo.color_codigo && (
                                                    <div className="flex flex-col gap-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                        <span className="text-slate-400 text-[0.65rem] font-bold uppercase tracking-widest">Color Seleccionado</span>
                                                        <span className="text-[#0F364B] font-black text-lg">{solicitudInfo.color_codigo}</span>
                                                    </div>
                                                )}
                                                {solicitudInfo.version_codigo && (
                                                    <div className="flex flex-col gap-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                        <span className="text-slate-400 text-[0.65rem] font-bold uppercase tracking-widest">Versión Seleccionada</span>
                                                        <span className="text-[#0F364B] font-black text-lg">{solicitudInfo.version_codigo}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mostrar Modificación */}
                                    {solicitudInfo?.tipo === 'modificacion' && solicitudInfo.nueva_descripcion && (
                                        <div className="space-y-3 mt-4 border border-blue-200 rounded-2xl p-6 bg-blue-50">
                                            <h4 className="text-blue-500 text-[0.8rem] font-bold uppercase tracking-wider flex items-center gap-2">
                                                <Activity className="w-4 h-4" />
                                                Nueva Descripción Solicitada
                                            </h4>
                                            <div className="text-[#0F364B] font-black text-xl bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                                {solicitudInfo.nueva_descripcion}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mostrar Kit Nombre */}
                                    {solicitudInfo?.tipo === 'kit' && solicitudInfo.kit_nombre && (
                                        <div className="space-y-3 mt-4 border border-purple-200 rounded-2xl p-6 bg-purple-50">
                                            <h4 className="text-purple-500 text-[0.8rem] font-bold uppercase tracking-wider flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                Nombre de Kit Solicitado
                                            </h4>
                                            <div className="text-[#0F364B] font-black text-xl bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                                                {solicitudInfo.kit_nombre}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mostrar Comentarios */}
                                    {solicitudInfo?.comentarios && (
                                        <div className="space-y-3 mt-4 border border-amber-200 rounded-2xl p-6 bg-amber-50">
                                            <h4 className="text-amber-600 text-[0.8rem] font-bold uppercase tracking-wider flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Comentarios y Observaciones
                                            </h4>
                                            <div className="text-[#0F364B] font-medium text-md leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-amber-100">
                                                {solicitudInfo.comentarios}
                                            </div>
                                        </div>
                                    )}

                                    {/* Mostrar Artículos Estructura/Kit */}
                                    {solicitudInfo?.kit_articulos && solicitudInfo.kit_articulos.length > 0 && (
                                        <div className="space-y-3 mt-4 border border-slate-200 rounded-2xl p-6 bg-slate-50">
                                            <h4 className="text-[#64748B] text-[0.8rem] font-bold uppercase tracking-wider">Artículos de la Estructura Sugeridos</h4>
                                            <div className="flex flex-col gap-2">
                                                {solicitudInfo.kit_articulos.map((art: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center text-sm font-bold bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                        <span className="text-[#3499CD]">{art.SKU}</span>
                                                        <span className="text-[#64748B] uppercase truncate max-w-[60%]">{art.DESCRIPCION}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap flex-col md:flex-row items-stretch md:items-center gap-4 pt-4 relative z-50">
                                        {badge ? (
                                            <div className={`flex items-center gap-4 px-8 py-5 rounded-2xl border-2 ${badge.bg} animate-in fade-in duration-500 flex-1 min-w-[300px]`}>
                                                {badge.icon}
                                                <div className="flex flex-col">
                                                    <span className="text-[#64748B] text-[0.7rem] font-bold uppercase tracking-widest">Estado de Solicitud</span>
                                                    <span className={`font-black text-xl uppercase tracking-tight ${badge.color}`}>{badge.label}</span>
                                                    {solicitudInfo?.created_at && (
                                                        <span className="text-slate-400 text-[0.6rem] font-medium mt-1">
                                                            Solicitado el {new Date(solicitudInfo.created_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 px-8 py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 animate-in fade-in duration-500 flex-1 min-w-[300px]">
                                                <Activity className="w-5 h-5 text-slate-400" />
                                                <div className="flex flex-col">
                                                    <span className="text-[#64748B] text-[0.7rem] font-bold uppercase tracking-widest">Información</span>
                                                    <span className="font-black text-lg text-slate-500 uppercase tracking-tight">SIN SOLICITUD PREVIA</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Selector de Estado */}
                                        {solicitudInfo && (
                                            <div className="relative group min-w-[200px]">
                                                <select
                                                    value={solicitudInfo.estado || "PENDIENTE"}
                                                    onChange={(e) => handleStatusChange(e.target.value)}
                                                    className="w-full appearance-none bg-white border-2 border-[#E2E8F0] text-[#0F172A] font-black text-sm tracking-wide px-6 py-5 rounded-2xl cursor-pointer hover:border-[#3499CD] focus:outline-none focus:border-[#3499CD] pr-12 transition-all shadow-sm uppercase"
                                                >
                                                    <option value="PENDIENTE">PENDIENTE</option>
                                                    <option value="EN REVISIÓN">EN REVISIÓN</option>
                                                    <option value="APROBADO">APROBADO</option>
                                                    <option value="RECHAZADO">RECHAZADO</option>
                                                </select>
                                                <ChevronLeft className="w-5 h-5 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none group-hover:text-[#3499CD] transition-colors" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Lista de Solicitudes Recientes (o Placeholder vacío) */}
                            {!selectedSku && !activeSearch && (
                                <div className="space-y-6 animate-in fade-in duration-500">
                                    <h3 className="text-[#0F172A] font-black tracking-tight text-xl ml-2">Tus Solicitudes</h3>

                                    {loadingCategoriaSolicitudes ? (
                                        <div className="py-14 flex justify-center">
                                            <Loader2 className="w-10 h-10 text-[#3499CD] animate-spin" />
                                        </div>
                                    ) : categoriaSolicitudes.length === 0 ? (
                                        <div className="py-14 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-4">
                                            <div className="p-5 bg-slate-50 rounded-full">
                                                <Activity className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <span className="text-slate-300 font-bold uppercase text-[0.7rem] tracking-widest">No hay solicitudes en esta categoría</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            {categoriaSolicitudes.map((sol: any) => {
                                                const b = estadoMap[sol.estado] || estadoMap["PENDIENTE"];
                                                return (
                                                    <button
                                                        key={sol.id}
                                                        onClick={() => handleSelectFromHistory(sol)}
                                                        className="w-full flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#3499CD] hover:shadow-lg transition-all text-left"
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[#0F364B] font-black text-xl uppercase tracking-tighter">
                                                                {sol.sku_referencia || sol.kit_nombre || "CÓDIGO NUEVO"}
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                                    {new Date(sol.created_at).toLocaleDateString()}
                                                                </span>
                                                                {sol.usuario_email && (
                                                                    <span className="text-slate-300 text-xs font-medium">| {sol.usuario_email}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${b.bg}`}>
                                                            {b.icon}
                                                            <span className={`font-black text-sm uppercase tracking-tight ${b.color}`}>{b.label}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dropdown resultados */}
                            {(skuResults.length > 0 || loading) && (
                                <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-white rounded-[1.2rem] shadow-[0_60px_120px_rgba(15,23,42,0.25)] border border-slate-200 overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex bg-[#eff2f5] border-b border-slate-200 font-black text-[0.65rem] tracking-[0.2em] text-[#324f5f]/60 uppercase italic">
                                        <div className="w-[25%] px-8 py-5 border-r border-[#dee2e6]">NRO. ARTÍCULO</div>
                                        <div className="w-[75%] px-8 py-5">DESCRIPCIÓN SAP</div>
                                    </div>
                                    <div className="max-h-[480px] overflow-y-auto custom-scrollbar bg-white" onScroll={handleScroll}>
                                        {loading ? (
                                            <div className="py-24 text-center flex flex-col items-center gap-6">
                                                <Loader2 className="w-12 h-12 text-[#3499CD] animate-spin" />
                                                <span className="text-[0.7rem] font-bold uppercase tracking-[0.6em] text-[#3499CD]/40">Sincronizando Catálogo...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {skuResults.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        onMouseDown={() => handleSelect(item)}
                                                        className="flex w-full group cursor-pointer hover:bg-[#FFFBEB] border-b border-slate-100 last:border-0 transition-colors duration-200"
                                                    >
                                                        <div className="w-[25%] px-8 py-5 font-mono font-black text-[#0F172A] text-lg tracking-tighter border-r border-slate-100 group-hover:text-[#3499CD] transition-colors">
                                                            {item.SKU || "S/C"}
                                                        </div>
                                                        <div className="w-[75%] px-8 py-5 font-black text-[#64748B] text-[0.95rem] uppercase group-hover:text-[#0F172A] transition-colors leading-relaxed">
                                                            {item.DESCRIPCION || "SIN NOMBRE"}
                                                        </div>
                                                    </div>
                                                ))}
                                                {loadingMore && (
                                                    <div className="py-12 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 text-[#3499CD]">
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                        <span className="text-[0.6rem] font-black uppercase tracking-[0.5em] italic">Ampliando registros...</span>
                                                    </div>
                                                )}
                                                {!hasMore && skuResults.length > 0 && (
                                                    <div className="py-10 bg-slate-50/50 text-center border-t border-slate-50">
                                                        <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-300">Catálogo Completo Cargado</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Volver */}
                    <div className="pt-8 relative z-0">
                        <button
                            onClick={() => setSelectedCategoria(null)}
                            className="w-full h-16 border-2 border-[#0F364B] text-[#0F364B] font-black text-xl tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all uppercase"
                        >
                            VOLVER ATRÁS
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
