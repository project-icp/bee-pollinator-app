import numpy as np

GWLFE_DEFAULTS = {
    'NRur': 10,  # Number of Rural Land Use Categories
    'NUrb': 6,  # Number of Urban Land Use Categories
    'TranVersionNo': '1.4.0',  # GWLF-E Version
    'RecessionCoef': 0.06,  # Recession Coefficient
    'SeepCoef': 0,  # Seepage Coefficient
    'UnsatStor': 10,  # Unsaturated Storage
    'SatStor': 0,  # Saturated Storage
    'InitSnow': 0,  # Initial Snow Days
    'TileDrainRatio': 0,  # Tile Drain Ratio
    'TileDrainDensity': 0,  # Tile Drain Density
    'ETFlag': 0,  # ET Flag: 0 for Hammon method, 1 for Blainy-Criddle method
    'AntMoist': np.zeros(5),  # Antecedent Rain + Melt Moisture Conditions for Days 1 to 5 # NOQA
    'StreamWithdrawal': np.zeros(12),  # Surface Water Withdrawal/Extraction
    'GroundWithdrawal': np.zeros(12),  # Groundwater Withdrawal/Extraction
    'PcntET': np.ones(12),  # Percent monthly adjustment for ET calculation
    'PhysFlag': 0,  # Flag: Physiographic Province Layer Detected (0 No; 1 Yes)
    'PointFlag': 1,  # Flag: Point Source Layer Detected (0 No; 1 Yes)
    'SeptSysFlag': 0,  # Flag: Septic System Layer Detected (0 No; 1 Yes)
    'CountyFlag': 0,  # Flag: County Layer Detected (0 No; 1 Yes)
    'SoilPFlag': 1,  # Flag: Soil P Layer Detected (0 No; 1 Yes)
    'GWNFlag': 1,  # Flag: Groundwater N Layer Detected (0 No; 1 Yes)
    'SedAAdjust': 1,  # Default Percent ET
    'SedNitr': 2000,  # Soil Concentration: N (mg/l)
    'BankNFrac': 0.25,  # % Bank N Fraction (0 - 1)
    'BankPFrac': 0.25,  # % Bank P Fraction (0 - 1)
    'ManuredAreas': 2,  # Manure Spreading Periods (Default = 2)
    'FirstManureMonth': 0,  # MS Period 1: First Month
    'LastManureMonth': 0,  # MS Period 1: Last Month
    'FirstManureMonth2': 0,  # MS Period 2: First Month
    'LastManureMonth2': 0,  # MS Period 2: Last Month
    'Nqual': 3,  # Number of Contaminants (Default = 3)
    'Contaminant': ['Nitrogen', 'Phosphorus', 'Sediment'],
    'UrbBMPRed': np.zeros((16, 3)),  # Urban BMP Reduction
    'SepticFlag': 1,  # Flag: Septic Systems Layer Detected (0 No; 1 Yes)
    'NumPondSys': np.zeros(12),  # Number of People on Pond Systems
    'NumShortSys': np.zeros(12),  # Number of People on Short Circuit Systems
    'NumDischargeSys': np.zeros(12),  # Number of People on Discharge Systems
    'NumSewerSys': np.zeros(12),  # Number of People on Public Sewer Systems
    'NitrSepticLoad': 12,  # Per Capita Tank Load: N (g/d)
    'PhosSepticLoad': 2.5,  # Per Capita Tank Load: P (g/d)
    'NitrPlantUptake': 1.6,  # Growing System Uptake: N (g/d)
    'PhosPlantUptake': 0.4,  # Growing System Uptake: P (g/d)
    'TileNconc': 15,  # Tile Drainage Concentration: N (mg/L)
    'TilePConc': 0.1,  # Tile Drainage Concentration: P (mg/L)
    'TileSedConc': 50,  # Tile Drainage Concentration: Sediment (mg/L)
    'n1': 0,  # Row Crops
    'n2': 0,  # Hay/Pasture
    'n2b': 0,  # High Density Urban
    'n2c': 0,  # Low Density Urban
    'n2d': 0,  # Unpaved Roads
    'n3': 0,  # Other
    'n4': 0,  # Streambank Erosion
    'n5': 0,  # Row Crops
    'n6': 0,  # Hay/Pasture
    'n6b': 0,  # High Density Urban
    'n6c': 0,  # Low Density Urban
    'n6d': 0,  # Unpaved Roads
    'n7': 0,  # Other
    'n7b': 0,  # Farm Animals
    'n8': 0,  # Streambank Erosion
    'n9': 0,  # Groundwater/Subsurface
    'n10': 0,  # Point Source Discharges
    'n11': 0,  # Septic Systems
    'n12': 0,  # Row Crops
    'n13': 0,  # Hay/Pasture
    'n13b': 0,  # High Density Urban
    'n13c': 0,  # Low Density Urban
    'n13d': 0,  # Unpaved Roads
    'n14': 0,  # Other
    'n14b': 0,  # Farm Animals
    'n15': 0,  # Streambank Erosion
    'n16': 0,  # Groundwater/Subsurface
    'n17': 0,  # Point Source Discharges
    'n18': 0,  # Septic Systems
    'n19': 0,  # Total Sediment Load (kg x 1000)
    'n20': 0,  # Total Nitrogen Load (kg)
    'n21': 0,  # Total Phosphorus Load (kg)
    'n22': 0,  # Basin Area (Ha)
    'n23c': 5,  # High Density Urban (Constructed Wetlands): % Drainage Used
    'n24c': 3,  # Low Density Urban (Constructed Wetlands): % Drainage Used
    'n24d': 6,  # High Density Urban (Bioretention Areas): % Drainage Used
    'n24e': 6,  # Low Density Urban (Bioretention Areas): % Drainage Used
    'n25': 0,  # Row Crops (BMP 1): Existing (%)
    'n25b': 0,  # High Density Urban (Constructed Wetlands): Existing (%)
    'n25c': 0,  # Low Density Urban (Constructed Wetlands): Existing (%)
    'n25d': 0,  # High Density Urban (Bioretention Areas): Existing (%)
    'n25e': 0,  # Low Density Urban (Bioretention Areas): Existing (%)
    'n26': 0,  # Row Crops (BMP 2): Existing (%)
    'n26b': 0,  # High Density Urban (Detention Basin): Existing (%)
    'n26c': 0,  # Low Density Urban (Detention Basin): Existing (%)
    'n27': 0,  # Row Crops (BMP 3): Existing (%)
    'n27b': 0,  # Row Crops (BMP 4): Existing (%)
    'n28': 0,  # Row Crops (BMP 5): Existing (%)
    'n28b': 0,  # Row Crops (BMP 6): Existing (%)
    'n29': 0,  # Row Crops (BMP 8): Existing (%)
    'n30': 0,  # Row Crops (BMP 1): Future (%)
    'n30b': 0,  # High Density Urban (Constructed Wetlands): Future (%)
    'n30c': 0,  # Low Density Urban (Constructed Wetlands): Future (%)
    'n30d': 0,  # High Density Urban (Bioretention Areas): Future (%)
    'n30e': 0,  # Low Density Urban (Bioretention Areas): Future (%)
    'n31': 0,  # Row Crops (BMP 2): Future (%)
    'n31b': 0,  # High Density Urban (Detention Basin): Future (%)
    'n31c': 0,  # Low Density Urban (Detention Basin): Future (%)
    'n32': 0,  # Row Crops (BMP 3): Future (%)
    'n32b': 0,  # Row Crops (BMP 4): Future (%)
    'n32c': 0,  # Hay/Pasture (BMP 3): Existing (%)
    'n32d': 0,  # Hay/Pasture (BMP 3): Future (%)
    'n33': 0,  # Row Crops (BMP 5): Future (%)
    'n33b': 0,  # Row Crops (BMP 6): Future (%)
    'n33c': 0,  # Hay/Pasture (BMP 4): Existing (%)
    'n33d': 0,  # Hay/Pasture (BMP 4): Future (%)
    'n34': 0,  # Row Crops (BMP 8): Future (%)
    'n35': 0,  # Hay/Pasture (BMP 5): Existing (%)
    'n35b': 0,  # Hay/Pasture (BMP 6): Existing (%)
    'n36': 0,  # Hay/Pasture (BMP 7): Existing (%)
    'n37': 0,  # Hay/Pasture (BMP 8): Existing (%)
    'n38': 0,  # Hay/Pasture (BMP 5): Future (%)
    'n38b': 0,  # Hay/Pasture (BMP 6): Future (%)
    'n39': 0,  # Hay/Pasture (BMP 7): Future (%)
    'n40': 0,  # Hay/Pasture (BMP 8): Future (%)
    'n41b': 0,  # AWMS (Livestock): Existing (%)
    'n41c': 0,  # AWMS (Livestock): Future (%)
    'n41d': 0,  # AWMS (Poultry): Existing (%)
    'n41e': 0,  # AWMS (Poultry): Future (%)
    'n41f': 0,  # Runoff Control: Existing (%)
    'n41g': 0,  # Runoff Control: Future (%)
    'n41h': 0,  # Phytase in Feed: Existing (%)
    'n41i': 0,  # Phytase in Feed: Future (%)
    'n43': 0,  # Stream Km with Vegetated Buffer Strips: Existing
    'GRLBN': 0,  # Average Grazing Animal Loss Rate (Barnyard/Confined Area): Nitrogen # NOQA
    'NGLBN': 0,  # Average Non-Grazing Animal Loss Rate (Barnyard/Confined Area): Nitrogen # NOQA
    'GRLBP': 0,  # Average Grazing Animal Loss Rate (Barnyard/Confined Area): Phosphorus # NOQA
    'NGLBP': 0,  # Average Non-Grazing Animal Loss Rate (Barnyard/Confined Area): Phosphorus # NOQA
    'NGLManP': 0,  # Average Non-Grazing Animal Loss Rate (Manure Spreading): Phosphorus # NOQA
    'NGLBFC': 0,  # Average Non-Grazing Animal Loss Rate (Barnyard/Confined Area): Fecal Coliform # NOQA
    'GRLBFC': 0,  # Average Grazing Animal Loss Rate (Barnyard/Confined Area): Fecal Coliform # NOQA
    'GRSFC': 0,  # Average Grazing Animal Loss Rate (Spent in Streams): Fecal Coliform # NOQA
    'GRSN': 0,  # Average Grazing Animal Loss Rate (Spent in Streams): Nitrogen
    'GRSP': 0,  # Average Grazing Animal Loss Rate (Spent in Streams): Phosphorus # NOQA
    'n43b': 0,  # High Density Urban (Constructed Wetlands): Required Ha
    'n43c': 0,  # High Density Urban (Detention Basin): % Drainage Used
    'n43d': 0,  # High Density Urban: % Impervious Surface
    'n43e': 0,  # High Density Urban (Constructed Wetlands): Impervious Ha Drained # NOQA
    'n43f': 0,  # High Density Urban (Detention Basin): Impervious Ha Drained
    'n43g': 0,  # High Density Urban (Bioretention Areas): Impervious Ha Drained
    'n43h': 0,  # High Density Urban (Bioretention Areas): Required Ha
    'n43i': 0,  # Low Density Urban (Bioretention Areas): Impervious Ha Drained
    'n43j': 0,  # Low Density Urban (Bioretention Areas): Required Ha
    'n44': 0,  # Stream Km with Vegetated Buffer Strips: Future
    'n44b': 0,  # High Density Urban (Detention Basin): Required Ha
    'n45': 0,  # Stream Km with Fencing: Existing
    'n45b': 0,  # Low Density Urban (Constructed Wetlands): Required Ha
    'n45c': 0,  # Low Density Urban (Detention Basin): % Drainage Used
    'n45d': 0,  # Low Density Urban: % Impervious Surface
    'n45e': 0,  # Low Density Urban (Constructed Wetlands): Impervious Ha Drained # NOQA
    'n45f': 0,  # Low Density Urban (Detention Basin): Impervious Ha Drained
    'n46': 0,  # Stream Km with Fencing: Future
    'n46b': 0,  # Low Density Urban (Detention Basin): Required Ha
    'n46c': 0,  # Stream Km with Stabilization: Existing
    'n46d': 0,  # Stream Km with Stabilization: Future
    'n46g': 0,  # Stream Km in High Density Urban Areas W/Buffers: Existing
    'n46h': 0,  # Stream Km in High Density Urban Areas W/Buffers: Future
    'n46i': 0,  # High Density Urban Streambank Stabilization (km): Existing
    'n46j': 0,  # High Density Urban Streambank Stabilization (km): Future
    'n46k': 0,  # Stream Km in Low Density Urban Areas W/Buffers: Existing
    'n46l': 0,  # Stream Km in Low Density Urban Areas W/Buffers: Future
    'n46m': 0,  # Low Density Urban Streambank Stabilization (km): Existing
    'n46n': 0,  # Low Density Urban Streambank Stabilization (km): Future
    'n46o': 0,  # Unpaved Road Km with E and S Controls (km): Existing
    'n46p': 0,  # Unpaved Road Km with E and S Controls (km): Future
    'n47': 0,  # Number of Persons on Septic Systems: Existing
    'n48': 0,  # No longer used (Default = 0)
    'n49': 0,  # Number of Persons on Septic Systems: Future
    'n50': 0,  # No longer used (Default = 0)
    'n51': 0,  # Septic Systems Converted by Secondary Treatment Type (%)
    'n52': 0,  # Septic Systems Converted by Tertiary Treatment Type (%)
    'n53': 0,  # No longer used (Default = 0)
    'n54': 0,  # Distribution of Pollutant Discharges by Primary Treatment Type (%): Existing # NOQA
    'n55': 0,  # Distribution of Pollutant Discharges by Secondary Treatment Type (%): Existing # NOQA
    'n56': 0,  # Distribution of Pollutant Discharges by Tertiary Treatment Type (%): Existing # NOQA
    'n57': 0,  # Distribution of Pollutant Discharges by Primary Treatment Type (%): Future # NOQA
    'n58': 0,  # Distribution of Pollutant Discharges by Secondary Treatment Type (%): Future # NOQA
    'n59': 0,  # Distribution of Pollutant Discharges by Tertiary Treatment Type (%): Future # NOQA
    'n60': 0,  # Distribution of Treatment Upgrades (%): Primary to Secondary
    'n61': 0,  # Distribution of Treatment Upgrades (%): Primary to Tertiary
    'n62': 0,  # Distribution of Treatment Upgrades (%): Secondary to Tertiary
    'n63': 0.29,  # BMP 1 (Nitrogen)
    'n64': 0.41,  # Vegetated Buffer Strips (Nitrogen)
    'n65': 0.08,  # BMP 2 (Nitrogen)
    'n66': 0.66,  # BMP 3 (Nitrogen)
    'n66b': 0.05,  # BMP 4 (Nitrogen)
    'n67': 0,  # BMP 5 (Nitrogen)
    'n68': 0.95,  # BMP 8 (Nitrogen)
    'n68b': 0.3,  # BMP 7 (Nitrogen)
    'n69': 0.56,  # Streambank Fencing (Nitrogen)
    'n69b': 0.2,  # Constructed Wetlands (Nitrogen)
    'n69c': 0.95,  # Streambank Stabilization (Nitrogen)
    'n70': 0.29,  # BMP 6 (Nitrogen)
    'n70b': 0.25,  # Detention Basins (Nitrogen)
    'n71': 0.5,  # BMP 1 (Phosphorus)
    'n71b': 0.28,  # Bioretention Areas (Nitrogen)
    'n72': 0.4,  # Vegetated Buffer Strips (Phosphorus)
    'n73': 0.22,  # BMP 2 (Phosphorus)
    'n74': 0.1,  # BMP 3 (Phosphorus)
    'n74b': 0.1,  # BMP 4 (Phosphorus)
    'n75': 0,  # BMP 5 (Phosphorus)
    'n76': 0.95,  # BMP 8 (Phosphorus)
    'n76b': 0.3,  # BMP 7 (Phosphorus)
    'n77': 0.78,  # Streambank Fencing (Phosphorus)
    'n77b': 0.45,  # Constructed Wetlands (Phosphorus)
    'n77c': 0.95,  # Streambank Stabilization (Phosphorus)
    'n78': 0.44,  # BMP 6 (Phosphorus)
    'n78b': 0.35,  # Detention Basins (Phosphorus)
    'n79': 0.35,  # BMP 1 (Sediment)
    'n79b': 0.44,  # Bioretention Areas (Phosphorus)
    'n79c': 0.63,  # Bioretention Areas (Sediment)
    'n80': 0.53,  # Vegetated Buffer Strips (Sediment)
    'n81': 0.3,  # BMP 2 (Sediment)
    'n82': 0.17,  # BMP 3 (Sediment)
    'n82b': 0.16,  # BMP 4 (Sediment)
    'n83': 0,  # BMP 5 (Sediment)
    'n84': 0.95,  # BMP 8 (Sediment)
    'n84b': 0.38,  # BMP 7 (Sediment)
    'n85': 0.76,  # Streambank Fencing (Sediment)
    'n85b': 0.6,  # Constructed Wetlands (Sediment)
    'n85c': 0.55,  # Detention Basins (Sediment)
    'n85d': 0.95,  # Streambank Stabilization (Sediment)
    'n85e': 0.02,  # Unpaved Road (kg/meter) (Nitrogen)
    'n85f': 0.0035,  # Unpaved Road (kg/meter) (Phosphorus)
    'n85g': 2.55,  # Unpaved Road (kg/meter) (Sediment)
    'n85h': 0.75,  # AWMS (Livestock) (Nitrogen)
    'n85i': 0.75,  # AWMS (Livestock) (Phosphorus)
    'n85j': 0.14,  # AWMS (Poultry) (Nitrogen)
    'n85k': 0.14,  # AWMS (Poultry) (Phosphorus)
    'n85l': 0.15,  # Runoff Control (Nitrogen)
    'n85m': 0.15,  # Runoff Control (Phosphorus)
    'n85n': 0.21,  # Phytase in Feed (Phosphorus)
    'n85o': 0.7,  # Vegetated Buffer Strips (Pathogens)
    'n85p': 1,  # Streambank Fencing (Pathogens)
    'n85q': 0.85,  # AWMS (Livestock) (Pathogens)
    'n85r': 0.14,  # AWMS (Poultry) (Pathogens)
    'n85s': 0.15,  # Runoff Control (Pathogens)
    'n85t': 0.71,  # Constructed Wetlands (Pathogens)
    'n85u': 0.82,  # Bioretention Areas (Pathogens)
    'n85v': 0.71,  # Detention Basins (Pathogens)
    'Qretention': 0,  # Detention Basin: Amount of runoff retention (cm)
    'FilterWidth': 0,  # Stream Protection: Vegetative buffer strip width (meters) # NOQA
    'Capacity': 0,  # Detention Basin: Detention basin volume (cubic meters)
    'BasinDeadStorage': 0,  # Detention Basin: Basin dead storage (cubic meters)
    'BasinArea': 0,  # Detention Basin: Basin surface area (square meters)
    'DaysToDrain': 0,  # Detention Basin: Basin days to drain
    'CleanMon': 0,  # Detention Basin: Basin cleaning month
    'PctAreaInfil': 0,  # Infiltration/Bioretention: Fraction of area treated (0-1) # NOQA
    'PctStrmBuf': 0,  # Stream Protection: Fraction of streams treated (0-1)
    'UrbBankStab': 0,  # Stream Protection: Streams w/bank stabilization (km)
    'ISRR': np.zeros(6),  # Impervious Surface Reduction (% Reduction) of Urban Land Uses # NOQA
    'ISRA': np.zeros(6),  # Impervious Surface Reduction (Area) of Urban Land Uses # NOQA
    'SweepType': 1,  # Street Sweeping: Sweep Type (1-2)
    'UrbSweepFrac': 1,  # Street Sweeping: Fraction of area treated (0-1)
    'StreetSweepNo': np.zeros(12),  # Street sweeping times per month
    'n108': 0,  # Row Crops: Sediment (kg x 1000)
    'n109': 0,  # Row Crops: Nitrogen (kg)
    'n110': 0,  # Row Crops: Phosphorus (kg)
    'n111': 0,  # Hay/Pasture: Sediment (kg x 1000)
    'n111b': 0,  # High Density Urban: Sediment (kg x 1000)
    'n111c': 0,  # Low Density Urban: Sediment (kg x 1000)
    'n111d': 0,  # Unpaved Roads: Sediment (kg x 1000)
    'n112': 0,  # Hay/Pasture: Nitrogen (kg)
    'n112b': 0,  # High Density Urban: Nitrogen (kg)
    'n112c': 0,  # Low Density Urban: Nitrogen (kg)
    'n112d': 0,  # Unpaved Roads: Nitrogen (kg)
    'n113': 0,  # Hay/Pasture: Phosphorus (kg)
    'n113b': 0,  # High Density Urban: Phosphorus (kg)
    'n113c': 0,  # Low Density Urban: Phosphorus (kg)
    'n113d': 0,  # Unpaved Roads: Phosphorus (kg)
    'n114': 0,  # Other: Sediment (kg x 1000)
    'n115': 0,  # Other: Nitrogen (kg)
    'n115b': 0,  # Farm Animals: Nitrogen (kg)
    'n116': 0,  # Other: Phosphorus (kg)
    'n116b': 0,  # Farm Animals: Phosphorus (kg)
    'n117': 0,  # Streambank Erosion: Sediment (kg x 1000)
    'n118': 0,  # Streambank Erosion: Nitrogen (kg)
    'n119': 0,  # Streambank Erosion: Phosphorus (kg)
    'n120': 0,  # Groundwater/Subsurface: Nitrogen (kg)
    'n121': 0,  # Groundwater/Subsurface: Phosphorus (kg)
    'n122': 0,  # Point Source Discharges: Nitrogen (kg)
    'n123': 0,  # Point Source Discharges: Phosphorus (kg)
    'n124': 0,  # Septic Systems: Nitrogen (kg)
    'n125': 0,  # Septic Systems: Phosphorus (kg)
    'n126': 0,  # Total: Sediment (kg x 1000)
    'n127': 0,  # Total: Nitrogen (kg)
    'n128': 0,  # Total: Phosphorus (kg)
    'n129': 0,  # Percent Reduction: Sediment (%)
    'n130': 0,  # Percent Reduction: Nitrogen (%)
    'n131': 0,  # Percent Reduction: Phosphorus (%)
    'n132': 0,  # Estimated Scenario Cost $: Total
    'n133': 0,  # Estimated Scenario Cost $: Agricultural BMPs
    'n134': 0,  # Estimated Scenario Cost $: Waste Water Upgrades
    'n135': 0,  # Estimated Scenario Cost $: Urban BMPs
    'n136': 0,  # Estimated Scenario Cost $: Stream Protection
    'n137': 0,  # Estimated Scenario Cost $: Unpaved Road Protection
    'n138': 0,  # Estimated Scenario Cost $: Animal BMPs
    'n139': 0,  # Pathogen Loads (Farm Animals): Existing (orgs/month)
    'n140': 0,  # Pathogen Loads (Wastewater Treatment Plants): Existing (orgs/month) # NOQA
    'n141': 0,  # Pathogen Loads (Septic Systems): Existing (orgs/month)
    'n142': 0,  # Pathogen Loads (Urban Areas): Existing (orgs/month)
    'n143': 0,  # Pathogen Loads (Wildlife): Existing (orgs/month)
    'n144': 0,  # Pathogen Loads (Total): Existing (orgs/month)
    'n145': 0,  # Pathogen Loads (Farm Animals): Future (orgs/month)
    'n146': 0,  # Pathogen Loads (Wastewater Treatment Plants): Future (orgs/month) # NOQA
    'n147': 0,  # Pathogen Loads (Septic Systems): Future (orgs/month)
    'n148': 0,  # Pathogen Loads (Urban Areas): Future (orgs/month)
    'n149': 0,  # Pathogen Loads (Wildlife): Future (orgs/month)
    'n150': 0,  # Pathogen Loads (Total): Future (orgs/month)
    'n151': 0,  # Pathogen Loads: Percent Reduction (%)
    'InitNgN': 2373,  # Initial Non-Grazing Animal Totals: Nitrogen (kg/yr)
    'InitNgP': 785,  # Initial Non-Grazing Animal Totals: Phosphorus (kg/yr)
    'InitNgFC': 3.38e+9,  # Initial Non-Grazing Animal Totals: Fecal Coliforms (orgs/yr) # NOQA
    'NGAppSum': 0.55,  # Non-Grazing Manure Data Check: Land Applied (%)
    'NGBarnSum': 0.28,  # Non-Grazing Manure Data Check: In Confined Areas (%)
    'NGTotSum': 0.83,  # Non-Grazing Manure Data Check: Total (<= 1)
    'InitGrN': 2373,  # Initial Grazing Animal Totals: Nitrogen (kg/yr)
    'InitGrP': 785,  # Initial Grazing Animal Totals: Phosphorus (kg/yr)
    'InitGrFC': 3.38e+9,  # Initial Grazing Animal Totals: Fecal Coliforms (orgs/yr) # NOQA
    'GRAppSum': 0.52,  # Grazing Manure Data Check: Land Applied (%)
    'GRBarnSum': 0.18,  # Grazing Manure Data Check: In Confined Areas (%)
    'GRTotSum': 1,  # Grazing Manure Data Check: Total (<= 1)
    'AnimalFlag': 1,  # Flag: Animal Layer Detected (0 No; 1 Yes)
    'WildOrgsDay': 5.0e+8,  # Wildlife Loading Rate (org/animal/per day)
    'WildDensity': 25,  # Wildlife Density (animals/square mile)
    'WuDieoff': 0.9,  # Wildlife/Urban Die-Off Rate
    'UrbEMC': 9600,  # Urban EMC (org/100ml)
    'SepticOrgsDay': 2.0e+9,  # Septic Loading Rate (org/person per day)
    'SepticFailure': 0,  # Malfunctioning System Rate (0 - 1)
    'WWTPConc': 200,  # Wastewater Treatment Plants Loading Rate (cfu/100ml)
    'InstreamDieoff': 0.5,  # In-Stream Die-Off Rate
    'AWMSGrPct': 0,  # Animal Waste Management Systems: Livestock (%)
    'AWMSNgPct': 0,  # Animal Waste Management Systems: Poultry (%)
    'RunContPct': 0,  # Runoff Control (%)
    'PhytasePct': 0,  # Phytase in Feed (%),

    'AnimalName':             ['Dairy Cows', 'Beef Cows', 'Broilers', 'Layers', 'Hogs/Swine',  'Sheep', 'Horses', 'Turkeys', 'Other'] ,  # NOQA
    'NumAnimals':    np.array([        0.00,        0.00,       0.00,     0.00,         0.00,     0.00,     0.00,      0.00,    0.00]),  # NOQA
    'GrazingAnimal':          [         'Y',         'Y',        'N',      'N',          'N',      'Y',      'Y',       'N',     'N'] ,  # NOQA
    'AvgAnimalWt':   np.array([      640.00,      360.00,       0.90,     1.80,        61.00,    50.00,   500.00,      6.80,    0.00]),  # Average Animal Weight (kg) # NOQA
    'AnimalDailyN':  np.array([        0.44,        0.31,       1.07,     0.85,         0.48,     0.37,     0.28,      0.59,    0.00]),  # Animal Daily Loads: Nitrogen (kg/AEU) # NOQA
    'AnimalDailyP':  np.array([        0.07,        0.09,       0.30,     0.29,         0.15,     0.10,     0.06,      0.20,    0.00]),  # Animal Daily Loads: Phosphorus (kg/AEU) # NOQA
    'FCOrgsPerDay':  np.array([     1.0e+11,     1.0e+11,    1.4e+08,  1.4e+08,      1.1e+10,  1.2e+10,  4.2e+08,   9.5e+07,    0.00]),  # Fecal Coliforms (orgs/day) # NOQA

    'Month':                     ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],   # NOQA
    'NGPctManApp':      np.array([ 0.01,  0.01,  0.15,  0.10,  0.05,  0.03,  0.03,  0.03,  0.11,  0.10,  0.10,  0.08]),  # Manure Spreading: % Of Annual Load Applied To Crops/Pasture # NOQA
    'NGAppNRate':       np.array([ 0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05]),  # Manure Spreading: Base Nitrogen Loss Rate # NOQA
    'NGAppPRate':       np.array([ 0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07]),  # Manure Spreading: Base Phosphorus Loss Rate # NOQA
    'NGAppFCRate':      np.array([ 0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12]),  # Manure Spreading: Base Fecal Coliform Loss Rate # NOQA
    'NGPctSoilIncRate': np.array([ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]),  # Manure Spreading: % Of Manure Load Incorporated Into Soil # NOQA
    'NGBarnNRate':      np.array([ 0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20]),  # Barnyard/Confined Area: Base Nitrogen Loss Rate # NOQA
    'NGBarnPRate':      np.array([ 0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20]),  # Barnyard/Confined Area: Base Phosphorus Loss Rate # NOQA
    'NGBarnFCRate':     np.array([ 0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12]),  # Barnyard/Confined Area: Base Fecal Coliform Loss Rate # NOQA
    'PctGrazing':       np.array([ 0.02,  0.02,  0.10,  0.25,  0.50,  0.50,  0.50,  0.50,  0.50,  0.40,  0.25,  0.10]),  # Grazing Land: % Of Time Spent Grazing # NOQA
    'PctStreams':       np.array([ 0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05]),  # Grazing Land: % Of Time Spent In Streams # NOQA
    'GrazingNRate':     np.array([ 0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05]),  # Grazing Land: Base Nitrogen Loss Rate # NOQA
    'GrazingPRate':     np.array([ 0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07]),  # Grazing Land: Base Phosphorus Loss Rate # NOQA
    'GrazingFCRate':    np.array([ 0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12]),  # Grazing Land: Base Fecal Coliform Loss Rate # NOQA
    'GRPctManApp':      np.array([ 0.01,  0.01,  0.10,  0.05,  0.05,  0.03,  0.03,  0.03,  0.11,  0.06,  0.02,  0.02]),  # Manure Spreading: % Of Annual Load Applied To Crops/Pasture # NOQA
    'GRAppNRate':       np.array([ 0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05,  0.05]),  # Manure Spreading: Base Nitrogen Loss Rate # NOQA
    'GRAppPRate':       np.array([ 0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07,  0.07]),  # Manure Spreading: Base Phosphorus Loss Rate # NOQA
    'GRAppFCRate':      np.array([ 0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12]),  # Manure Spreading: Base Fecal Coliform Loss Rate # NOQA
    'GRPctSoilIncRate': np.array([ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]),  # Manure Spreading: % Of Manure Load Incorporated Into Soil # NOQA
    'GRBarnNRate':      np.array([ 0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20]),  # Barnyard/Confined Area: Base Nitrogen Loss Rate # NOQA
    'GRBarnPRate':      np.array([ 0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20,  0.20]),  # Barnyard/Confined Area: Base Phosphorus Loss Rate # NOQA
    'GRBarnFCRate':     np.array([ 0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12,  0.12]),  # Barnyard/Confined Area: Base Fecal Coliform Loss Rate # NOQA

    'ShedAreaDrainLake': 0,  # Percentage of watershed area that drains into a lake or wetlands: (0 - 1) # NOQA
    'RetentNLake': 0.12,  # Lake Retention Rate: Nitrogen
    'RetentPLake': 0.29,  # Lake Retention Rate: Phosphorus
    'RetentSedLake': 0.84,  # Lake Retention Rate: Sediment
    'AttenFlowDist': 0,  # Attenuation: Flow Distance (km)
    'AttenFlowVel': 4,  # Attenuation: Flow Velocity (km/hr)
    'AttenLossRateN': 0.287,  # Attenuation: Loss Rate: Nitrogen
    'AttenLossRateP': 0.226,  # Attenuation: Loss Rate: Phosphorus
    'AttenLossRateTSS': 0,  # Attenuation: Loss Rate: Total Suspended Solids
    'AttenLossRatePath': 0,  # Attenuation: Loss Rate: Pathogens
    'StreamFlowVolAdj': 1,  # Streamflow Volume Adjustment Factor
}