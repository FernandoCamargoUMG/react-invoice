import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { CURRENCIES, useCurrency } from '../utils/currency';

const CurrencySelector = ({ size = 'small', showLabel = true }) => {
    const { selectedCurrency, changeCurrency, currencyInfo } = useCurrency();

    const handleChange = (event) => {
        changeCurrency(event.target.value);
    };

    return (
        <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth size={size}>
                {showLabel && <InputLabel>Moneda</InputLabel>}
                <Select
                    value={selectedCurrency}
                    label={showLabel ? "Moneda" : ""}
                    onChange={handleChange}
                >
                    {/* Grupo de Centroamérica */}
                    <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        Centroamérica
                    </Typography>
                    <MenuItem value="GTQ">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>Q</span>
                            <span>Quetzal (Guatemala)</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="CRC">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>₡</span>
                            <span>Colón (Costa Rica)</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="NIO">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>C$</span>
                            <span>Córdoba (Nicaragua)</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="HNL">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>L</span>
                            <span>Lempira (Honduras)</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="SVC">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>$</span>
                            <span>Colón (El Salvador)</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="PAB">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>B/.</span>
                            <span>Balboa (Panamá)</span>
                        </Box>
                    </MenuItem>
                    
                    {/* Grupo Principal */}
                    <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        Principales
                    </Typography>
                    <MenuItem value="USD">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>$</span>
                            <span>Dólar Estadounidense</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="EUR">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>€</span>
                            <span>Euro</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="GBP">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>£</span>
                            <span>Libra Esterlina</span>
                        </Box>
                    </MenuItem>
                    
                    {/* Grupo Latinoamérica */}
                    <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        Latinoamérica
                    </Typography>
                    <MenuItem value="MXN">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>$</span>
                            <span>Peso Mexicano</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="COP">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>$</span>
                            <span>Peso Colombiano</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="ARS">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>$</span>
                            <span>Peso Argentino</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="BRL">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>R$</span>
                            <span>Real Brasileño</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="CLP">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>$</span>
                            <span>Peso Chileno</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="PEN">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>S/</span>
                            <span>Sol Peruano</span>
                        </Box>
                    </MenuItem>
                    
                    {/* Grupo Otros */}
                    <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        Otros
                    </Typography>
                    <MenuItem value="JPY">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>¥</span>
                            <span>Yen Japonés</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="CHF">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>Fr</span>
                            <span>Franco Suizo</span>
                        </Box>
                    </MenuItem>
                    <MenuItem value="AUD">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontWeight: 'bold' }}>A$</span>
                            <span>Dólar Australiano</span>
                        </Box>
                    </MenuItem>
                </Select>
            </FormControl>
            
            {currencyInfo && (
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                    Moneda actual: {currencyInfo.name}
                </Typography>
            )}
        </Box>
    );
};

export default CurrencySelector;