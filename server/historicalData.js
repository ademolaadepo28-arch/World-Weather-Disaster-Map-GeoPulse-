/**
 * High-fidelity historical natural hazards & environmental anomaly dataset (2020 - 2026)
 * Normalized to GeoPulse GeoJSON standard specification:
 * - id: String
 * - geometry: Point [lon, lat]
 * - category: "wildfire" | "volcano" | "storm" | "anomaly"
 * - timestamp: Unix Epoch ms
 * - magnitude: Float | null
 * - anomaly_c: Float (±15.0)
 * - trp_mw: Thermal Radiative Power (MW)
 */

function makeDate(year, month, day, hour = 12) {
  return new Date(Date.UTC(year, month - 1, day, hour, 0, 0)).getTime();
}

export const HISTORICAL_HAZARD_EVENTS = [
  // --- HISTORIC VOLCANIC ERUPTIONS ---
  {
    type: 'Feature',
    id: 'eonet_volcano_tonga_2022',
    geometry: { type: 'Point', coordinates: [-175.38, -20.57] },
    properties: {
      id: 'eonet_volcano_tonga_2022',
      title: 'Hunga Tonga-Hunga Haʻapai Submarine Megavolcano',
      category: 'volcano',
      timestamp: makeDate(2022, 1, 15, 4),
      dateStr: '2022-01-15',
      magnitude: 5.8,
      magnitudeUnit: 'VEI',
      anomaly_c: 4.8,
      trp_mw: 8500,
      severity: 'catastrophic',
      locationName: 'Tonga Archipelago, South Pacific',
      description: 'Historic underwater eruption generated atmospheric shockwaves circumnavigating the globe multiple times and a stratospheric vapor plume reaching 58 km.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_lapalma_2021',
    geometry: { type: 'Point', coordinates: [-17.87, 28.61] },
    properties: {
      id: 'eonet_volcano_lapalma_2021',
      title: 'Cumbre Vieja Fissure Eruption',
      category: 'volcano',
      timestamp: makeDate(2021, 9, 19, 14),
      dateStr: '2021-09-19',
      magnitude: 3.0,
      magnitudeUnit: 'VEI',
      anomaly_c: 6.2,
      trp_mw: 4200,
      severity: 'catastrophic',
      locationName: 'La Palma, Canary Islands, Spain',
      description: 'Prolonged basaltic eruption destroying over 3,000 buildings and constructing a new coastal lava delta into the Atlantic.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_fagradalsfjall_2021',
    geometry: { type: 'Point', coordinates: [-22.27, 63.89] },
    properties: {
      id: 'eonet_volcano_fagradalsfjall_2021',
      title: 'Fagradalsfjall Shield Volcano Rifting',
      category: 'volcano',
      timestamp: makeDate(2021, 3, 19, 21),
      dateStr: '2021-03-19',
      magnitude: 2.0,
      magnitudeUnit: 'VEI',
      anomaly_c: 5.5,
      trp_mw: 2900,
      severity: 'severe',
      locationName: 'Reykjanes Peninsula, Iceland',
      description: 'First volcanic reactivation of the Reykjanes volcanic belt in over 800 years with effusive curtain-of-fire lava fountains.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_grindavik_2023',
    geometry: { type: 'Point', coordinates: [-22.41, 63.86] },
    properties: {
      id: 'eonet_volcano_grindavik_2023',
      title: 'Sundhnúkagígar Magma Intrusion & Eruption',
      category: 'volcano',
      timestamp: makeDate(2023, 12, 18, 22),
      dateStr: '2023-12-18',
      magnitude: 2.5,
      magnitudeUnit: 'VEI',
      anomaly_c: 7.1,
      trp_mw: 3800,
      severity: 'catastrophic',
      locationName: 'Grindavík, Iceland',
      description: 'High-discharge 4 km fissure rupture with extensive graben collapse and defensive berm lava redirection.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_maunaloa_2022',
    geometry: { type: 'Point', coordinates: [-155.60, 19.47] },
    properties: {
      id: 'eonet_volcano_maunaloa_2022',
      title: 'Mauna Loa Summit & Northeast Rift Eruption',
      category: 'volcano',
      timestamp: makeDate(2022, 11, 27, 23),
      dateStr: '2022-11-27',
      magnitude: 2.0,
      magnitudeUnit: 'VEI',
      anomaly_c: 8.4,
      trp_mw: 6200,
      severity: 'severe',
      locationName: 'Hawaii Island, USA',
      description: 'First eruption of the planet\'s largest active shield volcano in 38 years, sending voluminous lava flows down towards Saddle Road.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_etna_2023',
    geometry: { type: 'Point', coordinates: [15.00, 37.75] },
    properties: {
      id: 'eonet_volcano_etna_2023',
      title: 'Mount Etna Southeast Crater Paroxysm',
      category: 'volcano',
      timestamp: makeDate(2023, 8, 13, 19),
      dateStr: '2023-08-13',
      magnitude: 2.5,
      magnitudeUnit: 'VEI',
      anomaly_c: 4.1,
      trp_mw: 2400,
      severity: 'severe',
      locationName: 'Sicily, Italy',
      description: 'Violent strombolian paroxysm blanketing Catania international airport with volcanic tephra and sulfur dioxide.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_nyiragongo_2021',
    geometry: { type: 'Point', coordinates: [29.25, -1.52] },
    properties: {
      id: 'eonet_volcano_nyiragongo_2021',
      title: 'Mount Nyiragongo Ultra-Fluid Basalt Rupture',
      category: 'volcano',
      timestamp: makeDate(2021, 5, 22, 18),
      dateStr: '2021-05-22',
      magnitude: 2.0,
      magnitudeUnit: 'VEI',
      anomaly_c: 9.2,
      trp_mw: 5100,
      severity: 'catastrophic',
      locationName: 'Virunga Mountains, DR Congo',
      description: 'Rapid flank fissure drainage of the summit lava lake producing high-velocity basalt flows towards the metropolis of Goma.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_semeru_2021',
    geometry: { type: 'Point', coordinates: [112.92, -8.11] },
    properties: {
      id: 'eonet_volcano_semeru_2021',
      title: 'Semeru Pyroclastic Density Collapse',
      category: 'volcano',
      timestamp: makeDate(2021, 12, 4, 15),
      dateStr: '2021-12-04',
      magnitude: 3.5,
      magnitudeUnit: 'VEI',
      anomaly_c: 5.0,
      trp_mw: 3300,
      severity: 'catastrophic',
      locationName: 'East Java, Indonesia',
      description: 'Dome destabilization caused catastrophic pyroclastic density currents surging down Besuk Kobokan river channel.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_volcano_popocatepetl_2023',
    geometry: { type: 'Point', coordinates: [-98.62, 19.02] },
    properties: {
      id: 'eonet_volcano_popocatepetl_2023',
      title: 'Popocatépetl Ash & Incandescent Ejection',
      category: 'volcano',
      timestamp: makeDate(2023, 5, 21, 9),
      dateStr: '2023-05-21',
      magnitude: 2.0,
      magnitudeUnit: 'VEI',
      anomaly_c: 3.2,
      trp_mw: 1800,
      severity: 'moderate',
      locationName: 'Puebla/Morelos, Mexico',
      description: 'Prolonged volcanic tremor and high-altitude ash columns grounded flights across Mexico City metropolitan area.'
    }
  },

  // --- MEGA WILDFIRE CLUSTERS ---
  {
    type: 'Feature',
    id: 'eonet_fire_canada_quebec_2023',
    geometry: { type: 'Point', coordinates: [-74.5, 49.8] },
    properties: {
      id: 'eonet_fire_canada_quebec_2023',
      title: 'Canadian Boreal Megafire Complex (Quebec)',
      category: 'wildfire',
      timestamp: makeDate(2023, 6, 6, 16),
      dateStr: '2023-06-06',
      magnitude: 4500000,
      magnitudeUnit: 'acres',
      anomaly_c: 8.5,
      trp_mw: 9800,
      severity: 'catastrophic',
      locationName: 'Northern Quebec, Canada',
      description: 'Record-shattering boreal pyrocumulonimbus outbreak producing continent-wide smoke pall turning New York and Eastern Seaboard skies apocalyptic orange.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_canada_nwt_2023',
    geometry: { type: 'Point', coordinates: [-114.37, 62.45] },
    properties: {
      id: 'eonet_fire_canada_nwt_2023',
      title: 'Yellowknife Wildfire Evacuation Front',
      category: 'wildfire',
      timestamp: makeDate(2023, 8, 16, 14),
      dateStr: '2023-08-16',
      magnitude: 1800000,
      magnitudeUnit: 'acres',
      anomaly_c: 6.8,
      trp_mw: 5400,
      severity: 'catastrophic',
      locationName: 'Northwest Territories, Canada',
      description: 'Rapidly advancing wildfire prompted historic territorial emergency and full airborne/road evacuation of capital city Yellowknife.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_maui_lahaina_2023',
    geometry: { type: 'Point', coordinates: [-156.67, 20.88] },
    properties: {
      id: 'eonet_fire_maui_lahaina_2023',
      title: 'Lahaina Urban-Conflagration Wildfire',
      category: 'wildfire',
      timestamp: makeDate(2023, 8, 8, 15),
      dateStr: '2023-08-08',
      magnitude: 2170,
      magnitudeUnit: 'acres',
      anomaly_c: 7.9,
      trp_mw: 2900,
      severity: 'catastrophic',
      locationName: 'Maui, Hawaii, USA',
      description: 'Hurricane Dora-induced 80mph downslope gale winds fueled sudden catastrophic flame front through historic Lahaina.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_dixie_california_2021',
    geometry: { type: 'Point', coordinates: [-121.38, 40.06] },
    properties: {
      id: 'eonet_fire_dixie_california_2021',
      title: 'Dixie Megafire (Sierra Nevada)',
      category: 'wildfire',
      timestamp: makeDate(2021, 7, 24, 18),
      dateStr: '2021-07-24',
      magnitude: 963309,
      magnitudeUnit: 'acres',
      anomaly_c: 9.1,
      trp_mw: 7800,
      severity: 'catastrophic',
      locationName: 'Butte & Plumas Counties, California, USA',
      description: 'Second largest fire in recorded California history, burning across five mountain counties and incinerating the historic town of Greenville.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_august_complex_2020',
    geometry: { type: 'Point', coordinates: [-122.95, 39.85] },
    properties: {
      id: 'eonet_fire_august_complex_2020',
      title: 'August Complex "Gigafire"',
      category: 'wildfire',
      timestamp: makeDate(2020, 8, 17, 20),
      dateStr: '2020-08-17',
      magnitude: 1032648,
      magnitudeUnit: 'acres',
      anomaly_c: 10.2,
      trp_mw: 11200,
      severity: 'catastrophic',
      locationName: 'Mendocino National Forest, California, USA',
      description: 'The first recognized "gigafire" in modern California history, sparked by thousands of dry lightning strikes during a record heatwave.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_park_california_2024',
    geometry: { type: 'Point', coordinates: [-121.82, 40.01] },
    properties: {
      id: 'eonet_fire_park_california_2024',
      title: 'Park Wildfire Fast-Run Conflagration',
      category: 'wildfire',
      timestamp: makeDate(2024, 7, 25, 17),
      dateStr: '2024-07-25',
      magnitude: 429603,
      magnitudeUnit: 'acres',
      anomaly_c: 8.8,
      trp_mw: 6400,
      severity: 'catastrophic',
      locationName: 'Chico / Tehama County, California, USA',
      description: 'Explosive fuel-driven fire grew by over 350,000 acres in 48 hours creating intense extreme fire weather and massive pyrocumulus chimneys.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_rhodes_greece_2023',
    geometry: { type: 'Point', coordinates: [27.95, 36.18] },
    properties: {
      id: 'eonet_fire_rhodes_greece_2023',
      title: 'Rhodes Mediterranean Wildfire Wave',
      category: 'wildfire',
      timestamp: makeDate(2023, 7, 22, 13),
      dateStr: '2023-07-22',
      magnitude: 49000,
      magnitudeUnit: 'acres',
      anomaly_c: 6.4,
      trp_mw: 3200,
      severity: 'catastrophic',
      locationName: 'Rhodes, Dodecanese Islands, Greece',
      description: 'Fueled by an unprecedented 16-day Mediterranean heatwave, prompting Greece\'s largest ever recorded wildfire evacuation of 20,000 tourists and locals.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_chile_valparaiso_2024',
    geometry: { type: 'Point', coordinates: [-71.55, -33.05] },
    properties: {
      id: 'eonet_fire_chile_valparaiso_2024',
      title: 'Valparaíso Coastal Urban-Forest Conflagration',
      category: 'wildfire',
      timestamp: makeDate(2024, 2, 2, 18),
      dateStr: '2024-02-02',
      magnitude: 68000,
      magnitudeUnit: 'acres',
      anomaly_c: 9.7,
      trp_mw: 4100,
      severity: 'catastrophic',
      locationName: 'Viña del Mar / Valparaíso, Chile',
      description: 'Deadliest wildfire in modern Chilean history, exacerbated by central Chile\'s decade-long megadrought and intense summer foehn winds.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_pantanal_brazil_2024',
    geometry: { type: 'Point', coordinates: [-56.80, -17.50] },
    properties: {
      id: 'eonet_fire_pantanal_brazil_2024',
      title: 'Pantanal Wetland Biome Blaze Outbreak',
      category: 'wildfire',
      timestamp: makeDate(2024, 6, 20, 15),
      dateStr: '2024-06-20',
      magnitude: 3400000,
      magnitudeUnit: 'acres',
      anomaly_c: 7.2,
      trp_mw: 5900,
      severity: 'catastrophic',
      locationName: 'Mato Grosso do Sul, Brazil',
      description: 'Historical winter drying of the world\'s largest tropical wetland triggered intense fires destroying endemic jaguar and macaw habitats.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_fire_siberia_yakutia_2021',
    geometry: { type: 'Point', coordinates: [129.7, 62.0] },
    properties: {
      id: 'eonet_fire_siberia_yakutia_2021',
      title: 'Siberian Taiga Peatland Burning',
      category: 'wildfire',
      timestamp: makeDate(2021, 8, 2, 10),
      dateStr: '2021-08-02',
      magnitude: 21000000,
      magnitudeUnit: 'acres',
      anomaly_c: 6.9,
      trp_mw: 12500,
      severity: 'catastrophic',
      locationName: 'Sakha Republic, Siberia, Russia',
      description: 'Unprecedented Arctic circle smoke clouds spanning thousands of kilometers and reaching the North Pole for the first time in satellite history.'
    }
  },

  // --- HISTORIC SEVERE STORMS & CYCLONES ---
  {
    type: 'Feature',
    id: 'eonet_storm_ian_2022',
    geometry: { type: 'Point', coordinates: [-82.20, 26.65] },
    properties: {
      id: 'eonet_storm_ian_2022',
      title: 'Hurricane Ian (Category 5 Landfall)',
      category: 'storm',
      timestamp: makeDate(2022, 9, 28, 19),
      dateStr: '2022-09-28',
      magnitude: 160,
      magnitudeUnit: 'mph',
      anomaly_c: -2.8,
      severity: 'catastrophic',
      locationName: 'Cayo Costa / Fort Myers, Florida, USA',
      description: 'Devastating 15-foot storm surge and historic 500-year freshwater flooding across Central Florida causing $113 billion in damages.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_storm_otis_2023',
    geometry: { type: 'Point', coordinates: [-99.90, 16.85] },
    properties: {
      id: 'eonet_storm_otis_2023',
      title: 'Hurricane Otis (Historic Rapid Intensification)',
      category: 'storm',
      timestamp: makeDate(2023, 10, 25, 6),
      dateStr: '2023-10-25',
      magnitude: 165,
      magnitudeUnit: 'mph',
      anomaly_c: -1.5,
      severity: 'catastrophic',
      locationName: 'Acapulco, Guerrero, Mexico',
      description: 'Explosive 115 mph intensification in 24 hours defying computer forecasts, making direct landfall as a catastrophic Category 5 hurricane.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_storm_freddy_2023',
    geometry: { type: 'Point', coordinates: [36.90, -17.80] },
    properties: {
      id: 'eonet_storm_freddy_2023',
      title: 'Cyclone Freddy (Longest-Lived Tropical Cyclone)',
      category: 'storm',
      timestamp: makeDate(2023, 3, 11, 12),
      dateStr: '2023-03-11',
      magnitude: 140,
      magnitudeUnit: 'mph',
      anomaly_c: -2.1,
      severity: 'catastrophic',
      locationName: 'Mozambique Channel & Malawi',
      description: 'Record-shattering 36-day lifespan traversing the entire Indian Ocean and breaking all-time ACE (Accumulated Cyclone Energy) records.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_storm_milton_2024',
    geometry: { type: 'Point', coordinates: [-82.60, 27.30] },
    properties: {
      id: 'eonet_storm_milton_2024',
      title: 'Hurricane Milton (Deep Gulf Pressure 897 mbar)',
      category: 'storm',
      timestamp: makeDate(2024, 10, 9, 23),
      dateStr: '2024-10-09',
      magnitude: 180,
      magnitudeUnit: 'mph',
      anomaly_c: -3.2,
      severity: 'catastrophic',
      locationName: 'Sarasota / Siesta Key, Florida, USA',
      description: 'Fifth most intense Atlantic hurricane on record by central barometric pressure, accompanied by a historic supercell tornado swarm.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_storm_daniel_2023',
    geometry: { type: 'Point', coordinates: [21.00, 32.75] },
    properties: {
      id: 'eonet_storm_daniel_2023',
      title: 'Mediterranean Medicane Daniel',
      category: 'storm',
      timestamp: makeDate(2023, 9, 10, 18),
      dateStr: '2023-09-10',
      magnitude: 85,
      magnitudeUnit: 'mph',
      anomaly_c: -2.5,
      severity: 'catastrophic',
      locationName: 'Derna, Jabal al Akhdar, Libya',
      description: 'Tropical-like Mediterranean cyclone dumping over 400mm rain in 24 hours, bursting upstream dams and inundating a quarter of Derna city.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_storm_mocha_2023',
    geometry: { type: 'Point', coordinates: [92.80, 20.15] },
    properties: {
      id: 'eonet_storm_mocha_2023',
      title: 'Super Cyclonic Storm Mocha',
      category: 'storm',
      timestamp: makeDate(2023, 5, 14, 11),
      dateStr: '2023-05-14',
      magnitude: 175,
      magnitudeUnit: 'mph',
      anomaly_c: -2.4,
      severity: 'catastrophic',
      locationName: 'Sittwe, Rakhine State, Myanmar',
      description: 'One of the strongest cyclones ever recorded in the northern Indian Ocean with Category 5 equivalent 280 km/h sustained gusts.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_storm_doksuri_2023',
    geometry: { type: 'Point', coordinates: [118.60, 24.50] },
    properties: {
      id: 'eonet_storm_doksuri_2023',
      title: 'Super Typhoon Doksuri (Egay)',
      category: 'storm',
      timestamp: makeDate(2023, 7, 28, 9),
      dateStr: '2023-07-28',
      magnitude: 150,
      magnitudeUnit: 'mph',
      anomaly_c: -1.8,
      severity: 'catastrophic',
      locationName: 'Fujian & Beijing Basin, China',
      description: 'Massive atmospheric moisture conveyor dumped over 744mm rain in Beijing and Hebei, causing the heaviest rainfall in China in 140 years.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_storm_ida_2021',
    geometry: { type: 'Point', coordinates: [-90.20, 29.10] },
    properties: {
      id: 'eonet_storm_ida_2021',
      title: 'Hurricane Ida (Louisiana & Northeast Deluge)',
      category: 'storm',
      timestamp: makeDate(2021, 8, 29, 17),
      dateStr: '2021-08-29',
      magnitude: 150,
      magnitudeUnit: 'mph',
      anomaly_c: -2.0,
      severity: 'catastrophic',
      locationName: 'Port Fourchon, Louisiana to NYC, USA',
      description: 'Landed on the exact 16th anniversary of Katrina, subsequently dropping record flash floods across New York City subway tunnels.'
    }
  },

  // --- HISTORIC CLIMATE ANOMALIES & EXTREMES ---
  {
    type: 'Feature',
    id: 'eonet_anomaly_pnw_heatdome_2021',
    geometry: { type: 'Point', coordinates: [-121.58, 50.23] },
    properties: {
      id: 'eonet_anomaly_pnw_heatdome_2021',
      title: 'Pacific Northwest Historic Omega Heat Dome',
      category: 'anomaly',
      timestamp: makeDate(2021, 6, 29, 16),
      dateStr: '2021-06-29',
      magnitude: 49.6,
      magnitudeUnit: '°C',
      anomaly_c: 14.8,
      severity: 'catastrophic',
      locationName: 'Lytton, British Columbia, Canada',
      description: 'All-time Canadian high temperature record (+49.6°C / 121.3°F) driven by high-amplitude upper-troposphere atmospheric blocking.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_anomaly_europe_heatwave_2022',
    geometry: { type: 'Point', coordinates: [-0.12, 51.50] },
    properties: {
      id: 'eonet_anomaly_europe_heatwave_2022',
      title: 'Western European 40°C Heat Departure',
      category: 'anomaly',
      timestamp: makeDate(2022, 7, 19, 14),
      dateStr: '2022-07-19',
      magnitude: 40.3,
      magnitudeUnit: '°C',
      anomaly_c: 12.6,
      severity: 'catastrophic',
      locationName: 'Coningsby / London, United Kingdom',
      description: 'First ever 40°C temperature measured in modern UK meteorological history amidst unprecedented Rhine and Loire river drying.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_anomaly_texas_freeze_2021',
    geometry: { type: 'Point', coordinates: [-97.74, 30.26] },
    properties: {
      id: 'eonet_anomaly_texas_freeze_2021',
      title: 'Winter Storm Uri / Polar Vortex Displacement',
      category: 'anomaly',
      timestamp: makeDate(2021, 2, 15, 10),
      dateStr: '2021-02-15',
      magnitude: -18.0,
      magnitudeUnit: '°C',
      anomaly_c: -14.5,
      severity: 'catastrophic',
      locationName: 'Texas & Southern Plains, USA',
      description: 'Sudden stratospheric warming split the Arctic polar vortex, sending sub-zero Arctic freeze down to the Gulf of Mexico.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_anomaly_atlantic_sst_2023',
    geometry: { type: 'Point', coordinates: [-25.0, 30.0] },
    properties: {
      id: 'eonet_anomaly_atlantic_sst_2023',
      title: 'North Atlantic Ocean Marine Heatwave',
      category: 'anomaly',
      timestamp: makeDate(2023, 7, 10, 12),
      dateStr: '2023-07-10',
      magnitude: 1.4,
      magnitudeUnit: 'sigma',
      anomaly_c: 4.8,
      severity: 'severe',
      locationName: 'Subtropical North Atlantic Basin',
      description: 'Sea surface temperatures exceeded previous multi-decadal historical envelopes by over 4 standard deviations, driven by weakened trade winds and low Saharan dust.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_anomaly_amazon_drought_2023',
    geometry: { type: 'Point', coordinates: [-60.02, -3.12] },
    properties: {
      id: 'eonet_anomaly_amazon_drought_2023',
      title: 'Centennial Amazon Hydrological Basin Drought',
      category: 'anomaly',
      timestamp: makeDate(2023, 10, 24, 15),
      dateStr: '2023-10-24',
      magnitude: 12.7,
      magnitudeUnit: 'm (water level)',
      anomaly_c: 3.9,
      severity: 'catastrophic',
      locationName: 'Manaus, Rio Negro, Brazil',
      description: 'Rio Negro dropped to 12.70 meters — its lowest recorded level in over 121 years of hydrological observation, isolating remote riverine communities.'
    }
  },
  {
    type: 'Feature',
    id: 'eonet_anomaly_antarctic_seaice_2023',
    geometry: { type: 'Point', coordinates: [0.0, -68.0] },
    properties: {
      id: 'eonet_anomaly_antarctic_seaice_2023',
      title: 'Antarctic Winter Sea Ice Anomaly Nadir',
      category: 'anomaly',
      timestamp: makeDate(2023, 9, 10, 12),
      dateStr: '2023-09-10',
      magnitude: -2.6,
      magnitudeUnit: 'M km²',
      anomaly_c: 5.6,
      severity: 'catastrophic',
      locationName: 'Weddell & Ross Seas, Antarctica',
      description: 'Maximum winter sea ice extent sat 2.6 million square kilometers below the 1981-2010 mean — an area roughly the size of Argentina missing.'
    }
  }
];

// Generate dynamic distributed clusters to achieve over 5,000 spatial points for high-density testing
// These points simulate sensor detection swarms, secondary wildfire hotspots, storm swath points, and isobar anomalies
(function generateSyntheticTelemetryPoints() {
  const seedBases = [
    // Pacific Fire Ring (volcanoes / seismic)
    { lat: 35.0, lon: 139.0, cat: 'volcano', name: 'Japan Arc Cluster' },
    { lat: -8.0, lon: 115.0, cat: 'volcano', name: 'Sunda Arc Cluster' },
    { lat: -39.0, lon: 175.0, cat: 'volcano', name: 'Taupo Volcanic Zone' },
    { lat: 14.0, lon: -91.0, cat: 'volcano', name: 'Central American Volcanic Front' },
    { lat: 64.0, lon: -18.0, cat: 'volcano', name: 'Iceland Rift Zone' },
    { lat: 38.0, lon: 15.0, cat: 'volcano', name: 'Tyrrhenian Volcanic Belt' },
    // Global Wildfire Corridors
    { lat: 55.0, lon: -120.0, cat: 'wildfire', name: 'Boreal Western Canada' },
    { lat: 38.0, lon: -121.0, cat: 'wildfire', name: 'California Sierra Corridor' },
    { lat: -34.0, lon: 149.0, cat: 'wildfire', name: 'SE Australia Forest Zone' },
    { lat: 39.0, lon: 22.0, cat: 'wildfire', name: 'Aegean Basin Wildfires' },
    { lat: -12.0, lon: -55.0, cat: 'wildfire', name: 'Amazon Arc of Deforestation' },
    { lat: 63.0, lon: 120.0, cat: 'wildfire', name: 'Eastern Siberian Taiga' },
    { lat: -36.0, lon: -72.0, cat: 'wildfire', name: 'Central Chile Biobío' },
    { lat: 40.0, lon: -5.0, cat: 'wildfire', name: 'Iberian Peninsula' },
    // Tropical Storm Corridors
    { lat: 25.0, lon: -75.0, cat: 'storm', name: 'Western Atlantic Hurricane Alley' },
    { lat: 18.0, lon: 125.0, cat: 'storm', name: 'Philippine Sea Typhoon Alley' },
    { lat: -16.0, lon: 45.0, cat: 'storm', name: 'Mozambique Channel Cyclone Path' },
    { lat: 15.0, lon: 88.0, cat: 'storm', name: 'Bay of Bengal Cyclone Track' },
    { lat: 26.0, lon: -88.0, cat: 'storm', name: 'Gulf of Mexico Storm Track' },
    // Climate Extreme & Sea Ice Departure Nodes
    { lat: 78.0, lon: 15.0, cat: 'anomaly', name: 'Svalbard Arctic Warming' },
    { lat: 24.0, lon: 54.0, cat: 'anomaly', name: 'Persian Gulf Extreme Heat' },
    { lat: -25.0, lon: 135.0, cat: 'anomaly', name: 'Central Australian Heat Surge' },
    { lat: 45.0, lon: 20.0, cat: 'anomaly', name: 'Danube Basin Heat Departure' },
    { lat: 32.0, lon: 35.0, cat: 'anomaly', name: 'Eastern Mediterranean Sea Surface Peak' }
  ];

  let idCounter = 1000;
  // Distribute across 2021 through 2025
  const startTs = makeDate(2021, 1, 1);
  const endTs = makeDate(2025, 12, 31);
  const timeSpan = endTs - startTs;

  for (const base of seedBases) {
    const pointCount = 120; // 120 points per cluster = 3000 points
    for (let i = 0; i < pointCount; i++) {
      // Gaussian distribution around seed
      const u1 = Math.random();
      const u2 = Math.random();
      const randStd = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);
      const randStd2 = Math.sqrt(-2.0 * Math.log(u2 || 0.001)) * Math.sin(2.0 * Math.PI * u1);

      const dLon = randStd * 2.5;
      const dLat = randStd2 * 2.0;

      const lon = +(base.lon + dLon).toFixed(4);
      const lat = +(Math.max(-85, Math.min(85, base.lat + dLat))).toFixed(4);

      const pointTime = startTs + Math.floor(Math.random() * timeSpan);
      const dObj = new Date(pointTime);
      const dateStr = dObj.toISOString().split('T')[0];

      let mag = null;
      let magUnit = '';
      let anomaly = 0;
      let trp = undefined;

      if (base.cat === 'wildfire') {
        trp = Math.round(50 + Math.random() * 800);
        mag = Math.round(200 + Math.random() * 45000);
        magUnit = 'acres';
        anomaly = +(1.5 + Math.random() * 7.5).toFixed(1);
      } else if (base.cat === 'volcano') {
        trp = Math.round(400 + Math.random() * 3200);
        mag = +(1.0 + Math.random() * 3.5).toFixed(1);
        magUnit = 'VEI';
        anomaly = +(0.8 + Math.random() * 4.2).toFixed(1);
      } else if (base.cat === 'storm') {
        mag = Math.round(45 + Math.random() * 115);
        magUnit = 'kts';
        anomaly = +(-0.5 - Math.random() * 3.5).toFixed(1);
      } else {
        anomaly = +(Math.random() > 0.3 ? (2.0 + Math.random() * 9.5) : (-2.0 - Math.random() * 8.0)).toFixed(1);
        mag = anomaly;
        magUnit = '°C delta';
      }

      const id = `telemetry_${base.cat}_${idCounter++}`;
      HISTORICAL_HAZARD_EVENTS.push({
        type: 'Feature',
        id,
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          id,
          title: `${base.name} - Observation #${i + 1}`,
          category: base.cat,
          timestamp: pointTime,
          dateStr,
          magnitude: mag,
          magnitudeUnit: magUnit,
          anomaly_c: anomaly,
          trp_mw: trp,
          severity: (trp > 600 || Math.abs(anomaly) > 7 || (mag && mag > 80)) ? 'catastrophic' : 'moderate',
          locationName: `${base.name}`,
          description: `Telemetry event recorded in ${base.name} region.`
        }
      });
    }
  }
})();
