"use client";

import { ChevronLeft, PlusCircle, Package, Copy, Search, Loader2, ChevronRight, Bug, Database, XCircle, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type ActiveField = "sku" | "color" | "version" | "kit_sku" | null;

export default function CreacionPage() {
    const supabase = createClient();
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [debug, setDebug] = useState(false);

    // Connection & Table States
    const [activeColoresTable, setActiveColoresTable] = useState<string>("BD_ COLORES_GRUPOS");
    const [skuTable, setSkuTable] = useState<string>("SAP_SKU");
    const [connStatus, setConnStatus] = useState<"checking" | "connected" | "error">("checking");
    const [detailedError, setDetailedError] = useState<string | null>(null);

    // Search States (Inputs)
    const [skuInput, setSkuInput] = useState("");
    const [colorInput, setColorInput] = useState("");
    const [versionInput, setVersionInput] = useState("");

    // Independent Result States
    const [skuResults, setSkuResults] = useState<any[]>([]);
    const [colorResults, setColorResults] = useState<any[]>([]);
    const [versionResults, setVersionResults] = useState<any[]>([]);

    // Selected Details States
    const [selectedSku, setSelectedSku] = useState<any>(null);
    const [selectedColor, setSelectedColor] = useState<any>(null);
    const [selectedVersion, setSelectedVersion] = useState<any>(null);

    // Kit States
    const [kitInput, setKitInput] = useState("");
    const [kitResults, setKitResults] = useState<any[]>([]);
    const [kitName, setKitName] = useState("");
    const [kitSelectedItems, setKitSelectedItems] = useState<any[]>([]);

    // Form Inputs (Global for all sub-modules)
    const [comentarios, setComentarios] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Kit compatibility error toast
    const [kitCompatError, setKitCompatError] = useState<string | null>(null);

    // Pagination States
    const [hasMore, setHasMore] = useState<Record<string, boolean>>({ sku: true, color: true, version: true, kit_sku: true });

    // Control States
    const [activeField, setActiveField] = useState<ActiveField>(null);
    const [loading, setLoading] = useState<Record<string, boolean>>({ sku: false, color: false, version: false, kit_sku: false });
    const [loadingMore, setLoadingMore] = useState<Record<string, boolean>>({ sku: false, color: false, version: false, kit_sku: false });

    // Click outside listener refs
    const skuRef = useRef<HTMLDivElement>(null);
    const colorRef = useRef<HTMLDivElement>(null);
    const versionRef = useRef<HTMLDivElement>(null);
    const kitRef = useRef<HTMLDivElement>(null);

    // Sync Refs for scroll lock and offset tracking (avoids stale closures entirely)
    const fetchingRef = useRef<Record<string, boolean>>({ sku: false, color: false, version: false, kit_sku: false });
    const offsetRef = useRef<Record<string, number>>({ sku: 0, color: 0, version: 0, kit_sku: 0 });

    // Connection Check & Table Detection
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await fetch("/api/sap/skus?limit=1");
                if (!res.ok) throw new Error("SAP Connection failed");
                setConnStatus("connected");
            } catch (err: any) {
                setConnStatus("error");
            }
        };
        checkConnection();
    }, []);

    const performSearch = useCallback(async (field: ActiveField, value: string, isAppending = false) => {
        if (!field || fetchingRef.current[field]) return;
        fetchingRef.current[field] = true;

        if (!isAppending && value.trim().length > 0) {
            if (field === "sku" && (selectedSku?.SKU !== value && selectedSku?.DESCRIPCION !== value)) setSelectedSku(null);
            else if (field === "color" && (selectedColor?.Color !== value && selectedColor?.CodigoColor !== value)) setSelectedColor(null);
            else if (field === "version" && (selectedVersion?.Version !== value && selectedVersion?.CodigoVersion !== value)) setSelectedVersion(null);
        }

        const BATCH_SIZE = 100;

        // Reset offset on new search, keep it for appending
        if (!isAppending) {
            offsetRef.current[field] = 0;
        }

        // Synchronously grab the current offset from ref — no stale closure possible
        const offset = offsetRef.current[field];

        if (isAppending) setLoadingMore(prev => ({ ...prev, [field]: true }));
        else setLoading(prev => ({ ...prev, [field]: true }));

        try {
            let endpoint = "";
            let displayCodeCol = "";

            if (field === "sku" || field === "kit_sku") {
                endpoint = "/api/sap/skus";
                displayCodeCol = "SKU";
            } else if (field === "color") {
                endpoint = "/api/sap/colores";
                displayCodeCol = "CodigoColor";
            } else {
                endpoint = "/api/sap/versiones";
                displayCodeCol = "CodigoVersion";
            }

            const url = `${endpoint}?search=${encodeURIComponent(value)}&offset=${offset}&limit=${BATCH_SIZE}`;
            const res = await fetch(url);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Error fetching SAP data");
            }

            const resData = await res.json();
            const newData: any[] = resData.data || [];

            // Advance the offset ref by how many items we got
            offsetRef.current[field] += newData.length;

            setHasMore(prev => ({ ...prev, [field]: resData.hasMore }));

            const displayCol = displayCodeCol;
            const appendData = isAppending;
            const updateList = (prev: any[]) => {
                const arr = appendData ? [...prev, ...newData] : newData;
                return Array.from(new Map(arr.map((item: any) => [item[displayCol] ?? Math.random(), item])).values());
            };

            if (field === "sku") setSkuResults(updateList);
            else if (field === "color") setColorResults(updateList);
            else if (field === "version") setVersionResults(updateList);
            else if (field === "kit_sku") setKitResults(updateList);

        } catch (err: any) {
            console.error("Search Error:", err);
            setDetailedError(err.message);
        } finally {
            fetchingRef.current[field] = false;
            if (isAppending) setLoadingMore(prev => ({ ...prev, [field]: false }));
            else setLoading(prev => ({ ...prev, [field]: false }));
        }
    }, [selectedSku, selectedColor, selectedVersion]);

    // Consolidated typing effect with concurrency protection
    useEffect(() => {
        if (activeField && !fetchingRef.current[activeField]) {
            const val = activeField === "sku" ? skuInput : 
                        activeField === "color" ? colorInput : 
                        activeField === "kit_sku" ? kitInput : versionInput;
            const timer = setTimeout(() => {
                performSearch(activeField, val);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [skuInput, colorInput, kitInput, versionInput, activeField, performSearch]);

    const handleFocus = (field: ActiveField) => {
        if (field !== "sku") setSkuResults([]);
        if (field !== "color") setColorResults([]);
        if (field !== "version") setVersionResults([]);
        if (field !== "kit_sku") setKitResults([]);

        setActiveField(field);
        const val = field === "sku" ? skuInput : field === "color" ? colorInput : field === "kit_sku" ? kitInput : versionInput;
        performSearch(field, val);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>, field: ActiveField) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const fieldKey = field as string;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !fetchingRef.current[fieldKey] && hasMore[fieldKey]) {
            fetchingRef.current[fieldKey] = true;
            const val = field === "sku" ? skuInput : field === "color" ? colorInput : field === "kit_sku" ? kitInput : versionInput;
            performSearch(field, val, true);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (skuRef.current && !skuRef.current.contains(event.target as Node)) { setSkuResults([]); setHasMore(p => ({ ...p, sku: true })); }
            if (colorRef.current && !colorRef.current.contains(event.target as Node)) { setColorResults([]); setHasMore(p => ({ ...p, color: true })); }
            if (versionRef.current && !versionRef.current.contains(event.target as Node)) { setVersionResults([]); setHasMore(p => ({ ...p, version: true })); }
            if (kitRef.current && !kitRef.current.contains(event.target as Node)) { setKitResults([]); setHasMore(p => ({ ...p, kit_sku: true })); }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = async () => {
        if (!selectedAction) return;

        // Validaciones por tipo de módulo (solo aplican a Crear de Cero y Kit)
        if (selectedAction === "de_cero") {
            if (!selectedColor || !selectedVersion || !comentarios.trim()) {
                alert("Por favor, seleccione Color, Versión y añada Comentarios para finalizar la solicitud desde cero.");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const rowData = {
                tipo: selectedAction,
                sku_referencia: selectedAction === "estructura" ? selectedSku?.SKU : null,
                color_codigo: selectedColor?.CodigoColor || null,
                version_codigo: selectedVersion?.CodigoVersion || selectedVersion?.Version || null,
                kit_articulos: selectedAction === "kit" ? kitSelectedItems : null,
                kit_nombre: selectedAction === "kit" ? kitName : null,
                comentarios: comentarios,
            };

            const { error } = await supabase.from("solicitudes").insert(rowData);
            if (error) throw error;

            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
                setSelectedAction(null);
                setSkuInput(""); setSelectedSku(null);
                setColorInput(""); setSelectedColor(null);
                setVersionInput(""); setSelectedVersion(null);
                setKitInput(""); setKitSelectedItems([]); setKitName("");
                setComentarios("");
            }, 2000);
        } catch (err: any) {
            console.error("Error al crear solicitud:", err);
            alert("Hubo un error al enviar la solicitud: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

        const validateKitCompatibility = (newItem: any, currentItems: any[]) => {
            const getDetails = (item: any) => {
                const raw = (item.DESCRIPCION || item.ItemName || "").toUpperCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const sku = (item.SKU || item.ItemCode || "").toUpperCase();

                console.log("[KIT VALIDATE]", sku, "→", raw);

                const isMueble = raw.includes("MUE") || raw.includes("GABINETE") || raw.includes("VANITY") || sku.startsWith("MUE");
                const isLavamanos = raw.includes("LAVA") || raw.includes("LAVAB") || raw.includes("BASIN") || raw.includes("SINK") || sku.startsWith("LAV");
                const isEspejo = raw.includes("ESPEJO") || raw.includes("MIRROR") || sku.startsWith("ESP");
                const isVessel = raw.includes("VESSEL") || raw.includes("SOBREPONER");

                const dimMatch = raw.match(/(\d{2,3})\s*[Xx*]\s*(\d{2,3})/);
                const dimension = dimMatch ? `${dimMatch[1]}X${dimMatch[2]}` : null;

                // Extraer prefijo de familia del SKU (ej: CACC01, MAQYEQ, etc.)
                const familyPrefix = sku.split(/\d/)[0] || sku.substring(0, 6);

                return { isMueble, isLavamanos, isEspejo, dimension, isVessel, raw, sku, familyPrefix };
            };

            if (currentItems.length === 0) return null;

            const newDetails = getDetails(newItem);
            console.log("[KIT VALIDATE] Detectado:", { isMueble: newDetails.isMueble, isLavamanos: newDetails.isLavamanos, dimension: newDetails.dimension, familia: newDetails.familyPrefix });

            for (const item of currentItems) {
                const currDetails = getDetails(item);

                // Regla 1: Mueble + Lavamanos → misma medida obligatoria
                const isMuebleLavaPair =
                    (newDetails.isMueble && currDetails.isLavamanos) ||
                    (newDetails.isLavamanos && currDetails.isMueble);

                if (isMuebleLavaPair && newDetails.dimension && currDetails.dimension && newDetails.dimension !== currDetails.dimension) {
                    return `Las medidas no coinciden según el catálogo Firplak.\n\nArtículo nuevo: ${newDetails.sku} (${newDetails.dimension})\nArtículo en kit: ${currDetails.sku} (${currDetails.dimension})\n\nEl mueble y el lavamanos deben tener el mismo ancho × fondo.`;
                }

                // Regla 2: Vessel requiere mueble con cubierta plana
                const isVesselMueblePair =
                    (newDetails.isVessel && currDetails.isMueble) ||
                    (currDetails.isVessel && newDetails.isMueble);

                if (isVesselMueblePair) {
                    const muebleRaw = newDetails.isMueble ? newDetails.raw : currDetails.raw;
                    const muebleSku = newDetails.isMueble ? newDetails.sku : currDetails.sku;
                    if (!muebleRaw.includes("PLANO") && !muebleRaw.includes("CUBIERTA") && !muebleRaw.includes("FLAT")) {
                        return `El lavamanos tipo Vessel requiere un mueble con cubierta plana.\n\nEl mueble (${muebleSku}) no parece tener cubierta plana según su descripción.`;
                    }
                }

                // Regla 3: Familias de SKU incompatibles (ej: baño vs maquinaria)
                if (newDetails.familyPrefix && currDetails.familyPrefix && newDetails.familyPrefix !== currDetails.familyPrefix) {
                    return `Los artículos pertenecen a familias de productos diferentes y no son compatibles en un kit.\n\n"${newDetails.sku}" → familia: ${newDetails.familyPrefix}\n"${currDetails.sku}" → familia: ${currDetails.familyPrefix}\n\nUn kit solo debe contener artículos de la misma familia de productos.`;
                }

                // Regla 4: Dos lavamanos con medidas diferentes → incompatible
                if (newDetails.isLavamanos && currDetails.isLavamanos) {
                    if (newDetails.dimension && currDetails.dimension && newDetails.dimension !== currDetails.dimension) {
                        return `No se pueden combinar dos lavamanos con medidas diferentes en el mismo kit.\n\nLavamanos existente: ${currDetails.sku} (${currDetails.dimension})\nLavamanos nuevo: ${newDetails.sku} (${newDetails.dimension})\n\nUn kit de baño debe tener lavamanos de la misma referencia dimensional.`;
                    }
                    // Mismo tipo, misma medida: permitido (ej: kit doble)
                }

                // Regla 5: Dos muebles con medidas diferentes → incompatible
                if (newDetails.isMueble && currDetails.isMueble) {
                    if (newDetails.dimension && currDetails.dimension && newDetails.dimension !== currDetails.dimension) {
                        return `No se pueden combinar dos muebles con medidas diferentes en el mismo kit.\n\nMueble existente: ${currDetails.sku} (${currDetails.dimension})\nMueble nuevo: ${newDetails.sku} (${newDetails.dimension})\n\nUn kit de baño debe tener muebles de la misma referencia dimensional.`;
                    }
                }
            }

            return null;
        };

        const handleSelect = (field: ActiveField, item: any) => {
            if (field === "sku") {
                setSkuInput(item.SKU);
                setSelectedSku(item);
            } else if (field === "color") {
                setColorInput(item.CodigoColor); // Match screenshot: use code instead of name
                setSelectedColor(item);
            } else if (field === "version") {
                setVersionInput(item.CodigoVersion); // Match screenshot: use code instead of name
                setSelectedVersion(item);
            } else if (field === "kit_sku") {
                // Prevent duplicates
                if (kitSelectedItems.some(i => i.SKU === item.SKU)) {
                    setKitInput("");
                    setKitResults([]);
                    setActiveField(null);
                    return;
                }

                // Check compatibility rules based on Firplak Catalog
                const compatibilityError = validateKitCompatibility(item, kitSelectedItems);
                if (compatibilityError) {
                    setKitCompatError(compatibilityError);
                    setTimeout(() => setKitCompatError(null), 6000);
                    return; // Stop adding if incompatible
                }

                setKitSelectedItems(prev => [...prev, item]);
                setKitInput("");
                setKitResults([]);
            }

            if (field === "sku") setSkuResults([]);
            else if (field === "color") setColorResults([]);
            else if (field === "version") setVersionResults([]);
            else if (field === "kit_sku") setKitResults([]);
            setActiveField(null);
        };

        const SearchDropdown = ({ field, results, isLoading, isMoreLoading }: { field: ActiveField, results: any[], isLoading: boolean, isMoreLoading: boolean }) => {
            if (results.length === 0 && !isLoading) return null;

            const h1 = (field === "sku" || field === "kit_sku") ? "NRO. ARTÍCULO" : field === "color" ? "CÓDIGO COLOR" : "CÓDIGO VERSIÓN";
            const h2 = (field === "sku" || field === "kit_sku") ? "DESCRIPCIÓN SAP" : field === "color" ? "DESCRIPCIÓN COLOR" : "DESCRIPCIÓN VERSIÓN";

            return (
                <div className={`absolute top-[calc(100%+0.5rem)] left-0 ${field === 'version' ? 'right-0 w-auto' : 'w-[160%]'} bg-white rounded-[1.2rem] shadow-[0_60px_120px_rgba(15,23,42,0.25)] border border-slate-200 overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-300`}>
                    {/* Header Match ScreenShot */}
                    <div className="flex bg-[#eff2f5] border-b border-slate-200 font-black text-[0.65rem] tracking-[0.2em] text-[#324f5f]/60 uppercase italic">
                        <div className="w-[25%] px-8 py-5 border-r border-[#dee2e6]">{h1}</div>
                        <div className="w-[75%] px-8 py-5">{h2}</div>
                    </div>

                    {/* Scrollable Body Container */}
                    <div
                        className="max-h-[580px] overflow-y-auto custom-scrollbar bg-white"
                        onScroll={(e) => handleScroll(e, field)}
                    >
                        {isLoading ? (
                            <div className="py-24 text-center">
                                <div className="flex flex-col items-center gap-6">
                                    <Loader2 className="w-12 h-12 text-[#3499CD] animate-spin" />
                                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.6em] text-[#3499CD]/40">Sincronizando Catálogo...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {results.map((item, idx) => (
                                    <div
                                        key={`${field}-${idx}`}
                                        onMouseDown={() => {
                                            console.log(`Selecting ${field}:`, item);
                                            handleSelect(field, item);
                                        }}
                                        // Highlight Match Screenshot (Light Yellow)
                                        className="flex w-full group cursor-pointer hover:bg-[#FFFBEB] border-b border-slate-100 last:border-0 transition-colors duration-200"
                                    >
                                        <div className="w-[25%] px-8 py-5 font-mono font-black text-[#0F172A] text-lg tracking-tighter border-r border-slate-100 group-hover:text-[#3499CD] transition-colors">
                                            {(field === "sku" || field === "kit_sku") ? (item.SKU || "S/C") :
                                                field === "color" ? (item.CodigoColor || "S/C") : (item.CodigoVersion || "S/C")}
                                        </div>
                                        <div className="w-[75%] px-8 py-5 font-black text-[#64748B] text-[0.95rem] uppercase group-hover:text-[#0F172A] transition-colors leading-relaxed">
                                            {(field === "sku" || field === "kit_sku") ? (item.DESCRIPCION || "SIN NOMBRE") :
                                                field === "color" ? (item.Color || "SIN COLOR") : (item.Version || "SIN VERSIÓN")}
                                        </div>
                                    </div>
                                ))}

                                {isMoreLoading && (
                                    <div className="py-12 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 text-[#3499CD]">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span className="text-[0.6rem] font-black uppercase tracking-[0.5em] italic">Ampliando registros...</span>
                                    </div>
                                )}

                                {!hasMore[field as string] && results.length > 0 && (
                                    <div className="py-10 bg-slate-50/50 text-center border-t border-slate-50">
                                        <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-300">Catálogo Completo Cargado</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        };

        return (
            <div className="flex-1 w-full flex flex-col items-center justify-start min-h-screen bg-[#F8FAFC] p-8 pt-12 font-sans overflow-x-hidden">
                {/* Navigation & Header */}
                <div className="w-full max-w-6xl mb-12 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => selectedAction ? setSelectedAction(null) : window.location.href = "/protected"}
                            className="flex items-center gap-5 text-[#0F172A] font-black text-4xl tracking-tighter hover:opacity-80 transition-all group"
                        >
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:bg-[#F1F5F9] transition-all">
                                <ChevronLeft className="w-8 h-8 stroke-[4px]" />
                            </div>
                            <span className="uppercase italic relative">
                                {selectedAction ? "Creación de Solicitud de Código" : "Creación de Solicitud de Código"}
                                <div className={`absolute -bottom-2 left-0 w-48 h-1.5 bg-[#3499CD] rounded-full transition-all`} />
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {connStatus === "connected" && (
                            <div className="px-6 py-3 bg-white text-green-600 rounded-full border border-green-100 font-black text-[0.7rem] uppercase tracking-widest flex items-center gap-3 shadow-sm scale-90 md:scale-100 transition-all">
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
                    <div className="w-full max-w-5xl mb-10 p-10 bg-[#0F172A] text-blue-300 font-mono text-[0.8rem] rounded-[2.5rem] border border-white/10 shadow-3xl animate-in zoom-in duration-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Database className="w-48 h-48 text-white" />
                        </div>
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10">
                            <div className="space-y-2">
                                <div className="text-white/20 text-[0.6rem] font-bold tracking-[0.3em] uppercase">Table SKU</div>
                                <div className="text-white font-bold text-lg tracking-tight">{skuTable}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-white/20 text-[0.6rem] font-bold tracking-[0.3em] uppercase">Table Master</div>
                                <div className="text-white font-bold text-lg tracking-tight">{activeColoresTable}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-white/20 text-[0.6rem] font-bold tracking-[0.3em] uppercase">Registros</div>
                                <div className="text-green-400 font-bold text-lg">{skuResults.length + colorResults.length + versionResults.length} total</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-white/20 text-[0.6rem] font-bold tracking-[0.3em] uppercase">Errores</div>
                                <div className="text-red-400 font-bold">{detailedError ? "SI" : "NO"}</div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedAction ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl mt-6">
                        {[
                            { id: "estructura", title: "Estructura referencia", icon: Copy, desc: "Usar base de SAP" },
                            { id: "de_cero", title: "Crear de cero", icon: PlusCircle, desc: "Nuevo artículo" },
                            { id: "kit", title: "Crear kit", icon: Package, desc: "Agrupar piezas" },
                        ].map((action) => (
                            <button
                                key={action.id}
                                onClick={() => setSelectedAction(action.id)}
                                className="group p-10 rounded-[3rem] bg-white hover:bg-[#324f5f] transition-all duration-700 border border-slate-50 flex flex-col items-center gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(50,79,95,0.2)] hover:-translate-y-2"
                            >
                                <div className="p-12 bg-[#F8FAFC] group-hover:bg-white/10 rounded-[3rem] transition-all duration-500 shadow-inner group-hover:scale-110 border border-slate-50">
                                    <action.icon className="w-16 h-16 text-[#324f5f] group-hover:text-white stroke-[1.2px]" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="font-black uppercase italic text-2xl text-[#324f5f] group-hover:text-white tracking-tight">{action.title}</span>
                                    <span className="text-slate-300 group-hover:text-white/50 text-[0.6rem] font-black uppercase tracking-[0.5em] italic">{action.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="w-full max-w-4xl bg-white rounded-[2rem] p-16 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 space-y-12 relative animate-in zoom-in duration-700 overflow-visible">

                        {selectedAction === "estructura" ? (
                            <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                                {/* Row 1: SKU (Full Width) */}
                                <div className="relative space-y-4" ref={skuRef}>
                                    <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Buscar Código de Referencia</label>
                                    <div className={`relative transition-all duration-700 ${activeField === 'sku' ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                        <input
                                            type="text"
                                            value={skuInput}
                                            onFocus={() => handleFocus("sku")}
                                            onChange={(e) => setSkuInput(e.target.value)}
                                            placeholder="Ingrese SKU base..."
                                            className="w-full h-20 pl-10 pr-16 rounded-3xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm text-center"
                                        />
                                        <Search className={`absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeField === 'sku' ? 'text-[#3499CD]' : 'text-[#334155]'}`} />
                                    </div>

                                    {/* SKU Selected Detail */}
                                    {selectedSku && !activeField && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="w-full h-20 border-2 border-[#3499CD] rounded-2xl flex items-center justify-center bg-white">
                                                <span className="text-[#3499CD] font-black text-2xl tracking-tighter uppercase">
                                                    SKU Base: {selectedSku.SKU}
                                                </span>
                                            </div>
                                            <div className="space-y-1 pl-4">
                                                <div className="text-[#64748B] text-[0.8rem] font-bold uppercase tracking-wider">Descripción Base</div>
                                                <div className="text-[#0F364B] text-xl font-black uppercase leading-tight">
                                                    {selectedSku.DESCRIPCION}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <SearchDropdown field="sku" results={skuResults} isLoading={loading.sku} isMoreLoading={loadingMore.sku} />
                                </div>

                                {/* Row 2: Color & Version */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative items-start">
                                    <div className="relative space-y-4" ref={colorRef}>
                                        <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Buscar Color</label>
                                        <div className={`relative transition-all duration-700 ${activeField === 'color' ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                            <input
                                                type="text"
                                                value={colorInput}
                                                onFocus={() => handleFocus("color")}
                                                onChange={(e) => setColorInput(e.target.value)}
                                                placeholder="Código o nombre..."
                                                className="w-full h-20 pl-10 pr-16 rounded-3xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm text-center"
                                            />
                                            <Search className={`absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeField === 'color' ? 'text-[#3499CD]' : 'text-[#334155]'}`} />
                                        </div>

                                        {selectedColor && !activeField && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="w-full h-16 border-2 border-[#3499CD] rounded-2xl flex items-center justify-center bg-white">
                                                    <span className="text-[#3499CD] font-black text-lg tracking-tighter uppercase">
                                                        Color: {selectedColor.CodigoColor}
                                                    </span>
                                                </div>
                                                <div className="pl-4">
                                                    <div className="text-[#64748B] text-[0.7rem] font-bold uppercase">Color Seleccionado</div>
                                                    <div className="text-[#0F364B] text-lg font-black uppercase italic">{selectedColor.Color}</div>
                                                </div>
                                            </div>
                                        )}

                                        <SearchDropdown field="color" results={colorResults} isLoading={loading.color} isMoreLoading={loadingMore.color} />
                                    </div>

                                    <div className="relative space-y-4" ref={versionRef}>
                                        <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Buscar Versión</label>
                                        <div className={`relative transition-all duration-700 ${activeField === 'version' ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                            <input
                                                type="text"
                                                value={versionInput}
                                                onFocus={() => handleFocus("version")}
                                                onChange={(e) => setVersionInput(e.target.value)}
                                                placeholder="Versión..."
                                                className="w-full h-20 pl-10 pr-16 rounded-3xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm text-center"
                                            />
                                            <Search className={`absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeField === 'version' ? 'text-[#3499CD]' : 'text-[#334155]'}`} />
                                        </div>

                                        {selectedVersion && !activeField && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="w-full h-16 border-2 border-[#3499CD] rounded-2xl flex items-center justify-center bg-white">
                                                    <span className="text-[#3499CD] font-black text-lg tracking-tighter uppercase">
                                                        Versión: {selectedVersion.CodigoVersion || selectedVersion.Version}
                                                    </span>
                                                </div>
                                                <div className="pl-4">
                                                    <div className="text-[#64748B] text-[0.7rem] font-bold uppercase">Categoría</div>
                                                    <div className="text-[#0F364B] text-lg font-black uppercase italic">{selectedVersion.Version || selectedVersion.GroupName}</div>
                                                </div>
                                            </div>
                                        )}

                                        <SearchDropdown field="version" results={versionResults} isLoading={loading.version} isMoreLoading={loadingMore.version} />
                                    </div>
                                </div>
                            </div>
                        ) : selectedAction === "kit" ? (
                            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                                {/* Kit Article Search */}
                                <div className="relative space-y-4" ref={kitRef}>
                                    {/* ── Compatibility Error Toast ── */}
                                    {kitCompatError && (
                                        <div className="animate-in slide-in-from-top-4 fade-in duration-500 mb-4 flex items-start gap-4 p-6 bg-red-50 border-2 border-red-300 rounded-2xl shadow-lg relative">
                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                                <AlertTriangle className="w-7 h-7 text-red-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-red-700 font-black text-[0.85rem] uppercase tracking-wide mb-1">🚨 Artículo Incompatible</p>
                                                <p className="text-red-600 font-medium text-[0.82rem] leading-relaxed whitespace-pre-line">{kitCompatError}</p>
                                            </div>
                                            <button
                                                onClick={() => setKitCompatError(null)}
                                                className="shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                            {/* Progress bar auto-close */}
                                            <div className="absolute bottom-0 left-0 h-1 bg-red-300 rounded-b-2xl animate-[shrink_6s_linear_forwards]" style={{ width: '100%' }} />
                                        </div>
                                    )}

                                    <label className="text-[#64748B] font-bold text-[1rem] ml-2">Añadir Artículo al Kit</label>
                                    <div className={`relative transition-all duration-700 ${activeField === 'kit_sku' ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                        <input
                                            type="text"
                                            value={kitInput}
                                            onFocus={() => handleFocus("kit_sku")}
                                            onChange={(e) => setKitInput(e.target.value.toUpperCase())}
                                            placeholder="CACC01-0004-000-0000"
                                            className="w-full h-16 pl-10 pr-16 rounded-2xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-200 shadow-md text-center uppercase"
                                        />
                                        <Search className={`absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 ${activeField === 'kit_sku' ? 'text-[#3499CD]' : 'text-slate-400'}`} />
                                    </div>

                                    {/* Kit Selected Items List */}
                                    <div className="mt-8 space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                                        {kitSelectedItems.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-2xl border-l-[6px] border-l-[#0F364B] border-y border-r border-slate-100 group hover:shadow-md transition-all animate-in zoom-in slide-in-from-right-4 duration-300">
                                                <div className="flex flex-col">
                                                    <span className="text-[#0F364B] font-black text-lg tracking-tight leading-none mb-1">{item.SKU}</span>
                                                    <span className="text-slate-500 font-bold uppercase text-[0.75rem] leading-tight">{item.DESCRIPCION}</span>
                                                </div>
                                                <button
                                                    onClick={() => setKitSelectedItems(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="p-2 text-[#FF5A5F] hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-6 h-6" />
                                                </button>
                                            </div>
                                        ))}
                                        {kitSelectedItems.length === 0 && (
                                            <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <Package className="w-10 h-10 text-slate-200" />
                                                </div>
                                                <span className="text-slate-300 font-bold uppercase text-[0.7rem] tracking-widest">Ningún artículo añadido</span>
                                            </div>
                                        )}
                                    </div>

                                    <SearchDropdown field="kit_sku" results={kitResults} isLoading={loading.kit_sku} isMoreLoading={loadingMore.kit_sku} />
                                </div>

                                {/* Kit Name Field */}
                                <div className="space-y-4">
                                    <label className="text-[#64748B] font-bold text-[1rem] ml-2">Nombre del Kit</label>
                                    <input
                                        type="text"
                                        value={kitName}
                                        onChange={(e) => setKitName(e.target.value.toUpperCase())}
                                        placeholder="Ej: KIT MUEBLE + LAVAMAN"
                                        className="w-full h-16 px-10 rounded-2xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-black placeholder:text-slate-200 shadow-md text-center uppercase"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
                                {/* Row 1: Color & Version (grid-cols-2) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative items-start">
                                    {/* Color */}
                                    <div className="relative space-y-4" ref={colorRef}>
                                        <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Buscar Color</label>
                                        <div className={`relative transition-all duration-700 ${activeField === 'color' ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                            <input
                                                type="text"
                                                value={colorInput}
                                                onFocus={() => handleFocus("color")}
                                                onChange={(e) => setColorInput(e.target.value)}
                                                placeholder="Código o nombre..."
                                                className="w-full h-20 pl-10 pr-16 rounded-3xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm text-center"
                                            />
                                            <Search className={`absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeField === 'color' ? 'text-[#3499CD]' : 'text-[#334155]'}`} />
                                        </div>

                                        {selectedColor && !activeField && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="w-full h-16 border-2 border-[#3499CD] rounded-2xl flex items-center justify-center bg-white">
                                                    <span className="text-[#3499CD] font-black text-lg tracking-tighter uppercase">
                                                        Color: {selectedColor.CodigoColor}
                                                    </span>
                                                </div>
                                                <div className="pl-4">
                                                    <div className="text-[#64748B] text-[0.7rem] font-bold uppercase">Color Seleccionado</div>
                                                    <div className="text-[#0F364B] text-lg font-black uppercase italic">{selectedColor.Color}</div>
                                                </div>
                                            </div>
                                        )}

                                        <SearchDropdown field="color" results={colorResults} isLoading={loading.color} isMoreLoading={loadingMore.color} />
                                    </div>

                                    {/* Version */}
                                    <div className="relative space-y-4" ref={versionRef}>
                                        <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Buscar Versión</label>
                                        <div className={`relative transition-all duration-700 ${activeField === 'version' ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                            <input
                                                type="text"
                                                value={versionInput}
                                                onFocus={() => handleFocus("version")}
                                                onChange={(e) => setVersionInput(e.target.value)}
                                                placeholder="Versión..."
                                                className="w-full h-20 pl-10 pr-16 rounded-3xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm text-center"
                                            />
                                            <Search className={`absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeField === 'version' ? 'text-[#3499CD]' : 'text-[#334155]'}`} />
                                        </div>

                                        {selectedVersion && !activeField && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="w-full h-16 border-2 border-[#3499CD] rounded-2xl flex items-center justify-center bg-white">
                                                    <span className="text-[#3499CD] font-black text-lg tracking-tighter uppercase">
                                                        Versión: {selectedVersion.CodigoVersion || selectedVersion.Version}
                                                    </span>
                                                </div>
                                                <div className="pl-4">
                                                    <div className="text-[#64748B] text-[0.7rem] font-bold uppercase">Categoría</div>
                                                    <div className="text-[#0F364B] text-lg font-black uppercase italic">{selectedVersion.Version || selectedVersion.GroupName}</div>
                                                </div>
                                            </div>
                                        )}

                                        <SearchDropdown field="version" results={versionResults} isLoading={loading.version} isMoreLoading={loadingMore.version} />
                                    </div>
                                </div>

                                {/* Row 2: Buscar Artículos (full width) */}
                                <div className="relative space-y-4" ref={skuRef}>
                                    <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Buscar Artículos</label>
                                    <div className={`relative transition-all duration-700 ${activeField === 'sku' ? 'scale-[1.02] z-[201]' : 'z-10'}`}>
                                        <input
                                            type="text"
                                            value={skuInput}
                                            onFocus={() => handleFocus("sku")}
                                            onChange={(e) => setSkuInput(e.target.value)}
                                            placeholder="Ingrese SKU o descripción..."
                                            className="w-full h-20 pl-10 pr-16 rounded-3xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-xl text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm text-center"
                                        />
                                        <Search className={`absolute right-8 top-1/2 -translate-y-1/2 w-7 h-7 ${activeField === 'sku' ? 'text-[#3499CD]' : 'text-[#334155]'}`} />
                                    </div>

                                    {selectedSku && !activeField && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="w-full h-20 border-2 border-[#3499CD] rounded-2xl flex items-center justify-center bg-white">
                                                <span className="text-[#3499CD] font-black text-2xl tracking-tighter uppercase">
                                                    SKU: {selectedSku.SKU}
                                                </span>
                                            </div>
                                            <div className="space-y-1 pl-4">
                                                <div className="text-[#64748B] text-[0.8rem] font-bold uppercase tracking-wider">Descripción</div>
                                                <div className="text-[#0F364B] text-xl font-black uppercase leading-tight">{selectedSku.DESCRIPCION}</div>
                                            </div>
                                        </div>
                                    )}

                                    <SearchDropdown field="sku" results={skuResults} isLoading={loading.sku} isMoreLoading={loadingMore.sku} />
                                </div>

                                {/* Row 3: Comentarios */}
                                <div className="space-y-4">
                                    <label className="text-[#64748B] font-bold text-[0.9rem] ml-2">Insertar comentarios</label>
                                    <textarea
                                        rows={4}
                                        value={comentarios}
                                        onChange={(e) => setComentarios(e.target.value)}
                                        placeholder="Ingrese cualquier observación o detalle adicional..."
                                        className="w-full px-10 py-6 rounded-2xl border-2 border-[#E2E8F0] bg-white focus:border-[#3499CD] transition-all text-lg text-[#0F172A] font-medium placeholder:text-slate-300 shadow-sm resize-none outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Action Buttons common to all modules */}
                        <div className="pt-8 flex flex-col gap-4 relative z-0">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || submitSuccess}
                                className={`w-full h-16 text-white font-black text-xl tracking-[0.2em] rounded-2xl shadow-xl transition-all uppercase flex items-center justify-center gap-3
                                ${submitSuccess ? 'bg-green-500 scale-[1.02]' : 'bg-[#0F364B] hover:bg-[#0A2432] active:scale-[0.98]'}`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : submitSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-8 h-8" />
                                        ¡SOLICITUD ENVIADA!
                                    </>
                                ) : (
                                    "FINALIZAR SOLICITUD"
                                )}
                            </button>

                            <button
                                onClick={() => setSelectedAction(null)}
                                disabled={isSubmitting}
                                className="w-full h-16 border-2 border-[#0F364B] text-[#0F364B] font-black text-xl tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all uppercase disabled:opacity-50"
                            >
                                VOLVER ATRÁS
                            </button>
                        </div>
                    </div>
                )}



            </div>
        );
    }
