import { ChevronLeft, Phone, Video, MessageCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function VirtualGuard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-[#fde8e8] text-[#dc2626] p-6 pb-8 rounded-b-3xl shadow-lg">
        <button onClick={() => navigate("/home")} className="mb-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <h1 className="text-xl">Guardia Virtual</h1>
        </div>
        <p className="text-[#dc2626]/90 text-sm mt-2">
          Atención de emergencia las 24 horas
        </p>
      </div>

      <div className="p-6">
        <div className="bg-[#fef2f2] border-2 border-[#fecaca] rounded-3xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-[#ef4444] flex-shrink-0" />
            <div>
              <h3 className="text-[#991b1b] mb-1 font-medium">¿Es una emergencia grave?</h3>
              <p className="text-sm text-[#b91c1c]">
                Si tu mascota presenta dificultad para respirar, sangrado abundante,
                convulsiones o pérdida de conciencia, llama inmediatamente al{" "}
                <span className="font-semibold">0800-VET-URGENCIA</span>
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-foreground mb-4">Opciones de contacto</h2>

        <div className="space-y-3">
          <button className="w-full bg-[#86efac] text-[#166534] p-5 rounded-3xl hover:bg-[#6ee7b7] transition-colors shadow-md flex items-center gap-4">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <div className="text-base font-medium">Llamada de emergencia</div>
              <div className="text-sm text-[#166534]/80">
                Habla con un veterinario ahora
              </div>
            </div>
          </button>

          <button className="w-full bg-[#93c5fd] text-[#1e40af] p-5 rounded-3xl hover:bg-[#a5cfff] transition-colors shadow-md flex items-center gap-4">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <div className="text-base font-medium">Videollamada</div>
              <div className="text-sm text-[#1e40af]/80">
                Consulta virtual en vivo
              </div>
            </div>
          </button>

          <button className="w-full bg-[#fdba74] text-[#9a3412] p-5 rounded-3xl hover:bg-[#fcb272] transition-colors shadow-md flex items-center gap-4">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <div className="text-base font-medium">Chat en línea</div>
              <div className="text-sm text-[#9a3412]/80">
                Consulta por mensaje
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 bg-secondary rounded-3xl p-5">
          <h3 className="text-foreground mb-3">Veterinarias de guardia 24hs</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-foreground text-sm">Vet Care Recoleta</p>
                <p className="text-xs text-muted-foreground">Av. Las Heras 2102</p>
              </div>
              <button className="text-primary text-sm hover:underline">
                Llamar
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-foreground text-sm">Clínica 24hs Palermo</p>
                <p className="text-xs text-muted-foreground">Av. Santa Fe 3950</p>
              </div>
              <button className="text-primary text-sm hover:underline">
                Llamar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
