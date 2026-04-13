"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ColorGroup {
    CodigoVersion: string | null;
    Version: string | null;
    CodigoColor: string | null;
    Color: string | null;
    CodigoArticulo: string | null;
    Articulo: string | null;
}

export function ColorGroupsTable() {
    const [data, setData] = useState<ColorGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: result, error } = await supabase
                    .from("BD_ COLORES_GRUPOS")
                    .select("*");

                if (error) throw error;
                setData(result || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredData = data.filter((item) => {
        const searchStr = searchTerm.toLowerCase();
        return (
            item.Version?.toLowerCase().includes(searchStr) ||
            item.Color?.toLowerCase().includes(searchStr) ||
            item.Articulo?.toLowerCase().includes(searchStr) ||
            item.CodigoArticulo?.toLowerCase().includes(searchStr) ||
            item.CodigoColor?.toLowerCase().includes(searchStr) ||
            item.CodigoVersion?.toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="w-full mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <h3 className="text-2xl font-black text-[#23313F] dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="w-2 h-10 bg-[#FDD79A] rounded-full" />
                    Base de Datos Colores y Grupos
                </h3>

                <div className="relative w-full md:w-[28rem]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#23313F]/30" />
                    <Input
                        placeholder="Buscar por versión, color, artículo..."
                        className="pl-12 h-14 border-[#23313F]/10 focus:border-[#FDD79A] focus:ring-[#FDD79A] rounded-2xl bg-white/60 backdrop-blur-md transition-all font-medium text-lg placeholder:text-[#23313F]/20 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-[2rem] border border-[#23313F]/5 overflow-hidden bg-white/40 backdrop-blur-2xl shadow-[0_25px_60px_rgba(35,49,63,0.05)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#324f5f] text-white">
                            <tr>
                                <th className="px-5 py-6 text-left text-sm font-black tracking-widest uppercase">
                                    Código SAP
                                </th>
                                <th className="px-5 py-6 text-left text-sm font-black tracking-widest uppercase">
                                    Descripción Versión
                                </th>
                                <th className="px-5 py-6 text-left text-sm font-black tracking-widest uppercase">
                                    Familia
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <Loader2 className="w-12 h-12 text-[#23313F] animate-spin" />
                                                <div className="absolute inset-0 bg-[#FDD79A]/20 blur-xl rounded-full" />
                                            </div>
                                            <span className="text-[#23313F]/40 font-black italic uppercase tracking-widest text-xs">Consultando SAP Business One...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-32 text-center text-[#23313F]/40 font-bold italic text-lg">
                                        {searchTerm ? "No se encontraron resultados." : "No hay datos disponibles."}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-[#23313F]/5 transition-colors group"
                                    >
                                        <td className="px-8 py-4 text-sm font-bold text-[#23313F]/40">{item.CodigoVersion}</td>
                                        <td className="px-8 py-4 text-sm font-black text-[#23313F]">{item.Version}</td>
                                        <td className="px-8 py-4 text-sm font-bold text-[#23313F]/40">{item.CodigoColor}</td>
                                        <td className="px-8 py-4 text-sm font-black text-[#23313F]">
                                            <span className="bg-[#FDD79A] px-3 py-1 rounded-lg text-[#23313F] shadow-sm">
                                                {item.Color}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-sm font-bold text-[#23313F]/40 font-mono tracking-tighter">{item.CodigoArticulo}</td>
                                        <td className="px-8 py-4 text-sm font-medium text-[#23313F]/80 group-hover:text-[#23313F] transition-colors">{item.Articulo}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between items-center text-[0.65rem] text-[#23313F]/30 font-black uppercase tracking-[0.3em]">
                <span>Mostrando {filteredData.length} registros</span>
                <span>© FIRPLAK HOME - 2024</span>
            </div>
        </div>
    );
}
