
import React, { useEffect, useState } from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enUS, deDE, esES, frFR } from '@mui/x-date-pickers/locales'; // Añade aquí los locales que necesites
import dayjs from 'dayjs';



export const Calendar = () => {
    // Funcion para mapear idioma a configuracion MUI y dayjs para traduccion dekl usuario
    const getLocaleData = (locale) => {
        switch (locale) {
            case 'de':
                return { mui: deDE, dayjsLocale: 'de' };
            case 'es':
                return { mui: esES, dayjsLocale: 'es' };
            case 'fr':
                return { mui: frFR, dayjsLocale: 'fr' };
            case 'en':
            default:
                return { mui: enUS, dayjsLocale: 'en' };
        }
    };
    //--------
    const [localeInfo, setLocaleInfo] = useState(getLocaleData('en'));

    useEffect(() => {
        const userLang = navigator.language?.split('-')[0] || 'en';
        const localeData = getLocaleData(userLang);

        import(`dayjs/locale/${localeData.dayjsLocale}`)
            .then(() => {
                dayjs.locale(localeData.dayjsLocale);
                setLocaleInfo(localeData);
            })
            .catch(() => {
                console.warn(`No se pudo cargar el locale "${userLang}", usando inglés por defecto`) //mostrar mensajes de advertencia
                dayjs.locale('en');
                setLocaleInfo(getLocaleData('en'));
            });
    }, []);

    return (
        <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={localeInfo.dayjsLocale}
            localeText={localeInfo.mui.components.MuiLocalizationProvider.defaultProps.localeText}//para la traduccion por idiomas
        >
            <DateCalendar />
        </LocalizationProvider>
    );
};