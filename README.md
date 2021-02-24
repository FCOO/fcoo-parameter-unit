# fcoo-parameter-unit
>


## Description
Subset of [CF Standard Names](https://cfconventions.org/standard-names.html) from [CF Conventions and Metadata](https://cfconventions.org/index.html) of parameters and subset of [MANGLER](http://mangler.dk) of units used in FCOO applications. 

Also includes methods for unit conversion



## Installation
### bower
`bower install https://github.com/FCOO/fcoo-parameter-unit.git --save`

## Demo
http://FCOO.github.io/fcoo-parameter-unit/demo/

## Usage

### `cf_sn_parameter.json`
List of all parametre used in FCOOs web-application. 
Contain both standard CF scalar parameter and "vector"-parameter with two parameter `[eastward, westward]` and/or `[speed, direction]` 

#### Format
    {CF_SN_ID:PARAMETER}
    PARAMETER = {
        name    : STRING or {da: STRING, en: STRING}. The name of the parameter
        type    : STRING. "scalar" or "vector". Default "scalar"
        standard: BOOLEAN. true if it is a CF-parameter. Default true
        eastward_northward: [CF_SN_ID, CF_SN_ID]. Only for type="vector": The east- and westward component
    },

#### Example
    "sea_water_speed": {
        "name": {"da": "Strømhastighed", "en": "Current Speed"},
        "unit": "m s-1"
    },

    "sea_water_velocity": {
        "name": {"da": "Strøm", "en": "Current"},
        "type": "vector",
        "standard"  : false,
        "eastward_northward": ["eastward_sea_water_velocity", "northward_sea_water_velocity"],
        "speed_direction": ["sea_water_speed", "sea_water_velocity_to_direction"]
    },

### `cf_sn_unit.json`
List of all units used in FCOOs web-application. 

#### Format
    {UNIT_ID:UNIT}
    UNIT = {
        name     : STRING or {da: STRING, en: STRING}. The name of the unit
        decimals : NUMBER. Default decimals. Default 0
        SI_unit  : UNIT_ID. Ref to the units SI-unit.
        SI_factor: FLOAT/STRING. Convertion between the unit and the SI-unit. SI-unit = SI_factor*unit + SI_offset
        SI_offset: FLOAT/STRING.
        noSpace  : BOOLEAN. If true no space between a value and the unit-name. E.q. 12.3°
    },


#### Example
    "m": {
        "name": "m"
    },
    "cm": {
        "name": "cm",
        "SI_unit": "m",
        "SI_factor": 0.01
    },
    "km": {
        "name": "km",
        "SI_unit": "m",
        "SI_factor": 1000
    },

    "m s-1": {
        "name": "m/s",
        "decimals": 1
    },
    "nm h-1": {
        "name": {"da":"knob", "en":"knots"},
        "SI_unit": "m s-1",
        "SI_factor": "1852/(60*60)"
    },
    "km h-1": {
        "name": {"da":"km/t", "en":"km/h"},
        "SI_unit": "m s-1",
        "SI_factor": "1000/(60*60)"
    },



    
### The JavaScript package
Contains methods for 

- Getting parameter and units 
- Get parameter names with default units. E.q. `Temeprature (Air) [°C]`
- Format value with units. E.q.`12.3 m/s`
- Convert values between to units

See `src/fcoo-parameter-unit.js` for documentation


<!-- ### options
| Id | Type | Default | Description |
| :--: | :--: | :-----: | --- |
| options1 | boolean | true | If <code>true</code> the ... |
| options2 | string | null | Contain the ... |

### Methods

    .methods1( arg1, arg2,...): Do something
    .methods2( arg1, arg2,...): Do something else
 -->


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/fcoo-parameter-unit/LICENSE).

Copyright (c) 2021 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk
