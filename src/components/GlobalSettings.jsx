import React, { useState } from 'react';
import {
    IconButton,
    Button,
    Menu,
    MenuItem,
    Typography,
    Divider,
    Box,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { useCurrency } from '../utils/currency';
import CurrencySelector from './CurrencySelector';

const GlobalSettings = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { currencyInfo } = useCurrency();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={handleClick}
                aria-controls={open ? 'settings-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    fontWeight: 'bold',
                    px: 2,
                    py: 1,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    '&:hover': {
                        borderColor: '#764ba2',
                        background: 'rgba(102, 126, 234, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                    }
                }}
            >
                CONFIGURACIÓN
            </Button>
            
            <Menu
                anchorEl={anchorEl}
                id="settings-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        minWidth: 280,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Configuraciones Globales
                    </Typography>
                </Box>
                
                <Divider />
                
                <MenuItem onClick={(e) => e.stopPropagation()} sx={{ '&:hover': { backgroundColor: 'transparent' } }}>
                    <ListItemIcon>
                        <CurrencyExchangeIcon fontSize="small" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                        <CurrencySelector size="small" showLabel={false} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Actual: {currencyInfo?.name}
                        </Typography>
                    </Box>
                </MenuItem>
                
                <Divider />
                
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Los cambios se aplican automáticamente
                    </Typography>
                </Box>
            </Menu>
        </>
    );
};

export default GlobalSettings;