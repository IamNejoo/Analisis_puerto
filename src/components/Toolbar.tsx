import React from 'react';

type Props = {
  selectedWeek: string;
  setSelectedWeek: (w: string) => void;
};

const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

const Toolbar: React.FC<Props> = ({ selectedWeek, setSelectedWeek }) => (
  <div className="w-full bg-gray-100 px-4 py-2 flex items-center border-b">
    <span className="font-semibold mr-2">Semana:</span>
    <select
      value={selectedWeek}
      onChange={e => setSelectedWeek(e.target.value)}
      className="border rounded p-1"
    >
      {semanas.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  </div>
);

export default Toolbar;
