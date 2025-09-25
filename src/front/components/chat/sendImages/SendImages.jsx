import React, { useRef, useState, isValidElement, cloneElement } from "react";

export default function SendImages({
  uploader,            
  onUploaded,          
  onError, 
  disabled = false,
  multiple = false,
  accept = "image/*",
  maxSizeMB = 15,
  children,           
  buttonProps = {},
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const openPicker = () => {
    if (disabled || loading) return;
    inputRef.current?.click();
  };

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !uploader) return;

    setLoading(true);
    try {
      for (const file of files) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          onError?.(new Error(`La imagen supera ${maxSizeMB}MB`));
          continue;
        }
        const resp = await uploader(file);
        const url =
          typeof resp === "string"
            ? resp
            : resp?.imageUrl || resp?.secure_url || resp?.url;

        if (!url) {
          onError?.(new Error("No se obtuvo URL de la imagen subida"));
          continue;
        }
        onUploaded?.(url, { file, response: resp });
      }
    } catch (err) {
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const onIconKeyDown = (e) => {
    if (disabled || loading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const ariaLabel = loading ? "Subiendo…" : "Adjuntar imagen";
  const baseInteractiveProps = {
    role: "button",
    tabIndex: 0,
    "aria-label": ariaLabel,
    "aria-disabled": disabled || loading ? true : undefined,
    onClick: openPicker,
    onKeyDown: onIconKeyDown,
    style: {
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.6 : 1,
      ...(buttonProps.style || {}),
    },
    ...buttonProps,
  };

  return (
    <>
      {isValidElement(children)
        ? cloneElement(children, {
            ...baseInteractiveProps,
            onClick: (e) => {
              children.props?.onClick?.(e);
              baseInteractiveProps.onClick?.(e);
            },
            onKeyDown: (e) => {
              children.props?.onKeyDown?.(e);
              baseInteractiveProps.onKeyDown?.(e);
            },
            style: { ...(children.props?.style || {}), ...(baseInteractiveProps.style || {}) },
          })
        : (
          <span {...baseInteractiveProps}>📎</span>
        )
      }

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: "none" }}
        tabIndex={-1}
      />
    </>
  );
}
