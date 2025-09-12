// import React, { useMemo, useState } from 'react';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
// import { PickersDay } from '@mui/x-date-pickers/PickersDay';
// import StarIcon from '@mui/icons-material/Star';
// import { esES } from '@mui/x-date-pickers/locales';
// import dayjs from 'dayjs';

// // Importar locale de dayjs
// import 'dayjs/locale/es';

// export const Calendar = ({ markedDates = [] }) => {
//   const [value, setValue] = useState(dayjs());

//   // Normalizar fechas a strings "YYYY-MM-DD"
//   const normalizedMarkedDates = useMemo(() => {
//     return markedDates
//       .map(date => {
//         const d = dayjs(date);
//         return d.isValid() ? d.format('YYYY-MM-DD') : null;
//       })
//       .filter(Boolean);
//   }, [markedDates]);

//   const renderDay = (day, _selectedDate, dayInCurrentMonth, props) => {
//     const formattedDay = day.format('YYYY-MM-DD');
//     const isMarked = normalizedMarkedDates.includes(formattedDay);

//     return (
//       <PickersDay
//         {...props}
//         day={day}
//         sx={{
//           backgroundColor: isMarked ? '#1976d2' : undefined,
//           color: isMarked ? 'white' : undefined,
//           border: isMarked ? '2px solid #004a9f' : undefined,
//           borderRadius: '50%',
//           position: 'relative',
//           '&:hover': {
//             backgroundColor: isMarked ? '#1565c0' : undefined,
//           },
//         }}
//       >
//         {isMarked && (
//           <StarIcon
//             fontSize="small"
//             sx={{
//               position: 'absolute',
//               top: 0,
//               right: 0,
//               color: '#ffeb3b',
//               backgroundColor: 'rgba(0,0,0,0.6)',
//               borderRadius: '50%',
//               padding: '2px',
//               width: 16,
//               height: 16,
//             }}
//           />
//         )}
//       </PickersDay>
//     );
//   };

//   return (
//     <LocalizationProvider
//       dateAdapter={AdapterDayjs}
//       adapterLocale="es"
//       localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
//     >
//       <StaticDatePicker
//         displayStaticWrapperAs="desktop"
//         value={value}
//         onChange={setValue}
//         renderDay={renderDay}
//       />
//     </LocalizationProvider>
//   );
// };
// import React from 'react';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
// import { PickersDay } from '@mui/x-date-pickers/PickersDay';
// import StarIcon from '@mui/icons-material/Star';
// import dayjs from 'dayjs';
// import 'dayjs/locale/es';
// import { esES } from '@mui/x-date-pickers/locales';

// export const Calendar = ({ markedDates = [] }) => {
//   // Asegúrate que las fechas están en formato string "YYYY-MM-DD"
//   const normalizedMarkedDates = markedDates.map(date => dayjs(date).format('YYYY-MM-DD'));

//   const renderDay = (day, _value, props) => {
//     const formatted = day.format('YYYY-MM-DD');
//     const isMarked = normalizedMarkedDates.includes(formatted);

//     return (
//       <PickersDay
//         {...props}
//         sx={{
//           backgroundColor: isMarked ? '#1976d2' : undefined,
//           color: isMarked ? 'white' : undefined,
//           border: isMarked ? '2px solid #004a9f' : undefined,
//           position: 'relative',
//           borderRadius: '50%',
//           '&:hover': {
//             backgroundColor: isMarked ? '#1565c0' : undefined,
//           },
//         }}
//       >
//         {isMarked && (
//           <StarIcon
//             fontSize="small"
//             sx={{
//               position: 'absolute',
//               top: 2,
//               right: 2,
//               color: '#ffeb3b',
//               backgroundColor: 'rgba(0,0,0,0.6)',
//               borderRadius: '50%',
//               padding: '2px',
//               width: 16,
//               height: 16,
//             }}
//           />
//         )}
//       </PickersDay>
//     );
//   };

//   return (
//     <LocalizationProvider
//       dateAdapter={AdapterDayjs}
//       adapterLocale="es"
//       localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
//     >
//       <StaticDatePicker
//         defaultValue={dayjs()}
//         displayStaticWrapperAs="desktop"
//         renderDay={renderDay}
//       />
//     </LocalizationProvider>
//   );
// };
// import React from 'react';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
// import { PickersDay } from '@mui/x-date-pickers/PickersDay';
// import StarIcon from '@mui/icons-material/Star';
// import dayjs from 'dayjs';
// import 'dayjs/locale/es';
// import { esES } from '@mui/x-date-pickers/locales';

// const CustomDay = (props) => {
//   const { day, markedDates = [], outsideCurrentMonth, ...other } = props;
//   const formatted = day.format('YYYY-MM-DD');
//   const isMarked = markedDates.includes(formatted);

//   return (
//     <PickersDay
//       {...other}
//       outsideCurrentMonth={outsideCurrentMonth}
//       day={day}
//       sx={{
//         backgroundColor: isMarked ? '#1976d2' : undefined,
//         color: isMarked ? 'white' : undefined,
//         border: isMarked ? '2px solid #004a9f' : undefined,
//         position: 'relative',
//         borderRadius: '50%',
//         '&:hover': {
//           backgroundColor: isMarked ? '#1565c0' : undefined,
//         },
//       }}
//     >
//       {isMarked && (
//         <StarIcon
//           fontSize="small"
//           sx={{
//             position: 'absolute',
//             top: 2,
//             right: 2,
//             color: '#ffeb3b',
//             backgroundColor: 'rgba(0,0,0,0.6)',
//             borderRadius: '50%',
//             padding: '2px',
//             width: 16,
//             height: 16,
//           }}
//         />
//       )}
//     </PickersDay>
//   );
// };

// export const Calendar = ({ markedDates = [] }) => {
//   // Normaliza las fechas
//   const normalizedMarkedDates = markedDates.map((date) =>
//     dayjs(date).format('YYYY-MM-DD')
//   );

//   return (
//     <LocalizationProvider
//       dateAdapter={AdapterDayjs}
//       adapterLocale="es"
//       localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
//     >
//       <DateCalendar
//         defaultValue={dayjs()}
//         slots={{ day: CustomDay }}
//         slotProps={{
//           day: { markedDates: normalizedMarkedDates },
//         }}
//       />
//     </LocalizationProvider>
//   );
// };
import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import StarIcon from '@mui/icons-material/Star';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { esES } from '@mui/x-date-pickers/locales';

// 🎯 Custom day renderer
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
        color: isMarked ? 'white' : undefined,
        border: isMarked ? '2px solid #004a9f' : undefined,
        position: 'relative',
        borderRadius: '50%',
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
            top: 2,
            right: 2,
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

// 📅 Calendar component
export const Calendar = ({ markedDates = [] }) => {
  const normalizedMarkedDates = markedDates.map((date) =>
    dayjs(date).format('YYYY-MM-DD')
  );

  // ⬇️ Estado controlado (inicial: hoy)
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
          day: { markedDates: normalizedMarkedDates },
        }}
      />
    </LocalizationProvider>
  );
};

