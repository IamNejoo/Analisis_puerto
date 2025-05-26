
import React, { useState } from 'react';

const PortMap = ({
  className = "w-full h-auto",
  initialSettings = {
    showGates: true,
    showContainers: true,
    showAduanas: true,
    showTebas: true,
    showIMO: true,
    showOHiggins: true,
    showEspingon: true,
    showGruas: true,
    showCaminos: true
  }
}) => {
  const [settings, setSettings] = useState(initialSettings);

  const toggleSetting = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(settings).map(setting => (
          <button
            key={setting}
            onClick={() => toggleSetting(setting)}
            className={`px-3 py-1 rounded text-sm ${
              settings[setting] 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {setting.replace('show', '')}
          </button>
        ))}
      </div>
      
      <svg 
        id="svg1" 
        width="950" 
        height="500" 
        version="1.1" 
        viewBox="0 0 950 500" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g id="layer3" transform="translate(-91.272334,-242.83538)">
          {/* Base paths - always visible */}
          <path 
            id="calles-terminal" 
            d="m53.065 452.09 2.081-135.26 16.648-0.52025 52.545-70.753 13.526-4.6822 74.395-6.7632 13.526 5.7227 36.937 55.146 27.053-3.1215 17.688 2.6012 17.168 5.7227 20.29 16.648 88.442 69.713 11.966 19.249 2.081 8.8442v68.672l3.1215 13.526 9.3644 9.8847 10.405 4.162 407.87-2.6012-3.1215 133.7 6.243 6.7632 7.2834 1.0405 5.2025-2.6012 46.302-105.09 63.47-55.146-44.741-49.944 8.8442-8.8442 91.043 97.286-142.03 108.73-7.2834 16.128-11.966 10.405-9.3644 3.6417-15.087 1.5607 1.0405 24.452-191.45 1.0405v-35.897l74.395-2.081-144.11-52.545-279.89-2.6012-9.8847-2.081-5.7227-4.162-26.533-76.996-1.5607-18.209 4.6822-18.729 14.047-19.769 14.047 1.0405 43.701-26.533h49.944l-0.52024-13.526-6.243-11.445-28.093-20.81-36.417-31.735-28.093-22.371-14.567-10.405-13.006-3.6417-22.371 2.6012-25.492 3.6417-7.8037 0.52025-10.405 30.694 0.52025 31.735-54.626 21.85 4.6822 46.822h65.031l82.199-40.059 23.931-11.185 21.85-10.405 10.925-7.5436-33.816 15.087-23.411 11.185-81.158 43.961h-65.551l-21.85 4.6822 1.5607-10.405-1.5607-16.128-6.7632-13.526-9.3644-8.3239 11.445-27.573-30.694 16.128-19.769-1.5607-16.648 4.6822-14.567 11.966-8.3239 13.526-3.6417 15.087z" 
            style={{ 
              fillOpacity: 0.75381, 
              fill: '#333',
              opacity: 0.3
            }}
          />
          
          {/* CAMINOS DEL TERMINAL - Mostrar solo si showCaminos es true */}
          {settings.showCaminos && (
            <g id="g164">
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 242.79357,311.03328 c 61.61807,-13.61115 74.30955,3.67869 74.30955,3.67869"
                id="path106"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 334.20903,318.02279 c 86.44923,67.87184 86.44923,67.87184 86.44923,67.87184"
                id="path107"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 328.691,323.54083 88.4725,70.44692"
                id="path108"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 323.72476,329.7946 88.65644,70.44693"
                id="path109"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 423.60121,586.38327 -0.73574,-164.0696"
                id="path110"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 431.69433,585.64753 -0.36787,-30.71707"
                id="path111"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="M 431.69433,549.96423 V 422.12973"
                id="path112"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="M 439.60351,585.83146 V 421.76187"
                id="path113"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 592.82097,519.4311 0.18394,69.34331"
                id="path114"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 597.60327,519.4311 0.36787,69.89512"
                id="path115"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 602.5695,518.87929 0.73574,70.44693"
                id="path116"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 326.48378,462.77926 c -53.00979,8.02665 -23.04857,70.74684 -12.13968,100.98006"
                id="path119"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 314.16017,563.57538 9.8405,24.37133"
                id="path121"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 324.00067,587.94671 c 4.21581,6.37644 9.57146,5.83828 16.83,5.97787"
                id="path122"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 340.73871,593.92458 72.56217,-0.45984"
                id="path123"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 411.92137,399.87366 c 6.28689,4.88035 9.05385,14.65431 10.85214,22.99181"
                id="path124"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 416.70367,393.52792 c 8.2704,6.10527 12.95778,17.92155 15.26656,29.24559"
                id="path125"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 420.56629,385.52676 c 10.38152,10.90826 17.07922,21.80336 19.31313,36.60297"
                id="path126"
              />
              <path
                style={{ fill: 'none', fillOpacity: 0, stroke: '#e4e4e4', strokeLinecap: 'square', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 91.967262,306.43492 34.947558,-51.1338 8.82886,-5.51804 72.28627,-6.4377 11.77181,5.51803 31.4528,47.27118"
                id="path105"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 1, fillRule: 'evenodd', paintOrder: 'markers fill stroke' }}
                d="m 373.08064,344.67615 1.49571,-1.56073 -5.26749,-3.96688 0.97546,-1.30061 -4.74724,-0.78037 1.43068,4.35706 1.23558,-1.23559 z"
                id="path127-0"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 1, fillRule: 'evenodd', paintOrder: 'markers fill stroke' }}
                d="m 367.1227,350.07239 1.49571,-1.56073 -5.26749,-3.96688 0.97546,-1.30061 -4.74724,-0.78037 1.43068,4.35706 1.23558,-1.23559 z"
                id="path127-0-2"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 1, fillRule: 'evenodd', paintOrder: 'markers fill stroke' }}
                d="m 355.58903,348.64929 -1.49571,1.56073 5.26749,3.96688 -0.97546,1.30061 4.74724,0.78037 -1.43068,-4.35706 -1.23558,1.23559 z"
                id="path127-0-2-5"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 1, fillRule: 'evenodd', paintOrder: 'markers fill stroke' }}
                d="m 349.58651,354.17791 -1.49571,1.56073 5.26749,3.96688 -0.97546,1.30061 4.74724,0.78037 -1.43068,-4.35706 -1.23558,1.23559 z"
                id="path127-0-2-5-2"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', paintOrder: 'markers fill stroke' }}
                d="M 448.97178,593.86012 H 609.20736"
                id="path128"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="M 449.2319,593.33988 H 606.86626"
                id="path129"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 606.08589,593.33988 c 17.55828,-0.78037 71.6638,22.8908 71.6638,22.8908"
                id="path130"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 677.22945,615.97055 103.78896,38.75829"
                id="path131"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 723.41449,520.90257 0.5518,86.44923"
                id="path132"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 730.58793,520.53471 0.18394,86.44922"
                id="path133"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 737.76138,520.90257 -0.36787,86.08136"
                id="path134"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 363.54659,553.27505 6.98951,0.2759 -0.092,-2.11524 5.88591,2.48311 -5.70197,2.66705 v -1.37951 l -7.26542,-0.092 v 1.83934 l -6.62164,-2.20721 6.52968,-3.58673 z"
                id="path135"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 362.0596,494.5067 6.98951,0.2759 -0.092,-2.11524 5.88591,2.48311 -5.70197,2.66705 v -1.37951 l -7.26542,-0.092 v 1.83934 l -6.62164,-2.20721 6.52968,-3.58673 z"
                id="path135-6"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 363.68414,463.72511 6.98951,0.2759 -0.092,-2.11524 5.88591,2.48311 -5.70197,2.66705 v -1.37951 l -7.26542,-0.092 v 1.83934 l -6.62164,-2.20721 6.52968,-3.58673 z"
                id="path135-6-7"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 420.18047,576.23195 1.73051,-0.0555 -0.19778,4.88728 h 0.7911 l -1.33496,3.72099 -1.58218,-3.55438 0.79109,-0.0555 z"
                id="path136"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 427.02987,576.35353 1.73051,-0.0555 -0.19778,4.88728 h 0.7911 l -1.33496,3.72099 -1.58218,-3.55438 0.79109,-0.0555 z"
                id="path136-8"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 434.47806,584.98817 1.73051,0.0555 -0.19778,-4.88728 h 0.7911 l -1.33496,-3.72099 -1.58218,3.55438 0.79109,0.0555 z"
                id="path136-8-0"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 441.89249,585.26523 1.73051,0.0555 -0.19778,-4.88728 h 0.7911 l -1.33496,-3.72099 -1.58218,3.55438 0.79109,0.0555 z"
                id="path136-8-0-6"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 589.21121,557.1657 1.73051,-0.0555 -0.19778,4.88728 h 0.7911 l -1.33496,3.72099 -1.58218,-3.55438 0.79109,-0.0555 z"
                id="path136-9"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 594.54315,557.10334 1.73051,-0.0555 -0.19778,4.88728 h 0.7911 l -1.33496,3.72099 -1.58218,-3.55438 0.79109,-0.0555 z"
                id="path136-8-7"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 599.69215,565.78397 1.73051,0.0555 -0.19778,-4.88728 h 0.7911 l -1.33496,-3.72099 -1.58218,3.55438 0.79109,0.0555 z"
                id="path136-8-0-2"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 604.2556,566.19898 1.73051,0.0555 -0.19778,-4.88728 h 0.7911 l -1.33496,-3.72099 -1.58218,3.55438 0.79109,0.0555 z"
                id="path136-8-0-6-2"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 457.71999,591.50235 0.0555,-1.73051 -4.88728,0.19778 v -0.7911 l -3.72099,1.33496 3.55438,1.58218 0.0555,-0.79109 z"
                id="path136-8-0-6-4"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 449.94959,597.52286 -0.0555,-1.73051 4.88728,0.19778 v -0.7911 l 3.72099,1.33496 -3.55438,1.58218 -0.0555,-0.79109 z"
                id="path136-8-0-6-4-4"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 513.29231,553.54223 -0.0555,-1.73051 4.88728,0.19778 v -0.7911 l 3.72099,1.33496 -3.55438,1.58218 -0.0555,-0.79109 z"
                id="path136-8-0-6-4-4-9"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 660.01501,553.69929 -0.0555,-1.73051 4.88728,0.19778 v -0.7911 l 3.72099,1.33496 -3.55438,1.58218 -0.0555,-0.79109 z"
                id="path136-8-0-6-4-4-3"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 426.68211,535.34144 -0.046,19.17517 7.26541,-0.13795 -0.046,1.79336 4.55238,-2.85098 -4.46041,-3.72468 v 1.74738 l -4.46041,0.13795 0.22991,-16.50812 -3.3568,-0.092 z"
                id="path137"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 446.73098,551.48169 -0.18394,3.77066 6.02386,-1.79336 z"
                id="path138"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 585.48659,551.75759 0.13795,3.49476 -5.0582,-1.49447 z"
                id="path139"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 609.09918,551.71161 0.092,3.86262 5.15016,-1.74738 z"
                id="path140"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 717.52858,551.25177 0.092,4.32246 -5.15017,-1.88533 z"
                id="path141"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 446.63068,504.96319 -0.39019,8.32393 8.19387,-0.26013 z"
                id="path142"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 450.66258,503.33742 8.51902,7.99878"
                id="path143"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 450.33742,503.33742 9.62454,8.58405"
                id="path144"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 447.41104,516.08344 10.33988,-0.39019"
                id="path145"
              />
<path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 746.74724,588.82025 c 0.13006,-2.40614 0.13006,-2.40614 0.13006,-2.40614 l 4.38957,2.21104 -4.64969,2.34111 z"
                id="path149"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 720.06249,556.85762 1.73051,-0.0555 -0.19778,4.88728 h 0.7911 l -1.33496,3.72099 -1.58218,-3.55438 0.79109,-0.0555 z"
                id="path136-4"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 726.45205,556.88723 1.73051,-0.0555 -0.19778,4.88728 h 0.7911 l -1.33496,3.72099 -1.58218,-3.55438 0.79109,-0.0555 z"
                id="path136-8-2"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 733.25647,565.52187 1.73051,0.0555 -0.19778,-4.88728 h 0.7911 l -1.33496,-3.72099 -1.58218,3.55438 0.79109,0.0555 z"
                id="path136-8-0-5"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 739.56729,565.70697 1.73051,0.0555 -0.19778,-4.88728 h 0.7911 l -1.33496,-3.72099 -1.58218,3.55438 0.79109,0.0555 z"
                id="path136-8-0-6-8"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 856.90497,553.45899 4.87426,-2.29919 v 3.9546 z"
                id="path150"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 881.29571,658.37055 c 26.07852,-3.64076 31.83381,-34.14104 40.96932,-57.09693"
                id="path151"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 931.49939,577.86258 c 11.78362,-36.9776 43.4008,-56.41714 72.44421,-80.37792"
                id="path152"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 933.29796,615.68592 1.00977,1.40644 -4.1695,2.55734 0.44055,0.65709 -3.83405,0.96331 2.07118,-3.29349 0.48665,0.62616 z"
                id="path136-8-2-3-1"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 965.73272,534.34908 -1.00977,-1.40644 4.1695,-2.55734 -0.44055,-0.65709 3.83405,-0.96331 -2.07118,3.29349 -0.48665,-0.62616 z"
                id="path136-8-2-3-1-9"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 1, paintOrder: 'markers fill stroke' }}
                d="m 683.59266,611.67426 29.10764,0.13795 h 0.73574 l 1.24156,0.50582 0.59778,0.82771 0.27591,8.87484 -0.45984,0.50582 -0.64377,0.2759 -1.24156,0.092 -1.24156,-0.046 -1.56344,-0.27591 -26.71649,-7.81721 -1.19557,-0.87369 -0.68976,-1.28754 0.13795,-0.64377 0.41385,-0.32189 0.59779,-0.18393 z"
                id="path153"
              />
              <path
                style={{ opacity: 1, fill: 'none', fillOpacity: 0, fillRule: 'nonzero', stroke: '#e4e4e4', strokeOpacity: 1, paintOrder: 'markers fill stroke' }}
                d="m 870.63068,519.20491 -0.52025,126.93988"
                id="path154"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 872.85343,591.5009 1.73051,-0.0555 -0.19778,4.88728 h 0.7911 l -1.33496,3.72099 -1.58218,-3.55438 0.79109,-0.0555 z"
                id="path136-8-2-3"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 796.20029,553.64162 -0.0555,-1.73051 4.88728,0.19778 v -0.7911 l 3.72099,1.33496 -3.55438,1.58218 -0.0555,-0.79109 z"
                id="path136-8-0-6-4-4-8"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 795.21133,589.59622 -0.0555,-1.73051 4.88728,0.19778 v -0.7911 l 3.72099,1.33496 -3.55438,1.58218 -0.0555,-0.79109 z"
                id="path136-8-0-6-4-4-6"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 730.58308,632.76153 0.58753,-1.62866 -4.7092,-1.32215 0.24447,-0.75238 -3.9514,0.11978 2.8915,2.6031 0.29724,-0.73521 z"
                id="path136-8-0-6-4-7"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 721.2872,635.13737 -0.58753,1.62866 4.7092,1.32215 -0.24447,0.75238 3.9514,-0.11978 -2.8915,-2.6031 -0.29724,0.73521 z"
                id="path136-8-0-6-4-7-7"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 309.41428,541.04913 1.5671,-0.73619 -2.39501,-4.26481 0.70487,-0.35914 -2.87874,-2.70937 0.2039,3.88527 0.73009,-0.30966 z"
                id="path136-8-0-6-4-8"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 0.98731, fillRule: 'nonzero', stroke: 'none', strokeWidth: '0.805798', strokeOpacity: 0.972081, paintOrder: 'markers fill stroke' }}
                d="m 301.57759,535.83935 -1.5671,0.73619 2.39501,4.26481 -0.70487,0.35914 2.87874,2.70937 -0.2039,-3.88527 -0.73009,0.30966 z"
                id="path136-8-0-6-4-8-3"
              />
              <path
                style={{ opacity: 1, fill: '#ffffff', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none', strokeOpacity: 1, paintOrder: 'markers fill stroke' }}
                d="m 104.82945,311.88712 34.85644,-53.32516 69.71288,-6.24294 29.91411,45.00123 z"
                id="path209"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 1, fillRule: 'evenodd', paintOrder: 'markers fill stroke' }}
                d="m 250.93014,281.9204 -1.47121,1.58384 -4.26616,-5.02818 -1.24174,1.04937 -1.05481,-4.6939 4.43281,1.17518 -1.16174,1.30526 z"
                id="path127-0-4-5"
              />
              <path
                style={{ fill: '#ffffff', fillOpacity: 1, fillRule: 'evenodd', paintOrder: 'markers fill stroke' }}
                d="m 235.01668,280.67537 -1.78497,1.2194 4.33805,4.9663 -1.22233,1.07193 4.4849,1.74093 -0.50307,-4.55826 -1.46347,0.95477 z"
                id="path127-0-4"
              />
            </g>
          )}

          {/* SECCIÓN GATES */}
          {settings.showGates && (
            <>
              {/* Gate In - Círculo verde */}
              <ellipse 
                id="gate-in" 
                cx="102.75" 
                cy="451.83" 
                rx="49.163" 
                ry="51.244" 
                style={{ fillOpacity: 0.75381, fill: '#008000' }}
              />
              
              {/* Texto Gate In */}
              <text 
                id="text-gate-in" 
                transform="scale(1.107 0.90332)" 
                x="95.89505" 
                y="502.04626" 
                style={{ 
                  fillOpacity: 0.75381, 
                  fill: '#e6e6e6', 
                  fontFamily: 'Agency FB', 
                  fontSize: '40.893px', 
                  fontStretch: 'condensed', 
                  lineHeight: 0.7, 
                  strokeWidth: '1.7039',
                  textAlign: 'center',
                  textAnchor: 'middle'
                }}
              >
                <tspan 
                  x="95.89505" 
                  y="502.04626" 
                  style={{ 
                    fill: '#e6e6e6', 
                    fontFamily: 'Agency FB', 
                    fontSize: '40.893px', 
                    fontStretch: 'condensed', 
                    fontWeight: 'bold', 
                    lineHeight: 0.7, 
                    strokeWidth: '1.7039', 
                    textAlign: 'center', 
                    textAnchor: 'middle' 
                  }}
                >
                  Gate 
                </tspan>
                <tspan 
                  x="95.89505" 
                  y="530.67114" 
                  style={{ 
                    fill: '#e6e6e6', 
                    fontFamily: 'Agency FB', 
                    fontSize: '40.893px', 
                    fontStretch: 'condensed', 
                    fontWeight: 'bold', 
                    lineHeight: 0.7, 
                    strokeWidth: '1.7039', 
                    textAlign: 'center', 
                    textAnchor: 'middle' 
                  }}
                >
                  In
                </tspan>
              </text>
              
              {/* Flecha Gate In */}
              <path 
                id="path13" 
                d="m116.53 402.67 29.654-15.607-10.405 26.533z" 
                style={{ fillOpacity: 0.75381, fill: '#008000' }}
              />
              
              {/* Grupo Gate Out */}
              <g id="g18">
                {/* Gate Out - Círculo rojo */}
                <ellipse 
                  id="gate-out" 
                  cx="69.193" 
                  cy="207.84" 
                  rx="49.944" 
                  ry="49.163" 
                  style={{ fillOpacity: 0.75381, fill: '#800000' }}
                />
                
                {/* Texto Gate Out */}
                <text 
                  id="text-gate-out" 
                  transform="scale(1.107 0.90332)" 
                  x="66.781822" 
                  y="232.1998" 
                  style={{ 
                    fillOpacity: 0.75381, 
                    fill: '#e6e6e6', 
                    fontFamily: 'Agency FB', 
                    fontSize: '40.893px', 
                    fontStretch: 'condensed', 
                    lineHeight: 0.7, 
                    strokeWidth: '1.7039',
                    textAlign: 'center',
                    textAnchor: 'middle'
                  }}
                >
                  <tspan 
                    x="66.781822" 
                    y="232.1998" 
                    style={{ 
                      fill: '#e6e6e6', 
                      fontFamily: 'Agency FB', 
                      fontSize: '40.893px', 
                      fontStretch: 'condensed', 
                      fontWeight: 'bold', 
                      lineHeight: 0.7, 
                      strokeWidth: '1.7039', 
                      textAlign: 'center', 
                      textAnchor: 'middle' 
                    }}
                  >
                    Gate 
                  </tspan>
                  <tspan 
                    x="66.781822" 
                    y="260.82468" 
                    style={{ 
                      fill: '#e6e6e6', 
                      fontFamily: 'Agency FB', 
                      fontSize: '40.893px', 
                      fontStretch: 'condensed', 
                      fontWeight: 'bold', 
                      lineHeight: 0.7, 
                      strokeWidth: '1.7039', 
                      textAlign: 'center', 
                      textAnchor: 'middle' 
                    }}
                  >
                    Out
                  </tspan>
                </text>
                
                {/* Flecha Gate Out */}
                <path 
                  id="path16" 
                  d="m99.887 245.04 5.7227 28.614-18.729-20.29z" 
                  style={{ fillOpacity: 0.75381, fill: '#800000' }}
                />
              </g>
            </>
          )}

          {/* SECCIÓN ZONA IMO */}
          {settings.showIMO && (
            <g id="g25">
              {/* Círculo I1 - rojo */}
              <ellipse 
                id="i1" 
                cx="193.27116" 
                cy="421.13867" 
                rx="13.786503" 
                ry="13.266257" 
                style={{ fillOpacity: 0.75381, fill: '#800000' }}
              />
              
              {/* Rectángulo zona IMO */}
              <path 
                id="zona-imo" 
                d="m178.44417 439.15024h60.34847v14.56687l-60.34847 0.52024z" 
                style={{ fillOpacity: 0.75381, fill: '#999999' }}
              />
              
              {/* Círculo I2 - rojo */}
              <ellipse 
                id="i2" 
                cx="225.02332" 
                cy="421.51535" 
                rx="13.786503" 
                ry="13.266257" 
                style={{ fillOpacity: 0.75381, fill: '#800000' }}
              />
              
              {/* Texto I2 */}
              <text 
                id="text-i2" 
                x="225.26627" 
                y="430.76318" 
                style={{ 
                  fillOpacity: 0.75381, 
                  fill: '#f9f9f9', 
                  fontFamily: 'Agency FB', 
                  fontSize: '24px', 
                  fontStretch: 'condensed', 
                  fontWeight: 'bold', 
                  lineHeight: 0.7, 
                  textAlign: 'center', 
                  textAnchor: 'middle'
                }}
              >
                <tspan 
                  x="225.26627" 
                  y="430.76318"
                >
                  I2
                </tspan>
              </text>
              
              {/* Texto zona IMO */}
              <text 
                id="text18-2" 
                transform="scale(0.90623446,1.1034672)" 
                x="228.87749" 
                y="409.02771" 
                style={{ 
                  fillOpacity: 0.75381, 
                  fill: '#e6e6e6', 
                  fontFamily: 'Agency FB', 
                  fontSize: '14.2158px', 
                  fontStretch: 'condensed', 
                  fontWeight: 'bold', 
                  lineHeight: 0.7,
                  strokeWidth: '0.592328',
                  textAlign: 'center',
                  textAnchor: 'middle'
                }}
              >
                <tspan 
                  x="228.87749" 
                  y="409.02771" 
                  style={{ fill: '#e6e6e6', strokeWidth: '0.592328' }}
                >
                  zona imo
                </tspan>
              </text>
              
              {/* Texto I1 */}
              <text 
                id="text-i1" 
                x="193.78113" 
                y="430.31161" 
                style={{ 
                  fillOpacity: 0.75381, 
                  fill: '#f9f9f9', 
                  fontFamily: 'Agency FB', 
                  fontSize: '24px', 
                  fontStretch: 'condensed', 
                  fontWeight: 'bold', 
                  lineHeight: 0.7, 
                  textAlign: 'center', 
                  textAnchor: 'middle'
                }}
              >
                <tspan 
                  x="193.78113" 
                  y="430.31161"
                >
                  I1
                </tspan>
              </text>
            </g>
          )}

          {/* Zona Terminal de Pasajeros (PA) - Siempre visible */}
          <g id="g192">
            <path 
              id="PA" 
              d="m792.94174 657.56592 65.84855 0.18394 0.55181 24.83116-66.76823 0.36787z" 
              style={{ fill: '#447821', paintOrder: 'markers fill stroke' }}
            />
            
            <text 
              id="pa-text" 
              transform="scale(0.9849198,1.0153111)" 
              x="840.1701" 
              y="664.17157" 
              style={{ 
                fillOpacity: 0.75381, 
                fill: '#f9f9f9', 
                fontFamily: 'Agency FB', 
                fontSize: '14.1552px', 
                fontStretch: 'condensed', 
                fontWeight: 'bold', 
                lineHeight: 0.7, 
                strokeWidth: '0.5898', 
                textAlign: 'center', 
                textAnchor: 'middle'
              }}
            >
              <tspan 
                x="840.1701" 
                y="664.17157" 
                style={{ strokeWidth: '0.5898' }}
              >
                PA
              </tspan>
            </text>
            
            <text 
              id="texto-pa-t" 
              transform="scale(1.129824,0.88509363)" 
              x="640.10498" 
              y="760.88507" 
              style={{ 
                fillOpacity: 0.75381, 
                fill: '#e6e6e6', 
                fontFamily: 'Agency FB', 
                fontSize: '16.1525px', 
                fontStretch: 'condensed', 
                lineHeight: 0.9, 
                strokeWidth: '0.673019', 
                textAlign: 'center', 
                textAnchor: 'middle'
              }}
            >
              <tspan 
                x="640.10498" 
                y="760.88507" 
                style={{ 
                  fill: '#e6e6e6', 
                  fontFamily: 'Agency FB', 
                  fontSize: '16.1525px', 
                  fontStretch: 'condensed', 
                  fontWeight: 'bold', 
                  lineHeight: 0.9, 
                  strokeWidth: '0.673019', 
                  textAlign: 'center', 
                  textAnchor: 'middle' 
                }}
              >
                TERMINAL
              </tspan>
              <tspan 
                x="640.10498" 
                y="775.4223" 
                style={{ 
                  fill: '#e6e6e6', 
                  fontFamily: 'Agency FB', 
                  fontSize: '16.1525px', 
                  fontStretch: 'condensed', 
                  fontWeight: 'bold', 
                  lineHeight: 0.9, 
                  strokeWidth: '0.673019', 
                  textAlign: 'center', 
                  textAnchor: 'middle' 
                }}
              >
                PASAJERO
              </tspan>
            </text>
          </g>

          {/* Aquí puedes agregar el resto de secciones condicionales - showTebas, showOHiggins, showEspingon, showGruas, showContainers, showAduanas */}
        </g>
      </svg>
    </div>
  );
};

export default PortMap;