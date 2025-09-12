import React, { useEffect, useState, useMemo } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enUS, deDE, esES, frFR } from '@mui/x-date-pickers/locales';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import StarIcon from '@mui/icons-material/Star';
import dayjs from 'dayjs';

export const Calendar = ({ markedDates = [] }) => {
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

  const [localeInfo, setLocaleInfo] = useState(getLocaleData('en'));
  const [value, setValue] = useState(dayjs());

  useEffect(() => {
    const userLang = navigator.language?.split('-')[0] || 'en';
    const localeData = getLocaleData(userLang);

    import(`dayjs/locale/${localeData.dayjsLocale}`)
      .then(() => {
        dayjs.locale(localeData.dayjsLocale);
        setLocaleInfo(localeData);
      })
      .catch(() => {
        console.warn(`No se pudo cargar el locale "${userLang}", usando inglés por defecto`);
        dayjs.locale('en');
        setLocaleInfo(getLocaleData('en'));
      });
  }, []);

  // Normalizamos las fechas marcadas para facilitar comparación
  const normalizedMarkedDates = useMemo(() => {
    return markedDates
      .map(date => {
        const d = dayjs(date);
        return d.isValid() ? d.format('YYYY-MM-DD') : null;
      })
      .filter(Boolean);
  }, [markedDates]);

  useEffect(() => {
    console.log("Fechas marcadas (strings YYYY-MM-DD):", normalizedMarkedDates);
  }, [normalizedMarkedDates]);

  const renderDay = (day, _selectedDate, dayInCurrentMonth, props) => {
    const formattedDay = day.format('YYYY-MM-DD');
    const isMarked = normalizedMarkedDates.includes(formattedDay);

    return (
      <PickersDay
        {...props}
        day={day}
        sx={{
          backgroundColor: isMarked ? '#1976d2' : undefined,
          color: isMarked ? 'white' : undefined,
          border: isMarked ? '2px solid #004a9f' : undefined,
          borderRadius: '50%',
          position: 'relative',
          '&:hover': {
            backgroundColor: isMarked ? '#1565c0' : undefined,
          },
        }}
      >
        {isMarked && (
          <StarIcon
            fontSize="small"
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: '#ffeb3b',
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: '50%',
              padding: '2px',
              width: 16,
              height: 16,
            }}
          />
        )}
      </PickersDay>
    );
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={localeInfo.dayjsLocale}
      localeText={localeInfo.mui.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <StaticDatePicker
        key={normalizedMarkedDates.join('-')}
        displayStaticWrapperAs="desktop"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        renderDay={renderDay}
      />
    </LocalizationProvider>
  );
};
