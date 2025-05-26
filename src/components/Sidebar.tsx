// src/components/Sidebar.tsx
import type { Zona } from "../data/zonas";

interface Props {
  selected: Zona | null;
}

export default function Sidebar({ selected }: Props) {
  return (
    <div style={{ width: 220, background: "#fff", padding: 20, minHeight: "100vh" }}>
      <h2 style={{ fontWeight: 700, fontSize: 20 }}>Zona seleccionada</h2>
      {selected ? (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontWeight: 700 }}>{selected.nombre}</h3>
          <span>{selected.sector}</span>
        </div>
      ) : (
        <div style={{ marginTop: 20, color: "#555" }}>Selecciona una zona en el mapa</div>
      )}
    </div>
  );
}


// src/components/PortContour.tsx
import React from 'react';

const PortContour: React.FC = () => (
  <svg
    width="1200"
    height="800"
    viewBox="0 0 1200 800"
    style={{ background: "#e8f4f8", display: "block", margin: "0 auto" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* FONDO */}
    <rect x="0" y="0" width="1200" height="800" fill="#e8f4f8" />
    
    {/* CONTORNO PRINCIPAL DEL PUERTO */}
    <path d="M 120 120 
             Q 150 80 250 90
             L 650 80
             Q 800 75 900 90
             Q 1000 105 1100 140
             Q 1150 170 1170 220
             L 1170 580
             Q 1150 630 1100 660
             Q 1000 695 900 710
             Q 800 715 650 710
             L 250 720
             Q 150 710 120 650
             L 120 170
             Q 120 120 120 120 Z" 
          fill="#5a667a" />
    
    {/* ÁREA AZUL DEL QUAY */}
    <path d="M 900 90
             Q 1000 105 1100 140
             Q 1150 170 1170 220
             L 1170 580
             Q 1150 630 1100 660
             Q 1000 695 900 710
             Q 920 680 940 620
             L 940 200
             Q 920 130 900 90 Z"
          fill="#7dd3fc" />
    
    {/* CAMINOS NEGROS PRINCIPALES */}
    
    {/* Contorno negro principal del área TEBAS/O'HIGGINS */}
    <path d="M 150 200 
             Q 180 180 220 185
             L 350 180
             Q 420 175 480 185
             Q 530 195 570 210
             Q 610 225 630 250
             L 630 580
             Q 610 620 570 640
             L 350 650
             Q 220 645 180 620
             Q 150 595 150 560
             L 150 240
             Q 150 200 150 200 Z" 
          fill="none" 
          stroke="#1a1a1a" 
          strokeWidth="25" 
          strokeLinecap="round" 
          strokeLinejoin="round" />
    
    {/* Camino curvado hacia el QUAY */}
    <path d="M 630 350 
             Q 700 340 770 350
             Q 830 360 880 380
             Q 920 400 940 430" 
          fill="none" 
          stroke="#1a1a1a" 
          strokeWidth="25" 
          strokeLinecap="round" 
          strokeLinejoin="round" />
    
    {/* Camino inferior hacia zonas de apoyo */}
    <path d="M 630 580 
             Q 700 590 770 585
             Q 830 580 880 585
             Q 920 590 940 600" 
          fill="none" 
          stroke="#1a1a1a" 
          strokeWidth="25" 
          strokeLinecap="round" 
          strokeLinejoin="round" />
    
    {/* Camino de conexión GATE IN */}
    <path d="M 150 350 
             Q 120 330 110 300
             Q 105 270 115 240
             Q 125 210 150 200" 
          fill="none" 
          stroke="#1a1a1a" 
          strokeWidth="20" 
          strokeLinecap="round" 
          strokeLinejoin="round" />
    
    {/* Líneas de división en área O'HIGGINS */}
    <rect x="480" y="380" width="150" height="200" fill="none" stroke="#1a1a1a" strokeWidth="15" rx="10" />
    
    {/* Divisiones internas de área Costanera */}
    <line x1="650" y1="450" x2="880" y2="450" stroke="#1a1a1a" strokeWidth="12" />
    <line x1="650" y1="500" x2="880" y2="500" stroke="#1a1a1a" strokeWidth="12" />
    <line x1="720" y1="450" x2="720" y2="580" stroke="#1a1a1a" strokeWidth="12" />
    <line x1="800" y1="450" x2="800" y2="580" stroke="#1a1a1a" strokeWidth="12" />
    
    {/* Camino curvo hacia ESPIGÓN */}
    <path d="M 940 430 
             Q 980 420 1020 430
             Q 1050 440 1070 460
             Q 1080 480 1075 500
             Q 1070 520 1050 535
             Q 1030 550 1000 560" 
          fill="none" 
          stroke="#1a1a1a" 
          strokeWidth="20" 
          strokeLinecap="round" 
          strokeLinejoin="round" />
    
    {/* Líneas de separación verticales menores */}
    <line x1="300" y1="250" x2="300" y2="600" stroke="#1a1a1a" strokeWidth="8" />
    <line x1="400" y1="350" x2="400" y2="580" stroke="#1a1a1a" strokeWidth="8" />
  </svg>
);

export default PortContour;