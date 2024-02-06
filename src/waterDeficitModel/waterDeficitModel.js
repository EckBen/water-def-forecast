///////////////////////////////////////////////////////////////////////////////
//
// Climate Smart Farming Water Deficit Calculator
// Copyright (c) 2018 Cornell Institute for Climate Smart Solutions
// All Rights Reserved
//
// This software is published under the provisions of the GNU General Public
// License <http://www.gnu.org/licenses/>. A text copy of the license can be
// found in the file 'LICENSE' included with this software.
//
// A text copy of the copyright notice, licensing conditions and disclaimers
// is available in the file 'COPYRIGHT' included with this software.
//
///////////////////////////////////////////////////////////////////////////////

export const MODEL_DATA = {
    "cropinfo" : {
        "grass": {"label": 'Grass Reference', "Lini": 0, "Ldev": 0, "Lmid": 240, "Llate": 0, "Kcini": 1.00, "Kcmid": 1.00, "Kcend": 1.00},
        "cereals": {"label": 'Cereals', "Lini": 20, "Ldev": 35, "Lmid": 60, "Llate": 25, "Kcini": 0.30, "Kcmid": 1.15, "Kcend": 0.30},
        "forages": {"label": 'Forages', "Lini": 10, "Ldev": 15, "Lmid": 20, "Llate": 10, "Kcini": 0.40, "Kcmid": 1.20, "Kcend": 1.10},
        "grapes": {"label": 'Grapes (wine)', "Lini": 30, "Ldev": 60, "Lmid": 40, "Llate": 80, "Kcini": 0.30, "Kcmid": 0.70, "Kcend": 0.45},
        "legumes": {"label": 'Legumes', "Lini": 20, "Ldev": 30, "Lmid": 30, "Llate": 10, "Kcini": 0.50, "Kcmid": 1.10, "Kcend": 1.00},
        "rootstubers": {"label": 'Roots and Tubers', "Lini": 20, "Ldev": 30, "Lmid": 50, "Llate": 20, "Kcini": 0.50, "Kcmid": 1.15, "Kcend": 0.70},
        "vegsmallshort": {"label": 'Vegetables (Small) - Short Season', "Lini": 20, "Ldev": 35, "Lmid": 35, "Llate": 10, "Kcini": 0.70, "Kcmid": 1.05, "Kcend": 0.95},
        "vegsmalllong": {"label": 'Vegetables (Small) - Long Season', "Lini": 30, "Ldev": 45, "Lmid": 75, "Llate": 30, "Kcini": 0.70, "Kcmid": 1.05, "Kcend": 0.95},
        "vegsolanum": {"label": 'Vegetables (Solanum Family)', "Lini": 30, "Ldev": 40, "Lmid": 80, "Llate": 30, "Kcini": 0.60, "Kcmid": 1.15, "Kcend": 0.80},
        "vegcucumber": {"label": 'Vegetables (Cucumber Family)', "Lini": 25, "Ldev": 40, "Lmid": 35, "Llate": 20, "Kcini": 0.50, "Kcmid": 1.00, "Kcend": 0.80}
    },
    "soildata" : {
        "labels": {
            'high':'High (Clay)',
            'medium':'Medium (Loam)',
            'low':'Low (Sand)'
        },
        "soilmoistureoptions": {
            "low": { "wiltingpoint": 1.0, "prewiltingpoint": 1.15, "stressthreshold": 1.5, "fieldcapacity": 2.0, "saturation": 5.0 },
            "medium": { "wiltingpoint": 2.0, "prewiltingpoint": 2.225, "stressthreshold":2.8, "fieldcapacity": 3.5, "saturation": 5.5 },
            "high": { "wiltingpoint": 3.0, "prewiltingpoint": 3.3, "stressthreshold":4.0, "fieldcapacity": 5.0, "saturation": 6.5 }
        },
        "soildrainageoptions": {
            "low": { "daysToDrainToFcFromSat": 0.125 },
            "medium": { "daysToDrainToFcFromSat": 1.0 },
            "high": { "daysToDrainToFcFromSat": 2.0 }
        }
    }
};

