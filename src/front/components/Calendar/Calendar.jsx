import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import HandshakeIcon from "@mui/icons-material/Handshake";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { esES } from "@mui/x-date-pickers/locales";

const HandBadge = ({ selected = false }) => (
  <span
    style={{
      position: "absolute",
      right: 2,
      bottom: 2,
      width: 16,
      height: 16,
      borderRadius: 999,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: selected
        ? "rgba(255,255,255,.22)"
        : "color-mix(in srgb, var(--color-gold) 20%, transparent)",
      boxShadow: "0 1px 3px rgba(0,0,0,.18)",
      pointerEvents: "none",
    }}
  >
    <HandshakeIcon
      sx={{
        width: 12,
        height: 12,
        color: selected ? "#fff" : "var(--color-gold)",
      }}
    />
  </span>
);

const CustomDay = (props) => {
  const {
    day,
    outsideCurrentMonth,
    selected = false,
    markedDates = [],
    ...other
  } = props;

  const formatted = day.format("YYYY-MM-DD");
  const isMarked = markedDates.includes(formatted);

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={selected}
      sx={{
        position: "relative",
        width: 40,
        height: 40,
        borderRadius: "999px",
        backgroundColor: "transparent",
        border:
          "1px solid color-mix(in srgb, var(--color-border) 75%, transparent)",
        color: "var(--color-text)",
        transition:
          "transform 80ms ease, box-shadow 150ms ease, border-color 150ms ease, background 200ms ease",

        "&:hover": {
          backgroundColor:
            "color-mix(in srgb, var(--color-bg-2) 70%, transparent)",
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          borderColor:
            "color-mix(in srgb, var(--color-gold) 35%, var(--color-border))",
        },

        "&.MuiPickersDay-today": {
          boxShadow: "inset 0 0 0 2px var(--color-gold)",
          backgroundColor: "transparent",
        },

        "&.Mui-selected, &.Mui-selected:hover": {
          background:
            "linear-gradient(90deg, var(--color-gold), var(--color-gold-2))",
          color: "#fff",
          borderColor: "transparent",
          boxShadow: "0 6px 18px rgba(212,175,55,.35)",
        },

        "&.MuiPickersDay-dayOutsideMonth, &.Mui-disabled": {
          opacity: 0.45,
          color: "var(--color-muted)",
        },
      }}
    >
      {day.date()}
      {isMarked && <HandBadge selected={selected} />}
    </PickersDay>
  );
};

export const Calendar = ({ markedDates = [], value, onChange }) => {
  const normalizedMarkedDates = markedDates.map((d) =>
    dayjs(d).format("YYYY-MM-DD")
  );

  const [internalDate, setInternalDate] = useState(dayjs());
  const selectedDate = value ?? internalDate;

  const handleChange = (newValue) => {
    onChange?.(newValue);
    setInternalDate(newValue);
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="es"
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <DateCalendar
        value={selectedDate}
        onChange={handleChange}
        slots={{ day: CustomDay }}
        slotProps={{
          day: { markedDates: normalizedMarkedDates },
        }}
        sx={{
          width: "100%",
          maxWidth: 560,
          margin: "0 auto",
          padding: "10px 8px 14px",
          borderRadius: "20px",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 92%, transparent), var(--color-surface))",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-border)",

          "& .MuiPickersCalendarHeader-root": {
            padding: "6px 8px",
            borderBottom: "1px solid var(--color-border)",
            marginBottom: "6px",
          },
          "& .MuiPickersCalendarHeader-label": {
            fontWeight: 800,
            letterSpacing: ".2px",
            color: "var(--color-text)",
            textTransform: "capitalize",
          },
          "& .MuiPickersArrowSwitcher-root": { gap: "8px" },
          "& .MuiPickersArrowSwitcher-button": {
            width: 36,
            height: 36,
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            transition:
              "box-shadow 150ms ease, transform 80ms ease, border-color 150ms ease, background 200ms ease",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              borderColor:
                "color-mix(in srgb, var(--color-gold) 35%, var(--color-border))",
              background:
                "color-mix(in srgb, var(--color-bg-2) 70%, var(--color-surface))",
            },
            "&:active": { transform: "translateY(1px)" },
          },

          "& .MuiDayCalendar-weekDayLabel": {
            fontWeight: 700,
            fontSize: ".9rem",
            color: "var(--color-muted)",
          },
          "& .MuiDayCalendar-monthContainer": { paddingTop: "6px" },
          "& .MuiDayCalendar-weekContainer": { gap: "8px", padding: "0 6px" },
          "& .MuiPickersDay-root": { borderRadius: "999px" },
        }}
      />
    </LocalizationProvider>
  );
};
