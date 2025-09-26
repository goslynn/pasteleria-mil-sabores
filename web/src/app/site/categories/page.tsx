import * as React from 'react';
import { DashboardGrid, DashboardItem } from '@/components/ui/dashboard-grid';

const data = [
    { id: 1, title: 'Ventas Hoy', importance: 3 },
    { id: 2, title: 'Usuarios Online', importance: 2 },
    { id: 3, title: 'Pedidos Pendientes', importance: 4 },
    { id: 4, title: 'Inventario Crítico', importance: 1 },
    { id: 5, title: 'Top Productos', importance: 2 },
    { id: 6, title: 'Promociones Activas', importance: 1 },
];

export default function DashboardDemoPage() {
    return (
        <main className="container mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Demo Dashboard Grid</h1>

            <DashboardGrid cols={6} gap={4}>
                {data.map((card) => (
                    <DashboardItem key={card.id} importance={card.importance} >
                        <h2 className="font-medium">{card.title}</h2>
                        <p className="text-sm text-muted-foreground">
                            Importancia: {card.importance}
                        </p>
                    </DashboardItem>
                ))}
            </DashboardGrid>
        </main>
    );
}