function getPotentialDailyDrainage(soilcap) {
    // -----------------------------------------------------------------------------------------
    // Calculate potential daily drainage of soil
    //
    // soilcap : soil water capacity : string ('high', 'medium', 'low')
    // -----------------------------------------------------------------------------------------
    //console.log(soilcap)
    //console.log(MODEL_DATA.soildata.soilmoistureoptions[soilcap])
    return (MODEL_DATA.soildata.soilmoistureoptions[soilcap].saturation - MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity)/MODEL_DATA.soildata.soildrainageoptions[soilcap].daysToDrainToFcFromSat;
}

function getTawForPlant(soilcap) {
    // -----------------------------------------------------------------------------------------
    // Calculate total available water (TAW) for plant, defined here as:
    // soil moisture at field capacity minus soil moisture at wilting point
    //
    // soilcap : soil water capacity : string ('high', 'medium', 'low')
    // -----------------------------------------------------------------------------------------
    return MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity - MODEL_DATA.soildata.soilmoistureoptions[soilcap].wiltingpoint
}

function getWaterStressCoeff(Dr,TAW) {
    // -----------------------------------------------------------------------------------------
    // Calculate coefficient for adjusting ET when accounting for decreased ET during water stress conditions.
    // Refer to FAO-56 eq 84, pg 169
    // Dr  : the antecedent water deficit (in)
    // TAW : total available (in) water for the plant (soil moisture at field capacity minus soil moisture at wilting point).
    // p   : at what fraction between field capacity and wilting point do we start applying this water stress factor.
    // Ks  : water stress coefficient
    // -----------------------------------------------------------------------------------------
    var Ks = null
    var p = 0.5
    Dr = -1.*Dr
    Ks = (Dr<=(p*TAW)) ? 1. : (TAW-Dr)/((1-p)*TAW);
    Ks = Math.max(Ks,0.);
    return Ks;
}

function getSingleCropCoeff(numdays,croptype) {
    // -----------------------------------------------------------------------------------------
    // Calculate crop coefficient for a specific growth stage of plant.
    // - Coefficients for initial, middle and end growth stages are assigned directly.
    // - Coefficients for development and late growth stages are determined by linear interpolation between coefficients for surrounding stages.
    // Refer to FAO-56 single crop coefficient reference, along with other sources for values specific for the Northeast US.
    //
    // numdays : days since planting, used to estimate the growth stage.
    // croptype  : the crop type
    // Lini  : length (days) of initial growth stage
    // Ldev  : length (days) of development growth stage
    // Lmid  : length (days) of middle (mature) growth stage
    // Llate : length (days) of late growth stage
    // Kcini : crop coefficient for initial growth stage
    // Kcmid : crop coefficient for middle (mature) growth stage
    // Kcend : crop coefficient at end of growing season
    // Kc    : crop coefficient for this specific growth stage - we use Kc to adjust grass reference ET
    // -----------------------------------------------------------------------------------------
    var Lini = MODEL_DATA.cropinfo[croptype]['Lini']
    var Ldev = MODEL_DATA.cropinfo[croptype]['Ldev']
    var Lmid = MODEL_DATA.cropinfo[croptype]['Lmid']
    var Llate = MODEL_DATA.cropinfo[croptype]['Llate']
    var Kcini = MODEL_DATA.cropinfo[croptype]['Kcini']
    var Kcmid = MODEL_DATA.cropinfo[croptype]['Kcmid']
    var Kcend = MODEL_DATA.cropinfo[croptype]['Kcend']
    var Kc = null;

    if (numdays <= Lini) {
        // before planting or in initial growth stage
        Kc = Kcini
    } else if ((numdays > Lini) && (numdays < (Lini+Ldev))) {
        // in development growth stage
        // linearly interpolate between Kcini and Kcmid to find Kc within development stage
        Kc = Kcini + (numdays-Lini)*(Kcmid-Kcini)/Ldev
    } else if ((numdays >= (Lini+Ldev)) && (numdays <= (Lini+Ldev+Lmid))) {
        // in middle (mature) growth stage
        Kc = Kcmid
    } else if ((numdays > (Lini+Ldev+Lmid)) && (numdays < (Lini+Ldev+Lmid+Llate))) {
        // in late growth stage
        // linearly interpolate between Kcmid and Kcend to find Kc within late growth stage
        Kc = Kcmid - (numdays-(Lini+Ldev+Lmid))*(Kcmid-Kcend)/Llate
    } else {
        // at end of growing season
        Kc = Kcend
    }

    return Kc
}


