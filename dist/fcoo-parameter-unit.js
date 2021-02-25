/****************************************************************************
	fcoo-parameter-unit.js,

	(c) 2021, FCOO

	https://github.com/FCOO/fcoo-parameter-unit
	https://github.com/FCOO

****************************************************************************/

(function ($, i18next, moment, window/*, document, undefined*/) {
	"use strict";

    //Create fcoo-namespace
    var ns = window.fcoo = window.fcoo || {},
        nsParameter = ns.parameter = ns.parameter || {},
        nsUnit = nsParameter.unit = nsParameter.unit || {};


    //adjustText convet STRING or {da:STRING, en:STRING,..} into complete {da:STRING,...} for all languages
    function adjustText(text){
        var result = typeof text == 'string' ? {da:text, en:text} : text;

        $.each(i18next.options.languages || i18next.languages, function(index, lang){
            result[lang] = result[lang] || result.en;
        });
        return result;
    }


    /****************************************************************************
    UNIT
    ****************************************************************************/
    function Unit(id, options){
        this.id         = id;
        this.name       = options.name || '';
        this.group      = options.group || 'METRO';
        this.decimals   = options.decimals || 0;
        this.noSpace    = options.noSpace || false;
        this.SI_unit    = options.SI_unit  || null;
        this.SI_offset  = options.SI_offset|| 0;
        this.SI_factor  = options.SI_factor|| 1;

        this.SI_offset = eval(this.SI_offset);
        this.SI_factor = eval(this.SI_factor);

        if (this.name){
            this.name = adjustText(this.name);

            //Create translation of unit-names with Namespace unit. E.g. "unit:m" = {da:"m", en:"m"} or "unit:nm h-1": {"da":"knob", "en":"knots"}
            i18next.addPhrase( 'unit', this.id, this.name );
        }
    }

    nsParameter.Unit = Unit;
    nsParameter.Unit.prototype = {
        toSI     : function(value){
            return this.SI_offset + this.SI_factor*value;
        },
        fromSI   : function(value){
            return (value - this.SI_offset) / this.SI_factor;
        },
        convertTo: function(value, toUnit){
            toUnit = nsParameter.getUnit(toUnit);
            return toUnit ? toUnit.fromSI( this.toSI(value) ) : null;
        },
        convertFrom: function(value, fromUnit){
            fromUnit = nsParameter.getUnit(fromUnit);
            return fromUnit ? this.fromSI( fromUnit.toSI(value) ) : null;
        },

        translate: function(prefix='', postfix=''){
            var key = 'unit:'+this.id;
            return i18next.exists(key) ? prefix + i18next.t(key) + postfix : '';
        }
    };

    //Create list and methods direct in namespace
    nsParameter.getUnit = function(idOrUnit){
        return typeof idOrUnit == 'string' ? nsUnit[idOrUnit] : idOrUnit;
    };

    nsParameter.convert = function(value, fromUnit, toUnit){
        fromUnit = nsParameter.getUnit(fromUnit);
        return fromUnit ? fromUnit.convertTo(value, toUnit ) : null;
    };

    //Load units
    ns.promiseList.append({
        fileName: {subDir: 'parameter-unit', fileName: 'cf_sn_unit.json'},
        resolve : function(data){
            $.each(data, function(unit_id, options){
                nsUnit[unit_id] = new nsParameter.Unit(unit_id, options);
            });

            //Link SI-units with its derivative
            $.each(nsUnit, function(unitId, unit){
                if (unit.SI_unit){
                    nsUnit[unit.SI_unit].derivative = nsUnit[unit.SI_unit].derivative || {};
                    nsUnit[unit.SI_unit].derivative[unitId] = unit;
                }
            });
        }
    });

    var noUnit = new Unit('none', {name:''});

    /****************************************************************************
    PARAMETER
    ****************************************************************************/
    function Parameter(id, options){
        options = $.extend(true, {
            name    : id,
            type    : "scalar",
            decimals: -1,   //= unknown
            standard: true,
            eastward_northward: [],
            speed_direction: [],
        }, options );

        this.id         = id;
        this.name       = adjustText(options.name);
        this.decimals   = options.decimals;
        this.type       = options.type;
        this.standard   = options.standard;
        this.unit       = nsUnit[options.unit];
        this.eastward_northward = options.eastward_northward;
        this.speed_direction    = options.speed_direction;

        //Create translation of parameter-names with Namespace parameter. E.g. "parameter:sea_water_speed" = {"da": "Strømhastighed", "en": "Current Speed"}
        i18next.addPhrase( 'parameter', this.id, this.name );
    }

    nsParameter.Parameter = Parameter;
    nsParameter.Parameter.prototype = {
        getName: function(inclUnit, z){
            var _this = this,
                result = {};
            z = z ? adjustText(z) : null;
            $.each(this.name, function(lang, text){
                var langText = text;
                if (z)
                    langText = langText + '&nbsp;(' + z[lang] + ')';

                if (inclUnit)
                    langText = langText + '&nbsp;[' + _this.unit.name[lang] + ']';

                result[lang] = langText;
            });

            return result;
        },
        translate: function(inclUnit, z){
            return i18next.sentence( this.getName(inclUnit, z) );
        },

        format: function(value, inclUnit, toUnit){
            var decimals = this.decimals,
                unit = this.unit;

            if (toUnit){
                toUnit = nsParameter.getUnit(toUnit);

                //Calc decimals based on the factors between this.unit and toUnit
                decimals = decimals + Math.max(0, Math.round(Math.log10(toUnit.SI_factor/unit.SI_factor)));

                value = nsParameter.convert(value, unit, toUnit);
                unit = toUnit;
            }


            //Get numerical-format via FCOO-value-format
            return $.valueFormat.formats['number'].format(value, {decimals: decimals}) + (inclUnit ? (unit.noSpace ? '' : '&nbsp;') + unit.translate() : '');
        }
    };


    //Load parameter
    ns.promiseList.append({
        fileName: {subDir: 'parameter-unit', fileName: 'cf_sn_parameter.json'},
        resolve : function(data){
            $.each(data, function(parameter_id, options){
                nsParameter[parameter_id] = new nsParameter.Parameter(parameter_id, options);
            });

            //Link parameters to its vector-components
            $.each(nsParameter, function(pId, param){
                if (param.type == 'vector'){
                    $.each(param.eastward_northward, function(index, id){
                        param.eastward_northward[index] = nsParameter[id];
                    });
                    $.each(param.speed_direction, function(index, id){
                        param.speed_direction[index] = nsParameter[id];
                    });
                }

                //If no unit is given => use speed-unit or east-unit
                if (param.type)
                    param.unit =
                        param.unit ||
                        (param.speed_direction.length ? param.speed_direction[0].unit : null) ||
                        (param.eastward_northward.length ? param.eastward_northward[0].unit : null) ||
                        noUnit;

                //If no decimals is given for the parameter => use decimals given by the unit
                if (param.decimals == -1)
                    param.decimals = param.unit.decimals;
            });
        }
    });

}(jQuery, this.i18next, this.moment, this, document));