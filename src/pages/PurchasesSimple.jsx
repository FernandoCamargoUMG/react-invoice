import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import NavigationBar from '../components/NavigationBar';

const PurchasesSimple = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ 
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 25%, #6A4C93 70%, #8B5FBF 100%)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0,
            left: 0
        }}>
            <NavigationBar 
                title="🛒 Gestión de Compras"
                onHome={() => navigate('/')}
                onBack={() => navigate('/')}
            />

            <Box sx={{
                flex: 1,
                overflow: 'auto',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography variant="h3" sx={{ color: 'white', textAlign: 'center' }}>
                    🛒 Módulo de Compras<br/>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}>
                        Cargando correctamente...
                    </Typography>
                </Typography>
            </Box>
        </Box>
    );
};

export default PurchasesSimple;