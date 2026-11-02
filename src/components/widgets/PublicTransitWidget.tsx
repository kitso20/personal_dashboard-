import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Train, Bus, Plus, Clock, MapPin, RefreshCw, CheckCircle2, ChevronDown } from 'lucide-react';
import { DashboardState, TransitStation, TransitDeparture } from '../../types';

interface PublicTransitWidgetProps {
  state: DashboardState;
  dispatchAction: (action: string, payload?: any) => Promise<any>;
  variant?: 'full-schedule' | 'quick-glance' | 'compact';
}

export const PublicTransitWidget: React.FC<PublicTransitWidgetProps> = ({
  state,
  dispatchAction,
  variant = 'full-schedule'
}) => {
  const [stationMenuOpen, setStationMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal form state
  const [newLineCode, setNewLineCode] = useState('N');
  const [newLineName, setNewLineName] = useState('N Train');
  const [newType, setNewType] = useState<'metro' | 'bus'>('metro');
  const [newDestination, setNewDestination] = useState('');
  const [newArrivalMins, setNewArrivalMins] = useState(5);

  const stations: TransitStation[] = state.transitStations || [
    {
      id: 'times-square',
      name: 'Times Square - 42 St',
      location: 'Times Square, New York, NY',
      metroLines: [
        {
          id: 'ts-n-1',
          lineCode: 'N',
          lineName: 'N Train',
          type: 'metro',
          badgeColor: '#000000',
          badgeBg: '#FCCC0A',
          badgeText: 'N',
          destination: 'Coney Island',
          arrivalMinutes: 4,
          status: 'Good Service'
        },
        {
          id: 'ts-n-2',
          lineCode: 'N',
          lineName: 'N Train',
          type: 'metro',
          badgeColor: '#000000',
          badgeBg: '#FCCC0A',
          badgeText: 'N',
          destination: 'Ditmars Blvd',
          arrivalMinutes: 11,
          status: 'Good Service'
        },
        {
          id: 'ts-q-1',
          lineCode: 'Q',
          lineName: 'Q Train',
          type: 'metro',
          badgeColor: '#000000',
          badgeBg: '#FCCC0A',
          badgeText: 'Q',
          destination: 'Coney Island',
          arrivalMinutes: 15,
          status: 'Good Service'
        }
      ],
      busLines: [
        {
          id: 'ts-bus-m7',
          lineCode: 'M7',
          lineName: 'M7',
          type: 'bus',
          badgeColor: '#ffffff',
          badgeBg: '#f97316',
          badgeText: 'M',
          destination: 'Columbus Ave',
          arrivalMinutes: 5,
          status: 'On Time'
        },
        {
          id: 'ts-bus-m20',
          lineCode: 'M20',
          lineName: 'M20',
          type: 'bus',
          badgeColor: '#ffffff',
          badgeBg: '#0284c7',
          badgeText: 'M',
          destination: 'South Ferry',
          arrivalMinutes: 10,
          status: 'On Time'
        }
      ]
    }
  ];

  const currentStationId = state.selectedTransitStationId || 'times-square';
  const currentStation = stations.find((s) => s.id === currentStationId) || stations[0];

  // Periodic departure countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      dispatchAction('TICK_TRANSIT_SCHEDULES');
    }, 45000);
    return () => clearInterval(timer);
  }, [dispatchAction]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatchAction('TICK_TRANSIT_SCHEDULES');
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleAddDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestination.trim()) return;
    await dispatchAction('ADD_TRANSIT_DEPARTURE', {
      stationId: currentStation.id,
      lineCode: newLineCode,
      lineName: newLineName || `${newLineCode} ${newType === 'metro' ? 'Train' : 'Bus'}`,
      type: newType,
      destination: newDestination.trim(),
      arrivalMinutes: Number(newArrivalMins) || 5,
      badgeBg: newType === 'metro' ? '#FCCC0A' : newType === 'bus' && newLineCode.includes('7') ? '#f97316' : '#0284c7',
      badgeColor: newType === 'metro' ? '#000000' : '#ffffff',
      badgeText: newType === 'metro' ? newLineCode[0] : 'M'
    });
    setNewDestination('');
    setShowAddModal(false);
  };

  // Quick glance variant (Card 2 in the screenshot)
  if (variant === 'quick-glance') {
    return (
      <div className="bg-white/80 dark:bg-[#12151b] backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full min-h-[175px]">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
            Public Transit
          </h3>
          <button
            onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mt-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mb-1">
              METRO
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                M7
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-200/50 dark:border-emerald-800/40">
                Normal Service
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mb-1">
              BUS
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-neutral-200">
                M20, M34
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-neutral-300">
                On Time
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live NYC Transit Sync
          </span>
          <button
            onClick={handleRefresh}
            className="hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Group metro lines by lineCode/lineName
  const metroGroups: Record<string, { line: TransitDeparture; destinations: { dest: string; mins: number }[] }> = {};
  (currentStation.metroLines || []).forEach((item) => {
    const key = item.lineName;
    if (!metroGroups[key]) {
      metroGroups[key] = {
        line: item,
        destinations: []
      };
    }
    metroGroups[key].destinations.push({
      dest: item.destination,
      mins: item.arrivalMinutes
    });
  });

  return (
    <div className="bg-white/85 dark:bg-[#12151b] backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 relative">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-white">
            PUBLIC TRANSIT SCHEDULES ({currentStation.name.toUpperCase().replace(' - 42 ST', '').replace(' - HERALD SQ', '')})
          </h3>
          <button
            onClick={() => setStationMenuOpen(!stationMenuOpen)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
            title="Switch Station"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Station dropdown */}
          {stationMenuOpen && (
            <div className="absolute left-0 top-7 z-30 w-56 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl py-1 text-xs">
              <div className="px-3 py-1.5 font-semibold text-slate-400 dark:text-neutral-400 uppercase tracking-wider text-[10px]">
                Select Subway Station
              </div>
              {stations.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    dispatchAction('SELECT_TRANSIT_STATION', { stationId: st.id });
                    setStationMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/[0.06] ${
                    st.id === currentStation.id ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <span>{st.name}</span>
                  {st.id === currentStation.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={handleRefresh}
            title="Refresh arrivals"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {optionsMenuOpen && (
            <div className="absolute right-0 top-7 z-30 w-44 bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl py-1 text-xs">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setOptionsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Route
              </button>
              <button
                onClick={() => {
                  handleRefresh();
                  setOptionsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Arrivals
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Schedules Grid: METRO | BUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* METRO Column */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mb-2.5">
            METRO
          </div>
          <div className="space-y-3">
            {Object.values(metroGroups).map(({ line, destinations }) => (
              <div key={line.id} className="flex items-start gap-3">
                {/* Subway Circle Badge */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: line.badgeBg || '#FCCC0A', color: line.badgeColor || '#000000' }}
                >
                  {line.badgeText || line.lineCode[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white mr-3">
                    {line.lineName}
                  </span>
                  <div className="mt-0.5 space-y-1">
                    {destinations.map((d, i) => (
                      <div key={i} className="text-xs text-slate-600 dark:text-neutral-300 flex items-center justify-between sm:justify-start sm:gap-2">
                        <span>{d.dest}</span>
                        <span className="text-slate-400 dark:text-neutral-500">—</span>
                        <span className="font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-white/[0.07] px-1.5 py-0.5 rounded text-[11px]">
                          {d.mins}min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BUS Column */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-400 mb-2.5">
            BUS
          </div>
          <div className="space-y-3">
            {(currentStation.busLines || []).map((bus) => (
              <div key={bus.id} className="flex items-start gap-3">
                {/* Bus Bullet Badge */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs text-white"
                  style={{ backgroundColor: bus.badgeBg || '#0284c7' }}
                >
                  {bus.badgeText || 'M'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-white">
                      {bus.lineName}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-neutral-300">
                      {bus.destination}
                    </span>
                    <span className="text-slate-400 dark:text-neutral-500">—</span>
                    <span className="font-medium text-slate-900 dark:text-white bg-slate-100 dark:bg-white/[0.07] px-1.5 py-0.5 rounded text-[11px] ml-auto sm:ml-0">
                      {bus.arrivalMinutes}min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Custom Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181b22] border border-slate-200 dark:border-white/[0.1] rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
              Add Transit Route ({currentStation.name})
            </h4>
            <form onSubmit={handleAddDeparture} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Transit Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewType('metro');
                      setNewLineCode('N');
                      setNewLineName('N Train');
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-medium ${
                      newType === 'metro'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-600 dark:text-amber-300'
                        : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-neutral-400'
                    }`}
                  >
                    Subway / Metro
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewType('bus');
                      setNewLineCode('M7');
                      setNewLineName('M7');
                    }}
                    className={`flex-1 py-1.5 rounded-lg border font-medium ${
                      newType === 'bus'
                        ? 'bg-sky-100 border-sky-300 text-sky-900 dark:bg-sky-950/40 dark:border-sky-600 dark:text-sky-300'
                        : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-neutral-400'
                    }`}
                  >
                    MTA Bus
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Line Code / Name</label>
                <input
                  type="text"
                  value={newLineCode}
                  onChange={(e) => {
                    setNewLineCode(e.target.value);
                    setNewLineName(newType === 'metro' ? `${e.target.value} Train` : e.target.value);
                  }}
                  placeholder="e.g. N, Q, M7, M20, 1"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Destination</label>
                <input
                  type="text"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="e.g. Coney Island, Columbus Ave, Queens"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-neutral-400 mb-1">Arrival Minutes</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newArrivalMins}
                  onChange={(e) => setNewArrivalMins(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-xs"
                >
                  Add Departure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
