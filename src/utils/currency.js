// Configuración de monedas disponibles
export const CURRENCIES = {
    // Centroamérica
    GTQ: { symbol: 'Q', name: 'Quetzal Guatemalteco', locale: 'es-GT' },
    CRC: { symbol: '₡', name: 'Colón Costarricense', locale: 'es-CR' },
    NIO: { symbol: 'C$', name: 'Córdoba Nicaragüense', locale: 'es-NI' },
    HNL: { symbol: 'L', name: 'Lempira Hondureño', locale: 'es-HN' },
    SVC: { symbol: '$', name: 'Colón Salvadoreño', locale: 'es-SV' },
    PAB: { symbol: 'B/.', name: 'Balboa Panameño', locale: 'es-PA' },
    BZD: { symbol: 'BZ$', name: 'Dólar Beliceño', locale: 'en-BZ' },
    
    // Principales internacionales
    USD: { symbol: '$', name: 'Dólar Estadounidense', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'Libra Esterlina', locale: 'en-GB' },
    CAD: { symbol: 'C$', name: 'Dólar Canadiense', locale: 'en-CA' },
    
    // Latinoamérica
    MXN: { symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
    COP: { symbol: '$', name: 'Peso Colombiano', locale: 'es-CO' },
    ARS: { symbol: '$', name: 'Peso Argentino', locale: 'es-AR' },
    BRL: { symbol: 'R$', name: 'Real Brasileño', locale: 'pt-BR' },
    CLP: { symbol: '$', name: 'Peso Chileno', locale: 'es-CL' },
    PEN: { symbol: 'S/', name: 'Sol Peruano', locale: 'es-PE' },
    UYU: { symbol: '$U', name: 'Peso Uruguayo', locale: 'es-UY' },
    PYG: { symbol: '₲', name: 'Guaraní Paraguayo', locale: 'es-PY' },
    BOB: { symbol: 'Bs.', name: 'Boliviano', locale: 'es-BO' },
    VES: { symbol: 'Bs.S', name: 'Bolívar Venezolano', locale: 'es-VE' },
    
    // Asia
    JPY: { symbol: '¥', name: 'Yen Japonés', locale: 'ja-JP' },
    CNY: { symbol: '¥', name: 'Yuan Chino', locale: 'zh-CN' },
    KRW: { symbol: '₩', name: 'Won Surcoreano', locale: 'ko-KR' },
    INR: { symbol: '₹', name: 'Rupia India', locale: 'en-IN' },
    
    // Otros
    CHF: { symbol: 'Fr', name: 'Franco Suizo', locale: 'de-CH' },
    AUD: { symbol: 'A$', name: 'Dólar Australiano', locale: 'en-AU' },
    NZD: { symbol: 'NZ$', name: 'Dólar Neozelandés', locale: 'en-NZ' },
    ZAR: { symbol: 'R', name: 'Rand Sudafricano', locale: 'en-ZA' },
    RUB: { symbol: '₽', name: 'Rublo Ruso', locale: 'ru-RU' },
    NOK: { symbol: 'kr', name: 'Corona Noruega', locale: 'no-NO' },
    SEK: { symbol: 'kr', name: 'Corona Sueca', locale: 'sv-SE' },
    DKK: { symbol: 'kr', name: 'Corona Danesa', locale: 'da-DK' }
};

// Función para formatear montos según la moneda seleccionada
export const formatCurrency = (amount, currencyCode = 'GTQ') => {
    if (!amount && amount !== 0) return '0.00';
    
    const currency = CURRENCIES[currencyCode];
    if (!currency) return amount.toString();
    
    const numericAmount = parseFloat(amount);
    
    try {
        // Usar Intl.NumberFormat para formato automático según la configuración regional
        const formatter = new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatter.format(numericAmount);
    } catch {
        // Fallback manual si hay problemas con Intl
        return `${currency.symbol}${numericAmount.toLocaleString(currency.locale, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        })}`;
    }
};

// Hook personalizado para manejo de moneda
import { useState } from 'react';

export const useCurrency = () => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        // Obtener moneda guardada o usar GTQ por defecto (Guatemala)
        return localStorage.getItem('selectedCurrency') || 'GTQ';
    });

    const changeCurrency = (currencyCode) => {
        setSelectedCurrency(currencyCode);
        localStorage.setItem('selectedCurrency', currencyCode);
    };

    const formatAmount = (amount) => {
        return formatCurrency(amount, selectedCurrency);
    };

    return {
        selectedCurrency,
        changeCurrency,
        formatCurrency: formatAmount,
        formatAmount,
        currencyInfo: CURRENCIES[selectedCurrency]
    };
};

export default CURRENCIES;