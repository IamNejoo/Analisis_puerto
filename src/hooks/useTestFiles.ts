import { useState, useEffect } from 'react';

export const useTestFiles = () => {
    const [status, setStatus] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const testFiles = async () => {
            const files = [
                '/data/semanas/analisis_flujos_w3_ci.xlsx',
                '/data/magdalena/resultado_3_69_K.xlsx',
                'data/semanas/analisis_flujos_w3_ci.xlsx',
                'data/magdalena/resultado_3_69_K.xlsx'
            ];

            const results: { [key: string]: string } = {};

            for (const file of files) {
                try {
                    const response = await fetch(file);
                    if (response.ok) {
                        results[file] = `✅ OK (${response.status})`;
                    } else {
                        results[file] = `❌ Error ${response.status}`;
                    }
                } catch (err) {
                    results[file] = `❌ No accesible`;
                }
            }

            setStatus(results);
            console.log('🔍 Test de archivos:', results);
        };

        testFiles();
    }, []);

    return status;
};