import React, { useState } from 'react';
import {
    IconButton,
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
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'settings-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                title="Configuraciones"
            >
                <SettingsIcon />
            </IconButton>
            
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