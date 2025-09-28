import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import HandshakeIcon from '@mui/icons-material/Handshake';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { esES } from '@mui/x-date-pickers/locales';

// Custom day renderer
const CustomDay = (props) => {
  const { day, markedDates = [], outsideCurrentMonth, ...other } = props;
  const formatted = day.format('YYYY-MM-DD');
  const isMarked = markedDates.includes(formatted);

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      sx={{
        backgroundColor: isMarked ? '#1976d2' : undefined,
        color: isMarked ? 'white' : 'inherit',
        border: isMarked ? '1px solid #ffffff' : undefined,
        position: 'relative',
        borderRadius: '50%',
        '&:hover': {
          backgroundColor: isMarked ? '#1565c0' : undefined,
        },
      }}
    >
      {/* Renderiza el número del día */}
      {day.date()}

      {/*  Ícono si está marcado */}
      {isMarked && (
        <HandshakeIcon
          fontSize="small"
          sx={{
            position: 'absolute',
            top: 20,
            right: -8,
            color: '#d4af37',
            // backgroundColor: 'rgba(0,0,0,0.6)',
            // borderRadius: '50%',
            // padding: '2px',
            width: 30,
            height: 25,
          }}
        />
      )}
    </PickersDay>
  );
};

// Calendar component
export const Calendar = ({ markedDates = [] }) => {
  const normalizedMarkedDates = markedDates.map((date) =>
    dayjs(date).format('YYYY-MM-DD')
  );

  const [selectedDate, setSelectedDate] = useState(dayjs());

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="es"
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <DateCalendar
        value={selectedDate}
        onChange={(newValue) => setSelectedDate(newValue)}
        slots={{ day: CustomDay }}
        slotProps={{
          day: {
            markedDates: normalizedMarkedDates,
          },
        }}
        sx={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          '& .MuiPickersDay-root': {
            fontSize: '1rem',
            width: '42px',
            height: '42px',
          },
          '& .MuiDayCalendar-weekDayLabel': {
            fontSize: '0.9rem',
          },
          '& .MuiPickersCalendarHeader-root': {
            fontSize: '1.1rem',
          },
          '& .MuiPickersCalendarHeader-label': {
            textTransform: 'lowercase', 
            '&::first-letter': {
              textTransform: 'uppercase',
            },
          }
        }}
      />
    </LocalizationProvider>
  );
};