export function runWaterDeficitModel(precip,pet,initDeficit,startDate,plantingDate,soilcap,croptype,isContinuation) {
    // -----------------------------------------------------------------------------------------
    // Calculate daily water deficit (inches) from daily precipitation, evapotranspiration, soil drainage and runoff.
    //
    // The water deficit is calculated relative to field capacity (i.e. the amount of water available to the plant).
    // Therefore, the water deficit is:
    //    - zero when soil moisture is at field capacity
    //    - a negative value when soil moisture is between field capacity and the wilting point
    //    - a positive value when soil moisture is between field capacity and saturation
    //    - bounded below by the wilting point ( = soil moisture at wilting point minus soil moisture at field capacity )
    //    - bounded above by saturation ( = soil moisture at saturation minus soil moisture at field capacity)
    //
    //  precip       : daily precipitation array (in) : (NRCC ACIS grid 3)
    //  pet          : daily potential evapotranspiration array (in) : (grass reference PET obtained from NRCC MORECS model output)
    //  initDeficit  : water deficit used to initialize the model
    //  startDate    : date of model initialization
    //  plantingDate : date crop was planted
    //  soilcap      : soil water capacity ('high','medium','low')
    //  croptype     : type of crop
    //
    // -----------------------------------------------------------------------------------------

    // a running tally of the deficit
    var deficit = null;

    // days since planting, for help in determining the plant's current growth stage
    var daysSincePlanting = null;
    // Total water available to plant
    var TAW = null;
    // water stress coefficient
    var Ks = null;
    // crop coefficient
    var Kc = null;

    // values of model components for a single day
    var totalDailyDrainage = null;
    var totalDailyRunoff = null;
    var totalDailyPrecip = null;
    var totalDailyPET = null;
    var dailyPotentialDrainageRate = null;

    // hourly rates of model components
    var hourlyPrecip = null;
    var hourlyPET = null;
    var hourlyDrainage = null;
    var hourlyPotentialDrainage = null;

    // OUTPUT VARS
    // arrays holding daily values of model components
    // deficitDaily is water deficit calculation we are looking for.
    // Other variables are just for potential water balance verification, etc, if the user chooses.
    var deficitDaily = [];
    var deficitDailyChange = [];
    var drainageDaily = [];
    var runoffDaily = [];
    var precipDaily = [];
    var petDaily = [];

    // Initialize deficit
    //   : to zero if saturated soil after irrigation)
    //   : to last observed deficit if running for forecasts
    deficit = initDeficit;

    // the first elements in our output arrays. It include the water deficit initialization. Others will populate starting Day 2.
    deficitDaily.push(deficit);
    deficitDailyChange.push(null);
    drainageDaily.push(null);
    runoffDaily.push(null);
    petDaily.push(null);
    precipDaily.push(null);

    // Calculate daily drainage rate that occurs when soil water content is between saturation and field capacity
    dailyPotentialDrainageRate = getPotentialDailyDrainage(soilcap);

    // Need to know the number of days since planting for crop coefficient calculation
    // If the number is negative, assuming Kc = Kcini for bare soil and single crop coeff method (FAO-56)
    daysSincePlanting =  Math.floor(( Date.parse(startDate) - Date.parse(plantingDate) ) / 86400000);

    // Loop through all days, starting with the second day (we already have the deficit for the initial day from model initialization)
    const startIdx = isContinuation ? 0 : 1;
    for (var idx=startIdx; idx < pet.length; idx++) {
        // increment as we advance through the growth stages of the plant
        daysSincePlanting += 1

        // Calculate Ks, the water stress coefficient, using antecedent deficit
        TAW = getTawForPlant(soilcap);
        Ks = getWaterStressCoeff(deficit,TAW);
        // Calculate Kc, the crop coefficient, using the days since planting
        Kc = getSingleCropCoeff(daysSincePlanting,croptype);

        // Vars to hold the daily tally for components of the water balance model daily - mostly for calc verification
        // Initialize the daily totals here.
        totalDailyDrainage = 0.
        totalDailyRunoff = 0.
        // We already know what the daily total is for Precip and ET
        totalDailyPET = -1.*pet[idx]*Kc*Ks
        totalDailyPrecip = precip[idx]

        // Convert daily rates to hourly rates. For this simple model, rates are constant throughout the day.
        // For drainage : this assumption is okay
        // For precip   : this assumption is about all we can do without hourly observations
        // For PET      : this assumption isn't great. Something following diurnal cycle would be best.
        // For runoff   : not necessary. hourly runoff is determined without limits below.
        // ALL HOURLY RATES POSITIVE
        hourlyPrecip = totalDailyPrecip/24.
        hourlyPET = -1.*totalDailyPET/24.
        hourlyPotentialDrainage = dailyPotentialDrainageRate/24.

        for (var hr=1; hr<=24; hr++) {
            // Calculate hourly drainage estimate. It is bounded by the potential drainage rate and available
            // water in excess of the field capacity. We assume drainage does not occur below field capacity.
            if ( deficit > 0. ) {
                hourlyDrainage = Math.min(deficit, hourlyPotentialDrainage)
            } else {
                hourlyDrainage = 0.
            }
            totalDailyDrainage -= hourlyDrainage

            // calculate runoff for bookkeeping purposes
            // runoff is essentially calculated as the amount of water 'deficit' in excess of saturation
            // runoff is applied to the model by setting saturation bounds, below
            totalDailyRunoff -= Math.max(
                deficit + hourlyPrecip - hourlyPET - hourlyDrainage - (MODEL_DATA.soildata.soilmoistureoptions[soilcap].saturation-MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity),
                0.
            )

            // Adjust deficit based on hourly water budget.
            // deficit is bound by saturation (soil can't be super-saturated). This effectively reduces deficit by hourly runoff as well.
            deficit = Math.min(
                deficit + hourlyPrecip - hourlyPET - hourlyDrainage,
                MODEL_DATA.soildata.soilmoistureoptions[soilcap].saturation-MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity
            )

            // deficit is bound by wilting point, but calculations should never reach wilting point based on this model. We bound it below for completeness.
            // In the real world, deficit is able to reach wilting point. The user should note that deficit values NEAR the wilting point
            // from this model should be interpreted as 'danger of wilting exists'.
            deficit = Math.max(
                deficit,
                -1.*(MODEL_DATA.soildata.soilmoistureoptions[soilcap].fieldcapacity-MODEL_DATA.soildata.soilmoistureoptions[soilcap].wiltingpoint)
            )
        }

        deficitDailyChange.push(deficit-deficitDaily[deficitDaily.length-1]);
        deficitDaily.push(deficit);
        drainageDaily.push(totalDailyDrainage);
        runoffDaily.push(totalDailyRunoff);
        petDaily.push(totalDailyPET);
        precipDaily.push(totalDailyPrecip);
    }

    //console.log('INSIDE WATER DEFICIT MODEL');

    if (isContinuation) {
        return {
            'deficitDailyChange':deficitDailyChange.slice(1),
            'deficitDaily':deficitDaily.slice(1),
            'drainageDaily':drainageDaily.slice(1),
            'runoffDaily':runoffDaily.slice(1),
            'petDaily':petDaily.slice(1),
            'precipDaily':precipDaily.slice(1)
        };
    } else {
        return {
            'deficitDailyChange':deficitDailyChange,
            'deficitDaily':deficitDaily,
            'drainageDaily':drainageDaily,
            'runoffDaily':runoffDaily,
            'petDaily':petDaily,
            'precipDaily':precipDaily
        };
    }

}

