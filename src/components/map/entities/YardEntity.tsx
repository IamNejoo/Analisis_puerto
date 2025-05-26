import React from 'react';
import BlockEntity from './BlockEntity';

const YardEntity = () => {
  return (
    <g id="g187">
      {/* Contenedores amarillos principales */}
      <path 
        id="patio-costanera" 
        d="m447.51 521.45-0.73574 24.279 1.8394 2.3911 2.943 1.4715 131.88-0.5518 3.4948-2.3912 1.4715-1.6554-0.36787-22.256-1.2876-2.943-1.8393-1.1036-134.27-0.91967-2.2072 1.2875z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 1"
      />
      
      <path 
        id="path179" 
        d="m451.19 556.59 131.33-0.18393 3.1269 0.91967 1.4715 2.0233 0.18394 25.199-1.4715 2.3912-2.943 1.6554-132.8-0.5518-2.759-1.4715-0.91967-2.2072 0.36787-23.911 2.0233-2.759z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 2"
      />
      
      <path 
        id="path180" 
        d="m609.56 518.88 103.74-0.18393 4.2305 2.3912 0.91967 3.8626-0.18393 19.865-1.1036 2.759-2.759 1.6554h-100.98l-4.2305-0.91967-2.0233-2.0233-0.55181-1.1036 0.18394-24.095z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 3"
      />
      
      <path 
        id="path181" 
        d="m607.26 560.3v25.232l0.52025 1.3006 0.91043 0.78037 2.211 0.26012 107.82 0.13006-0.26012-27.443-1.6908-2.081-2.8614-1.1706-102.49-0.52024-1.9509 0.65031-1.1706 0.6503z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 4"
      />
      
      <path 
        id="path182" 
        d="m623.12 590.35 52.025 17.558 37.328 0.39018 3.9018-3.1215 1.9509-3.3816v-11.706z" 
        style={{ fill: '#F5AB00', strokeWidth: 1, stroke: '#34495E', opacity: 0.9, cursor: 'pointer' }}
        className="hover:opacity-80 transition-opacity"
        data-tip="Patio de contenedores - Bloque 5"
      />
      
      {/* Más patios... (reducido para brevedad) */}
      
      {/* Bloques individuales */}
      <BlockEntity id="costanera-c1" x="518.14" y="533.78" label="C1" value={82} tip="Contenedores C1: 82% ocupación" />
      <BlockEntity id="costanera-c2" x="517.14" y="572.37" label="C2" value={75} tip="Contenedores C2: 75% ocupación" />
      <BlockEntity id="costanera-c3" x="660" y="533.37" label="C3" value={90} tip="Contenedores C3: 90% ocupación" />
      <BlockEntity id="costanera-c4" x="661.64" y="572.05" label="C4" value={65} tip="Contenedores C4: 65% ocupación" />
      <BlockEntity id="costanera-c5" x="690.03" y="598.81" label="C5" value={70} tip="Contenedores C5: 70% ocupación" />
      <BlockEntity id="costanera-c6" x="801.5" y="534.11" label="C6" value={95} tip="Contenedores C6: 95% ocupación" />
      <BlockEntity id="costanera-c7" x="801.03" y="570.94" label="C7" value={80} tip="Contenedores C7: 80% ocupación" />
      <BlockEntity id="costanera-c8" x="797.82" y="604.56" label="C8" value={60} tip="Contenedores C8: 60% ocupación" />
      <BlockEntity id="costanera-c9" x="835.59" y="635.09" label="C9" value={85} tip="Contenedores C9: 85% ocupación" />
      <BlockEntity id="costanera-se" x="780.4" y="633" label="SE" value={65} tip="Carga Especial: 65% ocupación" size={11} />
    </g>
  );
};

export default YardEntity;